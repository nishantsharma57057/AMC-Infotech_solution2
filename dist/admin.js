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
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig, authorizedAdmins, configured } from "./firebase-config.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";
import { seedInventory } from "./seed-inventory.js";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));
const money = value => "₹" + Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const DEFAULT_SETTINGS = {
  businessName: "AMC Infotech Solution",
  tagline: "Great laptops deserve a second story. Let’s find yours.",
  announcement: "Good tech. A fresh start.",
  phone: "",
  whatsapp: "",
  email: "",
  whatsappMessage: "Hi AMC Infotech, I am interested in a laptop.",
  address: "Sanjay Place",
  city: "Agra",
  state: "Uttar Pradesh",
  pincode: "",
  openingHours: "Please confirm the exact shop pin and opening hours before visiting.",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=AMC+Infotech+Solution+Sanjay+Place+Agra",
  mapsEmbedUrl: "https://www.google.com/maps?q=Sanjay%20Place%2C%20Agra&z=15&output=embed",
  instagramUrl: "https://www.instagram.com/macbookhub_/",
  instagramHandle: "@macbookhub_",
  facebookUrl: "",
  youtubeUrl: "",
  linkedinUrl: ""
};

let auth;
let db;
let firebaseStorage;
let products = [];
let siteSettings = { ...DEFAULT_SETTINGS };
let currentView = "overview";
let currentAdminUser = null;

function show(selector, visible) {
  const element = $(selector);
  if (element) element.classList.toggle("admin-hidden", !visible);
}

function notify(message, type = "success") {
  const element = $("#adminNotice");
  element.textContent = message;
  element.className = "admin-notice show" + (type === "error" ? " error" : "");
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => element.classList.remove("show"), 5200);
}

function isAuthorizedAdmin(user) {
  const email = (user.email || "").toLowerCase();
  return authorizedAdmins.some(admin =>
    admin.uids.includes(user.uid) && admin.email.toLowerCase() === email
  );
}

function showLogin(message = "") {
  show(".admin-auth-shell", true);
  show("#login", true);
  show("#verify", false);
  show("#setup", false);
  show("#dashboard", false);
  if (message) $("#loginStatus").textContent = message;
}

async function openDashboard(user) {
  if (!isAuthorizedAdmin(user) || !user.emailVerified) {
    showLogin("This account is not an authorized, verified AMC admin.");
    await signOut(auth);
    return;
  }

  await getIdToken(user, true);
  currentAdminUser = user;
  show("#login", false);
  show("#verify", false);
  show("#setup", false);
  show(".admin-auth-shell", false);
  show("#dashboard", true);
  $("#adminIdentity").textContent = user.email || "Verified admin";
  await Promise.all([loadProducts(), loadSiteSettings()]);
  renderDashboard();
}

if (!configured) {
  show("#setup", true);
  show("#login", false);
} else {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  firebaseStorage = getStorage(app);

  onAuthStateChanged(auth, async user => {
    try {
      if (!user) {
        currentAdminUser = null;
        showLogin();
        return;
      }
      if (!isAuthorizedAdmin(user)) {
        showLogin("This Firebase account is not one of the approved AMC admins.");
        await signOut(auth);
        return;
      }
      if (!user.emailVerified) {
        currentAdminUser = null;
        show("#login", false);
        show("#verify", true);
        show("#dashboard", false);
        show("#logout", false);
        $("#verifyEmail").textContent = user.email || "";
        $("#verifyStatus").textContent = "Send the verification email, open its link, then return here and choose “I've verified — check again”.";
        return;
      }
      await openDashboard(user);
    } catch (error) {
      console.error("Admin session error:", error);
      notify("Could not open the admin dashboard: " + error.message, "error");
    }
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
      $("#verifyStatus").textContent = "Could not send email: " + error.message;
    }
  });

  $("#checkVerification").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return showLogin("Your session ended. Please sign in again.");
    try {
      await reload(user);
      const refreshedUser = auth.currentUser;
      if (refreshedUser?.emailVerified) {
        $("#verifyStatus").textContent = "Email verified. Opening your dashboard…";
        await openDashboard(refreshedUser);
      } else {
        $("#verifyStatus").textContent = "Firebase still shows this email as unverified. Open the latest verification email, then check again.";
      }
    } catch (error) {
      $("#verifyStatus").textContent = "Could not check verification: " + error.message;
    }
  });

  $("#verifyLogout").addEventListener("click", () => signOut(auth));
  $("#logout").addEventListener("click", () => signOut(auth));
}

