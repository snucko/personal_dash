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

interface TodoistResponse {
  tasks: TodoistTask[];
}

const TODOIST_API_URL = 'https://api.todoist.com/rest/v2';
const API_KEY = import.meta.env.VITE_TODOIST_API || '';

const createHeaders = () => ({
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
});

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }
  return response.json();
};

export const getTasks = async (): Promise<GoogleTask[]> => {
  if (!API_KEY) {
    throw new Error('Todoist API key not configured');
  }

  const response = await fetch(`${TODOIST_API_URL}/tasks`, {
    headers: createHeaders()
  });
  
  const data = await handleResponse(response);
  const tasks = (data as TodoistTask[]) || [];
  
  // Map Todoist tasks to GoogleTask format
  return tasks
    .sort((a, b) => {
      // Incomplete first, then complete
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
  if (!API_KEY) {
    throw new Error('Todoist API key not configured');
  }

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
  if (!API_KEY) {
    throw new Error('Todoist API key not configured');
  }

  const updateBody: any = {};
  
  if (taskUpdate.title) updateBody.content = taskUpdate.title;
  if (taskUpdate.status !== undefined) {
    // Close task if completed, reopen if not
    updateBody[taskUpdate.status === 'completed' ? 'is_completed' : 'is_completed'] = 
      taskUpdate.status === 'completed';
  }

  const response = await fetch(`${TODOIST_API_URL}/tasks/${taskId}`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(updateBody)
  });

  await handleResponse(response);
  
  // Return the updated task (Todoist doesn't return it, so construct from input)
  return {
    id: taskId,
    title: taskUpdate.title || '',
    status: taskUpdate.status || 'needsAction'
  };
};

export const deleteTask = async (taskId: string): Promise<void> => {
  if (!API_KEY) {
    throw new Error('Todoist API key not configured');
  }

  const response = await fetch(`${TODOIST_API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: createHeaders()
  });

  if (!response.ok && response.status !== 204) {
    await handleResponse(response);
  }
};
