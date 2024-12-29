// src/state/user.ts

import { create } from "zustand";
import { api } from "../utils/api";
import { generateRandomString } from "../utils/utils"; // Ensure this utility exists

export type Habit = {
  id: string;
  name: string;
  completed: string[];
  created?: number;
};

type Store = {
  loaded: boolean;
  id: string;
  created?: number;
  habits: Habit[];

  deleteHabit: (id: string) => void;
  createHabit: (name?: string) => void;
  renameHabit: (id: string, name: string) => void;
  updateUserInfo: () => void;
};

const fixedHabits: Habit[] = [
  { id: "habit_talk", name: "Talk to humans for 30 mins", completed: [] },
  { id: "habit_meditate", name: "Meditate for 30 mins", completed: [] },
  { id: "habit_exercise", name: "Exercise for 30 mins", completed: [] },
  { id: "habit_sleep", name: "Sleep 8 hours", completed: [] },
  { id: "habit_fast", name: "Fast for 14+ hours", completed: [] },
];

export const useUser = create<Store>()((set, get) => ({
  loaded: false,
  id: generateRandomString(16), // Generate a unique ID for the user
  habits: fixedHabits,          // Initialize with fixed habits

  deleteHabit: async (id) => {
    const req = await api.post("/habits/delete", {
      id,
    });

    if (req?.habits) {
      set((state) => ({ ...state, ...req, loaded: true }));
    }
  },

  createHabit: async (name) => {
    const req = await api.post("/habits/create", {
      name: name,
    });

    if (req?.habits) {
      set((state) => ({ ...state, ...req, loaded: true }));
    }
  },

  renameHabit: async (id, name) => {
    const req = await api.post("/habits/rename", {
      id,
      name,
    });

    if (req?.habits) {
      set((state) => ({ ...state, ...req, loaded: true }));
    }
  },

  updateUserInfo: async () => {
    const info = await api.get("/habits");

    if (info?.habits && info.habits.length > 0) {
      set((state) => ({ ...state, ...info, loaded: true }));
    } else {
      // If no habits exist, initialize with fixed habits
      set({ habits: fixedHabits, loaded: true });
    }
  },
}));
