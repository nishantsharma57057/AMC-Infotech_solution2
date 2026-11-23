# Firebase setup for AMC Admin

1. Create a Firebase project and add a Web App at https://console.firebase.google.com/.
2. Enable Authentication > Sign-in method > Email/Password.
3. Create a Firestore database in production mode.
4. Create the admin user in Authentication > Users and verify the email address.
5. Copy the Firebase Web App config into src/firebase-config.js. Replace REPLACE_WITH_ADMIN_EMAIL with the exact admin email.
6. In firestore.rules, replace REPLACE_WITH_ADMIN_EMAIL with the same email and publish rules in Firestore > Rules.
7. Add your production domain under Authentication > Settings > Authorized domains.
8. Deploy and open /admin.html. Sign in with the verified admin account.

Admin supports add, edit, publish/hide and delete. Products are stored in Firestore and active listings sync into the public catalogue on page load. Images are HTTPS URLs to avoid requiring Firebase Storage in this initial Spark setup.

Firebase project creation, admin account creation and publishing rules are external setup steps; a GitHub push alone cannot perform them. Never commit service-account JSON or private keys. Web config is public client configuration. Keep Firestore rules restricted to the verified admin email; do not use open test mode.
