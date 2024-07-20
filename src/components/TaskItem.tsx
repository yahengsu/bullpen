import React, { useCallback, useState } from "react";
import styles from "../styles/Task.module.css";
import { Task, TaskStatus } from "@/types/Task";
import TaskAnimation from "./TaskAnimation";

interface TaskItemProps {
  task: Task;
  isAnimating: boolean;
  onToggle: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, isAnimating, onToggle }) => {
  const [coinKey, setCoinKey] = useState(0);

  const handleToggle = useCallback(() => {
    if (task.completed === TaskStatus.Claimable) {
      setCoinKey((prev) => prev + 1);
    }
    if (task.completed === TaskStatus.Unclaimable) {
      return;
    }
    onToggle(task.id);
  }, [task.completed, task.id, onToggle]);

  return (
    <div className={styles.taskItem}>
      <span
        className={`${styles.taskTitle} ${
          task.completed ? styles.completed : ""
        }`}
      >
        {task.description}
      </span>
      <div className={styles.buttonWrapper}>
        <TaskAnimation key={coinKey} show={isAnimating} points={task.points} />
        <button
          onClick={handleToggle}
          className={`${styles.completeButton} ${task.completed}`}
        >
          {task.completed === TaskStatus.Claimed
            ? "DONE"
            : task.completed === TaskStatus.Claimable
            ? "CLAIM"
            : "TODO"}
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
