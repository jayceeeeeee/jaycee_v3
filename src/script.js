/*
 * variables
*/

//user input

//space
//latitude and longitude
let humanLat = 0;
let humanLon = 0;
geolocation(() => {
  display(); // au bon moment
});
//time
const date_now = getKabbalahDateTime();

//measures of the universe
let pi = Math.PI;
let earthRadiusMiles = 4536; // in miles

//other variables
let humanX = 0;
let humanY = 0;


/*
 * functions
*/

display();

function display() {
  const el_time = document.getElementById("time_constants");
  const el_space = document.getElementById("space_constants");
  const d = date_now;

  const pad = (n, z = 2) => String(n).padStart(z, "0");

  el_time.textContent =
    "Hebrew Date: " + d.day + " " + d.monthName + "(" + d.month + ") " + d.year + "\n" +
    "Time: " + pad(d.hours) + ":" + pad(d.minutes) + ":" + pad(d.seconds) + "." + pad(d.milliseconds, 3) + "\n" +
    "Timestamp: " + d.timestamp;

  el_space.textContent =
    "Human Latitude: " + humanLat + "\n" +
    "Human Longitude: " + humanLon;
}

function geolocation(display){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      humanLat = position.coords.latitude;
      humanLon = position.coords.longitude;

      display();
    });
  }
}

function getKabbalahDateTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-u-ca-hebrew", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).formatToParts(date);

  const get = (type) => parts.find(p => p.type === type).value;

  const months = [
    "Tishrei", "Cheshvan", "Kislev",
    "Tevet", "Shevat", "Adar",
    "Nisan", "Iyar", "Sivan",
    "Tammuz", "Av", "Elul"
  ];

  const monthName = get("month");

  return {
    // Hebrew date
    day: Number(get("day")),
    month: months.indexOf(monthName), // 0 → 11
    monthName: monthName,
    year: Number(get("year")),

    // Time (precise)
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    milliseconds: date.getMilliseconds(),

    // Bonus (useful)
    timestamp: date.getTime()
  };
}
