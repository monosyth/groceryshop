import { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

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
        throw error;
      }
    }
  };

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      // Create user profile in Firestore
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

  // Sign in with Google (using redirect to avoid COOP warnings)
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      // Use redirect instead of popup to avoid Cross-Origin-Opener-Policy warnings
      await signInWithRedirect(auth, provider);
      // Note: The actual sign-in result is handled in useEffect via getRedirectResult
    } catch (error) {
      setError(error.message);
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

  // Combined auth initialization - handles both redirect result and auth state
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // First, check for redirect result (from Google sign-in return)
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // Create user profile in Firestore if doesn't exist
          await createUserProfile(result.user);
        }
      } catch (error) {
        console.error('Redirect sign-in error:', error);
        if (isMounted) {
          setError(error.message);
        }
      }

      // Set up auth state listener (this handles the actual user state)
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return;

        if (user) {
          // Fetch user profile from Firestore
          try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              setCurrentUser({
                ...user,
                preferences: userSnap.data().preferences || {},
              });
            } else {
              // Profile doesn't exist yet - create it
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

      return unsubscribe;
    };

    const unsubscribePromise = initializeAuth();

    return () => {
      isMounted = false;
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
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
