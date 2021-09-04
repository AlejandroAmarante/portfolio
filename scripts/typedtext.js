// set up text to print, each item in array is new line
var arrText = new Array("I'm Alejandro, and I create. ");
var speed = 80; // time delay of print out
var index = 0; // start printing array at this position
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

setTimeout(typewriter, 400);
