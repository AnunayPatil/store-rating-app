export const validateAuth = ({ name, email, password, address }, isRegister = false) => {
  const errors = {};
  if (isRegister) {
    if (!name || name.length < 20 || name.length > 60) {
      errors.name = 'Name must be between 20 and 60 characters';
    }
    if (!address || address.length > 400) {
      errors.address = 'Address cannot exceed 400 characters';
    }
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Valid email address is required';
  }
  if (!password || !/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/.test(password)) {
    errors.password = 'Password must be 8-16 characters, with at least 1 uppercase and 1 special character';
  }
  return errors;
};