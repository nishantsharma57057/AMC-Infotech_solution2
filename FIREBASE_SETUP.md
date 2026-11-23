# Firebase setup for AMC Admin

## 1. Firebase Authentication
1. Open the Firebase project `amc-infotech-solution`.
2. In Authentication > Sign-in method, enable **Email/Password**.
3. In Authentication > Users, make sure these two users exist:
   - `admin@amcinfotech.com` — UID `5KgMz6p7RKeD75aSzaaan4Yodyb2`
   - `nishantsharma57057@gmail.com` — UID `nyD7LWscXQQV7cYkuSnx7qcRktF3`
4. Sign in at `/admin.html`. Both accounts must have verified email addresses.
5. Add the production domain in Authentication > Settings > Authorized domains.

The dashboard checks the exact Firebase UID and email pair and requires `emailVerified == true`.

## 2. Publish Firestore rules
1. Open Firestore Database > Rules.
2. Copy the complete contents of the repository's `firestore.rules` file.
3. Replace the existing rules and click **Publish**.

The rules provide:
- Public read access only to published product documents.
- Full product inventory access and product changes only to the two verified AMC admin accounts.
- Public read access to the single `siteSettings/public` document so the website can show contact details.
- Create/update access to business profile settings only for verified AMC admins.

Do not replace these rules with open read/write rules.

## 3. Existing catalogue migration
The original laptops were bundled in `catalogue.js`, not stored in Firestore. On the first successful admin dashboard load, the dashboard imports any missing catalogue IDs into the Firestore `products` collection. It does not overwrite products already present in Firebase, so previously edited records are preserved. The public website then reads the same published Firebase records.

The import requires the admin to be signed in and the Firestore rules above to be published.

## 4. Deploy
1. Build with `npm run build`; this copies all source files into `dist/`.
2. Deploy the contents of `dist/` to the hosting web root.
3. Open `https://YOUR-DOMAIN/admin.html`, sign in, and check Overview, Inventory and Business profile.
4. Confirm the public Shop section reflects published listings and contact details.

Admin supports add, edit, publish/hide and delete. Product images must use HTTPS URLs. Never commit a Firebase service-account JSON file or private server key.
