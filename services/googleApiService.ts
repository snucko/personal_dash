import type { GoogleCalendarEvent, GoogleTask, GoogleUserProfile } from '../types';

const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const TASKS_API_URL = 'https://www.googleapis.com/tasks/v1/lists/@default/tasks';
const USERINFO_API_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const createHeaders = (accessToken: string) => ({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
});

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            const errorDetails = await response.json().catch(() => ({}));
            const message = errorDetails?.error?.message || 'Authorization failed.';
            throw new Error(`[${response.status}] ${message} Please check your Google Cloud project configuration. Ensure the Client ID is correct, the app's URL is in 'Authorized JavaScript origins', and the Calendar and Tasks APIs are enabled.`);
        }
        const error = await response.json();
        throw new Error(error.error.message || 'An API error occurred');
    }
    return response.json();
}

// Debounce helper for fetch tasks
let fetchTasksAbortController: AbortController | null = null;
export const cancelFetchTasks = () => {
    if (fetchTasksAbortController) {
        fetchTasksAbortController.abort();
        fetchTasksAbortController = null;
    }
};

export const getCalendarEvents = async (accessToken: string, timeMin: string, timeMax: string): Promise<GoogleCalendarEvent[]> => {
    const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '100',
    });
    const response = await fetch(`${CALENDAR_API_URL}?${params.toString()}`, {
        headers: createHeaders(accessToken)
    });
    const data = await handleResponse(response);
    return data.items || [];
};

export const getTasks = async (accessToken: string): Promise<GoogleTask[]> => {
     // Cancel previous request if still pending
     cancelFetchTasks();
     
     fetchTasksAbortController = new AbortController();
     const response = await fetch(TASKS_API_URL, {
         headers: createHeaders(accessToken),
         signal: fetchTasksAbortController.signal
     });
     const data = await handleResponse(response);
     // Return uncompleted tasks first, then completed
     const tasks = data.items || [];
     return tasks.sort((a: GoogleTask, b: GoogleTask) => {
         if (a.status === b.status) return 0;
         return a.status === 'needsAction' ? -1 : 1;
     });
};

export const addTask = async (accessToken: string, title: string): Promise<GoogleTask> => {
    const response = await fetch(TASKS_API_URL, {
        method: 'POST',
        headers: createHeaders(accessToken),
        body: JSON.stringify({ title })
    });
    return handleResponse(response);
};

export const updateTask = async (accessToken: string, taskId: string, taskUpdate: Partial<GoogleTask>): Promise<GoogleTask> => {
    const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
        method: 'PATCH',
        headers: createHeaders(accessToken),
        body: JSON.stringify(taskUpdate)
    });
    return handleResponse(response);
};

export const deleteTask = async (accessToken: string, taskId: string): Promise<void> => {
    const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
        method: 'DELETE',
        headers: createHeaders(accessToken),
    });
    if (!response.ok || response.status !== 204) {
        await handleResponse(response);
    }
};

export const getUserInfo = async (accessToken: string): Promise<GoogleUserProfile> => {
    const response = await fetch(USERINFO_API_URL, {
        headers: createHeaders(accessToken)
    });
    return handleResponse(response);
};