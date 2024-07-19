import React from "react";
import styles from "../styles/Container.module.css";

interface ViewProps {
  children: React.ReactNode;
}

const View: React.FC<ViewProps> = ({ children }) => {
  return <div className={styles.view}>{children}</div>;
};

export default View;
