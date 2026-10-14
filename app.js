"use strict";
const APP_VERSION = "1.0.0";

/* ================= Content ================= */
const PHASES = [
  { id: "p4", name: "3–4 weeks out", items: [
    ["mail", "Set up a mailing address", "A UPS Store or private mailbox gives you a street address for banks, DMV and jobs. A USPS PO box works for most other mail."],
    ["gym", "Get a gym membership for showers", "A low-cost chain with many locations covers showers, restrooms and a warm place in the morning."],
    ["service", "Get the car serviced", "Oil, battery, tires, brakes. The car is now your house, so a breakdown costs more than a repair."],
    ["ins", "Call your auto insurer", "Confirm your coverage and update your address. Ask what happens if you're living in the vehicle."],
    ["stuff", "Sort your things: keep, store, sell", "Keep about two bins of clothes. Selling furniture can fund your first month."]]},
  { id: "p2", name: "1–2 weeks out", items: [
    ["covers", "Make window covers", "Cut black foam board or reflective insulation to fit each window. Privacy and temperature both improve."],
    ["bed", "Set up a sleeping layout", "Fold the seats flat or build a simple platform. Test it for a full night before you move."],
    ["vent", "Buy window rain guards", "They let you crack the windows for air without rain getting in or the gap looking obvious."],
    ["co", "Buy a battery CO detector", "Essential if you ever use any heater. Never run the engine to stay warm in a closed or snow-blocked space.", 1],
    ["power", "Get a portable power bank", "One you can charge while driving keeps your phone alive overnight."],
    ["docs", "Gather documents in one folder", "ID, birth certificate, title, registration, insurance card. Keep it hidden and always in the car.", 1]]},
  { id: "p0", name: "Move-out week", items: [
    ["211", "Call 211 about safe parking", "Ask about safe parking lots, shower programs and rehousing help in your area."],
    ["spots", "Scout three overnight spots", "Visit in daylight and at night. Note restrooms, lighting, and who else parks there."],
    ["contact", "Pick a check-in person", "Someone who knows roughly where you park each night and who you text each morning.", 1],
    ["water", "Stock water and food", "At least two gallons of water, and food that needs no cooking."],
    ["toilet", "Set up a backup toilet", "A wide-mouth bottle or bucket with a lid for nights when nothing is open."]]},
  { id: "pa", name: "First month", items: [
    ["routine", "Build a daily routine", "Same gym, same library, same lunch spot. Routine makes this more manageable."],
    ["budget", "Check your budget against real spending", "Use the Budget tab. Gas and eating out often run higher than expected."],
    ["goal", "Set a savings goal for your next place", "Deposit plus first month's rent is a common target."]]},
];
const ALL = PHASES.flatMap((p) => p.items);

const NIGHT = [
  "Tell your check-in person where you're parked",
  "Phone and power bank charged",
  "Window covers up",
  "Two windows cracked about an inch",
  "Doors locked, keys in the same spot every night",
  "CO detector on, engine off",
  "Water and toilet within reach",
  "Parked facing out so you can leave fast",
];

const SPOT_TIPS = [
  ["", "Ask your city or county about a <b>safe parking program</b>. Many run lots with security and restrooms for people sleeping in vehicles."],
  ["", "Store lots, gyms and 24-hour businesses each set their own rules. Ask the manager before you stay, and rotate spots."],
  ["", "Arrive after dark, leave early, and keep the car looking like a parked car: covers up, lights off, nothing on the dash."],
  ["warn", "Local overnight-parking laws vary a lot. Check your city's rules, and leave calmly if police or staff ask you to move."],
];

const HOTLINES = [
  { show: "211", dial: "211", sms: true, desc: "Local housing help, shelters, safe parking, food, showers. Call or text." },
  { show: "988", dial: "988", sms: true, desc: "Suicide & Crisis Lifeline. Call or text, any time." },
  { show: "1-800-799-7233", dial: "18007997233", sms: false, desc: "National Domestic Violence Hotline." },
  { show: "911", dial: "911", sms: false, desc: "Emergencies, or if you feel unsafe where you're parked." },
];

