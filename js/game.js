// game.js

let shuffledTracks = [];
let gameStarted = false;

// DOM-Refs
const usernameInput     = document.getElementById("username");
const startButton       = document.getElementById("startGame");
const avatarImg         = document.getElementById("avatar");
const poolContainer     = document.getElementById("poolContainer");
const rankingContainer  = document.getElementById("rankingContainer");
const submitButton      = document.getElementById("submitSelection");
const resultDiv         = document.getElementById("result");

// ---------- Utils ----------

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateGameTracks() {
  if (!tracks.length) {
    console.error("Tracks ist leer!");
    return [];
  }

  const top10 = tracks.slice(0, 10);
  const others = tracks.slice(10);
  const random10 = shuffle(others).slice(0, 10);

  return shuffle([...top10, ...random10]);
}

async function loadTwitchAvatar(username) {
  try {
    const res = await fetch(`/twitch-avatar/${encodeURIComponent(username)}`);
    const data = await res.json();
    avatarImg.src = data.avatarUrl;
  } catch (e) {
    console.error("Avatar-Fehler:", e);
  }
}

function createTrackCard(track) {
  const card = document.createElement("div");
  card.className = "track-card";
  card.draggable = true;
  card.dataset.id = track.id;

  const thumb = document.createElement("div");
  thumb.classList.add("thumbnail");
  thumb.style.backgroundImage =
    `url(https://img.youtube.com/vi/${track.videoId}/maxresdefault.jpg)`;

  const info = document.createElement("div");
  info.className = "track-info";

  const title = document.createElement("div");
  title.className = "track-title";
  title.textContent = track.title;

  const meta = document.createElement("div");
  meta.className = "track-meta";
  meta.textContent = `${track.views} views · ${track.yearsAgo} years ago`;

  info.appendChild(title);
  info.appendChild(meta);

  card.appendChild(thumb);
  card.appendChild(info);

  card.addEventListener("dragstart", (e) => {
    card.classList.add("dragging");
    e.dataTransfer.setData("text/plain", track.id);
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });

  return card;
}

function renderPool() {
  poolContainer.innerHTML = "";
  shuffledTracks.forEach((track, i) => {
    const card = createTrackCard(track);
    card.style.animationDelay = `${i * 0.05}s`;
    poolContainer.appendChild(card);
  });
}

function renderRankingSlots() {
  rankingContainer.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.position = i;

    const label = document.createElement("span");
    label.className = "slot-label";
    label.textContent = i;

    slot.appendChild(label);

    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      slot.classList.add("drag-over");
    });

    slot.addEventListener("dragleave", () => {
      slot.classList.remove("drag-over");
    });

    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("drag-over");

      const id = e.dataTransfer.getData("text/plain");
      const card = document.querySelector(`.track-card[data-id="${id}"]`);
      if (!card) return;

      const old = slot.querySelector(".track-card");
      if (old) poolContainer.appendChild(old);

      slot.appendChild(card);
      checkSubmitEnabled();
    });

    rankingContainer.appendChild(slot);
  }
}

function checkSubmitEnabled() {
  const filled = [...rankingContainer.querySelectorAll(".slot")]
    .filter(s => s.querySelector(".track-card")).length;

  submitButton.disabled = filled < 10;
}

function evaluateSelection() {
  const slots = rankingContainer.querySelectorAll(".slot");
  let correctCount = 0;

  slots.forEach(slot => {
    const position = Number(slot.dataset.position);
    const card = slot.querySelector(".track-card");
    if (!card) return;

    const id = Number(card.dataset.id);

    if (id === position) {
      card.classList.add("correct");
      correctCount++;
    } else {
      card.classList.add("wrong");
    }
  });

  const points = correctCount * 10;
  document.body.classList.add("show-views");
  showResultPopup(points, correctCount);
}

function showResultPopup(points, correctCount) {
  const popup = document.getElementById("resultPopup");
  const msg = document.getElementById("popupMessage");

  let text = "";
  if (correctCount === 10) text = "Unglaublich! Du hast ALLE Top 10 perfekt erkannt!";
  else if (correctCount >= 7) text = "Sehr stark!";
  else if (correctCount >= 4) text = "Solide Leistung.";
  else text = "Das war wohl nicht dein Tag…";

  msg.textContent = `${text} (${points} Punkte)`;
  popup.classList.remove("hidden");
}

// ---------- Events ----------

document.getElementById("popupClose").addEventListener("click", () => {
  document.getElementById("resultPopup").classList.add("hidden");
});

document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

startButton.addEventListener("click", async () => {
  if (!selectedChannel) {
    return alert("Bitte zuerst einen Kanal auswählen.");
  }

  const username = usernameInput.value.trim();
  if (!username) return alert("Bitte Twitch-Username eingeben.");

  gameStarted = true;
  resultDiv.textContent = "";
  submitButton.disabled = true;

  await loadTwitchAvatar(username);

  shuffledTracks = generateGameTracks();
  if (!shuffledTracks.length) {
    alert("Keine Tracks geladen – prüfe die CSV-Datei.");
    return;
  }

  renderPool();
  renderRankingSlots();
});

submitButton.addEventListener("click", () => {
  if (gameStarted) evaluateSelection();
});
	
	document.getElementById("backToStart").addEventListener("click", () => {
  // Spiel zurücksetzen
  poolContainer.innerHTML = "";
  rankingContainer.innerHTML = "";
  avatarImg.src = "";
  usernameInput.value = "";
  submitButton.disabled = true;
  gameStarted = false;

  // UI zurückschalten
  document.getElementById("gameRoot").classList.add("hidden");
  document.getElementById("startScreen").classList.remove("hidden");
});
