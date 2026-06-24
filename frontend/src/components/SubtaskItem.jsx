import { Check, Circle, Timer } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const SubtaskItem = ({ subtask, onToggle, compact = false }) => {
  const id = subtask._id || subtask.id || subtask.title;
  const status = subtask.status || (subtask.completed ? 'done' : 'todo');
  const isDone = status === 'done';
  const isActive = status === 'in-progress';

  const tooltipText = isDone ? "Click to reset to To Do" : isActive ? "Click to complete (Moves to Done)" : "Click to start task (Moves to In Progress)";

  return (
    <div 
      className={cn(
        'group flex items-start gap-2.5 rounded-md cursor-pointer transition-colors',
        compact ? 'py-0.5 px-1 -mx-1 hover:bg-zinc-100 dark:hover:bg-zinc-800/50' : 'py-1.5 px-2 -mx-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(id);
      }}
      title={tooltipText}
    >
      <button
        className={cn(
          'mt-[3px] shrink-0 w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-colors border',
          isDone
            ? 'bg-blue-500 border-blue-500 text-white dark:bg-blue-600 dark:border-blue-600'
            : isActive
              ? 'bg-amber-100 border-amber-300 text-amber-600 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-400'
              : 'bg-transparent border-zinc-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
        )}
      >
        {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        {isActive && <Timer className="w-2.5 h-2.5 stroke-[2.5]" />}
      </button>
      <span 
        className={cn(
          'text-[13px] tracking-tight leading-snug line-clamp-2 transition-colors',
          isDone 
            ? 'text-zinc-400 dark:text-zinc-600 line-through' 
            : isActive
              ? 'text-zinc-900 font-medium dark:text-zinc-100'
              : 'text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
        )}
      >
        {subtask.title}
      </span>
    </div>
  );
};

export default SubtaskItem;
