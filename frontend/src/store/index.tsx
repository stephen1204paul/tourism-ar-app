import React, { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { AppContextProvider, useAppContext } from './AppContext';

// Re-export hooks and types
export { useAuth } from './AuthContext';
export { useAppContext } from './AppContext';
export type { POI, UserPreferences, AppState } from './AppContext';

// Combined provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <AppContextProvider>{children}</AppContextProvider>
    </AuthProvider>
  );
};

export default AppProvider;
