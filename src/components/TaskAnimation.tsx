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
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!animate) return null;

  return (
    <div className={styles.coin}>
      +{points}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="16" height="16" fill="none" />

        <rect x="4" y="1" width="8" height="1" fill="#D4AF37" />
        <rect x="3" y="2" width="2" height="1" fill="#D4AF37" />
        <rect x="11" y="2" width="2" height="1" fill="#D4AF37" />
        <rect x="2" y="3" width="2" height="1" fill="#D4AF37" />
        <rect x="12" y="3" width="2" height="1" fill="#D4AF37" />
        <rect x="1" y="4" width="2" height="8" fill="#D4AF37" />
        <rect x="13" y="4" width="2" height="8" fill="#D4AF37" />
        <rect x="2" y="12" width="2" height="1" fill="#D4AF37" />
        <rect x="12" y="12" width="2" height="1" fill="#D4AF37" />
        <rect x="3" y="13" width="2" height="1" fill="#D4AF37" />
        <rect x="11" y="13" width="2" height="1" fill="#D4AF37" />
        <rect x="4" y="14" width="8" height="1" fill="#D4AF37" />

        <rect x="4" y="2" width="8" height="1" fill="#FFD700" />
        <rect x="3" y="3" width="10" height="1" fill="#FFD700" />
        <rect x="3" y="4" width="10" height="8" fill="#FFD700" />
        <rect x="3" y="12" width="10" height="1" fill="#FFD700" />
        <rect x="4" y="13" width="8" height="1" fill="#FFD700" />

        <rect x="4" y="3" width="1" height="2" fill="#FFF68F" />
        <rect x="5" y="4" width="1" height="2" fill="#FFF68F" />

        <rect x="7" y="5" width="2" height="1" fill="#D4AF37" />
        <rect x="7" y="6" width="1" height="3" fill="#D4AF37" />
        <rect x="7" y="9" width="2" height="1" fill="#D4AF37" />
        <rect x="8" y="10" width="1" height="1" fill="#D4AF37" />
        <rect x="7" y="11" width="2" height="1" fill="#D4AF37" />
      </svg>
    </div>
  );
};

export default TaskAnimation;
