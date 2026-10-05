// src/firebase/store/authStore.js
import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  deleteUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../config";

let unsubscribeProfileListener = null;

export const useAuthStore = create((set, get) => ({
  user: null,          // Firebase auth user object
  profile: null,       // Firestore users/{uid} document
  loading: true,       // true until first auth check resolves
  error: null,

  // Call this once, high up in App.jsx, to keep auth state in sync
  initAuthListener: () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      // Stop listening to the previous user's profile doc, if any
      if (unsubscribeProfileListener) {
        unsubscribeProfileListener();
        unsubscribeProfileListener = null;
      }

      if (firebaseUser) {
        set({ user: firebaseUser, loading: true });
        // Realtime listener on YOUR OWN profile doc: any change made
        // anywhere (a completed swap incrementing swapsCompleted, a new
        // review updating rating, editing your profile) reflects here
        // instantly, without needing a manual refresh or re-login.
        unsubscribeProfileListener = onSnapshot(doc(db, "users", firebaseUser.uid), (snap) => {
          const profile = snap.exists() ? { id: snap.id, ...snap.data() } : null;
          set({ profile, loading: false });
        });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  },

  fetchProfile: async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  refreshProfile: async () => {
    const uid = get().user?.uid;
    if (!uid) return;
    const profile = await get().fetchProfile(uid);
    set({ profile });
  },

  register: async ({ name, email, password }) => {
    set({ error: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      // Create the matching Firestore user doc — this is the doc every other
      // page (Profile, Browse, ViewSwap) reads from.
      const newProfile = {
        name,
        email,
        location: "",
        bio: "",
        photoURL: "",
        teaches: [],       // [{ skill: "React", level: "Intermediate" }]
        learns: [],        // [{ skill: "Spanish", level: "Beginner" }]
        format: "video",   // "video" | "in_person" | "chat"
        availability: [],  // ["Mon", "Wed", ...]
        rating: 0,
        ratingCount: 0,
        swapsCompleted: 0,
        onboarded: false,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", cred.user.uid), newProfile);
      set({ user: cred.user, profile: { id: cred.user.uid, ...newProfile } });
      return cred.user;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  login: async ({ email, password }) => {
    set({ error: null });
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await get().fetchProfile(cred.user.uid);
      set({ user: cred.user, profile });
      return cred.user;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    set({ error: null });
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      let profile = await get().fetchProfile(cred.user.uid);
      if (!profile) {
        // first time Google sign-in -> create a user doc same as register
        const newProfile = {
          name: cred.user.displayName || "New user",
          email: cred.user.email,
          location: "",
          bio: "",
          photoURL: cred.user.photoURL || "",
          teaches: [],
          learns: [],
          format: "video",
          availability: [],
          rating: 0,
          ratingCount: 0,
          swapsCompleted: 0,
          onboarded: false,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", cred.user.uid), newProfile);
        profile = { id: cred.user.uid, ...newProfile };
      }
      set({ user: cred.user, profile });
      return cred.user;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, profile: null });
  },

  // Firebase requires a "recent" login for destructive account actions like
  // this — if it's been a while since they signed in, this throws
  // auth/requires-recent-login, which the caller should catch and tell the
  // user to log out and back in, then retry.
  deleteAccount: async () => {
    const firebaseUser = get().user;
    if (!firebaseUser) return;
    await deleteDoc(doc(db, "users", firebaseUser.uid));
    await deleteUser(firebaseUser);
    set({ user: null, profile: null });
  },
}));
