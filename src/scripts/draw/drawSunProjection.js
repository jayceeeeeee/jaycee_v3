import { projectLatLonToTerritoryMap } from "../state/territory.js";
import { getSketchLayoutMetrics } from "../layout/sketchLayout.js";

// Number of samples used to approximate the full great-circle curve.
// More samples = smoother curve, but also more computation each frame.
// 361 is a nice number because it includes both the start and end points of the circle, which makes the curve drawing code simpler.
// 10 is also a nice number because it corresponds to the grid.
const GREAT_CIRCLE_SAMPLES = 100;

// If two consecutive projected points jump too far horizontally, it usually
// means the curve crossed the wrapped map boundary. In that case we split the
// drawing into separate segments to avoid an ugly line across the whole map.
const WRAP_BREAK_THRESHOLD = 0.45;

// Draw the "local space map" solar line.
//
// Important idea:
// This is not the apparent path of the Sun through the local sky dome.
// Instead, we:
// 1. take the Sun's current azimuth at the user's location
// 2. interpret that azimuth as a true initial bearing on Earth
// 3. follow the corresponding great circle all around the globe
// 4. project that great circle back onto the current square world-map view
export function drawSunProjection(radius, dateNow, humanLat, humanLon) {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);
  const diameter = radius * 2;

  // The Sun gives us a direction from the current location.
  const sunBearingDegrees = getSunBearingDegrees(dateNow, humanLat, humanLon);

  // Sample the corresponding full great circle and project it into the square map.
  const greatCirclePoints = getGreatCircleMapPoints(humanLat, humanLon, sunBearingDegrees, humanLat, humanLon);

  drawGreatCircleCurve(greatCirclePoints, centerX, centerY, diameter);
}

// Convert the Sun's current azimuth into a standard geographic bearing.
//
// SunCalc returns azimuth using its own convention:
// - 0 at south
// - positive angles increasing toward west
//
// We convert that into the more familiar navigation convention:
// - north = 0
// - east  = 90
// - south = 180
// - west  = 270
function getSunBearingDegrees(dateNow, humanLat, humanLon) {
  const sunPosition = SunCalc.getPosition(new Date(dateNow.timestamp), humanLat, humanLon);

  // SunCalc azimuth is measured from south and increases westward (this is their convention).
  // We convert it into a standard true bearing:
  // north = 0, east = 90, south = 180, west = 270.
  return normalizeDegrees(degrees(sunPosition.azimuth) + 180);
}

// Build all projected points needed to draw the great circle on the square map.
//
// startLat / startLon:
// - the point where the great circle originates
//
// bearingDegrees:
// - the initial direction at that starting point
//
// centerLat / centerLon:
// - the current center of the square world-map projection
//
// The result is an ordered list of points already expressed in normalized map
// coordinates, ready for drawing.
function getGreatCircleMapPoints(startLat, startLon, bearingDegrees, centerLat, centerLon) {
  const points = [];

  for (let sampleIndex = 0; sampleIndex <= GREAT_CIRCLE_SAMPLES; sampleIndex += 1) {
    // Convert the sample index into a fraction of the full great circle.
    const fraction = sampleIndex / GREAT_CIRCLE_SAMPLES;

    // Sweep the full circle from -pi to +pi so that we obtain the complete
    // geodesic around the Earth rather than just one half of it.
    const angularDistance = (fraction * TWO_PI) - Math.PI;

    // Compute the actual geographic point lying on the great circle at the
    // chosen angular distance from the starting point.
    const geoPoint = getGreatCirclePoint(startLat, startLon, bearingDegrees, angularDistance);

    // Reproject that real geographic point into the current square map view.
    const mapProjection = projectLatLonToTerritoryMap(geoPoint.lat, geoPoint.lon, centerLat, centerLon);

    if (mapProjection !== null) {
      points.push({
        ...mapProjection,
        lat: geoPoint.lat,
        lon: geoPoint.lon
      });
    }
  }

  return points;
}

// Solve the direct great-circle problem on a sphere:
// given a start point, an initial bearing, and an angular distance,
// compute the destination latitude / longitude.
//
// This is the geometric core of the local-space line:
// on the globe the line is a great circle, and this function samples it.
function getGreatCirclePoint(startLat, startLon, bearingDegrees, angularDistance) {
  const startLatRadians = radians(startLat);
  const startLonRadians = radians(startLon);
  const bearingRadians = radians(bearingDegrees);

  // Great-circle destination latitude formula.
  const endLatRadians = asin(
    sin(startLatRadians) * cos(angularDistance) +
    cos(startLatRadians) * sin(angularDistance) * cos(bearingRadians)
  );

  // Great-circle destination longitude formula.
  const endLonRadians = startLonRadians + atan2(
    sin(bearingRadians) * sin(angularDistance) * cos(startLatRadians),
    cos(angularDistance) - sin(startLatRadians) * sin(endLatRadians)
  );

  return {
    lat: degrees(endLatRadians),
    lon: wrapLongitudeDegrees(degrees(endLonRadians))
  };
}

// Draw the projected great circle as one or more smooth curve segments.
//
// We may need multiple segments because a wrapped world map can make a single
// continuous spherical curve jump discontinuously from one horizontal edge of
// the map to the other.
function drawGreatCircleCurve(points, centerX, centerY, diameter) {
  if (points.length < 2) {
    return;
  }

  // Split the polyline wherever the wrapped map would create a large jump.
  const segments = buildWrappedSegments(points);

  noFill();
  stroke(255, 95, 95, 210);
  strokeWeight(2);

  for (const segment of segments) {
    // If a segment has less than 2 points, it can't be drawn as a curve, so we skip it.
    if (segment.length < 2) {
      continue;
    }

    beginShape();
    // The first and last points are duplicated as control points to create a smooth curve that actually passes through all the original points, including the endpoints.
    addCurveVertex(segment[0], centerX, centerY, diameter);

    // Draw the curve through all the points in the segment.
    for (const point of segment) {
      addCurveVertex(point, centerX, centerY, diameter);
    }

    addCurveVertex(segment[segment.length - 1], centerX, centerY, diameter);
    endShape();
  }
}

// Split the projected point list into multiple drawable segments whenever
// the map projection wraps horizontally.
//
// Without this step, a line crossing the map edge would produce an incorrect
// stroke straight across the whole square.
//
// Here a segment is simpley a list of points that can be drawn as a single continuous curve without wrapping issues.
// In egenral we'll have only two segments.
function buildWrappedSegments(points) {
  const segments = [];
  let currentSegment = [];

  for (const point of points) {
    const previousPoint = currentSegment[currentSegment.length - 1];

    if (previousPoint && Math.abs(point.normalizedX - previousPoint.normalizedX) > WRAP_BREAK_THRESHOLD) {
      segments.push(currentSegment);
      currentSegment = [];
    }

    currentSegment.push(point);
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
}

// Normalize any angle in degrees into the canonical [0, 360) range.
function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

// Helper used while drawing the p5 curve.
// Convert normalized square coordinates back into actual canvas positions.
function addCurveVertex(point, centerX, centerY, diameter) {
  curveVertex(
    centerX + point.normalizedX * diameter,
    centerY - point.normalizedY * diameter
  );
}

// Wrap any longitude into the standard geographic interval [-180, 180).
function wrapLongitudeDegrees(value) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}
