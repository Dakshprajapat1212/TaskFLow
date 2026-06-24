import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      // General
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Appearance
      theme: 'system', // 'light' | 'dark' | 'system'
      
      // Board Preferences
      defaultView: 'kanban', // 'kanban' | 'list'
      defaultSort: 'custom', // 'custom' | 'dueDate' | 'priority'
      
      // Notifications
      taskUpdates: true,
      dueReminders: true,
      assignmentNotifs: true,

      // Actions
      setTheme: (theme) => {
        set({ theme });
        // Apply theme immediately
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
    }),
    {
      name: 'taskflow-settings',
    }
  )
);
