// routes/converter.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const ExcelJS = require("exceljs");
const { convertPoint, convertUtmToNtm } = require("../utility/proj4util");

// Memory storage keeps the file in RAM so we don't clog disk storage
const upload = multer({ storage: multer.memoryStorage() });

router.post("/convert", upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const { ntmBelt, utmZone } = req.body;

    // 1. Read uploaded Excel file using ExcelJS
    const inputWorkbook = new ExcelJS.Workbook();
    // we use load and buffer here because we are storing using RAM.
    await inputWorkbook.xlsx.load(req.file.buffer);
    // grabbing the first worksheets.
    const worksheet = inputWorkbook.worksheets[0];

    // 2. Prepare new Workbook for downloading
    const outputWorkbook = new ExcelJS.Workbook();
    const outputSheet = outputWorkbook.addWorksheet("Converted Coordinates");

    // Define output columns
    outputSheet.columns = [
      { header: "Point ID / Name", key: "id", width: 18 },
      { header: "NTM Easting (m)", key: "ntmEasting", width: 18 },
      { header: "NTM Northing (m)", key: "ntmNorthing", width: 18 },
      { header: "UTM Easting (m)", key: "utmEasting", width: 18 },
      { header: "UTM Northing (m)", key: "utmNorthing", width: 18 },
      { header: "Target Zone", key: "utmZone", width: 15 },
    ];

    // Style header row (bold)
    outputSheet.getRow(1).font = { bold: true };

    // 3. Loop through rows (skip header row 1)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip original headers

      const pointId = row.getCell(1).value || `Pt_${rowNumber - 1}`;
      const easting = parseFloat(row.getCell(2).value);
      const northing = parseFloat(row.getCell(3).value);

      // A check to confirm if both are not numbers.
      if (!isNaN(easting) && !isNaN(northing)) {
        const converted = convertPoint(easting, northing, ntmBelt, utmZone);

        outputSheet.addRow({
          id: pointId,
          ntmEasting: easting,
          ntmNorthing: northing,
          utmEasting: converted.utmEasting,
          utmNorthing: converted.utmNorthing,
          utmZone: utmZone,
        });
      }
    });

    // 4. Send the new file back to the user as a download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Converted_UTM_Coordinates.xlsx",
    );

    await outputWorkbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error during conversion:", error);
    res.status(500).send("An error occurred while processing your Excel file.");
  }
});

router.post("/transform", async (req, res) => {
  try {
    const { ntmBelt, utmZone, easting, northing } = req.body;

    let east = parseFloat(easting);
    let north = parseFloat(northing);

    if (isNaN(east) || isNaN(north)) {
      return res.status(401).json({ error: "You must type in a number" });
    }

    const result = convertPoint(east, north, ntmBelt, utmZone);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "something is wrong with your inputed coordinates." });
  }
});

router.post("/transform-reverse", (req, res) => {
  try {
    const { easting, northing, utmZone, ntmBelt } = req.body;

    if (!easting || !northing) {
      return res
        .status(400)
        .json({ error: "Both Easting and Northing values are required." });
    }

    const parsedEasting = parseFloat(easting);
    const parsedNorthing = parseFloat(northing);

    if (isNaN(parsedEasting) || isNaN(parsedNorthing)) {
      return res
        .status(400)
        .json({ error: "Easting and Northing must be valid numbers." });
    }

    // Call reverse conversion
    const converted = convertUtmToNtm(
      parsedEasting,
      parsedNorthing,
      utmZone,
      ntmBelt,
    );

    return res.json({
      ntmEasting: converted.ntmEasting,
      ntmNorthing: converted.ntmNorthing,
    });
  } catch (err) {
    console.error("Reverse conversion error:", err.message);
    return res.status(500).json({
      error: "An unexpected error occurred during reverse calculation.",
    });
  }
});

module.exports = router;
