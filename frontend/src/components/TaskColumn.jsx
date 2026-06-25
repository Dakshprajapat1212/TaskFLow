import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const TaskColumn = ({ column, tasks, onCardClick, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1 shrink-0">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {column.title}
          </h3>
          <span className="bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium px-1.5 py-0.5 rounded-sm">
            {tasks.length}
          </span>
        </div>
        <button onClick={onAddTask} className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/50 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50 rounded transition-colors" title="Add Task">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
      </div>

      {/* Sortable Area */}
      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto custom-scrollbar min-h-[150px] transition-all duration-200 rounded-xl ${
          isOver ? 'bg-blue-50/30 dark:bg-blue-900/10 ring-2 ring-blue-400 dark:ring-blue-500/50 shadow-inner' : ''
        }`}
      >
        <div className="flex flex-col gap-3 p-1">
          <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onClick={() => onCardClick(task)}
              />
            ))}
          </SortableContext>
          
          {tasks.length === 0 && (
            <div 
              onClick={onAddTask}
              className={`h-32 border border-dashed rounded-xl flex flex-col items-center justify-center text-center p-4 transition-colors cursor-pointer ${
              isOver 
                ? 'border-blue-400 dark:border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/20' 
                : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#09090b]/50 group hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50'
            }`}>
              <div className={`w-8 h-8 rounded-lg shadow-vercel-sm flex items-center justify-center mb-2 border ${
                isOver ? 'bg-blue-100 dark:bg-blue-800/50 border-blue-200 dark:border-blue-700' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
              }`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isOver ? 'text-blue-500 dark:text-blue-400' : 'text-zinc-400'}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </div>
              <span className={`text-[12px] font-medium mb-0.5 ${isOver ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                {isOver ? 'Drop task here' : 'No tasks yet'}
              </span>
              <span className={`text-[11px] ${isOver ? 'text-blue-500/80 dark:text-blue-400/80' : 'text-zinc-500'}`}>
                {isOver ? `Move to ${column.title}` : 'Drag tasks here'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskColumn;
