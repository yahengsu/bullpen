"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../styles/Container.module.css";
import View from "./View";
import Drawer from "./Drawer";
import Header from "./Header";
import { Task, TaskStatus } from "@/types/Task";
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

  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Mock data - would fetch from API here
    const dailyTasks: Task[] = [
      {
        id: "d1",
        description: "Daily Check In",
        completed: TaskStatus.Claimable,
        points: 1,
      },
      {
        id: "d2",
        description: "Read Daily Digest",
        completed: TaskStatus.Claimable,
        points: 10,
      },
      {
        id: "d3",
        description: "Post in Discord",
        completed: TaskStatus.Claimed,
        points: 15,
      },
    ];

    setDailyTasks(dailyTasks);

    const weeklyTasks: Task[] = [
      {
        id: "w1",
        description: "Weekly Check In",
        completed: TaskStatus.Claimable,
        points: 50,
      },
      {
        id: "w2",
        description: "Trade on Bullpen",
        completed: TaskStatus.Unclaimable,
        points: 100,
      },
      {
        id: "w3",
        description: "Interact with Partner Protocol",
        completed: TaskStatus.Claimed,
        points: 1,
      },
    ];

    setWeeklyTasks(weeklyTasks);
  }, []);

  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  const handleToggle = useCallback(
    (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) =>
      (id: string) => {
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === id) {
              if (task.completed === TaskStatus.Claimable) {
                setAnimatingTaskId(id);
                setTimeout(() => setAnimatingTaskId(null), 1000); // Reset after animation duration
              }
              return { ...task, completed: TaskStatus.Claimed };
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
