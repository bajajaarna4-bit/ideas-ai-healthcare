import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, VitalItem, ReminderItem } from '../types';
import { api } from '../services/api';

interface SystemHealth {
  status: string;
  app_name: string;
  version: string;
  gemini_configured: boolean;
  database: string;
  supported_languages: string[];
}

interface HealthDataContextType {
  userProfile: UserProfile;
  updateProfile: (profile: UserProfile) => Promise<void>;
  vitals: VitalItem[];
  reminders: ReminderItem[];
  systemHealth: SystemHealth | null;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  emergencyModalOpen: boolean;
  setEmergencyModalOpen: (open: boolean) => void;
  toggleReminder: (id: number) => Promise<void>;
  addVital: (vital: { vital_type: string; value_primary: number; value_secondary?: number | null; unit: string; notes?: string }) => Promise<void>;
  addReminder: (reminder: {
    title: string;
    reminder_type: string;
    scheduled_time: string;
    frequency?: string;
    notes?: string;
    doctor_specialty?: string;
    location?: string;
  }) => Promise<void>;
  updateReminder: (id: number, reminder: Partial<ReminderItem>) => Promise<void>;
  deleteReminder: (id: number) => Promise<void>;
  resetDemoData: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: "Aarav Sharma (Demo Profile)",
  age: 34,
  gender: "Male",
  language: "en",
  blood_group: "B+",
  allergies: "Penicillin",
  chronic_conditions: "Mild Hypertension (Under review)"
};

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [vitals, setVitals] = useState<VitalItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);

  const refreshAll = async () => {
    setIsLoading(true);
    try {
      const [health, profile, vitalsList, remindersList] = await Promise.allSettled([
        api.getHealth(),
        api.getUserProfile(),
        api.getVitals(),
        api.getReminders()
      ]);

      if (health.status === 'fulfilled') setSystemHealth(health.value);
      if (profile.status === 'fulfilled') setUserProfile(profile.value);
      if (vitalsList.status === 'fulfilled') setVitals(vitalsList.value);
      if (remindersList.status === 'fulfilled') setReminders(remindersList.value);
    } catch (err) {
      console.warn("Error refreshing health data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const updateProfile = async (profile: UserProfile) => {
    try {
      const updated = await api.updateUserProfile(profile);
      setUserProfile(updated);
    } catch (err) {
      console.error("Failed to update profile", err);
      setUserProfile(profile);
    }
  };

  const toggleReminder = async (id: number) => {
    // Optimistic UI update
    setReminders(prev => prev.map(r => r.id === id ? { ...r, is_completed: !r.is_completed } : r));
    try {
      await api.toggleReminder(id);
    } catch (err) {
      console.error("Failed to toggle reminder", err);
      refreshAll();
    }
  };

  const addVital = async (vital: { vital_type: string; value_primary: number; value_secondary?: number | null; unit: string; notes?: string }) => {
    try {
      const created = await api.addVital(vital);
      setVitals(prev => [...prev, created]);
    } catch (err) {
      console.error("Failed to add vital", err);
    }
  };

  const addReminder = async (reminder: {
    title: string;
    reminder_type: string;
    scheduled_time: string;
    frequency?: string;
    notes?: string;
    doctor_specialty?: string;
    location?: string;
  }) => {
    try {
      const created = await api.addReminder(reminder);
      setReminders(prev => [...prev, created]);
    } catch (err) {
      console.error("Failed to add reminder", err);
    }
  };

  const updateReminder = async (id: number, reminder: Partial<ReminderItem>) => {
    try {
      const updated = await api.updateReminder(id, reminder);
      setReminders(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err) {
      console.error("Failed to update reminder", err);
    }
  };

  const deleteReminder = async (id: number) => {
    try {
      await api.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete reminder", err);
    }
  };

  const resetDemoData = async () => {
    try {
      await api.resetDemoData();
      await refreshAll();
    } catch (err) {
      console.error("Failed to reset demo data", err);
    }
  };

  return (
    <HealthDataContext.Provider
      value={{
        userProfile,
        updateProfile,
        vitals,
        reminders,
        systemHealth,
        isLoading,
        activeTab,
        setActiveTab,
        emergencyModalOpen,
        setEmergencyModalOpen,
        toggleReminder,
        addVital,
        addReminder,
        updateReminder,
        deleteReminder,
        resetDemoData,
        refreshAll
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};
