import React, { useCallback, useState } from "react";
import styles from "../styles/Task.module.css";
import { Task } from "@/types/Task";
import TaskAnimation from "./TaskAnimation";

interface TaskItemProps {
  task: Task;
  isAnimating: boolean;
  onToggle: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, isAnimating, onToggle }) => {
  const [coinKey, setCoinKey] = useState(0);

  const handleToggle = useCallback(() => {
    if (!task.completed) {
      setCoinKey((prev) => prev + 1);
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
          className={`${styles.completeButton} ${
            task.completed ? styles.completed : ""
          }`}
        >
          {task.completed ? "DONE" : "COMPLETE"}
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
