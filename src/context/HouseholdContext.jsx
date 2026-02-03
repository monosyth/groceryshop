import { createContext, useState, useEffect, useContext } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import {
  createHousehold,
  joinHousehold,
  leaveHousehold,
  getHousehold,
  getHouseholdMembers,
  updateHouseholdName,
  regenerateInviteCode,
  getUserHouseholdId,
} from '../services/householdService';

const HouseholdContext = createContext({});

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};

export const HouseholdProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for household changes when user changes
  useEffect(() => {
    if (!currentUser) {
      setHousehold(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    let unsubscribeHousehold = null;

    const loadHousehold = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's household ID
        const householdId = await getUserHouseholdId(currentUser.uid);

        if (!householdId) {
          setHousehold(null);
          setMembers([]);
          setLoading(false);
          return;
        }

        // Subscribe to household document for real-time updates
        const householdRef = doc(db, 'households', householdId);
        unsubscribeHousehold = onSnapshot(
          householdRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const householdData = { id: snapshot.id, ...snapshot.data() };
              setHousehold(householdData);

              // Load members
              const membersList = await getHouseholdMembers(householdId);
              setMembers(membersList);
            } else {
              setHousehold(null);
              setMembers([]);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Household subscription error:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error loading household:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadHousehold();

    return () => {
      if (unsubscribeHousehold) {
        unsubscribeHousehold();
      }
    };
  }, [currentUser]);

  // Create a new household
  const handleCreateHousehold = async (name) => {
    if (!currentUser) throw new Error('Must be logged in');

    try {
      setError(null);
      const newHousehold = await createHousehold(currentUser.uid, name);
      setHousehold(newHousehold);
      setMembers([{
        id: currentUser.uid,
        displayName: currentUser.displayName || 'You',
        email: currentUser.email,
        photoURL: currentUser.photoURL,
      }]);
      return newHousehold;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Join an existing household
  const handleJoinHousehold = async (inviteCode) => {
    if (!currentUser) throw new Error('Must be logged in');

    try {
      setError(null);
      const joinedHousehold = await joinHousehold(currentUser.uid, inviteCode);

      // Reload household data
      const householdData = await getHousehold(joinedHousehold.id);
      setHousehold(householdData);

      const membersList = await getHouseholdMembers(joinedHousehold.id);
      setMembers(membersList);

      return householdData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Leave the current household
  const handleLeaveHousehold = async () => {
    if (!currentUser) throw new Error('Must be logged in');

    try {
      setError(null);
      await leaveHousehold(currentUser.uid);
      setHousehold(null);
      setMembers([]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update household name
  const handleUpdateName = async (newName) => {
    if (!household) throw new Error('No household to update');

    try {
      setError(null);
      await updateHouseholdName(household.id, newName);
      setHousehold((prev) => ({ ...prev, name: newName }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Regenerate invite code
  const handleRegenerateCode = async () => {
    if (!household) throw new Error('No household');

    try {
      setError(null);
      const newCode = await regenerateInviteCode(household.id);
      setHousehold((prev) => ({ ...prev, inviteCode: newCode }));
      return newCode;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    household,
    members,
    loading,
    error,
    hasHousehold: !!household,
    householdId: household?.id || null,
    inviteCode: household?.inviteCode || null,
    createHousehold: handleCreateHousehold,
    joinHousehold: handleJoinHousehold,
    leaveHousehold: handleLeaveHousehold,
    updateHouseholdName: handleUpdateName,
    regenerateInviteCode: handleRegenerateCode,
  };

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
};

export default HouseholdContext;
