"https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"

window.onscroll = function() {
  scrollFunction();
};

var navBar = document.getElementById("navbar");
var mobileNav = document.getElementById("mobilenav");
function scrollFunction() {
  if (window.scrollY > 10) {
    navBar.setAttribute(
      "style",
      "border-bottom: 1px solid #282828;background: #090c10;"
    );
    mobileNav.setAttribute("style", "background: #090c10;");
  } else {
    navBar.setAttribute("style", "border-bottom: none; background: none;");
    mobileNav.setAttribute("style", "border-bottom: none; background: none;");
  }
}

function mobileFunction() {
  var mobileLinks = document.getElementById("mobilenav__links");
  var mobileIcon = document.getElementById("mobilenav__icon");
  if (mobileLinks.style.display === "block") {
    mobileLinks.style.display = "none";
    mobileIcon.setAttribute("name", "menu");
  } else {
    mobileLinks.style.display = "block";
    navBar.setAttribute("style", "background: #090c10;");
    mobileNav.setAttribute("style", "background: #090c10;");
    mobileIcon.setAttribute("name", "close");
  }
}

// set up text to print, each item in array is new line
var arrText = new Array(
  "Hey there! I'm Alejandro Montalvo,",
  "and I build websites."
);
var speed = 60; // time delay of print out
var index = 0; // start printing array at this posision
var arrLength = arrText[0].length; // the length of the text array
var scrollAt = 20; // start scrolling up at this many lines

var textPos = 0; // initialise text position
var contents = ""; // initialise contents variable
var row; // initialise current row

function typewriter() {
  contents = "";
  row = Math.max(0, index - scrollAt);
  var destination = document.getElementById("typedtext");

  while (row < index) {
    contents += arrText[row++] + "<br />";
  }
  destination.innerHTML =
    contents +
    arrText[index].substring(0, textPos) +
    "<span class='blink'>█<span>";
  if (textPos++ == arrLength) {
    textPos = 0;
    index++;
    if (index != arrText.length) {
      arrLength = arrText[index].length;
      setTimeout("typewriter()", 500);
    }
  } else {
    setTimeout("typewriter()", speed);
  }
}

typewriter();
