const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw data || { error: { message: 'Request failed' } };
  }

  return data;
};

const handleError = (err) => {
  const message = err?.error?.message || err?.message || 'Unexpected error';
  alert(message);
};

const logout = async () => {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (err) {
    handleError(err);
  }
};

window.app = {
  apiRequest,
  handleError,
  logout,
};
