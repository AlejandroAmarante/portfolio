window.onscroll = function () {
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
