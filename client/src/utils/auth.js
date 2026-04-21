export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt_token');
};

export const isLoggedIn = () => !!getToken();

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8)        errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password))    errors.push('At least 1 uppercase letter');
  if (!/[0-9]/.test(password))    errors.push('At least 1 number');
  return errors; // empty array = valid
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};