const express = require("express");
const router = express.Router();

// Dynamic Sitemap Route
router.get("/sitemap.xml", (req, res) => {
  // Set the correct content type for XML
  res.header("Content-Type", "application/xml");

  // Define your domain and the pages you want Google to index
  const baseUrl = "https://ntm-utm-converter.vercel.app";

  // If you have multiple pages/routes, list them here with their priorities
  const urls = [
    { loc: `${baseUrl}/`, changefreq: "weekly", priority: "1.0" },
    // Add other routes here if you build them later, e.g.:
    // { loc: `${baseUrl}/about`, changefreq: "monthly", priority: "0.8" }
  ];

  // Construct the XML string
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  urls.forEach((url) => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${url.loc}</loc>\n`;
    sitemap += `    <changefreq>${url.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${url.priority}</priority>\n`;
    sitemap += `  </url>\n`;
  });

  sitemap += `</urlset>`;

  // Send the XML response back to the browser/crawler
  res.send(sitemap);
});

module.exports = router;
