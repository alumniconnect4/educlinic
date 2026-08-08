let isRedirecting = false;

export const handleChatAuthError = () => {
  if (typeof window === 'undefined') return;

  if (isRedirecting) return;
  isRedirecting = true;

  localStorage.removeItem('chatSessionId');
  localStorage.removeItem('sessionId');
  document.cookie =
    'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000';
  const cleanUrl = clientUrl.replace(/\/$/, '');
  const redirectTarget = cleanUrl.endsWith('/auth')
    ? cleanUrl
    : `${cleanUrl}/auth`;

  window.location.href = redirectTarget;
};

// Global fetch interceptor to catch any 401 Unauthorized responses across chat-app
export const setupFetchInterceptor = () => {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        handleChatAuthError();
      }
      return response;
    } catch (err) {
      throw err;
    }
  };
};
