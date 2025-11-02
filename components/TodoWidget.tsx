
import React, { useState, useEffect } from 'react';
import type { GoogleTask } from '../types';
import WidgetCard from './WidgetCard';
import { ICONS } from '../constants';
import { getTasks, addTask, updateTask, deleteTask } from '../services/googleApiService';

interface TodoWidgetProps {
    accessToken: string | null;
}

const TodoWidget: React.FC<TodoWidgetProps> = ({ accessToken }) => {
  const [todos, setTodos] = useState<GoogleTask[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
        const tasks = await getTasks(accessToken);
        setTodos(tasks);
    } catch (err) {
        setError("Failed to fetch tasks.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [accessToken]);


  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() === '' || !accessToken) return;
    
    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newTask: GoogleTask = { id: tempId, title: newTodo, status: 'needsAction' };
    setTodos([newTask, ...todos]);
    setNewTodo('');

    try {
      await addTask(accessToken, newTodo);
      await fetchTasks(); // Re-fetch to get the real ID and sync state
    } catch (err) {
      setError("Failed to add task.");
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
        setError("Failed to update task.");
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
        setError("Failed to delete task.");
        console.error(err);
        setTodos(originalTodos); // Revert on failure
    }
  };
  
  if (!accessToken) {
    return (
        <WidgetCard title="To-Do List" icon={ICONS.todo} className="h-full">
            <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-400">
                <p>Connect your Google Account to manage your tasks.</p>
            </div>
        </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Google Tasks" icon={ICONS.todo} className="h-full">
        <div className="flex flex-col h-full">
            <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="flex-grow bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button type="submit" className="bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors">Add</button>
            </form>
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            {loading ? (
                <div className="text-center text-slate-400">Loading tasks...</div>
            ) : (
                <ul className="space-y-2 overflow-y-auto flex-grow pr-2">
                    {todos.map(todo => (
                    <li key={todo.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg group">
                        <div className="flex items-center cursor-pointer flex-grow" onClick={() => toggleTodo(todo.id, todo.status)}>
                            <input
                                type="checkbox"
                                checked={todo.status === 'completed'}
                                readOnly
                                className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-sky-500 focus:ring-sky-500 mr-3 pointer-events-none"
                            />
                            <span className={`${todo.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>{todo.title}</span>
                        </div>
                        <button onClick={() => handleDeleteTodo(todo.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </li>
                    ))}
                </ul>
            )}
        </div>
    </WidgetCard>
  );
};

export default TodoWidget;