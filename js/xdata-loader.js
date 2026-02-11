// data-loader.js

async function loadChannelData(channel) {
  if (channel === "aggro") {
    return convertToOldFormat(await loadAggroCSV());
  }
  if (channel === "casper") {
    return convertToOldFormat(await loadCasperCSV());
  }
}

// CSV → altes Format
function convertToOldFormat(videos) {
  return videos.map((v, index) => ({
    id: index + 1,
    title: v.title,
    views: v.viewCount,
    yearsAgo: calcYearsAgo(v.publishedAt),
    videoId: v.videoId
  }));
}

function calcYearsAgo(dateString) {
  const year = new Date(dateString).getFullYear();
  return new Date().getFullYear() - year;
}

// AGGRO CSV laden
async function loadAggroCSV() {
  const res = await fetch("aggro.json");
  return await res.json();
}

// Casper CSV laden
async function loadCasperCSV() {
  const res = await fetch("casper.json");
  return await res.json();
}
