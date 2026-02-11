// csv-parser.js
// Universeller CSV → Array Parser

function parseViews(value) {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return Number(cleaned);
}

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");

  const header = lines.shift().split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);

  const idx = (name) => header.indexOf(name);

  const posIdx      = idx("position");
  const chanIdIdx   = idx("channelId");
  const titleIdx    = idx("videoTitle");
  const idIdx       = idx("videoId");
  const viewsIdx    = idx("viewCount");
  const dateIdx     = idx("publishedAt");

  return lines.map(line => {
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);

    return {
      position: Number(cols[posIdx]),
      channelId: cols[chanIdIdx],
      videoId: cols[idIdx],
      title: cols[titleIdx],
      viewCount: parseViews(cols[viewsIdx]),
      publishedAt: cols[dateIdx]
    };
  });
}
