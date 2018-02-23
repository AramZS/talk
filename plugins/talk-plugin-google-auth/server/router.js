module.exports = router => {
  const { passport, HandleAuthPopupCallback } = require('services/passport');

  /**
   * Google auth endpoint, this will redirect the user immediately to google
   * for authorization.
   */
  router.get(
    '/api/v1/auth/google',
    passport.authenticate('google', {
      display: 'popup',
      authType: 'rerequest',
      scope: ['profile'],
    })
  );

  /**
   * Google callback endpoint, this will send the user a html page designed to
   * send back the user credentials upon sucessful login.
   */
  router.get('/api/v1/auth/google/callback', (req, res, next) => {
    // Perform the google login flow and pass the data back through the opener.
    passport.authenticate(
      'google',
      { session: false },
      HandleAuthPopupCallback(req, res, next)
    )(req, res, next);
  });
};
