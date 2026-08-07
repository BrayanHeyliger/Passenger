import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "client" | "driver" | "fleet" | "admin";

export interface LocalUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

interface LocalAuthContextType {
  user: LocalUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export interface RegisterData {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  licenseNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  companyName?: string;
}

const LocalAuthContext = createContext<LocalAuthContextType | null>(null);

const STORAGE_KEY = "wt_user";
const USERS_KEY = "wt_users_db";

// Built-in super admin
const SUPER_ADMIN: LocalUser = {
  id: 0,
  name: "Heyliger",
  email: "admin@whatsapptaxi.com",
  role: "admin",
};

function getStoredUsers(): Array<LocalUser & { password: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: Array<LocalUser & { password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Check super admin
    if (email === "admin@whatsapptaxi.com" && password === "Hosting01") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SUPER_ADMIN));
      setUser(SUPER_ADMIN);
      return { success: true };
    }

    // Check registered users
    const users = getStoredUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) {
      return { success: false, error: "Email o contraseña incorrectos" };
    }

    const { password: _pw, ...userData } = found;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const users = getStoredUsers();

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: "Este email ya está registrado" };
    }

    const newUser: LocalUser & { password: string } = {
      id: Date.now(),
      name: `${data.firstName} ${data.lastName || ""}`.trim(),
      email: data.email,
      phone: data.phone,
      role: data.role,
      password: data.password,
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _pw, ...userData } = newUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <LocalAuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
    }}>
      {children}
    </LocalAuthContext.Provider>
  );
}

export function useLocalAuth() {
  const ctx = useContext(LocalAuthContext);
  if (!ctx) throw new Error("useLocalAuth must be used inside LocalAuthProvider");
  return ctx;
}
