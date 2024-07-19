import React, { useState, useEffect } from "react";
import styles from "../styles/TaskAnimation.module.css";

interface TaskAnimationProps {
  show: boolean;
  points: number;
}

const TaskAnimation: React.FC<TaskAnimationProps> = ({ show, points }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!animate) return null;

  return <div className={styles.coin}>+{points}🪙</div>;
};

export default TaskAnimation;
