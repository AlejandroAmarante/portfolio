window.onload = function () {
  document
    .getElementById("darkModeCheckbox")
    .addEventListener("click", function () {
      var sunny = document.getElementsByName("sunny")[0];
      var moon = document.getElementsByName("moon")[0];
      var isChecked = document
        .getElementsByClassName("switch")[0]
        .getElementsByTagName("input")[0].checked;

      if (isChecked) {
        sunny.style.display = "inline-block";
        moon.style.display = "none";
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        sunny.style.display = "none";
        moon.style.display = "inline-block";
        document.documentElement.setAttribute("data-theme", "white");
        localStorage.setItem("theme", "light");
      }
    });

  window.onscroll = function () {
    scrollFunction();
  };

  var navBar = document.getElementById("navbar");
  var mobileNav = document.getElementById("mobilenav");
  function scrollFunction() {
    /* If user scrolls down more than 10 pixels, change the background
     color and add border-bottom. Else, remove both.*/
    // if (window.scrollY > 10) {
    //   navBar.setAttribute(
    //     "style",
    //     "border-bottom: 1px solid #282828; background: #090c10;"
    //   );
    //   mobileNav.setAttribute("style", "background: #090c10;");
    // } else {
    //   navBar.setAttribute("style", "border-bottom: none; background: none;");
    //   mobileNav.setAttribute("style", "border-bottom: none; background: none;");
    // }
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

  function darkMode() {}

  // List of sentences
  var content = ["create.", "design.", "develop."];

  // Current sentence being processed
  var contentIndex = 0;

  // Character number of the current sentence being processed
  var characterIndex = 0;

  // Holds the handle returned from setInterval
  var _INTERVAL_VAL;

  // Element that holds the text
  var textElement = document.querySelector("#dynamicText");

  // Cursor element
  var cursor = document.querySelector("#cursor");

  // Implements typing effect
  function Type() {
    cursor.style.animation = null;
    // Get substring with 1 characater added
    var text = content[contentIndex].substring(0, characterIndex + 1);
    textElement.innerHTML = text;
    characterIndex++;

    // If full sentence has been displayed then start to delete the sentence after some time
    if (text === content[contentIndex]) {
      cursor.style.animation = "blink 1s step-end infinite";
      clearInterval(_INTERVAL_VAL);
      setTimeout(function () {
        _INTERVAL_VAL = setInterval(Delete, 50);
      }, 2000);
    }
  }

  // Implements deleting effect
  function Delete() {
    cursor.style.animation = null;
    // Get substring with 1 characater deleted
    var text = content[contentIndex].substring(0, characterIndex - 1);
    textElement.innerHTML = text;
    characterIndex--;

    // If sentence has been deleted then start to display the next sentence
    if (text === "") {
      clearInterval(_INTERVAL_VAL);

      // If current sentence was last then display the first one, else move to the next
      if (contentIndex == content.length - 1) contentIndex = 0;
      else contentIndex++;

      characterIndex = 0;

      // Start to display the next sentence after some time
      setTimeout(function () {
        cursor.style.display = "inline-block";
        _INTERVAL_VAL = setInterval(Type, 100);
      }, 200);
    }
  }

  // Start the typing effect on load
  _INTERVAL_VAL = setInterval(Type, 100);
};
