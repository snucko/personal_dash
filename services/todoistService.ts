import type { GoogleTask } from '../types';

interface TodoistTask {
  id: string;
  content: string;
  completed: boolean;
  description?: string;
  due?: {
    date: string;
  };
}

const TODOIST_API_URL = 'https://api.todoist.com/rest/v2';

const createHeaders = () => {
  const apiKey = import.meta.env.VITE_TODOIST_API || '';
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }
  return response.json();
};

export const getTasks = async (): Promise<GoogleTask[]> => {
  const apiKey = import.meta.env.VITE_TODOIST_API;
  if (!apiKey) {
    throw new Error('VITE_TODOIST_API not configured');
  }

  const response = await fetch(`${TODOIST_API_URL}/tasks`, {
    headers: createHeaders()
  });
  
  const tasks = await handleResponse(response);
  
  return (tasks as TodoistTask[])
    .sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    })
    .map(task => ({
      id: task.id,
      title: task.content,
      status: task.completed ? 'completed' : 'needsAction',
      notes: task.description,
      due: task.due?.date
    }));
};

export const addTask = async (title: string): Promise<GoogleTask> => {
  const response = await fetch(`${TODOIST_API_URL}/tasks`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ content: title })
  });

  const data = await handleResponse(response);
  
  return {
    id: data.id,
    title: data.content,
    status: 'needsAction',
    notes: data.description
  };
};

export const updateTask = async (taskId: string, taskUpdate: Partial<GoogleTask>): Promise<GoogleTask> => {
  const updateBody: any = {};
  
  if (taskUpdate.title) updateBody.content = taskUpdate.title;
  if (taskUpdate.status !== undefined) {
    updateBody.is_completed = taskUpdate.status === 'completed';
  }

  const response = await fetch(`${TODOIST_API_URL}/tasks/${taskId}`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(updateBody)
  });

  await handleResponse(response);
  
  return {
    id: taskId,
    title: taskUpdate.title || '',
    status: taskUpdate.status || 'needsAction'
  };
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const response = await fetch(`${TODOIST_API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: createHeaders()
  });

  if (!response.ok && response.status !== 204) {
    await handleResponse(response);
  }
};
