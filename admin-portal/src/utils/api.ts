const API_BASE = 'http://localhost:4000/api';

export interface RequestOptions extends RequestInit {
  bodyData?: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  if (options.bodyData && !(options.bodyData instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.bodyData);
  } else if (options.bodyData instanceof FormData) {
    options.body = options.bodyData;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important to pass cookies
  });

  const contentType = response.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data as T;
}
