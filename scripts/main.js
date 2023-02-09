window.onload = function () {
  // Dark/Light Theme Logic
  // Acquire the theme icons as variables
  let sunnyIcons = document.getElementsByName("sunny");
  let moonIcons = document.getElementsByName("moon");
  let themeSwitches = document.getElementsByClassName("switch");

  /* Set the theme to the previously saved value for
the theme within localstorage, if available */
  let theme = localStorage.theme || "dark";
  document.documentElement.setAttribute("data-theme", theme);

  /* If the current theme is 'light',
change the theme icon */
  if (theme === "light") {
    for (let i = 0; i < sunnyIcons.length; i++) {
      sunnyIcons[i].style.display = "none";
      moonIcons[i].style.display = "inline-block";
    }
  }

  for (let i = 0; i < themeSwitches.length; i++) {
    themeSwitches[i].addEventListener("click", function () {
      if (theme === "dark") {
        for (let j = 0; j < moonIcons.length; j++) {
          sunnyIcons[j].style.display = "none";
          moonIcons[j].style.display = "inline-block";
        }
        theme = "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.theme = theme;
      } else {
        for (let j = 0; j < sunnyIcons.length; j++) {
          sunnyIcons[j].style.display = "inline-block";
          moonIcons[j].style.display = "none";
        }
        theme = "dark";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.theme = theme;
      }
    });
  }

  let mobileLinks = document.getElementById("mobileNav__links");
  let menuIcon = document.getElementById("mobileNav__icon");
  let menuClose = document.getElementsByClassName("mobileNav__close")[0];

  menuIcon.addEventListener("click", toggleMenu);
  menuClose.addEventListener("click", closeMenu);
  mobileLinks.addEventListener("click", closeMenu);

  function toggleMenu() {
    if (menuIcon.getAttribute("name") === "close-sharp") {
      closeMenu();
    } else {
      menuIcon.setAttribute("name", "close-sharp");
      mobileLinks.style.height = "fit-content";
    }
  }

  function closeMenu() {
    mobileLinks.style.height = "0rem";
    menuIcon.setAttribute("name", "menu-sharp");
  }

  // TypeWriter ---------------------------------------------------------------|
  // List of sentences
  const content = ["create.", "design.", "develop."];

  // Current sentence being processed
  let contentIndex = 0;

  // Character number of the current sentence being processed
  let characterIndex = 0;

  // Holds the handle returned from setInterval
  let _INTERVAL_VAL;

  // Element that holds the text
  let textElement = document.querySelector("#dynamicText");

  // Cursor element
  let cursor = document.querySelector("#cursor");

  // Implements typing effect
  function typeText() {
    cursor.style.animation = null;
    // Get substring with 1 characater added
    let text = content[contentIndex].substring(0, characterIndex + 1);
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
    let text = content[contentIndex].substring(0, characterIndex - 1);
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

  // Get the links in the navbar
  const navLinks = document.querySelectorAll(".nav__link");

  // Function to turn the background of a link red
  const changeLinkBackground = (link) => {
    navLinks.forEach((navLink) => {
      navLink.style.color = "";
      navLink.style.backgroundColor = "";
    });
    link.style.color = "var(--hover-font-color)";
    link.style.backgroundColor = "var(--hover-color)";
  };

  // Event listener for clicks on links
  navLinks.forEach((navLink) => {
    navLink.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = navLink.getAttribute("href");
      const section = document.querySelector(sectionId);
      section.scrollIntoView({ behavior: "smooth" });
      changeLinkBackground(navLink);
    });
  });

  // Event listener for scroll events
  document.addEventListener("scroll", () => {
    // Check if the user is within the first 500 pixels of the top of the page
    if (window.scrollY < 600) {
      navLinks.forEach((navLink) => {
        navLink.style.color = "";
        navLink.style.backgroundColor = "";
      });
    } else {
      navLinks.forEach((navLink) => {
        const sectionId = navLink.getAttribute("href");
        const section = document.querySelector(sectionId);
        const bounding = section.getBoundingClientRect();
        const middle = (bounding.bottom - bounding.top) / 2;
        if (
          bounding.top + middle >= 0 &&
          bounding.left >= 0 &&
          bounding.right <= window.innerWidth &&
          bounding.bottom - middle <= window.innerHeight
        ) {
          changeLinkBackground(navLink);
        }
      });
    }
  });
};
