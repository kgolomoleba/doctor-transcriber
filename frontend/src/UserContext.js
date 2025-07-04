import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const UserContext = createContext(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.warn("Failed to load user from localStorage:", error);
      return null;
    }
  });

  // Persist user changes to localStorage with error handling
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.warn("Failed to save user to localStorage:", error);
    }
  }, [user]);

  // Stable updateUser function
  const updateUser = useCallback(
    (updates) => {
      setUser((prev) => ({ ...prev, ...updates }));
    },
    [setUser]
  );

  // Optional: clear user (logout)
  const clearUser = useCallback(() => setUser(null), [setUser]);

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}
