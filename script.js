
let lat = 0;
let lon = 0;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  angleMode(RADIANS);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
    });
  }
}

function draw() {
  background(0);
  translate(width/2, height/2);

  stroke(255);
  noFill();

  let earthRadius = 250;

  // Terre
  circle(0, 0, earthRadius * 2);

  // Conversion longitude → angle
  let angle = map(lon, -180, 180, -PI, PI);

  // Conversion latitude → distance
  let distance = map(lat, -90, 90, earthRadius, 0);

  let x = cos(angle) * distance;
  let y = sin(angle) * distance;

  fill(0, 200, 255);
  noStroke();
  circle(x, y, 12);

  // Centre = toi
  fill(255);
  circle(0, 0, 8);
}
