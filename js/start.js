let tracks = [];
let selectedChannel = null;

/* ============================================
   CHANNELS DYNAMISCH LADEN
============================================ */
async function loadChannels() {
  try {
    const res = await fetch("/api/channels");
    let channels = await res.json();

    // Alphabetisch sortieren
    channels.sort((a, b) => a.localeCompare(b));

    const container = document.getElementById("channelSelect");
    const searchInput = document.getElementById("channelSearch");

    function render(filtered) {
      container.innerHTML = "";

      filtered.forEach(name => {
        const btn = document.createElement("button");
        btn.className = "channel-btn";
        btn.dataset.channel = name;

        const img = document.createElement("img");
        img.className = "channel-avatar";
        img.src = `/avatars/${name}.png`;
        img.onerror = () => img.src = "/avatars/default.png";

        btn.appendChild(img);
        btn.appendChild(document.createTextNode(name));

        btn.addEventListener("click", () => selectChannel(name));

        container.appendChild(btn);
      });
    }

    // Initial render
    render(channels);

    // Live-Suche
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase();
      const filtered = channels.filter(c => c.toLowerCase().includes(term));
      render(filtered);
    });

  } catch (err) {
    console.error("Fehler beim Laden der Channels:", err);
  }
}


/* ============================================
   CHANNEL AUSWÄHLEN → CSV LADEN
============================================ */
async function selectChannel(name) {
  console.log("Channel gewählt:", name);

  try {
    selectedChannel = name;

    const csvText = await fetch(`/channels/${name}.csv`).then(r => r.text());
    const rawVideos = parseCSV(csvText);

    tracks = rawVideos
      .sort((a, b) => b.viewCount - a.viewCount)
      .map((v, index) => ({
        id: index + 1,
        title: v.title,
        views: v.viewCount,
        yearsAgo: calcYearsAgo(v.publishedAt),
        videoId: v.videoId
      }));

    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("gameRoot").classList.remove("hidden");

  } catch (err) {
    console.error("Fehler beim Laden/Parsen der CSV:", err);
    alert("Fehler beim Laden der Kanal-Daten.");
  }
}

/* ============================================
   HILFSFUNKTION
============================================ */
function calcYearsAgo(dateString) {
  const year = new Date(dateString).getFullYear();
  return new Date().getFullYear() - year;
}

/* ============================================
   BACK BUTTON
============================================ */
function initBackButton() {
  const backBtn = document.getElementById("backToStart");
  if (!backBtn) return;

  backBtn.addEventListener("click", () => {
    document.getElementById("gameRoot").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
  });
}

/* ============================================
   THEME SWITCH + PERSISTENZ
============================================ */
function loadTheme() {
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
  }
}

function initThemeToggle() {
  const toggleBtn = document.getElementById("toggleTheme");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
      localStorage.setItem("theme", "light");
    } else {
      localStorage.setItem("theme", "dark");
    }
  });
}

/* ============================================
   INITIALISIERUNG
============================================ */
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM geladen – Initialisierung startet");

  loadChannels();      // 🔥 Dynamische Channels laden
  initBackButton();
  loadTheme();
  initThemeToggle();

  console.log("Initialisierung abgeschlossen");
});
