import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import {
  createUser,
  findUserByEmail,
  getDatabase,
  getUserById,
  updateUserProfile,
} from '@/database';
import {
  getOnboardingDone,
  setOnboardingDone,
} from '@/services/storage/asyncStorageService';
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from '@/services/storage/secureStoreService';
import type { User } from '@/types';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (
    data: Partial<Pick<User, 'fullName' | 'bio' | 'avatarUri'>>
  ) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await getDatabase();
        const [savedToken, savedUserId, onboardingDone] = await Promise.all([
          getSecureItem(STORAGE_KEYS.AUTH_TOKEN_KEY),
          getSecureItem(STORAGE_KEYS.AUTH_USER_ID_KEY),
          getOnboardingDone(),
        ]);

        if (!mounted) return;

        setHasCompletedOnboarding(onboardingDone);

        if (savedToken && savedUserId) {
          const restoredUser = await getUserById(Number(savedUserId));
          if (mounted && restoredUser) {
            setToken(savedToken);
            setUser(restoredUser);
          } else if (mounted) {
            await deleteSecureItem(STORAGE_KEYS.AUTH_TOKEN_KEY);
            await deleteSecureItem(STORAGE_KEYS.AUTH_USER_ID_KEY);
          }
        }
      } catch (error) {
        console.warn('Could not restore auth session:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await getDatabase();
    const record = await findUserByEmail(email.trim());

    if (!record || record.passwordHash !== password) {
      return {
        ok: false,
        error: 'Email/istifadəçi adı və ya şifrə yanlışdır.',
      };
    }

    const sessionToken = `tripmate-jwt-${record.id}-${Date.now()}`;
    await Promise.all([
      setSecureItem(STORAGE_KEYS.AUTH_TOKEN_KEY, sessionToken),
      setSecureItem(STORAGE_KEYS.AUTH_USER_ID_KEY, String(record.id)),
    ]);

    const { passwordHash: _ignored, ...safeUser } = record;
    setToken(sessionToken);
    setUser(safeUser);
    return { ok: true };
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      await getDatabase();
      const existing = await findUserByEmail(email.trim());
      if (existing) {
        return {
          ok: false,
          error: 'Bu email ünvanı ilə artıq hesab mövcuddur.',
        };
      }

      const created = await createUser({ fullName, email, password });
      const sessionToken = `tripmate-jwt-${created.id}-${Date.now()}`;

      await Promise.all([
        setSecureItem(STORAGE_KEYS.AUTH_TOKEN_KEY, sessionToken),
        setSecureItem(STORAGE_KEYS.AUTH_USER_ID_KEY, String(created.id)),
      ]);

      setToken(sessionToken);
      setUser(created);
      return { ok: true };
    },
    []
  );

  const signOut = useCallback(async () => {
    await Promise.all([
      deleteSecureItem(STORAGE_KEYS.AUTH_TOKEN_KEY),
      deleteSecureItem(STORAGE_KEYS.AUTH_USER_ID_KEY),
    ]);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Pick<User, 'fullName' | 'bio' | 'avatarUri'>>) => {
      if (!user) return;
      const updated = await updateUserProfile(user.id, data);
      if (updated) {
        setUser(updated);
      }
    },
    [user]
  );

  const completeOnboarding = useCallback(async () => {
    await setOnboardingDone(true);
    setHasCompletedOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await setOnboardingDone(false);
    setHasCompletedOnboarding(false);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      hasCompletedOnboarding,
      isLoading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      completeOnboarding,
      resetOnboarding,
    }),
    [
      token,
      user,
      hasCompletedOnboarding,
      isLoading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      completeOnboarding,
      resetOnboarding,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
