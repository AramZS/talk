import { FormApi } from "final-form";
import React from "react";
import { graphql } from "react-relay";

import { AdvancedConfigRouteContainerQueryResponse } from "coral-admin/__generated__/AdvancedConfigRouteContainerQuery.graphql";
import { withRouteConfig } from "coral-framework/lib/router";
import { Delay, Spinner } from "coral-ui/components";

import AdvancedConfigContainer from "./AdvancedConfigContainer";

interface Props {
  data: AdvancedConfigRouteContainerQueryResponse | null;
  form: FormApi;
  submitting: boolean;
}

class AdvancedConfigRouteContainer extends React.Component<Props> {
  public render() {
    if (!this.props.data) {
      return (
        <Delay>
          <Spinner />
        </Delay>
      );
    }
    return (
      <AdvancedConfigContainer
        settings={this.props.data.settings}
        form={this.props.form}
        submitting={this.props.submitting}
      />
    );
  }
}

const enhanced = withRouteConfig<Props>({
  query: graphql`
    query AdvancedConfigRouteContainerQuery {
      settings {
        ...AdvancedConfigContainer_settings
      }
    }
  `,
  cacheConfig: { force: true },
})(AdvancedConfigRouteContainer);

export default enhanced;
