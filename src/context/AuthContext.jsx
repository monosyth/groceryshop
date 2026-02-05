import { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Detect if user is in an embedded browser/webview
const isEmbeddedBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  // Check for common in-app browsers
  const isInApp = (
    ua.includes('FBAN') ||      // Facebook
    ua.includes('FBAV') ||      // Facebook
    ua.includes('Instagram') || // Instagram
    ua.includes('Twitter') ||   // Twitter
    ua.includes('Line/') ||     // Line
    ua.includes('KAKAOTALK') || // KakaoTalk
    ua.includes('Snapchat') ||  // Snapchat
    ua.includes('TikTok') ||    // TikTok
    (ua.includes('wv') && ua.includes('Android')) // Android WebView
  );

  return isInApp;
};

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create user profile in Firestore
  const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { email, displayName, photoURL } = user;
      try {
        await setDoc(userRef, {
          uid: user.uid,
          email,
          displayName: displayName || '',
          photoURL: photoURL || null,
          preferences: {
            theme: 'light',
            currency: 'USD',
            defaultStore: null,
            categories: [],
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...additionalData,
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    }
  };

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      await createUserProfile(result.user, { displayName });

      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();

      // Check if user is in an embedded browser
      if (isEmbeddedBrowser()) {
        const errorMsg = 'Please open this app in your regular browser (Chrome, Safari, Firefox) to sign in with Google. In-app browsers don\'t support Google sign-in.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Try popup first (better UX)
      try {
        const result = await signInWithPopup(auth, provider);
        await createUserProfile(result.user);
        return result.user;
      } catch (popupError) {
        // If popup blocked or fails, try redirect as fallback
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/operation-not-supported-in-this-environment' ||
          popupError.code === 'auth/unauthorized-domain'
        ) {
          console.log('Popup blocked, falling back to redirect...');
          await signInWithRedirect(auth, provider);
          return null; // Redirect will reload the page
        }

        // Don't set error for user-cancelled popups
        if (popupError.code !== 'auth/popup-closed-by-user') {
          setError(popupError.message);
        }
        throw popupError;
      }
    } catch (error) {
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Handle redirect result (for cases where popup failed and redirect was used)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await createUserProfile(result.user);
        }
      } catch (error) {
        console.error('Redirect sign-in error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
          setError(error.message);
        }
      }
    };

    handleRedirectResult();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setCurrentUser({
              ...user,
              preferences: userSnap.data().preferences || {},
            });
          } else {
            await createUserProfile(user);
            setCurrentUser(user);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    signup,
    login,
    logout,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
