import { TodoistApi } from '@doist/todoist-api-typescript';
import type { GoogleTask } from '../types';

// Use Cloudflare Worker proxy to avoid CORS
const PROXY_URL = '/api/todoist';

// Create a minimal fetch-based client since we're proxying through a Worker
const getTodoistClient = () => {
  const api_key = import.meta.env.VITE_TODOIST_API || '';
  
  if (!api_key) {
    throw new Error('Todoist API key not configured');
  }

  // Create custom fetch that routes through Worker
  const customFetch = async (url: string, options?: RequestInit) => {
    const proxyUrl = url.replace('https://api.todoist.com/rest/v2', PROXY_URL);
    return fetch(proxyUrl, {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${api_key}`,
      }
    });
  };

  return new TodoistApi({ apiToken: api_key, fetch: customFetch as any });
};

export const getTasks = async (): Promise<GoogleTask[]> => {
  const api = getTodoistClient();
  
  const tasks = await api.getTasks();
  
  // Map Todoist tasks to GoogleTask format
  return tasks
    .sort((a, b) => {
      // Incomplete first, then complete
      if (a.isCompleted === b.isCompleted) return 0;
      return a.isCompleted ? 1 : -1;
    })
    .map(task => ({
      id: task.id,
      title: task.content,
      status: task.isCompleted ? 'completed' : 'needsAction',
      notes: task.description,
      due: task.due?.date
    }));
};

export const addTask = async (title: string): Promise<GoogleTask> => {
  const api = getTodoistClient();
  
  const task = await api.addTask({
    content: title
  });
  
  return {
    id: task.id,
    title: task.content,
    status: 'needsAction',
    notes: task.description
  };
};

export const updateTask = async (taskId: string, taskUpdate: Partial<GoogleTask>): Promise<GoogleTask> => {
  const api = getTodoistClient();
  
  const updatePayload: any = {};
  if (taskUpdate.title) updatePayload.content = taskUpdate.title;
  if (taskUpdate.status !== undefined) {
    updatePayload.isCompleted = taskUpdate.status === 'completed';
  }

  await api.updateTask(taskId, updatePayload);
  
  return {
    id: taskId,
    title: taskUpdate.title || '',
    status: taskUpdate.status || 'needsAction'
  };
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const api = getTodoistClient();
  await api.deleteTask(taskId);
};
