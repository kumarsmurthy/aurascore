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
  createHabit: (name?: string, id?: string) => void; // Allow optional ID for fixed habits
  renameHabit: (id: string, name: string) => void;
  updateUserInfo: () => void;
};

// Define the five fixed habits with unique IDs
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
  habits: [], // Initialize with an empty array; we'll populate it below

  deleteHabit: async (id) => {
    const req = await api.post("/habits/delete", { id });

    if (req?.habits) {
      set((state) => ({ ...state, ...req, loaded: true }));
    }
  },

  createHabit: async (name, id) => {
    // If an ID is provided (for fixed habits), include it in the request
    const payload = id ? { name, id } : { name };
    const req = await api.post("/habits/create", payload);

    if (req?.habits) {
      set((state) => ({ ...state, ...req, loaded: true }));
    }
  },

  renameHabit: async (id, name) => {
    const req = await api.post("/habits/rename", { id, name });

    if (req?.habits) {
      set((state) => ({ ...state, ...req, loaded: true }));
    }
  },

  updateUserInfo: async () => {
    const info = await api.get("/habits");

    if (info?.habits) {
      // Extract existing habit IDs
      const existingHabitIds = info.habits.map((habit: Habit) => habit.id);

      // Determine which fixed habits are missing
      const missingFixedHabits = fixedHabits.filter(
        (fixedHabit) => !existingHabitIds.includes(fixedHabit.id)
      );

      // If there are missing fixed habits, create them
      if (missingFixedHabits.length > 0) {
        // Create each missing fixed habit
        for (const habit of missingFixedHabits) {
          await get().createHabit(habit.name, habit.id);
        }

        // Optionally, you can refetch the habits after creation
        const updatedInfo = await api.get("/habits");
        set((state) => ({ ...state, ...updatedInfo, loaded: true }));
      } else {
        // If all fixed habits exist, simply update the store
        set((state) => ({ ...state, ...info, loaded: true }));
      }
    } else {
      // If no habits exist, initialize with fixed habits
      for (const habit of fixedHabits) {
        await get().createHabit(habit.name, habit.id);
      }
      // Optionally, set the fixed habits directly
      set({ habits: fixedHabits, loaded: true });
    }
  },
}));
