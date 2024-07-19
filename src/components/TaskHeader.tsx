import React from "react";
import styles from "../styles/TaskHeader.module.css";

interface TaskHeaderProps {
  title: string;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ title }) => {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
};

export default TaskHeader;
