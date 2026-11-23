// Firebase Web App configuration for AMC Infotech.
// These browser config values identify the Firebase project; do not add service-account keys here.
export const firebaseConfig = {
  apiKey: "AIzaSyCOeaniK6hcG8HJu9TnTHUat1Uah4A0lN0",
  authDomain: "amc-infotech-solution.firebaseapp.com",
  projectId: "amc-infotech-solution",
  storageBucket: "amc-infotech-solution.firebasestorage.app",
  messagingSenderId: "353215596705",
  appId: "1:353215596705:web:5f7c2932a9b38bacb608e0",
  measurementId: "G-K1WM63VJ3V"
};

// Replace this with the exact email address you create and verify in Firebase Authentication.
// Also use the same email in firestore.rules before publishing the rules.
export const adminEmails = ["admin@amcinfotech.com", "nishantsharma57057@gmail.com"];

export const configured =
  !Object.values(firebaseConfig).some(value => String(value).startsWith("PASTE_")) &&
  !adminEmails[0].startsWith("REPLACE_");
