// utils/coordinateUtils.js
const proj4 = require("proj4");

// Minna Datum base parameters (Clarke 1880 Ellipsoid)
const MINNA_BASE = "+proj=tmerc +ellps=clrk80 +units=m +no_defs";

// NTM Projection Strings
const NTM_PROJECTIONS = {
  WEST_BELT: `${MINNA_BASE} +lat_0=4 +lon_0=4.5 +k=0.99975 +x_0=670553.98 +y_0=0 +a6378249.145 +rf=293.465 +towgs84=-92,-93,122,0,0,0,0 +units=m`,
  MID_BELT: `${MINNA_BASE} +lat_0=4 +lon_0=8.5 +k=0.99975 +x_0=670553.98 +y_0=0 +a=6378249.145 +rf=293.465 +towgs84=-92,-93,122,0,0,0,0 +units=m`,
  EAST_BELT: `${MINNA_BASE} +lat_0=4 +lon_0=12.5 +k=0.99975 +x_0=670553.98 +y_0=0 +a=6378249.145 +rf=293.465 +towgs84=-92,-93,122,0,0,0,0 +units=m`,
};

// Target UTM Projections (WGS84)
const UTM_PROJECTIONS = {
  UTM_31N: "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs",
  UTM_32N: "+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs",
  UTM_33N: "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs",
};

/**
 * Converts single Easting/Northing pair from NTM to UTM
 */
function convertPoint(easting, northing, ntmBelt, utmZone) {
  const sourceProj = NTM_PROJECTIONS[ntmBelt];
  const targetProj = UTM_PROJECTIONS[utmZone];

  if (!sourceProj || !targetProj) {
    throw new Error("No source NTM Belt or UTM Zone selected.");
  }

  // Convert [Easting, Northing]
  const [utmEasting, utmNorthing] = proj4(sourceProj, targetProj, [
    easting,
    northing,
  ]);

  return {
    utmEasting: Number(utmEasting.toFixed(3)),
    utmNorthing: Number(utmNorthing.toFixed(3)),
  };
}

/**
 * Converts Reverse: UTM -> NTM
 */

function convertUtmToNtm(utmEasting, utmNorthing, utmZone, ntmBelt) {
  const sourceProj = UTM_PROJECTIONS[utmZone]; // Source is now UTM
  const targetProj = NTM_PROJECTIONS[ntmBelt]; // Target is now NTM

  if (!sourceProj || !targetProj) {
    throw new Error("Invalid NTM Belt or UTM Zone selected.");
  }

  // proj4 automatically reverses the math based on projection definitions!
  const [ntmEasting, ntmNorthing] = proj4(sourceProj, targetProj, [
    utmEasting,
    utmNorthing,
  ]);

  return {
    ntmEasting: Number(ntmEasting.toFixed(3)),
    ntmNorthing: Number(ntmNorthing.toFixed(3)),
  };
}

module.exports = { convertPoint, convertUtmToNtm };
