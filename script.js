/* =========================================================
   EDIT YOUR CONTENT HERE
   - `fields` is a list of [label, text] pairs. Add, remove, or
     reword them freely. Use "" as the label for a plain bullet.
   - `color` sets the pop-up card color.
   - `x`, `y` is the button position on the 1920x1080 layout.
   ========================================================= */

const TEAS = [
  {
    id: "white", name: "White Tea", color: "#e8dca8",
    x: 745, y: 395,
    fields: [
      ["Flavor", "delicate, light, slightly sweet with floral and fruity notes"],
      ["Benefits", "skin elasticity & anti-aging support"],
      ["How it's made", "young leaves and unopened buds with minimal processing"],
    ],
  },
  {
    id: "green", name: "Green Tea", color: "#8f9a55",
    x: 1145, y: 395,
    fields: [
      ["Flavor", "fresh, grassy flavor"],
      ["Benefits", "sustained focus & metabolic rate"],
      ["How it's made", "leaves steamed or pan-fired to stop oxidation (leaves antioxidants and nutrients)"],
    ],
  },
  {
    id: "oolong", name: "Oolong Tea", color: "#e0a63a",
    x: 1253, y: 687,
    fields: [
      ["Flavor", "varies! From floral and fruity to earthy and robust"],
      ["Benefits", "fat oxidation & blood sugar response"],
      ["How it's made", "partially oxidized, varies!"],
    ],
  },
  {
    id: "black", name: "Black Tea", color: "#b0553a",
    x: 788, y: 828,
    fields: [
      ["Flavor", "malty, robust"],
      ["Benefits", "heart health, vascular support & gut microbiome"],
      ["How it's made", "thorough oxidization and firing"],
    ],
  },
  {
    id: "puerh", name: "Pu-erh Tea", color: "#8a6246",
    x: 593, y: 601,
    fields: [
      ["Flavor", "deep, earthy"],
      ["Benefits", "post-meal digestion & cholesterol management"],
      ["How it's made", "fermented and oxidized"],
    ],
  },
];

// Cup and spoon
const EXTRAS = [
  {
    id: "history", name: "Brief History", color: "#d9b98a",
    x: 1710, y: 730,
    fields: [
      ["", "Legend says Emperor Shennong discovered tea around 2737 BCE, when leaves blew into his pot of boiling water."],
    ],
  },
  {
    id: "funfact", name: "Fun Fact", color: "#e6c86e",
    x: 1700, y: 450,
    fields: [
      ["", "White, green, oolong, black and pu-erh all come from the same plant, Camellia sinensis. Only the processing differs!"],
    ],
  },
];

// Benefits shown in the "Brew your tea" window. The recommended tea is the one
// that matches the most selected benefits (ties go to the first tea in TEAS).
const TAGS = {
  white:  ["Skin health", "Anti-aging"],
  green:  ["Focus", "Metabolism", "Antioxidants"],
  oolong: ["Metabolism", "Blood sugar"],
  black:  ["Heart health", "Gut health"],
  puerh:  ["Digestion", "Cholesterol"],
};

/* =========================================================
   CODE (no need to edit below to change content)
   ========================================================= */

const stage = document.getElementById("stage");
const hotspots = document.getElementById("hotspots");

let openCard = null;
let openButton = null;

// Buttons
[...TEAS, ...EXTRAS].forEach((item) => {
  const btn = document.createElement("button");
  btn.className = "hotspot";
  btn.setAttribute("aria-label", item.name);
  btn.style.left = `${(item.x / 1920) * 100}%`;
  btn.style.top = `${(item.y / 1080) * 100}%`;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (openButton === btn) return closeCard();
    showCard(item, btn);
  });
  hotspots.appendChild(btn);
});

function showCard(item, btn) {
  closeCard();
  markVisited(item.id);

  const card = document.createElement("div");
  card.className = "card";
  card.style.setProperty("--tea", item.color);
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-label", item.name);

  const items = item.fields
    .map(([label, text]) => `<li>${label ? `<b>${label}:</b> ` : ""}${text}</li>`)
    .join("");
  card.innerHTML = `
    <button class="close" aria-label="Close">&times;</button>
    <h2><span>${item.name}</span></h2>
    <ul>${items}</ul>`;
  card.addEventListener("click", (e) => e.stopPropagation());
  card.querySelector(".close").addEventListener("click", closeCard);
  document.body.appendChild(card);

  // Place next to the button, on whichever side has more room
  const b = btn.getBoundingClientRect();
  const cx = b.left + b.width / 2;
  const cy = b.top + b.height / 2;
  const gap = 22;
  const onRight = cx < window.innerWidth / 2;
  const left = onRight ? b.right + gap : b.left - gap - card.offsetWidth;
  const top = Math.max(12, Math.min(cy - 40, window.innerHeight - card.offsetHeight - 12));

  card.classList.add(onRight ? "on-right" : "on-left");
  card.style.left = `${left}px`;
  card.style.top = `${top}px`;
  card.style.setProperty("--arrow-y", `${cy - top - 9}px`);

  openCard = card;
  openButton = btn;
  card.querySelector(".close").focus();
}

