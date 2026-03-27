
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Trash2, Plus, AlertCircle, Loader2 } from 'lucide-react';
import type { GoogleTask } from '../types';
import WidgetCard from './WidgetCard';
import { ICONS } from '../constants';
import { getTasks, addTask, updateTask, deleteTask } from '../services/todoistService';

interface TodoWidgetProps {
    accessToken?: string | null;
}

const TodoWidget: React.FC<TodoWidgetProps> = ({ accessToken }) => {
  const [todos, setTodos] = useState<GoogleTask[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
        const tasks = await getTasks();
        setTodos(tasks);
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tasks.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);


  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() === '') return;
    
    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newTask: GoogleTask = { id: tempId, title: newTodo, status: 'needsAction' };
    setTodos([newTask, ...todos]);
    setNewTodo('');

    try {
      await addTask(accessToken, newTodo);
      await fetchTasks(); // Re-fetch to get the real ID and sync state
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task.");
      console.error(err);
      // Revert optimistic update on failure
      setTodos(todos.filter(t => t.id !== tempId));
    }
  };

  const toggleTodo = async (id: string, currentStatus: 'needsAction' | 'completed') => {
    if (!accessToken) return;
    
    const originalTodos = [...todos];
    const newStatus = currentStatus === 'completed' ? 'needsAction' : 'completed';
    // Optimistic update
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, status: newStatus } : todo)));

    try {
      await updateTask(accessToken, id, { status: newStatus });
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update task.");
        console.error(err);
        setTodos(originalTodos); // Revert on failure
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!accessToken) return;

    const originalTodos = [...todos];
    // Optimistic update
    setTodos(todos.filter(todo => todo.id !== id));
    
    try {
      await deleteTask(accessToken, id);
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete task.");
        console.error(err);
        setTodos(originalTodos); // Revert on failure
    }
  };
  
  return (
    <WidgetCard title="To-Do List" icon={ICONS.todo} className="h-full">
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Today's Tasks</h3>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">
                        {todos.filter(t => t.status !== 'completed').length} items remaining
                    </p>
                </div>
                <div className="bg-sky-500/10 text-sky-400 p-2 rounded-xl border border-sky-500/20">
                    {ICONS.todo}
                </div>
            </div>

            <form onSubmit={handleAddTodo} className="relative group">
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full bg-slate-900/50 text-white placeholder-slate-500 rounded-2xl px-5 py-4 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all pr-16"
                />
                <button 
                    type="submit" 
                    className="absolute right-2 top-2 bottom-2 bg-sky-600 text-white font-bold px-4 rounded-xl hover:bg-sky-500 transition-all shadow-lg shadow-sky-900/20 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add</span>
                </button>
            </form>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm"
                >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </motion.div>
            )}

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-3 animate-pulse"
                        >
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-slate-800/50 rounded-2xl border border-slate-700/50"></div>
                            ))}
                        </motion.div>
                    ) : todos.length > 0 ? (
                        <ul className="space-y-3">
                            {todos.map((todo, idx) => (
                                <motion.li 
                                    key={todo.id} 
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all group
                                        ${todo.status === 'completed' 
                                            ? 'bg-slate-900/30 border-slate-800/50 opacity-60' 
                                            : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/60 shadow-sm'}
                                    `}
                                >
                                    <div 
                                        className="flex items-center cursor-pointer flex-grow gap-4" 
                                        onClick={() => toggleTodo(todo.id, todo.status)}
                                    >
                                        <div className={`transition-all ${todo.status === 'completed' ? 'text-sky-500' : 'text-slate-600 group-hover:text-sky-500/50'}`}>
                                            {todo.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                        </div>
                                        <span className={`text-lg transition-all ${todo.status === 'completed' ? 'line-through text-slate-500 italic' : 'text-slate-200 font-medium'}`}>
                                            {todo.title}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteTodo(todo.id)} 
                                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete task"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </motion.li>
                            ))}
                        </ul>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-48 text-slate-600"
                        >
                            <div className="bg-slate-800/50 p-4 rounded-full mb-4 border border-slate-700">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <p className="italic font-medium">No tasks found. Add one above!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </WidgetCard>
  );
};

export default TodoWidget;