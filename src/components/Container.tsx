"use client";

import React, { useCallback, useMemo, useState } from "react";
import styles from "../styles/Container.module.css";
import View from "./View";
import Drawer from "./Drawer";
import Header from "./Header";
import { Task } from "@/types/Task";
import TaskList from "./TaskList";
import TaskHeader from "./TaskHeader";
import Trade from "./Trade";

interface Tab {
  icon: React.ReactNode;
  title: string;
}

interface ContainerProps {
  tabs: Tab[];
  headerTitle: string;
}

const Container: React.FC<ContainerProps> = ({ tabs, headerTitle }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Mock data, ideally would be fetched from an API using useEffect
  const [dailyTasks, setDailyTasks] = useState<Task[]>([
    { id: "d1", description: "Daily Task 1", completed: false, points: 10 },
    { id: "d2", description: "Daily Task 2", completed: false, points: 15 },
    { id: "d3", description: "Daily Task 3", completed: false, points: 20 },
  ]);
  const [weeklyTasks, setWeeklyTasks] = useState<Task[]>([
    { id: "w1", description: "Weekly Task 1", completed: false, points: 50 },
    { id: "w2", description: "Weekly Task 2", completed: false, points: 200 },
    { id: "w3", description: "Weekly Task 3", completed: false, points: 250 },
  ]);

  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  const handleToggle = useCallback(
    (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) =>
      (id: string) => {
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === id) {
              if (!task.completed) {
                setAnimatingTaskId(id);
                setTimeout(() => setAnimatingTaskId(null), 1000); // Reset after animation duration
              }
              return { ...task, completed: !task.completed };
            }
            return task;
          })
        );
      },
    []
  );

  const handleDailyToggle = handleToggle(dailyTasks, setDailyTasks);
  const handleWeeklyToggle = handleToggle(weeklyTasks, setWeeklyTasks);

  const totalScore = useMemo(() => {
    return (
      dailyTasks.reduce(
        (acc, task) => (task.completed ? acc + task.points : acc),
        0
      ) +
      weeklyTasks.reduce(
        (acc, task) => (task.completed ? acc + task.points : acc),
        0
      )
    );
  }, [dailyTasks, weeklyTasks]);

  return (
    <div className={styles.container}>
      <Header title={headerTitle} />
      <View>
        <div className={styles.viewContent}>
          {activeTab === 0 && (
            <div className={styles.taskListsContainer}>
              <TaskHeader title={`Total Score: ${totalScore}`} />
              <TaskList
                title="Daily Tasks"
                tasks={dailyTasks}
                onToggle={handleDailyToggle}
                animatingTaskId={animatingTaskId}
              />
              <TaskList
                title="Weekly Tasks"
                tasks={weeklyTasks}
                onToggle={handleWeeklyToggle}
                animatingTaskId={animatingTaskId}
              />
            </div>
          )}
          {activeTab === 1 && <Trade />}
        </div>
      </View>
      <Drawer>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`${styles.tab} ${
              activeTab === index ? styles.activeTab : ""
            }`}
          >
            {tab.icon}
            <span>{tab.title}</span>
          </button>
        ))}
      </Drawer>
    </div>
  );
};

export default Container;
export type { Tab, ContainerProps };