function setView(view) {
  currentView = view;
  const labels = {
    overview: ["Overview", "Good to see you."],
    inventory: ["Inventory", "Your laptop inventory."],
    settings: ["Business profile", "Your store, your details."]
  };
  for (const panel of ["overview", "inventory", "settings"]) {
    $("#" + panel + "Panel").classList.toggle("admin-hidden", panel !== view);
  }
  $$("[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  $("#pageBreadcrumb").textContent = labels[view][0];
  $("#pageTitle").textContent = labels[view][1];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$("[data-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
$$("[data-go]").forEach(button => button.addEventListener("click", () => setView(button.dataset.go)));
$("#overviewAddBtn").addEventListener("click", () => openProductDialog());
$("#addProductButton").addEventListener("click", () => openProductDialog());
$("#refreshBtn").addEventListener("click", async () => {
  await Promise.all([loadProducts(), loadSiteSettings()]);
  renderDashboard();
  notify("Dashboard refreshed from Firebase.");
});

async function loadProducts() {
  try {
    let snapshot = await getDocs(collection(db, "products"));
    const existingIds = new Set(snapshot.docs.map(document => document.id));

    // The original public catalogue was bundled in catalogue.js, not stored in Firestore.
    // Import only missing IDs once, preserving any product an admin has already edited.
    const missingSeedItems = seedInventory.filter(item => !existingIds.has(String(item.id)));
    if (missingSeedItems.length) {
      await Promise.all(missingSeedItems.map(item => {
        const ram = Number.parseInt(String(item.ram || ""), 10) || 8;
        const storage = Number.parseInt(String(item.storage || ""), 10) || 256;
        const qty = Number.isFinite(Number(item.qty)) ? Number(item.qty) : (item.available === false ? 0 : 1);
        const product = {
          brand: item.brand || "Other",
          name: item.name || "Laptop",
          model: item.model || item.id,
          chip: item.chip || item.processor || "Not specified",
          ram,
          storage,
          price: Number(item.price) || 0,
          qty,
          warranty: item.warranty || "Not specified",
          condition: "Refurbished",
          imageUrl: item.imageUrl || "",
          desc: item.desc || "",
          use: Array.isArray(item.use) ? item.use : ["Office", "Students"],
          active: true,
          legacyCatalogueImport: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        return setDoc(doc(db, "products", String(item.id)), product);
      }));
      snapshot = await getDocs(collection(db, "products"));
      notify(missingSeedItems.length + " existing website listings imported into Firebase inventory.");
    }

    products = snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
    // Old Firebase documents without an active field remain published by default.
    const legacy = snapshot.docs.filter(document => typeof document.data().active !== "boolean");
    if (legacy.length) {
      await Promise.all(legacy.map(document =>
        updateDoc(doc(db, "products", document.id), { active: true, updatedAt: serverTimestamp() })
      ));
      products = products.map(product => product.active === undefined ? { ...product, active: true } : product);
    }
    renderDashboard();
  } catch (error) {
    console.error("Inventory load error:", error);
    notify("Could not load Firebase inventory: " + error.message, "error");
  }
}

function isPublished(product) {
  return product.active !== false;
}

function stockValue() {
  return products.reduce((sum, product) =>
    sum + Math.max(0, Number(product.price) || 0) * Math.max(0, Number(product.qty) || 0), 0);
}

function updatedTime(product) {
  const value = product.updatedAt || product.createdAt;
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function productStatus(product) {
  if (!isPublished(product)) return '<span class="admin-status-pill status-hidden">Hidden</span>';
  if (Number(product.qty) <= 0) return '<span class="admin-status-pill status-out">Out of stock</span>';
  return '<span class="admin-status-pill status-live">Published</span>';
}

function productThumb(product) {
  return product.imageUrl
    ? '<img class="admin-product-thumb" src="' + esc(product.imageUrl) + '" alt="" loading="lazy">'
    : '<span class="admin-product-thumb" aria-hidden="true"></span>';
}

function productNameCell(product) {
  return '<div class="admin-product-cell">' + productThumb(product) +
    '<span><strong>' + esc(product.name || "Untitled laptop") + '</strong><small>' +
    esc(product.brand || "Laptop") + (product.model ? " · " + esc(product.model) : "") +
    '</small></span></div>';
}

function renderDashboard() {
  $("#metricTotal").textContent = products.length.toLocaleString("en-IN");
  $("#metricLive").textContent = products.filter(isPublished).length.toLocaleString("en-IN");
  $("#metricHidden").textContent = products.filter(product => !isPublished(product)).length.toLocaleString("en-IN");
  $("#metricValue").textContent = money(stockValue());
  $("#navInventoryCount").textContent = products.length.toLocaleString("en-IN");
  renderRecent();
  renderInventory();
}

function renderRecent() {
  const recent = [...products].sort((a, b) => updatedTime(b) - updatedTime(a)).slice(0, 6);
  $("#recentRows").innerHTML = recent.map(product => `
    <tr>
      <td>${productNameCell(product)}</td>
      <td>${esc(product.ram || "—")} GB / ${esc(product.storage || "—")} GB<br><small>${esc(product.chip || "Processor not set")}</small></td>
      <td><strong>${money(product.price)}</strong></td>
      <td>${productStatus(product)}</td>
    </tr>
  `).join("");
  $("#recentEmpty").classList.toggle("admin-hidden", products.length > 0);
}

function renderInventory() {
  const search = ($("#inventorySearch")?.value || "").trim().toLowerCase();
  const filter = $("#inventoryFilter")?.value || "all";
  const filtered = products.filter(product => {
    const haystack = [product.name, product.model, product.brand, product.chip].join(" ").toLowerCase();
    if (search && !haystack.includes(search)) return false;
    if (filter === "published" && !isPublished(product)) return false;
    if (filter === "hidden" && isPublished(product)) return false;
    if (filter === "out" && Number(product.qty) > 0) return false;
    return true;
  }).sort((a, b) => updatedTime(b) - updatedTime(a));

  $("#inventoryCount").textContent = filtered.length + " of " + products.length + " listings";
  $("#productRows").innerHTML = filtered.map(product => `
    <tr>
      <td>${productNameCell(product)}</td>
      <td>${esc(product.ram || "—")} GB RAM · ${esc(product.storage || "—")} GB<br><small>${esc(product.chip || "Processor not set")} · ${esc(product.condition || "Condition not set")}</small></td>
      <td><strong>${Number(product.qty || 0).toLocaleString("en-IN")}</strong></td>
      <td><strong>${money(product.price)}</strong></td>
      <td>${productStatus(product)}</td>
      <td><div class="admin-row-actions">
        <button type="button" class="admin-mini-btn" data-edit="${esc(product.id)}">Edit</button>
        <button type="button" class="admin-mini-btn" data-toggle="${esc(product.id)}">${isPublished(product) ? "Hide" : "Publish"}</button>
        <button type="button" class="admin-mini-btn danger" data-delete="${esc(product.id)}">Delete</button>
      </div></td>
    </tr>
  `).join("");
  $("#inventoryEmpty").classList.toggle("admin-hidden", filtered.length > 0);
}

$("#inventorySearch").addEventListener("input", renderInventory);
$("#inventoryFilter").addEventListener("change", renderInventory);

$("#productRows").addEventListener("click", async event => {
  const button = event.target.closest("button[data-edit],button[data-toggle],button[data-delete]");
  if (!button) return;
  const id = button.dataset.edit || button.dataset.toggle || button.dataset.delete;
  const product = products.find(item => item.id === id);
  if (!product) return;

  if (button.dataset.edit) {
    openProductDialog(product);
    return;
  }

  if (button.dataset.toggle) {
    try {
      await updateDoc(doc(db, "products", id), { active: !isPublished(product), updatedAt: serverTimestamp() });
      await loadProducts();
      notify(isPublished({ active: !isPublished(product) }) ? "Listing published to the website." : "Listing hidden from the public shop.");
    } catch (error) {
      notify("Could not update listing: " + error.message, "error");
    }
    return;
  }

  if (button.dataset.delete && window.confirm("Delete “" + (product.name || "this laptop") + "” permanently? This cannot be undone.")) {
    try {
      await deleteDoc(doc(db, "products", id));
      await loadProducts();
      notify("Laptop removed from inventory and the public shop.");
    } catch (error) {
      notify("Could not delete listing: " + error.message, "error");
    }
  }
});

function setProductImagePreview(url = "") {
  const image = $("#productImagePreview");
  const empty = $("#productImagePreviewEmpty");
  if (url) {
    image.src = url;
    image.hidden = false;
    empty.hidden = true;
  } else {
    image.removeAttribute("src");
    image.hidden = true;
    empty.hidden = false;
  }
}

let retainedGalleryImages = [];
function renderAdminGallery() {
  const container = $("#productGalleryExisting"); container.innerHTML = "";
  retainedGalleryImages.forEach((url, index) => {
    const item = document.createElement("span"); item.className = "admin-gallery-thumb";
    const image = document.createElement("img"); image.src = url; image.alt = "Saved product photo";
    const button = document.createElement("button"); button.type = "button"; button.textContent = "Remove"; button.dataset.removeGallery = String(index);
    item.append(image, button); container.append(item);
  });
}
$("#productGalleryExisting").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-gallery]"); if (!button) return;
  retainedGalleryImages.splice(Number(button.dataset.removeGallery), 1); renderAdminGallery();
});
function openProductDialog(product = null) {
  const form = $("#productForm");
  form.reset();
  form.elements.namedItem("id").value = product?.id || "";
  form.elements.namedItem("imageUrl").value = product?.imageUrl || "";\n  retainedGalleryImages = Array.isArray(product?.galleryImages) ? [...product.galleryImages] : (product?.imageUrl ? [product.imageUrl] : []);\n  renderAdminGallery();
  form.elements.namedItem("active").checked = product ? isPublished(product) : true;
  $("#productDialogTitle").textContent = product ? "Edit laptop" : "Add a laptop";
  $("#productFormStatus").textContent = "";
  setProductImagePreview(product?.imageUrl || "");
  if (product) {
    for (const key of ["brand", "name", "model", "chip", "ram", "storage", "price", "qty", "condition", "warranty", "desc", "screen", "os", "batteryHealth", "cycleCount", "serialNumber", "repairs", "accessories", "returnPolicy"]) {
      const field = form.elements.namedItem(key);
      if (field) field.value = product[key] ?? "";
    }
    form.elements.namedItem("use").value = Array.isArray(product.use) ? product.use.join(", ") : (product.use || "");
  } else {
    form.elements.namedItem("use").value = "Students, Office, Programming";
  }
  $("#productDialog").showModal();
}

$("#productForm").elements.namedItem("imageFiles").addEventListener("change", event => {
  const files = [...(event.currentTarget.files || [])];\n  const file = files[0];
  if (!file) {
    setProductImagePreview($("#productForm").elements.namedItem("imageUrl").value);
    return;
  }
  if (!file.type.startsWith("image/")) {
    event.currentTarget.value = "";
    $("#productFormStatus").textContent = "Please select an image file.";
    return;
  }
  setProductImagePreview(URL.createObjectURL(file));
  $("#productFormStatus").textContent = file.name;
});
function closeProductDialog() {
  $("#productDialog").close();
}
$("#closeProductDialog").addEventListener("click", closeProductDialog);
$("#cancelProduct").addEventListener("click", closeProductDialog);
$("#productForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const id = String(data.get("id") || "laptop-" + crypto.randomUUID());
  const imageFiles = [...(form.elements.namedItem("imageFiles").files || [])];
  const product = {
    brand: String(data.get("brand") || "Other"),
    name: String(data.get("name") || "").trim(),
    model: String(data.get("model") || "").trim(),
    chip: String(data.get("chip") || "").trim(),
    ram: Number(data.get("ram")),
    storage: Number(data.get("storage")),
    price: Number(data.get("price")),
    qty: Number(data.get("qty")),
    warranty: String(data.get("warranty") || "Not specified").trim(),
    condition: String(data.get("condition") || "Refurbished"),
    imageUrl: String(data.get("imageUrl") || "").trim(),
    desc: String(data.get("desc") || "").trim(),
    active: form.elements.namedItem("active").checked,
    use: String(data.get("use") || "").split(",").map(value => value.trim()).filter(Boolean),
    updatedAt: serverTimestamp()
  };
  if (!product.name || !product.model || !product.chip || !Number.isFinite(product.price) || !Number.isFinite(product.qty)) {
    $("#productFormStatus").textContent = "Please complete the required product details.";
    return;
  }
  if (imageFiles.some(file => file.size > 8 * 1024 * 1024)) {
    $("#productFormStatus").textContent = "Image must be 8 MB or smaller.";
    return;
  }
  if (imageFiles.some(file => !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type))) {
    $("#productFormStatus").textContent = "Use a JPG, PNG, WEBP or AVIF image.";
    return;
  }
  try {
    if (imageFiles.length) {
      $("#productFormStatus").textContent = "Uploading product gallery…";
      for (const imageFile of imageFiles) {
        const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "product-image";
        const imageRef = storageRef(firebaseStorage, "product-images/" + id + "/" + Date.now() + "-" + safeFileName);
        const uploaded = await uploadBytes(imageRef, imageFile, { contentType: imageFile.type });
        product.galleryImages.push(await getDownloadURL(uploaded.ref));
      }
    }
    product.imageUrl = product.galleryImages[0] || product.imageUrl || "";
    $("#productFormStatus").textContent = "Saving to Firebase…";
    const payload = { ...product };
    if (!form.elements.namedItem("id").value) payload.createdAt = serverTimestamp();
    await setDoc(doc(db, "products", id), payload, { merge: true });
    closeProductDialog();
    await loadProducts();
    notify(product.active ? "Laptop saved and published to the public shop." : "Laptop saved as a hidden listing.");
  } catch (error) {
    $("#productFormStatus").textContent = "Save failed: " + error.message;
  }
});

