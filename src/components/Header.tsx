import React from "react";
import styles from "../styles/Container.module.css";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className={styles.header}>
      <h1>{title}</h1>
    </header>
  );
};

export default Header;
export type { HeaderProps };
