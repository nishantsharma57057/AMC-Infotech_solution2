// Public Firebase Web App config only. Never place service-account keys here.
export const firebaseConfig={apiKey:"PASTE_API_KEY",authDomain:"PASTE_PROJECT_ID.firebaseapp.com",projectId:"PASTE_PROJECT_ID",storageBucket:"PASTE_PROJECT_ID.appspot.com",messagingSenderId:"PASTE_SENDER_ID",appId:"PASTE_APP_ID"};
export const adminEmails=["REPLACE_WITH_ADMIN_EMAIL"];
export const configured=!Object.values(firebaseConfig).some(v=>v.startsWith("PASTE_"))&&!adminEmails[0].startsWith("REPLACE_");
