/**
 * useAuth — the primary hook for all auth actions.
 * @example
 * // Login
 * const { login, isLoading, error } = useAuth();
 * await login({ email: "a@b.com", password: "secret" });
 *
 * // Logout
 * const { logout } = useAuth();
 * await logout();
 *
 * // Read auth state anywhere
 * const { user, isAuthenticated } = useAuth();
 */

import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useApiMutation } from "../lib/use-api-mutation";
import { useAuthStore, type AuthUser } from "../store/auth.store";
import type { ApiError } from "../lib";

interface LoginPayload {
  email: string;
  password: string;
}

export interface UseAuthResult {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  loginError: ApiError | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const { user, isAuthenticated, isCheckingAuth, setUser, clearUser } =
    useAuthStore();

  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthFailure = () => {
      clearUser();
      navigate("/login");
      toast.error("Session expired. Please login again.");
    };

    window.addEventListener("ict-auth-failure", handleAuthFailure);
    return () =>
      window.removeEventListener("ict-auth-failure", handleAuthFailure);
  }, [clearUser, navigate]);

  // login mutation
  const {
    execute: executeLogin,
    isLoading: isLoggingIn,
    error: loginError,
  } = useApiMutation("login")<void, LoginPayload>({
    method: "POST",
    onSuccess: () => {
      toast.success("Welcome back!");
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message || "Invalid credentials");
    },
  });

  const login = useCallback(
    async (payload: LoginPayload) => {
      await executeLogin(payload);
      // to trigger the authenticated state in the UI.
      setUser({ userId: "admin", email: payload.email, role: "admin" });
    },
    [executeLogin, setUser],
  );

  // logout mutation
  const { execute: executeLogout, isLoading: isLoggingOut } = useApiMutation(
    "logout",
  )<void, never>({
    method: "POST",
    onSuccess: () => {
      clearUser();
      navigate("/login");
      toast.success("Logged out successfully");
    },
    onError: () => {
      // Force-clear local state even if server fails
      clearUser();
      navigate("/login");
    },
  });

  const logout = useCallback(async () => {
    await executeLogout();
  }, [executeLogout]);

  return {
    user,
    isAuthenticated,
    isCheckingAuth,
    isLoggingIn,
    isLoggingOut,
    loginError,
    login,
    logout,
  };
}
