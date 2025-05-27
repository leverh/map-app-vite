import { database } from '../firebaseConfig';
import { ref, set, get, child } from 'firebase/database';

export const saveUserData = (userId, data) => {
  const dbRef = ref(database);
  return set(child(dbRef, `users/${userId}`), data);
};

export const getUserData = (userId) => {
  const dbRef = ref(database);
  return get(child(dbRef, `users/${userId}`));
};
