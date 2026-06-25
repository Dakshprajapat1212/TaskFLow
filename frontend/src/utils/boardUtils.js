export const COLUMNS = [
  {
    id: 'todo',
    title: 'Todo',
    tone: 'slate',
    accent: 'border-slate-200/80',
    headerBg: 'bg-white/90 dark:bg-slate-900/90',
    dot: 'bg-slate-400',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tone: 'blue',
    accent: 'border-blue-200/80',
    headerBg: 'bg-white/90 dark:bg-slate-900/90',
    dot: 'bg-blue-500',
  },
  {
    id: 'done',
    title: 'Done',
    tone: 'emerald',
    accent: 'border-emerald-200/80',
    headerBg: 'bg-white/90 dark:bg-slate-900/90',
    dot: 'bg-emerald-500',
  },
];

export const COLUMN_IDS = COLUMNS.map((c) => c.id);

export const PRIORITY_CONFIG = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-600 ring-slate-200/60' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 ring-amber-200/60' },
  high: { label: 'High', className: 'bg-red-50 text-red-700 ring-red-200/60' },
};

export const STATUS_CONFIG = {
  todo: { label: 'To Do', className: 'bg-slate-100 text-slate-600' },
  'in-progress': { label: 'In Progress', className: 'bg-blue-50 text-blue-700' },
  done: { label: 'Done', className: 'bg-emerald-50 text-emerald-700' },
};

export const EFFORT_BADGE = {
  'Small (1-2 hours)': 'bg-teal-50 text-teal-700',
  'Medium (1 day)': 'bg-indigo-50 text-indigo-700',
  'Large (2-3 days)': 'bg-orange-50 text-orange-700',
  'Epic (1+ week)': 'bg-purple-50 text-purple-700',
};

export function getSubtaskStatus(st) {
  if (st.status) return st.status;
  return st.completed ? 'done' : 'todo';
}

export function getNextSubtaskStatus(status) {
  if (status === 'todo') return 'in-progress';
  if (status === 'in-progress') return 'done';
  return 'in-progress';
}

export function normalizeSubtasks(subtasks = []) {
  return subtasks.map((st) => {
    const status = getSubtaskStatus(st);
    return { ...st, status, completed: status === 'done' };
  });
}

export function deriveParentStatus(subtasks) {
  if (!subtasks?.length) return null;
  const normalized = normalizeSubtasks(subtasks);
  if (normalized.every((st) => st.status === 'done')) return 'done';
  if (normalized.some((st) => st.status === 'in-progress')) return 'in-progress';
  return 'todo';
}

export function getSubtasksForColumn(task, columnId) {
  if (!task.subtasks?.length) return [];
  return normalizeSubtasks(task.subtasks).filter((st) => st.status === columnId);
}

export function taskAppearsInColumn(task, columnId) {
  if (!task.subtasks?.length) return task.status === columnId;
  return getSubtasksForColumn(task, columnId).length > 0;
}

export function getCompletedCount(subtasks = []) {
  return normalizeSubtasks(subtasks).filter((st) => st.status === 'done').length;
}

export function getRemainingCount(subtasks = [], columnId = 'todo') {
  return getSubtasksForColumn({ subtasks }, columnId).length;
}

export function buildColumnItems(tasks, columnId) {
  const items = [];

  for (const task of tasks) {
    if (!task.subtasks?.length) {
      if (task.status === columnId) {
        items.push({ type: 'task', task, visibleSubtasks: [], key: task._id });
      }
      continue;
    }

    const visibleSubtasks = getSubtasksForColumn(task, columnId);
    if (visibleSubtasks.length > 0) {
      items.push({
        type: 'parent',
        task,
        visibleSubtasks,
        key: `${task._id}-${columnId}`,
      });
    }
  }

  return items;
}

export function resolveDropColumn(overId, tasks) {
  if (typeof overId === 'string' && overId.includes('::')) {
    return overId.split('::').at(-1);
  }
  const overTask = tasks.find((t) => t._id === overId);
  if (overTask) return overTask.status;
  return overId;
}

export function getEffortBadgeClass(effort) {
  if (!effort) return 'bg-slate-100 text-slate-600';
  for (const [key, cls] of Object.entries(EFFORT_BADGE)) {
    if (effort.toLowerCase().includes(key.split(' ')[0].toLowerCase())) return cls;
  }
  return 'bg-slate-100 text-slate-600';
}

export function filterTasks(tasks, { searchQuery, priorityFilter, categoryFilter, statusFilter, assigneeFilter }) {
  let result = [...tasks];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
        t.subtasks?.some((st) => st.title.toLowerCase().includes(q))
    );
  }

  if (priorityFilter !== 'all') {
    result = result.filter((t) => t.priority === priorityFilter);
  }

  if (categoryFilter !== 'all') {
    result = result.filter((t) => t.tags?.includes(categoryFilter));
  }

  if (statusFilter !== 'all') {
    result = result.filter((t) => t.status === statusFilter);
  }

  if (assigneeFilter !== 'all') {
    result = result.filter((t) => (t.assignee || 'Unassigned') === assigneeFilter);
  }

  return result;
}

export function sortTasks(tasks, sortBy) {
  const result = [...tasks];
  result.sort((a, b) => {
    if (sortBy === 'manual') {
      const aOrder = Number.isFinite(a.sortOrder) ? a.sortOrder : Number.MAX_SAFE_INTEGER;
      const bOrder = Number.isFinite(b.sortOrder) ? b.sortOrder : Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'priority') {
      const w = { high: 3, medium: 2, low: 1 };
      return w[b.priority] - w[a.priority];
    }
    return 0;
  });
  return result;
}

export function getAllCategories(tasks) {
  const cats = new Set();
  tasks.forEach((t) => t.tags?.forEach((tag) => cats.add(tag)));
  return Array.from(cats).sort();
}

export function getAllAssignees(tasks) {
  const set = new Set(['Unassigned']);
  tasks.forEach((t) => set.add(t.assignee || 'Unassigned'));
  return Array.from(set).sort();
}