async function loadSiteSettings() {
  try {
    const snapshot = await getDoc(doc(db, "siteSettings", "public"));
    siteSettings = { ...DEFAULT_SETTINGS, ...(snapshot.exists() ? snapshot.data() : {}) };
    populateSettingsForm();
  } catch (error) {
    console.error("Site settings load error:", error);
    $("#settingsStatus").textContent = "Could not load website settings: " + error.message;
  }
}

function populateSettingsForm() {
  const form = $("#siteSettingsForm");
  for (const [key, value] of Object.entries(siteSettings)) {
    const field = form.elements.namedItem(key);
    if (field) field.value = value ?? "";
  }
  $("#settingsStatus").textContent = "Your current business profile is loaded. Save changes to update the public website.";
}

function validOptionalUrl(value, label) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error();
    return url.href;
  } catch {
    throw new Error(label + " must be a valid HTTPS URL.");
  }
}

$("#siteSettingsForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const next = { ...DEFAULT_SETTINGS };

  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    next[key] = String(data.get(key) || "").trim();
  }

  try {
    for (const key of ["mapsUrl", "mapsEmbedUrl", "instagramUrl", "facebookUrl", "youtubeUrl", "linkedinUrl"]) {
      next[key] = validOptionalUrl(next[key], key);
    }
    if (next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
      throw new Error("Enter a valid business email address.");
    }
    if (next.whatsapp && next.whatsapp.replace(/\D/g, "").length < 10) {
      throw new Error("Enter a WhatsApp number with country code, for example 91 followed by the 10-digit mobile number.");
    }
    next.updatedAt = serverTimestamp();
    $("#settingsStatus").textContent = "Saving website details…";
    await setDoc(doc(db, "siteSettings", "public"), next, { merge: true });
    siteSettings = { ...next };
    $("#settingsStatus").textContent = "Saved. Contact and social details are now available to the public website.";
    notify("Business profile saved. Open or refresh the website to see the changes.");
  } catch (error) {
    $("#settingsStatus").textContent = error.message;
  }
});

setView("overview");
