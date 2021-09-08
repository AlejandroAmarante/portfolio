var arrText = new Array("I'm Alejandro, and I create. "); // Array of text to be "typed"
var speed = 80; // Delay speed as text "types" out. Lower value = faster speed
var index = 0; // Start position for the typing effect
var arrLength = arrText[0].length; // Length of the text array

var textPos = 0; // Initialize text position
var contents = ""; // Initialize contents variable

function typewriter() {
  // Aqcuire the destination of the typewriter ID
  var destination = document.getElementById("typewriter");

  // Initiate the innerHTML of the destination, with an initial carat value
  destination.innerHTML =
    contents +
    arrText[index].substring(0, textPos) +
    "<span class='blink'>█<span>";
  // If textPos hasn't reached the array length, increase textPos value
  if (textPos++ != arrLength) {
    setTimeout("typewriter()", speed);
  } else {
    // Subtract text code here???
  }
}

// Wait specified time (in milliseconds) before starting script
setTimeout(typewriter, 500);
