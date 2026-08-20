import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  toggleDarkMode: () => void;
  activeHospitalId: number;
  setActiveHospitalId: (id: number) => void;
  audioAlertsEnabled: boolean;
  setAudioAlertsEnabled: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('HOSPITAL_STAFF');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('setu_theme') === 'dark';
  });
  const [activeHospitalId, setActiveHospitalId] = useState<number>(1);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('setu_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('setu_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        darkMode,
        setDarkMode,
        toggleDarkMode,
        activeHospitalId,
        setActiveHospitalId,
        audioAlertsEnabled,
        setAudioAlertsEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
