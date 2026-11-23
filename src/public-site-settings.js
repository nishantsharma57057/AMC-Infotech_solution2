import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig, configured } from "./firebase-config.js";

const DEFAULTS = {
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
  openingHours: "Area shown. Confirm the exact shop pin and opening hours before visiting.",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=AMC+Infotech+Solution+Sanjay+Place+Agra",
  mapsEmbedUrl: "https://www.google.com/maps?q=Sanjay%20Place%2C%20Agra&z=15&output=embed",
  instagramUrl: "https://www.instagram.com/macbookhub_/",
  instagramHandle: "@macbookhub_",
  facebookUrl: "",
  youtubeUrl: "",
  linkedinUrl: ""
};

const $ = selector => document.querySelector(selector);
const safeHttps = value => {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
};
const phoneDigits = value => String(value || "").replace(/[^0-9]/g, "");
const text = (selector, value) => {
  const element = $(selector);
  if (element && value !== undefined && value !== null) element.textContent = value;
};

function setLinks(settings) {
  const phone = String(settings.phone || "").trim();
  const whatsapp = phoneDigits(settings.whatsapp || settings.phone);
  const email = String(settings.email || "").trim();
  const linkValues = {
    phone: phone ? "tel:" + phone.replace(/[^0-9+]/g, "") : "",
    whatsapp: whatsapp.length >= 10
      ? "https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(settings.whatsappMessage || DEFAULTS.whatsappMessage)
      : "",
    email: email ? "mailto:" + email : "",
    maps: safeHttps(settings.mapsUrl),
    instagram: safeHttps(settings.instagramUrl),
    facebook: safeHttps(settings.facebookUrl),
    youtube: safeHttps(settings.youtubeUrl),
    linkedin: safeHttps(settings.linkedinUrl)
  };

  document.querySelectorAll("[data-site-link]").forEach(element => {
    const key = element.dataset.siteLink;
    const href = linkValues[key] || "";
    if (href) {
      element.href = href;
      element.hidden = false;
    } else {
      element.removeAttribute("href");
      element.hidden = true;
    }
  });

  const contactLinks = document.querySelectorAll("#siteContactActions [data-site-link]");
  const hasContact = [...contactLinks].some(element => !element.hidden);
  const contactGroup = $("#siteContactActions");
  if (contactGroup) contactGroup.hidden = !hasContact;

  const socialLinks = document.querySelectorAll("#siteSocialLinks [data-site-link]");
  const hasSocial = [...socialLinks].some(element => !element.hidden);
  const socialGroup = $("#siteSocialLinks");
  if (socialGroup) socialGroup.hidden = !hasSocial;

  const footerContacts = document.querySelectorAll(".footer-contact [data-site-link]");
  const footerGroup = $(".footer-contact");
  if (footerGroup) footerGroup.hidden = ![...footerContacts].some(element => !element.hidden);
}

function applySettings(raw = {}) {
  const settings = { ...DEFAULTS, ...raw };
  const businessName = String(settings.businessName || DEFAULTS.businessName).trim();
  const city = String(settings.city || "").trim();
  const state = String(settings.state || "").trim();
  const address = String(settings.address || "").trim();
  const pincode = String(settings.pincode || "").trim();
  const fullAddress = [address, city, state, pincode].filter(Boolean).join(", ");
  const locationCaption = [city, state].filter(Boolean).join(" · ") || "Visit AMC Infotech";
  const locationLabel = [city, state].filter(Boolean).join(", ") + " →";

  text('[data-site-text="announcement"]', settings.announcement || DEFAULTS.announcement);
  text('[data-site-text="businessName"]', businessName);
  text('[data-site-text="tagline"]', settings.tagline || DEFAULTS.tagline);
  text('[data-site-text="fullAddress"]', fullAddress);
  text('[data-site-text="openingHours"]', settings.openingHours || "Please contact the store to confirm opening hours.");
  text('[data-site-text="locationCaption"]', locationCaption);
  text('[data-site-text="footerLocation"]', "Made for a smarter second beginning. · " + locationCaption);
  text('[data-site-text="instagramHandle"]', settings.instagramHandle || "@instagram");

  const locationLink = $('[data-site-link-label="location"]');
  if (locationLink) locationLink.textContent = locationLabel || "Visit our store →";

  const topMap = safeHttps(settings.mapsUrl);
  const mapEmbed = safeHttps(settings.mapsEmbedUrl);
  const mapFrame = $("#siteMapEmbed");
  if (mapFrame && mapEmbed) mapFrame.src = mapEmbed;
  const mapCard = $(".map-card");
  if (mapCard) mapCard.hidden = !mapEmbed;

  setLinks(settings);

  const instagramUrl = safeHttps(settings.instagramUrl);
  const instagramSection = $("#instagram");
  if (instagramSection) instagramSection.hidden = !instagramUrl;
  const instagramFrame = $("#instagramEmbed");
  const handle = String(settings.instagramHandle || "").replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, "");
  if (instagramFrame && instagramUrl && handle) {
    instagramFrame.src = "https://www.instagram.com/" + encodeURIComponent(handle) + "/embed/";
    instagramFrame.title = "Instagram posts from " + (settings.instagramHandle || businessName);
  }

  document.title = businessName + " | Buy & Sell Laptops in " + (city || "India");
}

async function init() {
  if (!configured) return;
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const snapshot = await getDoc(doc(db, "siteSettings", "public"));
    applySettings(snapshot.exists() ? snapshot.data() : DEFAULTS);
  } catch (error) {
    console.warn("AMC website profile could not be loaded; showing the built-in store details.", error);
    applySettings(DEFAULTS);
  }
}

applySettings(DEFAULTS);
init();
