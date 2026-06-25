import { create } from 'zustand';
import api from '../utils/api';
import { getNextSubtaskStatus, normalizeSubtasks, deriveParentStatus } from '../utils/boardUtils';

const MAX_HISTORY = 50;

const pushHistory = (past, command) => {
  const next = [...past, command];
  return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
};

export const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  tasks: [],
  activities: [],
  historyPast: [],
  historyFuture: [],
  isLoading: false,
  error: null,
  successMsg: null,
  allWorkspaceTasks: [],

  _recordCommand: (command) => {
    set((state) => ({
      historyPast: pushHistory(state.historyPast, command),
      historyFuture: [],
    }));
  },

  _applyTasks: (tasks) => set({ tasks }),

  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/boards');
      set({ boards: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch boards', isLoading: false });
    }
  },

  fetchAllWorkspaceTasks: async () => {
    let currentBoards = get().boards;
    if (currentBoards.length === 0) {
      try {
        const res = await api.get('/boards');
        currentBoards = res.data;
        set({ boards: res.data });
      } catch (err) {
        return;
      }
    }
    try {
      const results = await Promise.allSettled(
        currentBoards.map(board => api.get(`/tasks?boardId=${board._id}`))
      );
      const allTasks = [];
      results.forEach(res => {
        if (res.status === 'fulfilled') {
          allTasks.push(...res.value.data);
        }
      });
      set({ allWorkspaceTasks: allTasks });
    } catch (err) {
      console.error(err);
    }
  },

  fetchActivities: async (boardId) => {
    try {
      const res = await api.get(`/activities?boardId=${boardId}`);
      set({ activities: res.data });
    } catch {
      // non-critical
    }
  },

  createBoard: async (title, description) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/boards', { title, description });
      set((state) => ({ boards: [...state.boards, res.data], isLoading: false, successMsg: 'Project created successfully.' }));
      get().fetchAllWorkspaceTasks();
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create board', isLoading: false });
      throw error;
    }
  },

  deleteBoard: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/boards/${id}`);
      set((state) => ({ boards: state.boards.filter((b) => b._id !== id), isLoading: false, successMsg: 'Project deleted.' }));
      get().fetchAllWorkspaceTasks();
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete board', isLoading: false });
    }
  },

  addColumn: async (boardId, columnTitle) => {
    const board = get().boards.find(b => b._id === boardId);
    if (!board) return;
    
    // Create new column object
    const newColumn = {
      id: columnTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: columnTitle
    };
    
    const updatedColumns = [...(board.columns || []), newColumn];
    
    // Optimistic update
    set((state) => ({
      boards: state.boards.map(b => b._id === boardId ? { ...b, columns: updatedColumns } : b)
    }));
    
    try {
      const res = await api.put(`/boards/${boardId}`, { columns: updatedColumns });
      set((state) => ({
        boards: state.boards.map(b => b._id === boardId ? res.data : b)
      }));
      return res.data;
    } catch (error) {
      // Revert optimistic update
      set((state) => ({
        boards: state.boards.map(b => b._id === boardId ? board : b),
        error: 'Failed to add column'
      }));
      throw error;
    }
  },

  fetchTasks: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/tasks?boardId=${boardId}`);
      set({ tasks: res.data, isLoading: false, currentBoard: boardId });
      get().fetchActivities(boardId);
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch tasks', isLoading: false });
    }
  },

  createTask: async (taskData, { skipHistory = false } = {}) => {
    const prevTasks = get().tasks;
    set({ error: null });

    const optimistic = {
      ...taskData,
      _id: `temp-${Date.now()}`,
      subtasks: normalizeSubtasks(taskData.subtasks || []),
      createdAt: new Date().toISOString(),
      sortOrder: taskData.sortOrder ?? Date.now(),
      status: taskData.status || 'todo',
    };
    set((state) => ({ tasks: [optimistic, ...state.tasks] }));

    try {
      const res = await api.post('/tasks', taskData);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === optimistic._id ? res.data : t)),
      }));

      if (!skipHistory) {
        get()._recordCommand({
          type: 'CREATE_TASK',
          taskId: res.data._id,
          snapshot: null,
          after: res.data,
        });
      }

      get().fetchActivities(get().currentBoard);
      get().fetchAllWorkspaceTasks();
      set({ successMsg: 'Task created successfully.' });
      return res.data;
    } catch (error) {
      set({ tasks: prevTasks, error: error.response?.data?.message || 'Failed to create task' });
      throw error;
    }
  },

  updateTask: async (id, taskData, { skipHistory = false, beforeSnapshot = null } = {}) => {
    const prevTasks = get().tasks;
    const before = beforeSnapshot || prevTasks.find((t) => t._id === id);
    if (!before) return;

    const merged = { ...before, ...taskData };
    if (taskData.subtasks) {
      merged.subtasks = normalizeSubtasks(taskData.subtasks);
      const derived = deriveParentStatus(merged.subtasks);
      if (derived) merged.status = derived;
    }

    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? merged : t)),
    }));

    try {
      const res = await api.put(`/tasks/${id}`, taskData);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? res.data : t)),
      }));

      if (!skipHistory) {
        get()._recordCommand({
          type: 'UPDATE_TASK',
          taskId: id,
          snapshot: before,
          after: res.data,
        });
      }

      get().fetchActivities(get().currentBoard);
      get().fetchAllWorkspaceTasks();
      return res.data;
    } catch (error) {
      set({ tasks: prevTasks, error: 'Failed to update task. Changes reverted.' });
      throw error;
    }
  },

  updateTaskStatus: async (id, newStatus) => {
    const task = get().tasks.find((t) => t._id === id);
    if (!task) return;
    
    // Good Logic: Auto-update subtasks based on parent drop
    let updatedSubtasks = task.subtasks;
    if (task.subtasks?.length > 0) {
      if (newStatus === 'done') {
        updatedSubtasks = task.subtasks.map(st => ({ ...st, status: 'done', completed: true }));
      } else if (newStatus === 'todo') {
        updatedSubtasks = task.subtasks.map(st => ({ ...st, status: 'todo', completed: false }));
      }
    }
    
    return get().updateTask(id, { status: newStatus, subtasks: updatedSubtasks });
  },

  reorderTask: async (activeId, overId) => {
    if (!activeId || !overId || activeId === overId) return;

    const prevTasks = get().tasks;
    const tasks = get().tasks.map((task, index) => ({
      ...task,
      sortOrder: Number.isFinite(task.sortOrder) ? task.sortOrder : index * 1000,
    }));
    const activeIndex = tasks.findIndex((t) => t._id === activeId);
    const overIndex = tasks.findIndex((t) => t._id === overId);
    if (activeIndex < 0 || overIndex < 0) return;

    const active = tasks[activeIndex];
    const withoutActive = tasks.filter((t) => t._id !== activeId);
    const insertIndex = withoutActive.findIndex((t) => t._id === overId);
    const finalIndex = activeIndex < overIndex ? insertIndex + 1 : insertIndex;
    const nextTasks = [...withoutActive];

    const prev = nextTasks[finalIndex - 1];
    const next = nextTasks[finalIndex];
    let sortOrder;
    if (prev && next) sortOrder = (prev.sortOrder + next.sortOrder) / 2;
    else if (prev) sortOrder = prev.sortOrder + 1000;
    else if (next) sortOrder = next.sortOrder - 1000;
    else sortOrder = 0;

    const updatedActive = { ...active, sortOrder };
    nextTasks.splice(finalIndex, 0, updatedActive);
    set({ tasks: nextTasks });

    try {
      const res = await api.put(`/tasks/${activeId}`, { sortOrder });
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === activeId ? { ...t, ...res.data } : t)),
      }));
    } catch (error) {
      set({ tasks: prevTasks, error: 'Failed to reorder task.' });
      throw error;
    }
  },

  toggleSubtaskComplete: async (taskId, subtaskId, forceCompleted) => {
    const task = get().tasks.find((t) => t._id === taskId);
    if (!task) return;
    
    const before = { ...task };
    let newStatus;
    
    const subtasks = (task.subtasks || []).map((st, i) => {
      const id = st._id || st.id || i;
      const match = id === subtaskId || st.title === subtaskId;
      if (!match) return st;
      
      const currentStatus = st.status || (st.completed ? 'done' : 'todo');
      if (typeof forceCompleted === 'boolean') {
        newStatus = forceCompleted ? 'done' : 'todo';
      } else {
        if (currentStatus === 'todo') newStatus = 'in-progress';
        else if (currentStatus === 'in-progress') newStatus = 'done';
        else newStatus = 'todo';
      }
      
      return { ...st, status: newStatus, completed: newStatus === 'done' };
    });
    
    return get().updateTask(taskId, { subtasks }, { beforeSnapshot: before });
  },

  deleteTask: async (id, { skipHistory = false } = {}) => {
    const taskToDelete = get().tasks.find((t) => t._id === id);
    if (!taskToDelete) return;

    const prevTasks = get().tasks;
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id), error: null }));

    try {
      await api.delete(`/tasks/${id}`);

      if (!skipHistory) {
        get()._recordCommand({
          type: 'DELETE_TASK',
          taskId: id,
          snapshot: taskToDelete,
          after: null,
        });
      }

      get().fetchActivities(get().currentBoard);
      get().fetchAllWorkspaceTasks();
      set({ successMsg: 'Task deleted.' });
    } catch (error) {
      set({ tasks: prevTasks, error: error.response?.data?.message || 'Failed to delete task' });
      throw error;
    }
  },

  bulkUpdateTasks: async (ids, updates) => {
    for (const id of ids) {
      await get().updateTask(id, updates);
    }
  },

  bulkDeleteTasks: async (ids) => {
    for (const id of ids) {
      await get().deleteTask(id);
    }
  },

  undo: async () => {
    const { historyPast, historyFuture, createTask, updateTask, deleteTask } = get();
    if (historyPast.length === 0) return;

    const command = historyPast[historyPast.length - 1];
    set((state) => ({
      historyPast: state.historyPast.slice(0, -1),
      historyFuture: [command, ...state.historyFuture],
    }));

    try {
      switch (command.type) {
        case 'CREATE_TASK':
          await deleteTask(command.taskId, { skipHistory: true });
          break;
        case 'DELETE_TASK':
          await createTask(
            {
              title: command.snapshot.title,
              description: command.snapshot.description,
              status: command.snapshot.status,
              priority: command.snapshot.priority,
              sortOrder: command.snapshot.sortOrder,
              dueDate: command.snapshot.dueDate,
              estimatedEffort: command.snapshot.estimatedEffort,
              assignee: command.snapshot.assignee,
              subtasks: command.snapshot.subtasks,
              tags: command.snapshot.tags,
              comments: command.snapshot.comments,
              boardId: command.snapshot.board?._id || command.snapshot.board,
            },
            { skipHistory: true }
          );
          break;
        case 'UPDATE_TASK':
          await updateTask(
            command.taskId,
            {
              title: command.snapshot.title,
              description: command.snapshot.description,
              status: command.snapshot.status,
              priority: command.snapshot.priority,
              sortOrder: command.snapshot.sortOrder,
              dueDate: command.snapshot.dueDate,
              estimatedEffort: command.snapshot.estimatedEffort,
              assignee: command.snapshot.assignee,
              subtasks: command.snapshot.subtasks,
              tags: command.snapshot.tags,
              comments: command.snapshot.comments,
            },
            { skipHistory: true }
          );
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Undo failed:', err);
      set({ error: 'Failed to undo last action' });
    }
  },

  redo: async () => {
    const { historyFuture, historyPast, createTask, updateTask, deleteTask } = get();
    if (historyFuture.length === 0) return;

    const command = historyFuture[0];
    set((state) => ({
      historyFuture: state.historyFuture.slice(1),
      historyPast: pushHistory(state.historyPast, command),
    }));

    try {
      switch (command.type) {
        case 'CREATE_TASK':
          await createTask(
            {
              title: command.after.title,
              description: command.after.description,
              status: command.after.status,
              priority: command.after.priority,
              sortOrder: command.after.sortOrder,
              dueDate: command.after.dueDate,
              estimatedEffort: command.after.estimatedEffort,
              assignee: command.after.assignee,
              subtasks: command.after.subtasks,
              tags: command.after.tags,
              comments: command.after.comments,
              boardId: command.after.board?._id || command.after.board,
            },
            { skipHistory: true }
          );
          break;
        case 'DELETE_TASK':
          await deleteTask(command.taskId, { skipHistory: true });
          break;
        case 'UPDATE_TASK':
          await updateTask(
            command.taskId,
            {
              title: command.after.title,
              description: command.after.description,
              status: command.after.status,
              priority: command.after.priority,
              sortOrder: command.after.sortOrder,
              dueDate: command.after.dueDate,
              estimatedEffort: command.after.estimatedEffort,
              assignee: command.after.assignee,
              subtasks: command.after.subtasks,
              tags: command.after.tags,
              comments: command.after.comments,
            },
            { skipHistory: true }
          );
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Redo failed:', err);
      set({ error: 'Failed to redo action' });
    }
  },

  clearError: () => set({ error: null }),
  clearSuccessMsg: () => set({ successMsg: null }),
}));

