import {
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
} from "./firebase-config.js";

export function subscribeToGuests(collectionName, callback) {
  const q = query(
    collection(db, collectionName),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const guests = [];
    snapshot.forEach((docSnap) => {
      guests.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(guests);
  });
}

export async function addGuest(collectionName, guestData) {
  return addDoc(collection(db, collectionName), {
    name: guestData.name || "",
    phone: guestData.phone || "",
    confirmed: guestData.confirmed || false,
    communicated: guestData.communicated || false,
    children: guestData.children || [],
    notes: guestData.notes || "",
    createdAt: serverTimestamp(),
  });
}

export async function removeGuest(collectionName, guestId) {
  return deleteDoc(doc(db, collectionName, guestId));
}

export async function updateGuestField(collectionName, guestId, fields) {
  return updateDoc(doc(db, collectionName, guestId), fields);
}

export async function addChildToGuest(collectionName, guestId, currentChildren, childName) {
  const newChildren = [...currentChildren, { name: childName }];
  return updateDoc(doc(db, collectionName, guestId), {
    children: newChildren,
  });
}

export async function removeChildFromGuest(collectionName, guestId, currentChildren, childIndex) {
  const newChildren = currentChildren.filter((_, i) => i !== childIndex);
  return updateDoc(doc(db, collectionName, guestId), {
    children: newChildren,
  });
}

export async function importGuests(collectionName, guestsArray) {
  const promises = guestsArray.map((guest) => addGuest(collectionName, guest));
  return Promise.all(promises);
}
