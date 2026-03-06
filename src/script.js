//user input, latitude and longitude
let humanX = 0;
let humanY = 0;
let humanLat = 0;
let humanLon = 0;

//measures of the universe
let pi = 3.142857;
let earthRadius = 4536; // in miles

//creating the canvas and getting the geolocation of the user
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  angleMode(RADIANS);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      humanLat = position.coords.latitude;
      humanLon = position.coords.longitude;
    });
  }
}

//starting to draw
function draw() {
  //initiating the canvas
  background(0);
  translate(width/2, height/2);

  stroke(255);
  noFill();

  // Terre
  circle(0, 0, earthRadius * 2);

  // Conversion longitude → angle
  let angle = map(humanLon, -180, 180, -PI, PI);

  // Conversion latitude → distance
  let distance = map(humanLat, -90, 90, earthRadius, 0);

  let x = cos(angle) * distance;
  let y = sin(angle) * distance;

  fill(0, 200, 255);
  noStroke();
  circle(x, y, 12);

  // Centre = toi
  fill(255);
  circle(0, 0, 8);
}
