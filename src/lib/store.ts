/**
 * Firebase Firestore based data store.
 */

import { AppUser, Transaction, RecurringExpense } from "./types";
import { format, subDays } from "date-fns";
import { auth, db, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDoc,
  setDoc
} from "firebase/firestore";

// ---- AUTH ----

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<AppUser> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName });

  const appUser: AppUser = {
    uid: user.uid,
    email: user.email || email,
    displayName
  };
  return appUser;
}

export async function loginWithEmail(email: string, password: string): Promise<AppUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  return {
    uid: user.uid,
    email: user.email || email,
    displayName: user.displayName || "User"
  };
}

export async function loginWithGoogle(): Promise<AppUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const appUser: AppUser = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "Google User",
    photoURL: user.photoURL || undefined,
  };

  return appUser;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

// Current user is now managed via onAuthStateChanged in AuthContext, 
// so we don't need a synchronous getCurrentUser() from local storage here.

// ---- TRANSACTIONS ----

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
}

// Utility to remove undefined fields which Firestore rejects
function stripUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as T;
}

export async function addTransaction(
  userId: string,
  data: Omit<Transaction, "id" | "userId" | "createdAt">
): Promise<Transaction> {
  const cleanData = stripUndefined(data);
  const docRef = await addDoc(collection(db, "transactions"), {
    ...cleanData,
    userId,
    createdAt: new Date().toISOString()
  });

  const newDoc = await getDoc(docRef);
  return { id: newDoc.id, ...newDoc.data() } as Transaction;
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>
): Promise<Transaction> {
  const docRef = doc(db, "transactions", id);
  const cleanData = stripUndefined(data);
  await updateDoc(docRef, cleanData);
  const updatedDoc = await getDoc(docRef);
  return { id: updatedDoc.id, ...updatedDoc.data() } as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, "transactions", id));
}

// ---- RECURRING EXPENSES ----

export async function getUserRecurringRules(userId: string): Promise<RecurringExpense[]> {
  const q = query(
    collection(db, "recurring_expenses"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecurringExpense));
}

export async function addRecurringRule(
  userId: string,
  data: Omit<RecurringExpense, "id" | "userId" | "createdAt" | "active">
): Promise<RecurringExpense> {
  const cleanData = stripUndefined(data);
  const docRef = await addDoc(collection(db, "recurring_expenses"), {
    ...cleanData,
    userId,
    active: true,
    createdAt: new Date().toISOString()
  });
  const newDoc = await getDoc(docRef);
  return { id: newDoc.id, ...newDoc.data() } as RecurringExpense;
}

export async function updateRecurringRule(
  id: string,
  data: Partial<Omit<RecurringExpense, "id" | "userId" | "createdAt">>
): Promise<RecurringExpense> {
  const docRef = doc(db, "recurring_expenses", id);
  const cleanData = stripUndefined(data);
  await updateDoc(docRef, cleanData);
  const updatedDoc = await getDoc(docRef);
  return { id: updatedDoc.id, ...updatedDoc.data() } as RecurringExpense;
}

export async function deleteRecurringRule(id: string): Promise<void> {
  await deleteDoc(doc(db, "recurring_expenses", id));
}

// ---- IMAGE UPLOAD (Mock Firebase Storage) ----
export function uploadImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // In real Firebase: upload to Storage, get download URL
      // Here we store as base64 data URL
      resolve(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
}