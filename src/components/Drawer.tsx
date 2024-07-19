import React from "react";
import styles from "../styles/Container.module.css";

interface DrawerProps {
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ children }) => {
  return <div className={styles.drawer}>{children}</div>;
};

export default Drawer;
