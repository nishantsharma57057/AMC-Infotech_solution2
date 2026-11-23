import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  reload,
  getIdToken
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig, authorizedAdmins, configured } from "./firebase-config.js";

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

let auth;
let db;
let items = [];

function show(selector, visible) {
  $(selector).classList.toggle("admin-hidden", !visible);
}

function isAuthorizedAdmin(user) {
  const email = (user.email || "").toLowerCase();
  return authorizedAdmins.some(admin =>
    admin.uids.includes(user.uid) && admin.email.toLowerCase() === email
  );
}

function showLogin(message = "") {
  show("#login", true);
  show("#verify", false);
  show("#dashboard", false);
  show("#logout", false);
  if (message) $("#loginStatus").textContent = message;
}

async function openDashboard(user) {
  if (!isAuthorizedAdmin(user) || !user.emailVerified) {
    showLogin("This account is not an authorized, verified AMC admin.");
    await signOut(auth);
    return;
  }

  // Refresh the ID token so Firestore receives the updated email_verified claim.
  await getIdToken(user, true);
  show("#login", false);
  show("#verify", false);
  show("#dashboard", true);
  show("#logout", true);
  await load();
}

if (!configured) {
  show("#setup", true);
  show("#login", false);
  $("#loginStatus").textContent = "Firebase configuration is missing.";
} else {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, async user => {
    if (!user) {
      showLogin();
      return;
    }

    if (!isAuthorizedAdmin(user)) {
      showLogin("This Firebase account is not one of the two approved AMC admins.");
      await signOut(auth);
      return;
    }

    if (!user.emailVerified) {
      show("#login", false);
      show("#verify", true);
      show("#dashboard", false);
      show("#logout", true);
      $("#verifyEmail").textContent = user.email || "";
      $("#verifyStatus").textContent = "Send the verification email, open its link, then return here and select “I've verified — check again”.";
      return;
    }

    await openDashboard(user);
  });

  $("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    $("#loginStatus").textContent = "Signing in…";

    try {
      await signInWithEmailAndPassword(
        auth,
        String(formData.get("email") || "").trim(),
        String(formData.get("password") || "")
      );
    } catch (error) {
      $("#loginStatus").textContent = "Login failed: " + (error.message || "Please check your email and password.");
    }
  });

  $("#resendVerification").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await sendEmailVerification(user);
      $("#verifyStatus").textContent = "Verification email sent to " + user.email + ". Check your inbox and Spam folder.";
    } catch (error) {
      $("#verifyStatus").textContent = "Could not send email: " + (error.message || "Please try again later.");
    }
  });

  $("#checkVerification").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      showLogin("Your session ended. Please sign in again.");
      return;
    }

    try {
      await reload(user);
      const refreshedUser = auth.currentUser;
      if (refreshedUser?.emailVerified) {
        $("#verifyStatus").textContent = "Email verified. Opening the inventory dashboard…";
        await openDashboard(refreshedUser);
      } else {
        $("#verifyStatus").textContent = "Firebase still shows this email as unverified. Open the latest verification email, then check again.";
      }
    } catch (error) {
      $("#verifyStatus").textContent = "Could not check verification: " + (error.message || "Please try again.");
    }
  });

  $("#logout").addEventListener("click", () => signOut(auth));
}

async function load() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    items = snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
    render();
  } catch (error) {
    $("#saveStatus").textContent = "Could not load inventory: " + error.message;
  }
}

function render() {
  $("#count").textContent = items.length + " managed products";
  $("#rows").innerHTML = items.map(product => `
    <tr>
      <td>${product.imageUrl ? '<img class="admin-thumb" src="' + esc(product.imageUrl) + '" alt="">' : "—"}</td>
      <td><b>${esc(product.name)}</b><br>${esc(product.model)}</td>
      <td>${esc(product.chip)}<br>${esc(product.ram)} / ${esc(product.storage)} GB</td>
      <td>${esc(product.qty)}</td>
      <td>₹${Number(product.price || 0).toLocaleString("en-IN")}</td>
      <td>
        <button class="button small outline" type="button" data-edit="${esc(product.id)}">Edit</button>
        <button class="button small" type="button" data-del="${esc(product.id)}">Delete</button>
      </td>
    </tr>
  `).join("");
}

function clearForm() {
  const form = $("#productForm");
  form.reset();
  form.elements.namedItem("id").value = "";
  $("#formTitle").textContent = "Add laptop";
}

$("#clear").addEventListener("click", clearForm);

$("#productForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const id = String(formData.get("id") || "laptop-" + crypto.randomUUID());
  const product = {
    brand: formData.get("brand"),
    name: String(formData.get("name") || "").trim(),
    model: String(formData.get("model") || "").trim(),
    chip: String(formData.get("chip") || "").trim(),
    ram: Number(formData.get("ram")),
    storage: Number(formData.get("storage")),
    price: Number(formData.get("price")),
    qty: Number(formData.get("qty")),
    warranty: formData.get("warranty") || "Not specified",
    condition: formData.get("condition"),
    imageUrl: String(formData.get("imageUrl") || "").trim(),
    desc: String(formData.get("desc") || "").trim(),
    active: formData.get("active") === "true",
    use: String(formData.get("use") || "").split(",").map(value => value.trim()).filter(Boolean),
    updatedAt: serverTimestamp()
  };

  if (product.imageUrl && !product.imageUrl.startsWith("https://")) {
    alert("Use an HTTPS image URL.");
    return;
  }

  try {
    $("#saveStatus").textContent = "Saving…";
    await setDoc(doc(db, "products", id), product, { merge: true });
    $("#saveStatus").textContent = "Saved. Published products will appear in the public catalogue.";
    clearForm();
    await load();
  } catch (error) {
    $("#saveStatus").textContent = "Save failed: " + error.message;
  }
});

$("#rows").addEventListener("click", async event => {
  const button = event.target.closest("button[data-edit], button[data-del]");
  if (!button) return;

  const id = button.dataset.edit || button.dataset.del;
  const product = items.find(item => item.id === id);
  if (!product) return;

  if (button.dataset.edit) {
    const form = $("#productForm");
    for (const [key, value] of Object.entries(product)) {
      const field = form.elements.namedItem(key);
      if (field) field.value = Array.isArray(value) ? value.join(", ") : String(value ?? "");
    }
    form.elements.namedItem("id").value = id;
    $("#formTitle").textContent = "Edit laptop";
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (confirm("Delete this listing permanently?")) {
    try {
      await deleteDoc(doc(db, "products", id));
      $("#saveStatus").textContent = "Laptop deleted.";
      await load();
    } catch (error) {
      $("#saveStatus").textContent = "Delete failed: " + error.message;
    }
  }
});
