const moment = require('moment');
const uuid = require('uuid/v4');
const { DOWNLOAD_LINK_SUBJECT } = require('./constants');
const { ErrNotAuthorized, ErrMaxRateLimit } = require('errors');
const { URL } = require('url');

// generateDownloadLinks will generate a signed set of links for a given user to
// download an archive of their data.
async function generateDownloadLinks(ctx, userID) {
  const { connectors: { url: { BASE_URL }, secrets } } = ctx;

  // Generate a token for the download link.
  const token = await secrets.jwt.sign(
    { user: userID },
    { jwtid: uuid.v4(), expiresIn: '1d', subject: DOWNLOAD_LINK_SUBJECT }
  );

  // Generate the url that a user can land on.
  const downloadLandingURL = new URL('account/download', BASE_URL);
  downloadLandingURL.hash = token;

  // Generate the url that the API calls to download the actual zip.
  const downloadFileURL = new URL('api/v1/account/download', BASE_URL);
  downloadFileURL.searchParams.set('token', token);

  return {
    downloadLandingURL: downloadLandingURL.href,
    downloadFileURL: downloadFileURL.href,
  };
}

async function sendDownloadLink(ctx) {
  const {
    user,
    loaders: { Settings },
    connectors: { services: { Users, I18n, Limit }, models: { User } },
  } = ctx;

  // downloadLinkLimiter can be used to limit downloads for the user's data to
  // once every 7 days.
  const downloadLinkLimiter = new Limit('profileDataDownloadLimiter', 1, '7d');

  // Check that the user has not already requested a download within the last
  // 7 days.
  const attempts = await downloadLinkLimiter.get(user.id);
  if (attempts && attempts >= 1) {
    throw new ErrMaxRateLimit();
  }

  // Check if the lastAccountDownload time is within 7 days.
  if (
    user.lastAccountDownload &&
    moment(user.lastAccountDownload)
      .add(7, 'days')
      .isAfter(moment())
  ) {
    throw new ErrMaxRateLimit();
  }

  // The account currently does not have a download link, let's record the
  // download. This will throw an error if a race ocurred and we should stop
  // now.
  await downloadLinkLimiter.test(user.id);

  const now = new Date();

  // Generate the download links.
  const { downloadLandingURL } = await generateDownloadLinks(ctx, user.id);

  const { organizationName } = await Settings.load('organizationName');

  // Send the download link via the user's attached email account.
  await Users.sendEmail(user, {
    template: 'download',
    locals: {
      downloadLandingURL,
      organizationName,
      now,
    },
    subject: I18n.t('email.download.subject', organizationName),
  });

  // Amend the lastAccountDownload on the user.
  await User.update(
    { id: user.id },
    { $set: { 'metadata.lastAccountDownload': now } }
  );
}

// downloadUser will return the download file url that can be used to directly
// download the archive.
async function downloadUser(ctx, userID) {
  const { downloadFileURL } = await generateDownloadLinks(ctx, userID);
  return downloadFileURL;
}

module.exports = ctx => ({
  User: {
    requestDownloadLink: () => sendDownloadLink(ctx),
    download:
      // Only ADMIN users can execute an account download.
      ctx.user && ctx.user.role === 'ADMIN'
        ? userID => downloadUser(ctx, userID)
        : () => Promise.reject(new ErrNotAuthorized()),
  },
});
