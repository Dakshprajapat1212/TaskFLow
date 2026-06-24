import { Clock, Tag, Flag, CircleDot } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  const config = {
    high: { icon: Flag, class: 'bg-orange-50 text-orange-700 border-orange-200/50 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' },
    medium: { icon: Flag, class: 'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
    low: { icon: Flag, class: 'bg-zinc-50 text-zinc-700 border-zinc-200/50 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20' }
  };
  
  const { icon: Icon, class: className } = config[priority] || config.medium;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border ${className}`}>
      <Icon className="w-3 h-3 stroke-[1.5]" />
      <span className="capitalize">{priority}</span>
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const config = {
    todo: { icon: CircleDot, class: 'bg-zinc-50 text-zinc-700 border-zinc-200/50 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20' },
    'in-progress': { icon: CircleDot, class: 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
    done: { icon: CircleDot, class: 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' }
  };

  const { icon: Icon, class: className } = config[status] || config.todo;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border ${className}`}>
      <Icon className="w-3 h-3 stroke-[1.5]" />
      <span className="capitalize">{status.replace('-', ' ')}</span>
    </span>
  );
};

export const CategoryBadge = ({ tag }) => (
  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border bg-zinc-50 text-zinc-600 border-zinc-200/50 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50">
    <Tag className="w-3 h-3 stroke-[1.5]" />
    {tag}
  </span>
);

export const EffortBadge = ({ effort }) => (
  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border bg-zinc-50 text-zinc-600 border-zinc-200/50 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50">
    <Clock className="w-3 h-3 stroke-[1.5]" />
    {effort}
  </span>
);

export const ProgressBar = ({ value, max, className = '' }) => {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 mb-1.5">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-zinc-900 dark:bg-zinc-100 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