const NOWL = { rent: "Rent or mortgage", util: "Utilities", ins: "Renters insurance", internet: "Home internet" };
const CARL = { gym: "Gym (showers)", mailbox: "Mailbox", storage: "Storage unit", phone: "Phone + hotspot", gas: "Gas (more driving)", food: "Food (less cooking)", laundry: "Laundromat", parking: "Paid parking" };

function tailored(S) {
  const t = [];
  if (S.climate === "cold") t.push(["warn", "Cold nights: a 0°F-rated sleeping bag and wool layers do more than any heater. Never sleep with the engine running."]);
  if (S.climate === "hot") t.push(["warn", "Hot weather: a car can pass 120°F in an hour. Park in shade, use window covers on the sun side, and plan cool daytime places."]);
  if (S.climate === "mild") t.push(["", "Mild weather: condensation is the main issue. Crack two windows on opposite sides and wipe down glass each morning."]);
  if (S.who.includes("pet")) t.push(["warn", "Your pet can never be left in the car in warm weather, even with windows cracked. Line up pet-friendly daytime spots."]);
  if (S.who.includes("kids")) t.push(["", "With kids: ask 211 about family shelters and school support. Schools must help students without stable housing stay enrolled under the McKinney-Vento Act."]);
  if (S.who.includes("partner")) t.push(["", "With a partner: split the car into two personal zones and agree on a nightly routine so you're not negotiating at 11pm."]);
  const v = {
    sedan: "Sedan: check if your rear seats fold into the trunk. Many people sleep diagonally with feet in the trunk.",
    suv: "SUV: fold the rear seats flat and measure. A trifold foam mattress usually fits without a platform.",
    van: "Van: you have room for a fixed bed and storage drawers. Keep the build simple until you've lived in it a few weeks.",
    truck: "Pickup: a locking cap on the bed turns it into a sleeping space. Secure everything in the cab overnight.",
  };
  if (v[S.vehicle]) t.push(["", v[S.vehicle]]);
  return t;
}

/* ================= State (on-device only) ================= */
const KEY = "glovebox.v1";
const pad = (n) => String(n).padStart(2, "0");
const localISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => localISO(new Date());

function defaults() {
  const d = new Date(); d.setDate(d.getDate() + 21);
  return {
    moveDate: localISO(d), vehicle: "suv", who: [], climate: "cold",
    done: {}, night: {}, nightDay: today(), installDismissed: false,
    // Example figures so the budget opens in a working state.
    now: { rent: 1450, util: 140, ins: 15, internet: 60 },
    car: { gym: 30, mailbox: 25, storage: 90, phone: 45, gas: 220, food: 420, laundry: 30, parking: 0 },
  };
}
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === "object") {
      const d = defaults();
      return { ...d, ...saved, now: { ...d.now, ...saved.now }, car: { ...d.car, ...saved.car } };
    }
  } catch (e) {}
  return defaults();
}
let S = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
function rollNight() { if (S.nightDay !== today()) { S.night = {}; S.nightDay = today(); save(); } }
rollNight();

// Ask the browser not to evict our data under storage pressure.
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* ================= Helpers ================= */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");
let toastTimer;
function toast(m) {
  const t = $("#toast"); t.textContent = m; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2000);
}

/* ================= Render ================= */
function daysLeft() {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(S.moveDate || "");
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  const n = new Date(); n.setHours(0, 0, 0, 0);
  return Math.round((d - n) / 864e5);
}

function itemHTML([k, t, w, f], prefix) {
  const on = !!S.done[k];
  return `<label class="item${on ? " checked" : ""}" for="${prefix}-${k}">
    <input type="checkbox" id="${prefix}-${k}" data-k="${k}" ${on ? "checked" : ""}>
    <div><strong>${esc(t)}${f ? '<span class="flag">safety</span>' : ""}</strong><span class="why">${esc(w)}</span></div></label>`;
}

