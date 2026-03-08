import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn03i6YJcAdT3vWgghjybxiSsEnFv3ySk",
  authDomain: "wedding-invitations-7129c.firebaseapp.com",
  projectId: "wedding-invitations-7129c",
  storageBucket: "wedding-invitations-7129c.firebasestorage.app",
  messagingSenderId: "754604142124",
  appId: "1:754604142124:web:8f74f5e0878f10d070ab89",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
};