function closeCard() {
  if (openCard) openCard.remove();
  if (openButton) openButton.focus({ preventScroll: true });
  openCard = openButton = null;
}

document.addEventListener("click", () => openCard && closeCard());
window.addEventListener("resize", () => openCard && closeCard());
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (overlay) closeOverlay();
  else if (openCard) closeCard();
});

/* ---------- Kettle ---------- */

const TOTAL = TEAS.length + EXTRAS.length;
const WATER_H = 113; // height of the water area in the kettle drawing
const visited = new Set();

const kettleWrap = document.getElementById("kettle");
const brewBtn = document.getElementById("brew-btn");
const countEl = document.getElementById("kettle-count");

const water = kettleWrap.querySelector(".water");

function updateKettle() {
  const level = visited.size / TOTAL;
  water.style.transform = `translateY(${(1 - level) * WATER_H}px)`;
  const full = visited.size >= TOTAL;
  kettleWrap.classList.toggle("full", full);
  brewBtn.hidden = !full;
  countEl.textContent = full ? "" : `${visited.size} / ${TOTAL} explored`;
}

// Each of the 7 pop-ups raises the water once (the first time it is opened)
function markVisited(id) {
  if (visited.has(id)) return;
  visited.add(id);
  updateKettle();
}
updateKettle();

/* ---------- Brew window + recommendation ---------- */

let overlay = null;

function closeOverlay() {
  if (overlay) overlay.remove();
  overlay = null;
}

function openOverlay(html, className) {
  closeOverlay();
  closeCard();
  overlay = document.createElement("div");
  overlay.className = "backdrop";
  overlay.innerHTML = `<div class="${className}" role="dialog" aria-modal="true">
    <button class="close" aria-label="Close">&times;</button>${html}</div>`;
  overlay.addEventListener("click", (e) => e.target === overlay && closeOverlay());
  overlay.querySelector(".close").addEventListener("click", closeOverlay);
  document.body.appendChild(overlay);
  return overlay;
}

brewBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  openBrewWindow();
});

function openBrewWindow() {
  const selected = new Set();
  const allTags = [...new Set(TEAS.flatMap((t) => TAGS[t.id] || []))];

  const o = openOverlay(`
    <h2><span>What do you want from your tea?</span></h2>
    <p class="hint">Pick the benefits you're after.</p>
    <div class="pills">
      ${allTags.map((t) => `<button class="pill" aria-pressed="false">${t}</button>`).join("")}
    </div>
    <button class="big-kettle" disabled aria-label="Brew">
      <span class="kettle-pic"></span>
      <span class="label">Select a benefit, then click the kettle</span>
    </button>`, "brew-window");

  const kettleBtn = o.querySelector(".big-kettle");

  o.querySelectorAll(".pills .pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const tag = pill.textContent;
      selected.has(tag) ? selected.delete(tag) : selected.add(tag);
      pill.setAttribute("aria-pressed", selected.has(tag));
      kettleBtn.disabled = selected.size === 0;
      kettleBtn.querySelector(".label").textContent =
        selected.size ? "Click the kettle to brew!" : "Select a benefit, then click the kettle";
    });
  });

  kettleBtn.addEventListener("click", () => showRecommendation(selected));
}

function showRecommendation(selected) {
  let best = null, bestMatches = [];
  TEAS.forEach((tea) => {
    const matches = (TAGS[tea.id] || []).filter((t) => selected.has(t));
    if (matches.length > bestMatches.length) { best = tea; bestMatches = matches; }
  });
  if (!best) best = TEAS[0];

  openOverlay(`
    ${cupSVG(best.color)}
    <p class="hint">Your recommended tea</p>
    <h2><span>${best.name}</span></h2>
    <p class="matches">Matches: ${bestMatches.join(", ") || "&mdash;"}</p>
    <ul>${best.fields.map(([l, t]) => `<li>${l ? `<b>${l}:</b> ` : ""}${t}</li>`).join("")}</ul>`,
    "result").style.setProperty("--tea", best.color);
}

function cupSVG(color) {
  return `
  <svg class="cup" viewBox="0 -30 200 190" aria-hidden="true">
    <g class="steam" style="opacity:1">
      <path d="M80 10 q-10 -12 0 -24 q10 -12 0 -24"/>
      <path d="M100 6 q-10 -12 0 -24 q10 -12 0 -24"/>
      <path d="M120 10 q-10 -12 0 -24 q10 -12 0 -24"/>
    </g>
    <ellipse cx="100" cy="140" rx="85" ry="16" fill="#d6e3ec" stroke="#9bb7c4" stroke-width="3"/>
    <path d="M150 62 Q186 62 180 92 Q174 118 140 116" fill="none" stroke="#9bb7c4" stroke-width="8" stroke-linecap="round"/>
    <path d="M45 40 H155 Q155 125 100 130 Q45 125 45 40 Z" fill="#f4f8fb" stroke="#9bb7c4" stroke-width="3"/>
    <ellipse cx="100" cy="40" rx="55" ry="10" fill="${color}" stroke="#9bb7c4" stroke-width="3"/>
  </svg>`;
}
