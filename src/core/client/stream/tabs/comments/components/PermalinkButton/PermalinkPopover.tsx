import React from "react";

import { CopyButton } from "coral-framework/components";
import { Flex, TextField } from "coral-ui/components";

import styles from "./PermalinkPopover.css";

interface Props {
  permalinkURL: string;
}

class PermalinkPopover extends React.Component<Props> {
  public render() {
    const { permalinkURL } = this.props;
    return (
      <Flex itemGutter="half" className={styles.root}>
        <TextField
          defaultValue={permalinkURL}
          className={styles.textField}
          readOnly
        />
        <CopyButton text={permalinkURL} />
      </Flex>
    );
  }
}

export default PermalinkPopover;
