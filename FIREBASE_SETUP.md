# Firebase setup for AMC Admin

## 1. Firebase Authentication
1. Open the Firebase project `amc-infotech-solution`.
2. In Authentication > Sign-in method, enable **Email/Password**.
3. In Authentication > Users, make sure these two users exist:
   - `admin@amcinfotech.com` — UID `5KgMz6p7RKeD75aSzaaan4Yody` or `5KgMz6p7RKeD75aSzaaan4Yodyb2` (the pasted records differ; the app safely scopes both to this same exact email)
   - `nishantsharma57057@gmail.com` — UID `nyD7LWscXQQV7cYkuSnx7qcRktF3`
4. Open each account at `/admin.html` and sign in. If its email is unverified, the page offers **Resend verification email**. Open the email link, return to the admin page and choose **I've verified — check again**.
5. Add the website's production domain in Authentication > Settings > Authorized domains.

The dashboard checks the Firebase UID and email pair, and requires `emailVerified == true`. Merely having a user in Authentication does not grant admin access.

## 2. Firestore
1. Create the Firestore database in production mode if it does not exist.
2. Open Firestore Database > Rules.
3. Replace the rules with the complete contents of the repository's `firestore.rules` file and click **Publish**.

The rules allow public reads only for documents where `active == true`. The two verified admin accounts can read all products and create, update, or delete products. All other Firestore access is denied by default.

The public catalogue query also includes `where("active", "==", true)`; keep this constraint in place because Firestore Security Rules are not filters.

## 3. Deploy
1. Build the project with `npm run build`.
2. Deploy the contents of `dist/` to the static hosting web root.
3. Open `https://YOUR-DOMAIN/admin.html` and test each admin account.

Admin supports add, edit, publish/hide and delete. Product images must use HTTPS URLs. Never commit a Firebase service-account JSON file or private server key.
