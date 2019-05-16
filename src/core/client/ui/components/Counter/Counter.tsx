import cn from "classnames";
import React, { FunctionComponent } from "react";

import { withStyles } from "coral-ui/hocs";

import styles from "./Counter.css";

interface Props {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes: typeof styles;
  /**
   * The color of the component. It supports those theme colors that make sense for this component.
   */
  color?: "inherit" | "grey" | "primary";
}

const Counter: FunctionComponent<Props> = ({
  classes,
  color,
  className,
  children,
  ...rest
}) => {
  const rootClassName = cn(
    classes.root,
    {
      [classes.colorPrimary]: color === "primary",
      [classes.colorGrey]: color === "grey",
      [classes.colorInherit]: color === "inherit",
    },
    className
  );
  return (
    <span className={rootClassName} {...rest}>
      <span className={classes.text}>{children}</span>
    </span>
  );
};

Counter.defaultProps = {
  color: "inherit",
};

const enhanced = withStyles(styles)(Counter);
export default enhanced;
