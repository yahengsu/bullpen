import React, { useMemo } from "react";
import TaskItem from "./TaskItem";
import { Task } from "@/types/Task";
import styles from "../styles/Task.module.css";
import TaskHeader from "./TaskHeader";

interface TaskListProps {
  title: string;
  tasks: Task[];
  animatingTaskId: string | null;
  onToggle: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  title,
  tasks,
  animatingTaskId,
  onToggle,
}) => {
  return (
    <div className={styles.taskListContainer}>
      <TaskHeader title={title} />
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            isAnimating={task.id === animatingTaskId}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
