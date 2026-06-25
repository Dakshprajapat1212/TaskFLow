import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '../store/useBoardStore';
import { useUIStore } from '../store/useUIStore';
import TaskColumn from '../components/TaskColumn';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailDrawer from '../components/TaskDetailDrawer';
import { LayoutGrid, Plus, MoreHorizontal, ArrowLeft, Loader2, ListFilter, Users, Menu } from 'lucide-react';
import { normalizeSubtasks } from '../utils/boardUtils';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' }
];

const BoardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    boards, tasks, fetchTasks, isLoading, error, clearError,
    reorderTask, updateTaskStatus, undo, addColumn
  } = useBoardStore();
  const { toggleSidebar } = useUIStore();

  const [activeTask, setActiveTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [createModalStatus, setCreateModalStatus] = useState('todo');
  const [localTasks, setLocalTasks] = useState([]);

  const handleOpenCreateModal = (statusId = 'todo') => {
    setCreateModalStatus(statusId);
    setIsCreateModalOpen(true);
  };

  const board = useMemo(() => boards.find((b) => b._id === id), [boards, id]);
  const activeColumns = board?.columns?.length > 0 ? board.columns : COLUMNS;

  useEffect(() => {
    fetchTasks(id);
    return () => clearError();
  }, [id, fetchTasks, clearError]);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    setLocalTasks((prevTasks) => {
      const activeTaskIndex = prevTasks.findIndex((t) => t._id === activeId);
      if (activeTaskIndex === -1) return prevTasks;
      const activeTask = prevTasks[activeTaskIndex];

      const isOverColumn = activeColumns.some((col) => col.id === overId);
      if (isOverColumn) {
        if (activeTask.status !== overId) {
          const nextTasks = [...prevTasks];
          nextTasks[activeTaskIndex] = { ...activeTask, status: overId };
          return nextTasks;
        }
        return prevTasks;
      }

      const overTaskIndex = prevTasks.findIndex((t) => t._id === overId);
      if (overTaskIndex !== -1) {
        const overTask = prevTasks[overTaskIndex];
        if (activeTask.status !== overTask.status) {
          const nextTasks = [...prevTasks];
          nextTasks[activeTaskIndex] = { ...activeTask, status: overTask.status };
          
          // Move item to the over index
          const item = nextTasks.splice(activeTaskIndex, 1)[0];
          nextTasks.splice(overTaskIndex, 0, item);
          return nextTasks;
        } else {
          // Same column reordering during drag over for smoother visual
          const nextTasks = [...prevTasks];
          const item = nextTasks.splice(activeTaskIndex, 1)[0];
          nextTasks.splice(overTaskIndex, 0, item);
          return nextTasks;
        }
      }
      return prevTasks;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;
    const activeTask = tasks.find(t => t._id === activeId);
    
    if (!activeTask) return;

    const isOverColumn = activeColumns.some(col => col.id === overId);
    
    if (isOverColumn) {
      if (activeTask.status !== overId) {
        updateTaskStatus(activeId, overId);
      }
    } else {
      const overTask = tasks.find(t => t._id === overId);
      if (overTask) {
        if (activeTask.status !== overTask.status) {
          updateTaskStatus(activeId, overTask.status).then(() => {
            reorderTask(activeId, overId);
          });
        } else {
          reorderTask(activeId, overId);
        }
      }
    }
  };

  const handleCardClick = (task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleEditClick = (task) => {
    setTaskToEdit(task);
    setIsCreateModalOpen(true);
    setIsDrawerOpen(false);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setTaskToEdit(null);
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    await addColumn(board._id, newColumnTitle.trim());
    setIsAddingColumn(false);
    setNewColumnTitle('');
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-[#09090b]">
        <div className="bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800/80 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
        </div>
        <div className="flex-1 overflow-hidden p-6">
          <div className="flex gap-6 h-full">
            {[1, 2, 3].map((col) => (
              <div key={col} className="w-[340px] shrink-0 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 w-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                {[1, 2].map((card) => (
                  <div key={card} className="h-28 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 animate-pulse">
                    <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
                    <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded mt-auto" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-[#09090b]">
        <div className="text-center">
          <p className="text-[13px] text-red-500 mb-3">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="text-[13px] text-zinc-600 hover:text-zinc-900 underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-[#09090b]">
      {/* Premium Header */}
      <div className="bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800/80 px-6 py-4 flex items-center justify-between shrink-0 z-10 shadow-sm shadow-black/[0.02]">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors dark:hover:text-white dark:hover:bg-zinc-800"
          >
            <Menu className="w-4 h-4 stroke-[2]" />
          </button>
          <button 
            onClick={() => navigate('/')}
            className="hidden md:block p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors dark:hover:text-white dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
          
          <div className="w-6 h-6 rounded-[4px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center shrink-0">
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 stroke-[1.5]" />
          </div>
          
          <div className="flex flex-col truncate">
            <h1 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate leading-tight">
              {board?.title || 'Loading Board...'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 mr-2 border-r border-zinc-200 dark:border-zinc-800 pr-3">
            <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors dark:hover:text-zinc-200 dark:hover:bg-zinc-800" aria-label="Filter">
              <ListFilter className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors dark:hover:text-zinc-200 dark:hover:bg-zinc-800" aria-label="Members">
              <Users className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
          <button
            onClick={() => handleOpenCreateModal(activeColumns[0]?.id || 'todo')}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors shadow-vercel-sm shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
            New Issue
          </button>
          <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors ml-1 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 shrink-0">
            <MoreHorizontal className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="h-full inline-flex items-start p-6 gap-6 min-w-max">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners} 
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {activeColumns.map((col) => {
              const columnTasks = localTasks
                .filter((t) => t.status === col.id)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

              return (
                <div key={col.id} className="w-[340px] flex flex-col h-full max-h-full shrink-0">
                  <TaskColumn 
                    column={col} 
                    tasks={columnTasks}
                    onCardClick={handleCardClick}
                    onAddTask={() => handleOpenCreateModal(col.id)}
                  />
                </div>
              );
            })}

            <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
              {activeTask ? (
                <div className="rotate-2 scale-105 shadow-vercel-xl cursor-grabbing opacity-90">
                  <TaskCard task={activeTask} isOverlay={true} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Add Column Placeholder */}
          {isAddingColumn ? (
            <form onSubmit={handleAddColumn} className="w-[340px] shrink-0 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm h-fit">
              <input
                autoFocus
                type="text"
                placeholder="Column title..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white mb-2"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-md hover:bg-zinc-800 dark:hover:bg-white">
                  Save
                </button>
                <button type="button" onClick={() => setIsAddingColumn(false)} className="px-3 py-1.5 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsAddingColumn(true)}
              className="w-[340px] shrink-0 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200 px-3 py-2.5 rounded-lg border border-transparent transition-colors mt-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              <span className="text-[13px] font-medium">Add Column</span>
            </button>
          )}
        </div>
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseModal} 
        boardId={id} 
        taskToEdit={taskToEdit}
        initialStatus={createModalStatus}
      />
      
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedTask(null); }}
        onEdit={handleEditClick}
      />
    </div>
  );
};

export default BoardDetails;
