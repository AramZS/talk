import { Localized } from "fluent-react/compat";
import React, { Component } from "react";

import { SignInWithGoogleContainer_auth as AuthData } from "coral-auth/__generated__/SignInWithGoogleContainer_auth.graphql";
import GoogleButton from "coral-framework/components/GoogleButton";
import { redirectOAuth2 } from "coral-framework/helpers";
import { graphql, withFragmentContainer } from "coral-framework/lib/relay";

interface Props {
  auth: AuthData;
}

class SignInWithGoogleContainer extends Component<Props> {
  private handleOnClick = () => {
    redirectOAuth2(this.props.auth.integrations.google.redirectURL);
  };

  public render() {
    return (
      <Localized id="signIn-signInWithGoogle">
        <GoogleButton onClick={this.handleOnClick}>
          Sign in with Google
        </GoogleButton>
      </Localized>
    );
  }
}

const enhanced = withFragmentContainer<Props>({
  auth: graphql`
    fragment SignInWithGoogleContainer_auth on Auth {
      integrations {
        google {
          redirectURL
        }
      }
    }
  `,
})(SignInWithGoogleContainer);

export default enhanced;
