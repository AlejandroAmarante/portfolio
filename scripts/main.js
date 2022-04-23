window.onload = function () {
  // Dark/Light Theme Logic
  // Aqcuire the theme icons as variables
  var sunnyIcons = document.getElementsByName("sunny");
  var moonIcons = document.getElementsByName("moon");
  var themeSwitches = document.getElementsByClassName("switch");

  /* Set the theme to the previously saved 
     value for the theme within localstorage, if available  */
  document.documentElement.setAttribute("data-theme", localStorage.theme);

  /* If the current theme is 'light', 
     change the theme icon  */
  if (localStorage.theme == "light") {
    for (var i = 0; i < sunnyIcons.length; i++) {
      sunnyIcons[i].style.display = "none";
      moonIcons[i].style.display = "inline-block";
    }
  }

  for (var i = 0; i < themeSwitches.length; i++) {
    themeSwitches[i].addEventListener("click", function () {
      if (localStorage.theme == "dark") {
        for (var j = 0; j < moonIcons.length; j++) {
          sunnyIcons[j].style.display = "none";
          moonIcons[j].style.display = "inline-block";
        }
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.theme = "light";
      } else {
        for (var j = 0; j < sunnyIcons.length; j++) {
          sunnyIcons[j].style.display = "inline-block";
          moonIcons[j].style.display = "none";
        }
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.theme = "dark";
      }
    });
  }
  //---------------------------------------------------------------------------|

  var mobileLinks = document.getElementById("mobileNav__links");
  var menuIcon = document.getElementById("mobileNav__icon");
  var menuClose = document.getElementsByClassName("mobileNav__close");

  menuIcon.addEventListener("click", function () {
    if (menuIcon.getAttribute("name") === "close-sharp") {
      mobileLinks.style.display = "none";
      menuIcon.setAttribute("name", "menu-sharp");
    } else {
      mobileLinks.style.display = "block";
      menuIcon.setAttribute("name", "close-sharp");
    }
  });

  for (var i = 0; i < menuClose.length; i++) {
    menuClose[i].addEventListener("click", function () {
      mobileLinks.style.display = "none";
      menuIcon.setAttribute("name", "menu-sharp");
    });
  }

  // TypeWriter ---------------------------------------------------------------|
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
  function typeText() {
    cursor.style.animation = null;
    // Get substring with 1 characater added
    var text = content[contentIndex].substring(0, characterIndex + 1);
    textElement.innerText = text;
    characterIndex++;

    // If full sentence has been displayed then start to delete the sentence after some time
    if (text === content[contentIndex]) {
      cursor.style.animation = "blink 1s step-end infinite";
      clearInterval(_INTERVAL_VAL);
      setTimeout(function () {
        _INTERVAL_VAL = setInterval(deleteText, 50);
      }, 2000);
    }
  }

  // Implements deleting effect
  function deleteText() {
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
        _INTERVAL_VAL = setInterval(typeText, 100);
      }, 200);
    }
  }

  // Start the typing effect on load
  _INTERVAL_VAL = setInterval(typeText, 100);
};
