export function validateFullName(name) {
  return name.trim().length >= 2;
}

export function validateUsername(username) {
    const value = username.trim();
    return value.length >= 3 && value.length <= 20 && !/\s/.test(value);
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password) {
  return password.length >= 8 && /\d/.test(password);
}

export function passwordsMatch(password, confirmation) {
  return password === confirmation && confirmation.length > 0;
}
