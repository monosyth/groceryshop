import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Household Service
 *
 * Handles household creation, joining, and member management.
 * User attribution is stored but not displayed (for future features).
 */

// Generate a random 6-character invite code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new household
export const createHousehold = async (userId, householdName) => {
  try {
    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let codeExists = true;

    // Ensure invite code is unique
    while (codeExists) {
      const q = query(collection(db, 'households'), where('inviteCode', '==', inviteCode));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        codeExists = false;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    // Create household document
    const householdRef = doc(collection(db, 'households'));
    const householdData = {
      id: householdRef.id,
      name: householdName,
      inviteCode,
      members: [userId],
      createdBy: userId, // Stored for future features, not displayed
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(householdRef, householdData);

    // Update user's householdId
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      householdId: householdRef.id,
      updatedAt: serverTimestamp(),
    });

    return { id: householdRef.id, ...householdData };
  } catch (error) {
    console.error('Error creating household:', error);
    throw error;
  }
};

// Join a household using invite code
export const joinHousehold = async (userId, inviteCode) => {
  try {
    // Find household by invite code
    const q = query(collection(db, 'households'), where('inviteCode', '==', inviteCode.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Invalid invite code. Please check and try again.');
    }

    const householdDoc = snapshot.docs[0];
    const householdData = householdDoc.data();

    // Check if user is already a member
    if (householdData.members.includes(userId)) {
      throw new Error('You are already a member of this household.');
    }

    // Add user to household members
    await updateDoc(householdDoc.ref, {
      members: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });

    // Update user's householdId
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      householdId: householdDoc.id,
      updatedAt: serverTimestamp(),
    });

    return { id: householdDoc.id, ...householdData };
  } catch (error) {
    console.error('Error joining household:', error);
    throw error;
  }
};

// Leave a household
export const leaveHousehold = async (userId) => {
  try {
    // Get user's current household
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || !userSnap.data().householdId) {
      throw new Error('You are not part of any household.');
    }

    const householdId = userSnap.data().householdId;
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);

    if (!householdSnap.exists()) {
      // Household doesn't exist, just clear user's householdId
      await updateDoc(userRef, {
        householdId: null,
        updatedAt: serverTimestamp(),
      });
      return;
    }

    const householdData = householdSnap.data();

    // If user is the only member, delete the household
    if (householdData.members.length === 1) {
      await deleteDoc(householdRef);
    } else {
      // Remove user from members
      await updateDoc(householdRef, {
        members: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });
    }

    // Clear user's householdId
    await updateDoc(userRef, {
      householdId: null,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error leaving household:', error);
    throw error;
  }
};

// Get household by ID
export const getHousehold = async (householdId) => {
  try {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);

    if (!householdSnap.exists()) {
      return null;
    }

    return { id: householdSnap.id, ...householdSnap.data() };
  } catch (error) {
    console.error('Error getting household:', error);
    throw error;
  }
};

// Get household members with their profile info
export const getHouseholdMembers = async (householdId) => {
  try {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);

    if (!householdSnap.exists()) {
      return [];
    }

    const memberIds = householdSnap.data().members || [];
    const members = [];

    for (const memberId of memberIds) {
      const userRef = doc(db, 'users', memberId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        members.push({
          id: memberId,
          displayName: userData.displayName || 'Unknown',
          email: userData.email,
          photoURL: userData.photoURL,
        });
      }
    }

    return members;
  } catch (error) {
    console.error('Error getting household members:', error);
    throw error;
  }
};

// Update household name
export const updateHouseholdName = async (householdId, newName) => {
  try {
    const householdRef = doc(db, 'households', householdId);
    await updateDoc(householdRef, {
      name: newName,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating household name:', error);
    throw error;
  }
};

// Regenerate invite code
export const regenerateInviteCode = async (householdId) => {
  try {
    let inviteCode = generateInviteCode();
    let codeExists = true;

    while (codeExists) {
      const q = query(collection(db, 'households'), where('inviteCode', '==', inviteCode));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        codeExists = false;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    const householdRef = doc(db, 'households', householdId);
    await updateDoc(householdRef, {
      inviteCode,
      updatedAt: serverTimestamp(),
    });

    return inviteCode;
  } catch (error) {
    console.error('Error regenerating invite code:', error);
    throw error;
  }
};

// Get user's household ID
export const getUserHouseholdId = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data().householdId || null;
  } catch (error) {
    console.error('Error getting user household ID:', error);
    throw error;
  }
};
