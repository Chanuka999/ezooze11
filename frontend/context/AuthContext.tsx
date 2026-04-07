import React, { createContext, useState, ReactNode, useEffect } from "react";
import { User } from "../types";
import { api } from "../api";
import { getAppleIdToken, getGoogleIdToken } from "../utils/oauth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInWithApple: () => Promise<User>;
  clearError: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "ezooze_auth";
const TOKEN_KEY = "ezooze_token";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const googleClientId =
    ((import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID as string | undefined) ||
    ((globalThis as any)?.process?.env?.VITE_GOOGLE_CLIENT_ID as
      | string
      | undefined);
  const appleClientId =
    ((import.meta as any)?.env?.VITE_APPLE_CLIENT_ID as string | undefined) ||
    ((globalThis as any)?.process?.env?.VITE_APPLE_CLIENT_ID as
      | string
      | undefined);
  const appleRedirectUri =
    (import.meta as any)?.env?.VITE_APPLE_REDIRECT_URI ||
    (globalThis as any)?.process?.env?.VITE_APPLE_REDIRECT_URI ||
    window.location.origin;

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        // Update API auth header
        api.setAuthToken(savedToken);
      } catch (e) {
        console.warn("Failed to restore session from localStorage");
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, pass: string): Promise<User> => {
    try {
      clearError();
      const loggedInUser = await api.login(email, pass);
      const userToken = loggedInUser.token;

      // Store in state
      setUser(loggedInUser);
      setToken(userToken);

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      localStorage.setItem(TOKEN_KEY, userToken);

      // Update API auth header
      api.setAuthToken(userToken);

      return loggedInUser;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setError(errorMessage);
      console.error("Login failed:", err);
      throw err;
    }
  };

  const signInWithGoogle = async (): Promise<User> => {
    try {
      clearError();
      const normalizedGoogleClientId = googleClientId?.trim();
      if (!normalizedGoogleClientId) {
        throw new Error(
          "Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID.",
        );
      }

      if (normalizedGoogleClientId.startsWith("AIza")) {
        throw new Error(
          "VITE_GOOGLE_CLIENT_ID should be an OAuth Client ID ending with .apps.googleusercontent.com, not an API key.",
        );
      }

      const { idToken } = await getGoogleIdToken(normalizedGoogleClientId);
      const googleUser = await api.signInWithGoogle(idToken);
      const userToken = googleUser.token;
      setUser(googleUser);
      setToken(userToken);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
      localStorage.setItem(TOKEN_KEY, userToken);
      api.setAuthToken(userToken);
      return googleUser;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Google sign-in failed";
      setError(errorMessage);
      console.error("Google sign-in failed:", err);
      throw err;
    }
  };

  const signInWithApple = async (): Promise<User> => {
    try {
      clearError();
      const normalizedAppleClientId = appleClientId?.trim();
      if (!normalizedAppleClientId) {
        throw new Error(
          "Apple Sign-In is not configured. Set VITE_APPLE_CLIENT_ID.",
        );
      }

      const { idToken, email, name } = await getAppleIdToken(
        normalizedAppleClientId,
        appleRedirectUri,
      );
      const appleUser = await api.signInWithApple(idToken, { email, name });
      const userToken = appleUser.token;
      setUser(appleUser);
      setToken(userToken);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appleUser));
      localStorage.setItem(TOKEN_KEY, userToken);
      api.setAuthToken(userToken);
      return appleUser;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Apple sign-in failed";
      setError(errorMessage);
      console.error("Apple sign-in failed:", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    api.setAuthToken(null);
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
  ): Promise<User> => {
    try {
      clearError();
      const newUser = await api.register(name, email, pass);
      // We don't set user/token here as the user wants to log in manually after registration
      return newUser;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed";
      setError(errorMessage);
      console.error("Registration failed:", err);
      throw err;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    token,
    login,
    logout,
    register,
    signInWithGoogle,
    signInWithApple,
    clearError,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
