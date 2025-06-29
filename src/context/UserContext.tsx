import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUsername } from '../api/ApiLobby';

interface UserContextType {
  username: string | null;
  setUsername: (username: string | null) => void;
  refreshUsername: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);

  // Inicializa el username desde el token al cargar la app
  useEffect(() => {
    setUsername(getCurrentUsername() || null);
  }, []);

  // Permite refrescar el username desde el token (por ejemplo, tras login/logout)
  const refreshUsername = () => {
    setUsername(getCurrentUsername() || null);
  };

  return (
    <UserContext.Provider value={{ username, setUsername, refreshUsername }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar el contexto fácilmente
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser debe usarse dentro de <UserProvider>');
  return context;
}; 