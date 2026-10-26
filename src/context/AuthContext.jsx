import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { fireDB } from '../firebase/FirebaseConfig.js';
import { authService } from '../services/auth/authService.js';
import { userService } from '../services/user/userService.js';
import { clearDraftsForUser } from '../hooks/common/useDraftManager.js';
import { store } from '../redux/store.jsx';
import { loadCartFromStorage, setCart, clearCart } from '../redux/cartSlice.jsx';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // Sync user state on start
  useEffect(() => {
    let isMounted = true;

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (isMounted) setUser(parsed);
      } catch (err) {
        console.error("Error parsing user from localStorage", err);
      }
    }

    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        try {
          const profile = await userService.getUserProfile(firebaseUser.uid, firebaseUser.email);
          if (!isMounted) return;

          const name = profile?.name || "";
          const role = profile?.role || "USER";
          
          if (profile && profile.docId !== firebaseUser.uid) {
            const { getDoc: _getDoc, doc: _doc } = await import('firebase/firestore');
            const existingUidDoc = await _getDoc(_doc(fireDB, "users", firebaseUser.uid));
            const existingRole = existingUidDoc.exists() ? existingUidDoc.data()?.role : null;

            const ROLE_PRIORITY = { SUPERADMIN: 3, superadmin: 3, ADMIN: 2, admin: 2, USER: 1, user: 1 };
            const finalRole = (ROLE_PRIORITY[existingRole] || 0) > (ROLE_PRIORITY[role] || 0) ? existingRole : role;

            await setDoc(doc(fireDB, "users", firebaseUser.uid), {
              ...profile,
              uid: firebaseUser.uid,
              role: finalRole,
            }, { merge: true });
          } else if (!profile) {
            await setDoc(doc(fireDB, "users", firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              role: "USER",
              createdAt: new Date().toISOString(),
            }, { merge: true });
          }

          if (!isMounted) return;

          setUserName(name);
          const cleanUser = {
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || name || "",
              role: role,
            }
          };
          setUser(cleanUser);
          localStorage.setItem('user', JSON.stringify(cleanUser));

          // Load user-specific cart into Redux store
          const userCart = loadCartFromStorage(firebaseUser.uid);
          store.dispatch(setCart(userCart));
        } catch (err) {
          console.error("Error loading user profile from Firestore", err);
        }
      } else {
        if (isMounted) {
          setUser(null);
          setUserName('');
          localStorage.removeItem('user');
          const guestCart = loadCartFromStorage(null);
          store.dispatch(setCart(guestCart));
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      const profile = await userService.getUserProfile(result.user.uid, result.user.email);
      const name = profile?.name || "";
      const role = profile?.role || "USER";

      // Ensure document exists at users/{uid}
      if (profile && profile.docId !== result.user.uid) {
        await setDoc(doc(fireDB, "users", result.user.uid), {
          ...profile,
          uid: result.user.uid,
          role: role,
        }, { merge: true });
      }
      const cleanUser = {
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || name || "",
          role: role,
        }
      };
      setUser(cleanUser);
      localStorage.setItem('user', JSON.stringify(cleanUser));
      setUserName(name);
      setIsLoginOpen(false);

      // Load user-specific cart
      const userCart = loadCartFromStorage(result.user.uid);
      store.dispatch(setCart(userCart));

      return result;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const result = await authService.signup(name, email, password);
      const cleanUser = {
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || name || "",
          role: "USER",
        }
      };
      setUser(cleanUser);
      localStorage.setItem('user', JSON.stringify(cleanUser));
      setUserName(name);
      setIsSignupOpen(false);

      // Load user-specific cart (fresh empty or existing)
      const userCart = loadCartFromStorage(result.user.uid);
      store.dispatch(setCart(userCart));

      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Clear all localStorage drafts belonging to this user before logout
      const currentUid = user?.user?.uid;
      if (currentUid) clearDraftsForUser(currentUid);

      // Clear the current in-memory cart and purge global guest cart
      store.dispatch(clearCart());
      localStorage.removeItem('cart');
      localStorage.removeItem('cart_guest');

      await authService.logout();
      setUser(null);
      setUserName('');
      localStorage.removeItem('user');
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = (containerId, size) => authService.setupRecaptcha(containerId, size);
  const checkPhoneExists = async (phoneNumber) => authService.checkPhoneExists(phoneNumber);
  const sendOtp = async (phoneNumber, recaptchaVerifier) => authService.sendOtp(phoneNumber, recaptchaVerifier);
  const verifyOtp = async (confirmationResult, otpCode, customName) => authService.verifyOtp(confirmationResult, otpCode, customName);
  const sendPasswordResetEmail = async (email) => authService.sendPasswordResetEmail(email);

  return (
    <AuthContext.Provider value={{ 
      user, userName, loading, setLoading, 
      login, signup, logout,
      setupRecaptcha, checkPhoneExists, sendOtp, verifyOtp,
      sendPasswordResetEmail,
      isLoginOpen, setIsLoginOpen,
      isSignupOpen, setIsSignupOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthContext = {
  user: null,
  userName: '',
  loading: false,
  setLoading: () => {},
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  setupRecaptcha: () => {},
  checkPhoneExists: async () => false,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  sendPasswordResetEmail: async () => {},
  isLoginOpen: false,
  setIsLoginOpen: () => {},
  isSignupOpen: false,
  setIsSignupOpen: () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth hook called outside AuthProvider; returning default context fallback.');
    return defaultAuthContext;
  }
  return context;
}
