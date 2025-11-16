// src/utils/auth.js
export const users = [
  { username: "user", password: "123", role: "ROLE_USER" },
  { username: "admin", password: "123", role: "admin" },
];

export const login = (username, password) => {
  const found = users.find(
    (u) => u.username === username && u.password === password
  );
  if (found) {
    localStorage.setItem("user", JSON.stringify(found));
    return found;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
