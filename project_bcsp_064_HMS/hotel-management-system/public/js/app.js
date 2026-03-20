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
  let message = 'Unexpected error';
  if (err) {
    if (err.error && err.error.message) message = err.error.message;
    else if (err.message) message = err.message;
  }
  
  // Find or create an error banner
  let errBox = document.getElementById('errorBox');
  if (!errBox) {
    errBox = document.createElement('div');
    errBox.id = 'errorBox';
    errBox.style = "background: #f8dbdb; color: #a94442; padding: 10px; border-radius: 4px; margin-bottom: 15px; border: 1px solid #ebccd1; text-align: center;";
    
    const card = document.querySelector('.card');
    if (card) card.prepend(errBox);
    else document.body.prepend(errBox);
  }
  
  errBox.textContent = message;
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    if (errBox.parentNode) errBox.remove();
  }, 5000);
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
