const proj4 = require("proj4");

// NTM Projection Strings - Added +type=crs to activate the datum shift engine
const NTM_PROJECTIONS = {
  WEST_BELT:
    "+proj=tmerc +lat_0=4 +lon_0=4.5 +k=0.99975 +x_0=230738.26 +y_0=0 +a=6378249.145 +rf=293.465 +towgs84=-90.2,-87.32,114.17,0,0,0,0 +units=m +no_defs +type=crs",
  MID_BELT:
    "+proj=tmerc +lat_0=4 +lon_0=8.5 +k=0.99975 +x_0=670553.98 +y_0=0 +a=6378249.145 +rf=293.465 +towgs84=-92.5,-93.3,122.1,0,0,0,0 +units=m +no_defs +type=crs",
  EAST_BELT:
    "+proj=tmerc +lat_0=4 +lon_0=12.5 +k=0.99975 +x_0=1110369.7 +y_0=0 +a=6378249.145 +rf=293.465 +towgs84=-93.134,-86.647,114.196,0,0,0,0 +units=m +no_defs +type=crs",
};

// Target UTM Projections (WGS84)
const UTM_PROJECTIONS = {
  UTM_31N: "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs +type=crs",
  UTM_32N: "+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs +type=crs",
  UTM_33N: "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs +type=crs",
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
    zone: utmZone,
  };
}

/**
 * Converts Reverse: UTM -> NTM
 */
function convertUtmToNtm(utmEasting, utmNorthing, utmZone, ntmBelt) {
  const sourceProj = UTM_PROJECTIONS[utmZone];
  const targetProj = NTM_PROJECTIONS[ntmBelt];

  if (!sourceProj || !targetProj) {
    throw new Error("Invalid NTM Belt or UTM Zone selected.");
  }

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
