import { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, Clock, AlertCircle, CheckSquare, Tags, Wand2 } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';
import api from '../utils/api';

const CreateTaskModal = ({ isOpen, onClose, boardId, taskToEdit = null, initialStatus = 'todo' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [assignee, setAssignee] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [nlInput, setNlInput] = useState('');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiSubtasksSuggestion, setAiSubtasksSuggestion] = useState(null);
  const [selectedAiSubtasks, setSelectedAiSubtasks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { boards, createTask, updateTask, isLoading, error, clearError } = useBoardStore();

  const board = boards.find(b => b._id === boardId);
  const activeColumns = board?.columns?.length > 0 ? board.columns : [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus(initialStatus);
    setPriority('medium');
    setDueDate('');
    setEstimatedEffort('');
    setSubtasks([]);
    setTags([]);
    setAssignee('');
    setNlInput('');
    setAiSuggestion(null);
    setAiSubtasksSuggestion(null);
    setAiError('');
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
      setEstimatedEffort(taskToEdit.estimatedEffort || '');
      setSubtasks(taskToEdit.subtasks || []);
      setTags(taskToEdit.tags || []);
      setAssignee(taskToEdit.assignee || '');
    } else {
      resetForm();
    }
  }, [taskToEdit, isOpen, initialStatus]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const taskData = {
        title,
        description,
        status,
        priority,
        dueDate: dueDate || undefined,
        estimatedEffort,
        subtasks,
        tags,
        assignee: assignee || undefined,
        boardId,
      };

      if (taskToEdit) {
        await updateTask(taskToEdit._id, taskData);
      } else {
        await createTask(taskData);
      }
      
      handleClose();
    } catch (err) {
      // Error handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    clearError();
    onClose();
  };

  const handleParseNL = async () => {
    if (!nlInput) return;
    setIsAiLoading(true);
    setAiError('');
    try {
      const res = await api.post('/ai/parse', { text: nlInput });
      if (res.data.title) setTitle(res.data.title);
      if (res.data.dueDate) setDueDate(res.data.dueDate);
      if (res.data.priority) setPriority(res.data.priority);
      setNlInput('');
    } catch (err) {
      setAiError('Failed to parse natural language.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSuggestEstimate = async () => {
    if (!title) {
      setAiError('Please enter a task title first.');
      return;
    }
    setIsAiLoading(true);
    setAiError('');
    try {
      const res = await api.post('/ai/suggest', { title, description, priority });
      setAiSuggestion(res.data);
    } catch (err) {
      setAiError('Failed to get suggestion.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSuggestSubtasks = async () => {
    if (!title) {
      setAiError('Please enter a task title first.');
      return;
    }
    setIsAiLoading(true);
    setAiError('');
    try {
      const res = await api.post('/ai/subtasks', { title, description });
      setAiSubtasksSuggestion(res.data.subtasks);
      setSelectedAiSubtasks(res.data.subtasks);
    } catch (err) {
      setAiError('Failed to suggest subtasks.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSuggestTags = async () => {
    if (!title) {
      setAiError('Please enter a task title first.');
      return;
    }
    setIsAiLoading(true);
    setAiError('');
    try {
      const res = await api.post('/ai/categorize', { title, description });
      const newTags = res.data.tags.filter(tag => !tags.includes(tag));
      setTags([...tags, ...newTags]);
    } catch (err) {
      setAiError('Failed to categorize task.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleAiSubtaskSelection = (subtask) => {
    if (selectedAiSubtasks.includes(subtask)) {
      setSelectedAiSubtasks(selectedAiSubtasks.filter(s => s !== subtask));
    } else {
      setSelectedAiSubtasks([...selectedAiSubtasks, subtask]);
    }
  };

  const acceptAiSubtasks = () => {
    const formattedSubtasks = selectedAiSubtasks.map(t => ({ title: t, status: 'todo', completed: false }));
    setSubtasks([...subtasks, ...formattedSubtasks]);
    setAiSubtasksSuggestion(null);
    setSelectedAiSubtasks([]);
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { title: newSubtask.trim(), status: 'todo', completed: false }]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (index) => {
    const updated = [...subtasks];
    updated.splice(index, 1);
    setSubtasks(updated);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#09090b] w-full max-w-5xl rounded-xl shadow-vercel-xl border border-zinc-200 dark:border-zinc-800 my-8 flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* Header */}
        <div className="flex justify-between items-start gap-4 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {taskToEdit ? 'Task editor' : 'New issue'}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {taskToEdit ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-zinc-50/50 dark:bg-[#09090b]">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-[13px] border border-red-200 dark:border-red-800/50 mb-5">
              {error}
            </div>
          )}

          {/* AI Natural Language Input */}
          {!taskToEdit && (
            <div className="mb-5 p-3 bg-white border border-zinc-200 rounded-lg flex gap-3 shadow-vercel-sm dark:bg-[#09090b] dark:border-zinc-800">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Ask AI: e.g. 'Remind me to learn Docker in the next 3 days with high priority'"
                  value={nlInput}
                  onChange={(e) => setNlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleParseNL()}
                  className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-md bg-white text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-100 transition-colors"
                />
                <Wand2 className="absolute left-3 top-2.5 h-4 w-4 text-blue-500 dark:text-blue-400" />
              </div>
              <button
                type="button"
                onClick={handleParseNL}
                disabled={isAiLoading || !nlInput}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md text-[13px] font-medium disabled:opacity-50 transition-colors shrink-0 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm"
              >
                Auto-fill
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5">
            {/* Form Fields */}
            <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
              
              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:bg-[#09090b] dark:border-zinc-800 shadow-vercel-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Task Title *</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-md bg-white text-zinc-900 placeholder:text-zinc-400 focus:ring-1 focus:ring-zinc-900 outline-none dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100 transition-colors"
                      placeholder="e.g. Design Landing Page"
                      value={title}
                      onChange={(e) => { setTitle(e.target.value); if (aiError) setAiError(''); }}
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Description</label>
                    <textarea
                      className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-md bg-white text-zinc-900 placeholder:text-zinc-400 focus:ring-1 focus:ring-zinc-900 outline-none transition-colors resize-none dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100"
                      placeholder="Add more details about this task..."
                      rows="4"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:bg-[#09090b] dark:border-zinc-800 shadow-vercel-sm">
                <h3 className="text-[13px] font-medium text-zinc-900 mb-4 dark:text-zinc-100">Properties</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Status</label>
                    <select
                      className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-md bg-white text-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-colors dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {activeColumns.map(col => (
                        <option key={col.id} value={col.id}>{col.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Priority</label>
                    <select
                      className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-md bg-white text-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-colors dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Due Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full pl-9 pr-3 py-2 text-[13px] border border-zinc-200 rounded-md bg-white text-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-colors [color-scheme:light] dark:[color-scheme:dark] dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                      <Calendar className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Estimated Effort</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full pl-9 pr-3 py-2 text-[13px] border border-zinc-200 rounded-md bg-white text-zinc-900 placeholder:text-zinc-400 focus:ring-1 focus:ring-zinc-900 outline-none transition-colors dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100"
                        placeholder="e.g. Medium (1 day)"
                        value={estimatedEffort}
                        onChange={(e) => setEstimatedEffort(e.target.value)}
                      />
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Assignee</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-md bg-white text-zinc-900 placeholder:text-zinc-400 focus:ring-1 focus:ring-zinc-900 outline-none transition-colors dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100"
                      placeholder="e.g. John Doe"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:bg-[#09090b] dark:border-zinc-800 shadow-vercel-sm">
                <label className="mb-3 flex items-center text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                  <CheckSquare className="h-4 w-4 mr-2 text-zinc-500 dark:text-zinc-400" /> Subtasks
                </label>
                <div className="space-y-2 mb-3">
                  {subtasks.map((st, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-800 dark:bg-zinc-900/50 dark:border-zinc-700 dark:text-zinc-200">
                        {st.title}
                      </div>
                      <button type="button" onClick={() => removeSubtask(i)} className="text-zinc-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                    placeholder="Add a subtask..."
                    className="flex-1 px-3 py-2 text-[13px] border border-zinc-200 rounded-md bg-white text-zinc-900 placeholder:text-zinc-400 focus:ring-1 focus:ring-zinc-900 outline-none dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100 transition-colors"
                  />
                  <button type="button" onClick={addSubtask} className="px-4 py-2 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 text-[13px] font-medium text-zinc-700 transition-colors dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                    Add
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:bg-[#09090b] dark:border-zinc-800 shadow-vercel-sm">
                <label className="mb-3 flex items-center text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                  <Tags className="h-4 w-4 mr-2 text-zinc-500 dark:text-zinc-400" /> Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-sm bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-300">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 text-[13px] border border-zinc-200 rounded-md bg-white text-zinc-900 placeholder:text-zinc-400 focus:ring-1 focus:ring-zinc-900 outline-none dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100 transition-colors"
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 text-[13px] font-medium text-zinc-700 transition-colors dark:bg-[#09090b] dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                    Add
                  </button>
                </div>
              </section>
            </form>

            {/* AI Side Panel */}
            <aside className="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-vercel-sm h-fit shrink-0 dark:bg-[#09090b] dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 border border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">AI Assistant</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Generate metadata</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSuggestSubtasks}
                  disabled={isAiLoading || !title.trim()}
                  className="w-full bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 px-3 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center justify-start disabled:opacity-50 dark:bg-[#09090b] dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                >
                  <CheckSquare className="h-4 w-4 mr-2 text-zinc-400" /> Auto Suggest Subtasks
                </button>

                <button
                  type="button"
                  onClick={handleSuggestTags}
                  disabled={isAiLoading || !title.trim()}
                  className="w-full bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 px-3 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center justify-start disabled:opacity-50 dark:bg-[#09090b] dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                >
                  <Tags className="h-4 w-4 mr-2 text-zinc-400" /> Auto Categorize
                </button>

                <button
                  type="button"
                  onClick={handleSuggestEstimate}
                  disabled={isAiLoading || !title.trim()}
                  className="w-full bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 px-3 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center justify-start disabled:opacity-50 dark:bg-[#09090b] dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                >
                  <Clock className="h-4 w-4 mr-2 text-zinc-400" /> Estimate Effort & Due Date
                </button>
              </div>

              {isAiLoading && (
                <div className="mt-4 flex justify-center">
                  <span className="w-5 h-5 border-2 border-zinc-200 border-t-blue-600 rounded-full animate-spin dark:border-zinc-800 dark:border-t-blue-500"></span>
                </div>
              )}

              {aiError && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600 flex items-start gap-1.5 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* AI Subtasks Suggestion Box */}
              {aiSubtasksSuggestion && (
                <div className="mt-4 p-3 bg-zinc-50 border border-zinc-200 rounded-md dark:bg-zinc-900/50 dark:border-zinc-800 animate-fade-in">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-2 font-medium dark:text-zinc-400">Suggested Subtasks</span>
                  <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {aiSubtasksSuggestion.map((st, i) => (
                      <label key={i} className="flex items-start gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedAiSubtasks.includes(st)}
                          onChange={() => toggleAiSubtaskSelection(st)}
                          className="mt-0.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-[#09090b] dark:checked:bg-blue-500"
                        />
                        <span className="text-[13px] text-zinc-700 group-hover:text-blue-600 transition-colors dark:text-zinc-300 dark:group-hover:text-blue-400">{st}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={acceptAiSubtasks} className="flex-1 bg-zinc-900 text-white text-[11px] font-medium py-1.5 rounded bg-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm">
                      Accept
                    </button>
                    <button type="button" onClick={() => setAiSubtasksSuggestion(null)} className="flex-1 bg-white text-zinc-700 border border-zinc-200 text-[11px] font-medium py-1.5 rounded hover:bg-zinc-50 transition-colors dark:bg-[#09090b] dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800 shadow-sm">
                      Ignore
                    </button>
                  </div>
                </div>
              )}

              {/* AI Effort Suggestion Box */}
              {aiSuggestion && (
                <div className="mt-4 p-3 bg-zinc-50 border border-zinc-200 rounded-md dark:bg-zinc-900/50 dark:border-zinc-800 animate-fade-in">
                  <div className="space-y-3 mb-4 text-[13px]">
                    <div>
                      <span className="text-[11px] text-zinc-500 uppercase tracking-wider block dark:text-zinc-400">Suggested Effort</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{aiSuggestion.effort}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-500 uppercase tracking-wider block dark:text-zinc-400">Suggested Due Date</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{aiSuggestion.suggestedDueDate}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-500 uppercase tracking-wider block dark:text-zinc-400">Reasoning</span>
                      <span className="text-zinc-600 italic dark:text-zinc-300">{aiSuggestion.reason}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setEstimatedEffort(aiSuggestion.effort); setDueDate(aiSuggestion.suggestedDueDate); setAiSuggestion(null); }} className="flex-1 bg-zinc-900 text-white text-[11px] font-medium py-1.5 rounded bg-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm">
                      Accept
                    </button>
                    <button type="button" onClick={() => setAiSuggestion(null)} className="flex-1 bg-white text-zinc-700 border border-zinc-200 text-[11px] font-medium py-1.5 rounded hover:bg-zinc-50 transition-colors dark:bg-[#09090b] dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800 shadow-sm">
                      Ignore
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 flex justify-end gap-2 bg-white rounded-b-xl flex-shrink-0 dark:bg-[#09090b] dark:border-zinc-800">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800">
            Cancel
          </button>
          <button type="submit" form="task-form" disabled={isSubmitting || isLoading || !title.trim()} className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 flex items-center shadow-sm dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
            {(isSubmitting || isLoading) && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2 dark:border-zinc-900/20 dark:border-t-zinc-900"></span>}
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
