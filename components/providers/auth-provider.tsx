"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AUTH_CLEARED_EVENT,
  USER_STORAGE_KEY,
  getAccessToken,
  getUserFromStorage,
  saveUserToStorage,
} from "@/lib/api";
import { getCurrentUser, toSessionUser } from "@/services/authServices";
import type { SessionUser } from "@/types/user";

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  setUser: (user: SessionUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Satu-satunya sumber data user di sisi klien.
 *
 * Data dibaca dari localStorage sekali saat mount (bukan /auth/me tiap halaman).
 * `isLoading` dipakai layout supaya tidak sempat merender versi Guest sebelum
 * localStorage selesai dibaca.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const migrationStarted = useRef(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      // Baca localStorage setelah tick pertama agar tidak setState sinkron
      // di dalam effect (hidrasi aman, tidak ada kedip Guest).
      await Promise.resolve();
      if (!active) return;

      const storedUser = getUserFromStorage();
      setUserState(storedUser);

      // Migrasi sekali untuk sesi lama: token ada tapi data user belum tersimpan.
      // Sesi baru tidak pernah masuk ke sini, jadi tidak ada /auth/me tiap load.
      if (!storedUser && !migrationStarted.current) {
        migrationStarted.current = true;
        const token = await getAccessToken();
        if (token) {
          try {
            const migrated = toSessionUser(await getCurrentUser());
            if (!active) return;
            saveUserToStorage(migrated);
            setUserState(migrated);
          } catch {
            // 401 sudah ditangani handleUnauthorized() di lib/api.ts.
          }
        }
      }

      if (active) setIsLoading(false);
    })();

    // clearTokens() dipanggil logout/401; sinkronkan context di tab yang sama.
    const handleCleared = () => setUserState(null);
    // Sinkron antar tab saat localStorage berubah.
    const handleStorage = (event: StorageEvent) => {
      if (event.key === USER_STORAGE_KEY) setUserState(getUserFromStorage());
    };

    window.addEventListener(AUTH_CLEARED_EVENT, handleCleared);
    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener(AUTH_CLEARED_EVENT, handleCleared);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setUser = useCallback((next: SessionUser | null) => {
    setUserState(next);
    if (next) saveUserToStorage(next);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, setUser }),
    [user, isLoading, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  }
  return context;
}
