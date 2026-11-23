// Public Firebase Web App configuration for AMC Infotech.
// These values identify the Firebase project; never place service-account keys here.
export const firebaseConfig = {
  apiKey: "AIzaSyCOeaniK6hcG8HJu9TnTHUat1Uah4A0lN0",
  authDomain: "amc-infotech-solution.firebaseapp.com",
  projectId: "amc-infotech-solution",
  storageBucket: "amc-infotech-solution.firebasestorage.app",
  messagingSenderId: "353215596705",
  appId: "1:353215596705:web:5f7c2932a9b38bacb608e0",
  measurementId: "G-K1WM63VJ3V"
};

// Admin access requires the exact Firebase UID and matching verified email.
export const authorizedAdmins = [
  {
    uids: ["5KgMz6p7RKeD75aSzaaan4Yodyb2"],
    email: "admin@amcinfotech.com"
  },
  {
    uids: ["nyD7LWscXQQV7cYkuSnx7qcRktF3"],
    email: "nishantsharma57057@gmail.com"
  }
];

export const adminEmails = authorizedAdmins.map(admin => admin.email);

export const configured =
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId) &&
  !firebaseConfig.apiKey.startsWith("PASTE_") &&
  authorizedAdmins.length > 0;
