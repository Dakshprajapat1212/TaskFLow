import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, CheckSquare, MessageSquare, GripVertical, AlertCircle, SignalHigh, SignalMedium, SignalLow } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { getCompletedCount, normalizeSubtasks } from '../utils/boardUtils';
import SubtaskItem from './SubtaskItem';
import { useBoardStore } from '../store/useBoardStore';

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'high': return <SignalHigh className="w-[14px] h-[14px] text-orange-500" />;
    case 'medium': return <SignalMedium className="w-[14px] h-[14px] text-blue-500" />;
    case 'low': return <SignalLow className="w-[14px] h-[14px] text-zinc-400" />;
    default: return <SignalMedium className="w-[14px] h-[14px] text-zinc-400" />;
  }
};

const TaskCard = ({ task, onClick, isOverlay }) => {
  const { toggleSubtaskComplete } = useBoardStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, disabled: isOverlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isOverlay ? { cursor: 'grabbing' } : {})
  };

  const subtasks = normalizeSubtasks(task.subtasks || []);
  const completedCount = getCompletedCount(subtasks);
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'done';
  const isDone = task.status === 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      title="Drag to move, click to view details"
      className={`group relative flex flex-col bg-white dark:bg-[#09090b] border ${
        isDragging 
          ? 'opacity-50 ring-2 ring-blue-500/50 border-transparent shadow-vercel-lg' 
          : 'border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-vercel-sm hover:shadow-linear-hover'
      } rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-200 ease-out`}
      onClick={onClick}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <div className="mt-[3px] shrink-0">
              {getPriorityIcon(task.priority)}
            </div>
            <h4 className={`text-[13px] font-medium tracking-tight leading-snug line-clamp-2 ${isDone ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
              {task.title}
            </h4>
          </div>
          {task.assignee && (
            <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-semibold text-zinc-600 dark:text-zinc-400">
                {task.assignee.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {task.tags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded-[4px] bg-zinc-100 dark:bg-zinc-800/60 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 tracking-wide border border-transparent dark:border-zinc-700/50">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Subtasks inline preview */}
        {subtasks.length > 0 && (
          <div 
            className="flex flex-col gap-1 mt-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {subtasks.map((st) => (
              <SubtaskItem
                key={st._id || st.id || st.title}
                subtask={st}
                onToggle={(id, completed) => toggleSubtaskComplete(task._id, id, completed)}
                compact
              />
            ))}
          </div>
        )}

        {/* Footer Meta */}
        <div className="flex items-center gap-3 mt-2 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
          {task.dueDate && (
            <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500 dark:text-red-400' : ''}`}>
              {isOverdue ? <AlertCircle className="w-3.5 h-3.5 stroke-[1.5]" /> : <CalendarDays className="w-3.5 h-3.5 stroke-[1.5]" />}
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
          
          {subtasks.length > 0 && (
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{completedCount}/{subtasks.length}</span>
            </div>
          )}

          {(task.comments?.length > 0) && (
            <div className="flex items-center gap-1.5 ml-auto">
              <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
