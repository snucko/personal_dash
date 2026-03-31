interface Env {
  TODOIST_API: string;
}

const TODOIST_API_URL = 'https://api.todoist.com/rest/v2';

// Cloudflare Pages Function Handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Only allow /api/todoist/* requests
    if (!pathname.startsWith('/api/todoist/')) {
      return new Response('Not found', { status: 404 });
    }

    // Remove /api/todoist prefix
    const todoist_path = pathname.replace('/api/todoist', '');
    const todoist_url = new URL(TODOIST_API_URL + todoist_path);

    // Copy query parameters
    todoist_url.search = url.search;

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${env.TODOIST_API}`);
    headers.set('Content-Type', 'application/json');

    try {
      const response = await fetch(todoist_url.toString(), {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'DELETE' && request.method !== 'OPTIONS' ? await request.text() : undefined,
      });

      // Add CORS headers
      const corsHeaders = new Headers(response.headers);
      corsHeaders.set('Access-Control-Allow-Origin', '*');
      corsHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      corsHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(JSON.stringify({ error: 'Failed to proxy request', details: error.toString() }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
};