function renderPlan() {
  $("#moveDate").value = S.moveDate || "";
  $$(".chips").forEach((g) => {
    const k = g.dataset.key;
    g.querySelectorAll(".chip").forEach((c) => {
      const on = g.dataset.multi ? S[k].includes(c.dataset.val) : S[k] === c.dataset.val;
      c.setAttribute("aria-pressed", on);
    });
  });
  const dl = daysLeft();
  $("#days").textContent = dl === null ? "—" : Math.abs(dl);
  $("#daysLbl").textContent = dl === null ? "pick a date" : dl > 0 ? (dl === 1 ? "day until move-out" : "days until move-out") : dl === 0 ? "move-out is today" : "days since move-out";
  const n = ALL.filter((i) => S.done[i[0]]).length;
  $("#overallBar").style.width = (n / ALL.length) * 100 + "%";
  $("#overallTxt").textContent = `${n} of ${ALL.length} checklist items done`;
  const next = ALL.filter((i) => !S.done[i[0]]).slice(0, 3);
  $("#nextUp").innerHTML = next.length ? next.map((i) => itemHTML(i, "n")).join("") : '<p class="muted">Every item is done. Check your nightly routine.</p>';
  $("#tailoredTips").innerHTML = tailored(S).map(([c, t]) => `<div class="tip ${c}">${esc(t)}</div>`).join("");
}

function renderCheck() {
  $("#phases").innerHTML = PHASES.map((p) => {
    const d = p.items.filter((i) => S.done[i[0]]).length, all = d === p.items.length;
    return `<div class="card phase"><div class="phase-head"><h2>${p.name}</h2><span class="tag${all ? " done" : ""}">${d}/${p.items.length}</span></div>
      <div>${p.items.map((i) => itemHTML(i, "c")).join("")}</div></div>`;
  }).join("");
}

function costRows(el, obj, labels, grp) {
  el.innerHTML = Object.keys(labels).map((k) => `<label class="row" for="b-${grp}-${k}"><span>${labels[k]}</span>
    <input type="number" inputmode="numeric" pattern="[0-9]*" min="0" id="b-${grp}-${k}" data-g="${grp}" data-k="${k}" value="${obj[k]}"></label>`).join("");
}
function totals() {
  const a = Object.values(S.now).reduce((x, y) => x + (+y || 0), 0);
  const b = Object.values(S.car).reduce((x, y) => x + (+y || 0), 0);
  $("#tNow").textContent = fmt(a); $("#tCar").textContent = fmt(b);
  const diff = a - b, v = $("#verdict");
  v.className = "verdict " + (diff > 0 ? "good" : "bad");
  v.textContent = diff > 0 ? `You'd keep about ${fmt(diff)} a month.` : `Car life costs ${fmt(-diff)} more a month at these numbers.`;
  const goal = (+S.now.rent || 0) * 2, m = diff > 0 ? Math.ceil(goal / diff) : 0;
  $("#saveGoal").textContent = diff > 0 && goal ? `At that rate, a ${fmt(goal)} move-in fund (deposit + first month) takes about ${m} month${m > 1 ? "s" : ""}.` : "";
}
function renderBudget() { costRows($("#bNow"), S.now, NOWL, "now"); costRows($("#bCar"), S.car, CARL, "car"); totals(); }

function renderNight() {
  rollNight();
  $("#nightDate").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) + ". Resets each day.";
  $("#nightList").innerHTML = NIGHT.map((t, i) => `<label class="item${S.night[i] ? " checked" : ""}" for="nt-${i}">
    <input type="checkbox" id="nt-${i}" data-n="${i}" ${S.night[i] ? "checked" : ""}><div><strong>${esc(t)}</strong></div></label>`).join("");
  $("#nightBar").style.width = (Object.values(S.night).filter(Boolean).length / NIGHT.length) * 100 + "%";
  $("#spotTips").innerHTML = SPOT_TIPS.map(([c, t]) => `<div class="tip ${c}">${t}</div>`).join("");
}

function renderHelp() {
  $("#hotlines").innerHTML = HOTLINES.map((h) => `<div class="line">
    <div class="num">${h.show}</div><p class="small muted">${h.desc}</p>
    <div class="line-actions">
      <a class="pill primary" href="tel:${h.dial}">Call</a>
      ${h.sms ? `<a class="pill" href="sms:${h.dial}">Text</a>` : ""}
      <button class="pill" data-copy="${h.show}">Copy</button>
    </div></div>`).join("");
  $("#versionTxt").textContent = `Glovebox ${APP_VERSION}${isStandalone() ? " · installed" : ""}`;
}

