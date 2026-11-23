import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig, configured } from "./firebase-config.js";

if (configured) {
  try {
    const db = getFirestore(initializeApp(firebaseConfig));
    // Firestore rules are not filters: constrain the public query to published products.
    const publishedProducts = query(
      collection(db, "products"),
      where("active", "==", true)
    );
    const snapshot = await getDocs(publishedProducts);
    window.dispatchEvent(new CustomEvent("amc:inventory", {
      detail: snapshot.docs.map(document => ({ id: document.id, ...document.data() }))
    }));
  } catch (error) {
    console.warn("Firebase catalogue unavailable; using bundled inventory.", error);
  }
}
