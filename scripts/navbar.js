window.onscroll = function () {
  scrollFunction();
};

var navBar = document.getElementById("navbar");
var mobileNav = document.getElementById("mobilenav");
function scrollFunction() {
  /* If user scrolls down more than 10 pixels, change the background
     color and add border-bottom. Else, remove both.*/
  if (window.scrollY > 10) {
    navBar.setAttribute(
      "style",
      "border-bottom: 1px solid #282828; background: #090c10;"
    );
    mobileNav.setAttribute("style", "background: #090c10;");
  } else {
    navBar.setAttribute("style", "border-bottom: none; background: none;");
    mobileNav.setAttribute("style", "border-bottom: none; background: none;");
  }
}

var mobileLinks = document.getElementById("mobilenav__links");
var mobileIcon = document.getElementById("mobilenav__icon");

function mobileFunction() {
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

function logoFunction() {
  mobileLinks.style.display = "none";
  mobileIcon.setAttribute("name", "menu");
  navBar.setAttribute("style", "border-bottom: none; background: none;");
}
