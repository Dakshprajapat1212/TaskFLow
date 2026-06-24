import { X, CalendarDays, Clock, User, MessageSquare, Activity, CheckSquare, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import SubtaskItem from './SubtaskItem';
import { PriorityBadge, StatusBadge, CategoryBadge, EffortBadge, ProgressBar } from './ui/Badges';
import { getCompletedCount, normalizeSubtasks } from '../utils/boardUtils';
import { useBoardStore } from '../store/useBoardStore';

const TaskDetailDrawer = ({ task, onClose, onEdit }) => {
  const [comment, setComment] = useState('');
  const { activities, updateTask, toggleSubtaskComplete } = useBoardStore();

  if (!task) return null;

  const subtasks = normalizeSubtasks(task.subtasks || []);
  const completedCount = getCompletedCount(subtasks);
  const parentStatus = task.status;
  const taskActivities = activities.filter((a) => a.task === task._id || a.task?._id === task._id);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    const comments = [
      ...(task.comments || []),
      { text: comment.trim(), author: 'You', createdAt: new Date().toISOString() },
    ];
    await updateTask(task._id, { comments });
    setComment('');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40 animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-[#09090b] shadow-vercel-xl z-50 flex flex-col animate-slide-in-right border-l border-zinc-200 dark:border-zinc-800">
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              Task Details
            </p>
            <h2 className="text-lg font-semibold text-zinc-900 leading-snug dark:text-zinc-100 tracking-tight">
              {task.title}
            </h2>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={parentStatus} />
              {task.tags?.map((tag) => (
                <CategoryBadge key={tag} tag={tag} />
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-50/30 dark:bg-[#09090b]">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-transparent">
            {task.dueDate && (
              <div>
                <p className="text-[11px] font-medium text-zinc-500 mb-1 flex items-center gap-1.5 dark:text-zinc-400 uppercase tracking-wider">
                  <CalendarDays className="w-3.5 h-3.5 stroke-[1.5]" /> Due Date
                </p>
                <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-200">
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </p>
              </div>
            )}
            {task.estimatedEffort && (
              <div>
                <p className="text-[11px] font-medium text-zinc-500 mb-1 flex items-center gap-1.5 dark:text-zinc-400 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 stroke-[1.5]" /> Effort
                </p>
                <EffortBadge effort={task.estimatedEffort} />
              </div>
            )}
            {task.assignee && (
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[11px] font-medium text-zinc-500 mb-1 flex items-center gap-1.5 dark:text-zinc-400 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 stroke-[1.5]" /> Assignee
                </p>
                <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-200">
                  {task.assignee}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-transparent">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-2 dark:text-zinc-400">
              Description
            </h3>
            <div className="text-[13px] text-zinc-700 leading-relaxed whitespace-pre-wrap dark:text-zinc-300">
              {task.description || <span className="text-zinc-400 italic">No description provided.</span>}
            </div>
          </div>

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-transparent">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 dark:text-zinc-400">
                  <CheckSquare className="w-3.5 h-3.5 stroke-[1.5]" /> Subtasks
                </h3>
                <span className="text-[11px] text-zinc-500 font-medium dark:text-zinc-400">
                  {completedCount}/{subtasks.length}
                </span>
              </div>
              <ProgressBar value={completedCount} max={subtasks.length} className="mb-4" />
              <div className="space-y-0.5">
                {subtasks.map((st) => (
                  <SubtaskItem
                    key={st._id || st.id || st.title}
                    subtask={st}
                    onToggle={(id, completed) => toggleSubtaskComplete(task._id, id, completed)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-1.5 dark:text-zinc-400">
              <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" /> Comments
            </h3>
            <div className="space-y-4 mb-4">
              {(task.comments || []).length === 0 && (
                <p className="text-[13px] text-zinc-400 dark:text-zinc-500">No comments yet.</p>
              )}
              {(task.comments || []).map((c, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{c.author}</span>
                    <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                      {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-[13px] text-zinc-600 dark:text-zinc-300">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 text-[13px] border border-zinc-200 rounded-md focus:ring-1 focus:ring-zinc-900 outline-none text-zinc-900 placeholder:text-zinc-400 dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100 transition-colors shadow-sm"
              />
              <button
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className="px-3 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50 transition-colors dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm flex-shrink-0 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="px-6 py-5">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-1.5 dark:text-zinc-400">
              <Activity className="w-3.5 h-3.5 stroke-[1.5]" /> Activity
            </h3>
            <div className="space-y-4">
              {taskActivities.length === 0 && (
                <p className="text-[13px] text-zinc-400 dark:text-zinc-500">No activity recorded.</p>
              )}
              {taskActivities.map((act) => (
                <div key={act._id} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] text-zinc-700 dark:text-zinc-300">{act.action}</p>
                    <p className="text-[10px] font-medium text-zinc-400 mt-0.5 dark:text-zinc-500">
                      {format(new Date(act.createdAt), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 flex justify-between dark:border-zinc-800 shrink-0 bg-white dark:bg-[#09090b]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent rounded-md transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(task)}
            className="px-5 py-1.5 text-[13px] font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-md transition-colors dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
          >
            Edit Task
          </button>
        </div>
      </div>
    </>
  );
};

export default TaskDetailDrawer;