/* ================= Navigation ================= */
const VIEWS = ["plan", "check", "budget", "night", "help"];
function go(v, push = true) {
  if (!VIEWS.includes(v)) v = "plan";
  $$(".view").forEach((s) => (s.hidden = s.id !== "v-" + v));
  $$("nav.tabs button").forEach((b) => (b.dataset.go === v ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
  ({ plan: renderPlan, check: renderCheck, budget: renderBudget, night: renderNight, help: renderHelp })[v]();
  if (push) history.replaceState(null, "", "#" + v);
  window.scrollTo(0, 0);
}

/* ================= Events ================= */
document.addEventListener("click", (e) => {
  const g = e.target.closest("[data-go]");
  if (g) { go(g.dataset.go); return; }
  const c = e.target.closest(".chip");
  if (c) {
    const grp = c.parentElement, k = grp.dataset.key, v = c.dataset.val;
    if (grp.dataset.multi) S[k] = S[k].includes(v) ? S[k].filter((x) => x !== v) : [...S[k], v];
    else S[k] = v;
    save(); renderPlan(); return;
  }
  const cp = e.target.closest("[data-copy]");
  if (cp) {
    const t = cp.dataset.copy;
    const ok = () => toast("Copied " + t), fail = () => toast("Press and hold the number to copy it");
    try { navigator.clipboard.writeText(t).then(ok, fail); } catch (x) { fail(); }
  }
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.k && t.type === "checkbox") {
    S.done[t.dataset.k] = t.checked; save();
    if (!$("#v-plan").hidden) renderPlan(); else renderCheck();
  }
  if (t.dataset.n !== undefined) { rollNight(); S.night[t.dataset.n] = t.checked; save(); renderNight(); }
  if (t.id === "moveDate") { S.moveDate = t.value; save(); renderPlan(); }
});
document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset.g) { S[t.dataset.g][t.dataset.k] = +t.value || 0; save(); totals(); }
});
$("#nightReset").onclick = () => { S.night = {}; S.nightDay = today(); save(); renderNight(); };
$("#wipe").onclick = () => { $("#wipeConfirm").hidden = false; $("#wipe").hidden = true; };
$("#wipeNo").onclick = () => { $("#wipeConfirm").hidden = true; $("#wipe").hidden = false; };
$("#wipeYes").onclick = () => {
  S = defaults(); save();
  $("#wipeConfirm").hidden = true; $("#wipe").hidden = false;
  toast("Your data is cleared"); go("plan");
};
window.addEventListener("hashchange", () => go(location.hash.slice(1), false));
// Coming back to the app after midnight should show a fresh routine and countdown.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") { const v = location.hash.slice(1) || "plan"; go(v, false); }
});

/* ================= Install prompt ================= */
function isStandalone() { return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; }
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
let deferredPrompt = null;

function showInstall(mode) {
  if (isStandalone() || S.installDismissed) return;
  $("#installCard").hidden = false;
  if (mode === "ios") {
    $("#installBtn").hidden = true;
    $("#installTxt").innerHTML = 'Tap <svg class="ios-share" viewBox="0 0 24 24" aria-label="Share"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg> Share, then <b>Add to Home Screen</b>. It works with no signal once installed.';
  } else {
    $("#installBtn").hidden = false;
  }
}
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredPrompt = e; showInstall("prompt"); });
window.addEventListener("appinstalled", () => { $("#installCard").hidden = true; deferredPrompt = null; toast("Glovebox is on your home screen"); });
$("#installBtn").onclick = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  if (outcome === "accepted") $("#installCard").hidden = true;
};
$("#installDismiss").onclick = () => { S.installDismissed = true; save(); $("#installCard").hidden = true; };
if (isIOS) showInstall("ios");

/* ================= Service worker (offline + updates) ================= */
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      const offer = (w) => {
        $("#updateBar").hidden = false;
        $("#updateBtn").onclick = () => w.postMessage("skipWaiting");
      };
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const w = reg.installing;
        w && w.addEventListener("statechange", () => {
          if (w.state === "installed" && navigator.serviceWorker.controller) offer(w);
        });
      });
      // Check for a new version whenever the app comes back to the foreground.
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
    }).catch(() => {});
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (!reloading) { reloading = true; location.reload(); } });
  });
}

/* ================= Boot ================= */
go(location.hash.slice(1) || "plan", false);
