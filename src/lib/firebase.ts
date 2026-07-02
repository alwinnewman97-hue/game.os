import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAyVhqdlNlEfpzvBwLJB2DmrCcHWPlJsKc",
  authDomain: "databasis-6a8fc.firebaseapp.com",
  databaseURL: "https://databasis-6a8fc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "databasis-6a8fc",
  storageBucket: "databasis-6a8fc.firebasestorage.app",
  messagingSenderId: "367716257661",
  appId: "1:367716257661:web:34efa087f0246e9b87c614",
  measurementId: "G-9M96RE1SK1"
};

const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    // Optionally re-authenticate anonymously so they can still save anonymously
    await signInAnonymously(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

// Attempt anonymous sign-in so we can read/write data safely
signInAnonymously(auth).catch(console.error);

export async function saveStateToCloud(userId: string, username: string, state: any) {
  if (!userId) throw new Error("User ID required");
  
  // Create a minimal state object to avoid saving too much data or functions
  const dataToSave = {
    username,
    resources: state.resources,
    buildings: state.buildings,
    researched: state.researched,
    upgrades: state.upgrades,
    portalUpgrades: state.portalUpgrades,
    unlocks: state.unlocks,
    portalResets: state.portalResets,
    portalFlux: state.portalFlux,
    currentDimension: state.currentDimension,
    dimensionEnterTime: state.dimensionEnterTime,
    timeStayedMs: state.dimensionEnterTime ? Date.now() - state.dimensionEnterTime : 0,
    year: state.year,
    season: state.season,
    day: state.day,
    
    // Stats for leaderboard
    fluxScore: state.portalFlux,
    totalResets: state.portalResets,
    updatedAt: serverTimestamp(),
  };

  const docRef = doc(db, "saves", userId);
  await setDoc(docRef, dataToSave, { merge: true });
}

export async function loadStateFromCloud(userId: string) {
  if (!userId) throw new Error("User ID required");
  const docRef = doc(db, "saves", userId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

export async function getLeaderboard() {
  const savesRef = collection(db, "saves");
  const q = query(savesRef, orderBy("fluxScore", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export { app, analytics };
