import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface POI {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  imageUrl?: string;
}

interface UserPreferences {
  language: string;
  units: 'metric' | 'imperial';
  notifications: boolean;
  arQuality: 'low' | 'medium' | 'high';
  maxDistance: number;
  categories: string[];
}

interface AppState {
  selectedPOI: POI | null;
  isARMode: boolean;
  preferences: UserPreferences;
}

type AppAction =
  | { type: 'SET_SELECTED_POI'; payload: POI | null }
  | { type: 'TOGGLE_AR_MODE' }
  | { type: 'SET_AR_MODE'; payload: boolean }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> };

interface AppContextType extends AppState {
  setSelectedPOI: (poi: POI | null) => void;
  toggleARMode: () => void;
  setARMode: (enabled: boolean) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  language: 'en',
  units: 'metric',
  notifications: true,
  arQuality: 'medium',
  maxDistance: 1000,
  categories: ['historical', 'cultural', 'nature', 'entertainment'],
};

// Initial state
const initialState: AppState = {
  selectedPOI: null,
  isARMode: false,
  preferences: defaultPreferences,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SELECTED_POI':
      return {
        ...state,
        selectedPOI: action.payload,
      };
    case 'TOGGLE_AR_MODE':
      return {
        ...state,
        isARMode: !state.isARMode,
      };
    case 'SET_AR_MODE':
      return {
        ...state,
        isARMode: action.payload,
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

// Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setSelectedPOI = (poi: POI | null): void => {
    dispatch({ type: 'SET_SELECTED_POI', payload: poi });
  };

  const toggleARMode = (): void => {
    dispatch({ type: 'TOGGLE_AR_MODE' });
  };

  const setARMode = (enabled: boolean): void => {
    dispatch({ type: 'SET_AR_MODE', payload: enabled });
  };

  const updatePreferences = (preferences: Partial<UserPreferences>): void => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  const value: AppContextType = {
    ...state,
    setSelectedPOI,
    toggleARMode,
    setARMode,
    updatePreferences,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

// Export types for external use
export type { POI, UserPreferences, AppState };

export default AppContext;
