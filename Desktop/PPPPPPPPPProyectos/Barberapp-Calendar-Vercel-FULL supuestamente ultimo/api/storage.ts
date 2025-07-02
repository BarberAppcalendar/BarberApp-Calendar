// Firebase is the ONLY storage system - all barber IDs are generated and stored directly in Firebase
// No other database or storage system is used

import { FirebaseStorage } from './firebase-storage';

export const storage = new FirebaseStorage();