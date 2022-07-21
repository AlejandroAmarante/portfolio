window.onload = function () {
  // Dark/Light Theme Logic
  // Aqcuire the theme icons as variables
  let sunnyIcons = document.getElementsByName("sunny");
  let moonIcons = document.getElementsByName("moon");
  let themeSwitches = document.getElementsByClassName("switch");

  /* Set the theme to the previously saved 
     value for the theme within localstorage, if available  */
  document.documentElement.setAttribute("data-theme", localStorage.theme);

  /* If the current theme is 'light', 
     change the theme icon  */
  if (localStorage.theme == "light") {
    for (let i = 0; i < sunnyIcons.length; i++) {
      sunnyIcons[i].style.display = "none";
      moonIcons[i].style.display = "inline-block";
    }
  }

  for (let i = 0; i < themeSwitches.length; i++) {
    themeSwitches[i].addEventListener("click", function () {
      if (localStorage.theme == "dark") {
        for (let j = 0; j < moonIcons.length; j++) {
          sunnyIcons[j].style.display = "none";
          moonIcons[j].style.display = "inline-block";
        }
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.theme = "light";
      } else {
        for (let j = 0; j < sunnyIcons.length; j++) {
          sunnyIcons[j].style.display = "inline-block";
          moonIcons[j].style.display = "none";
        }
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.theme = "dark";
      }
    });
  }

  let mobileLinks = document.getElementById("mobileNav__links");
  let menuIcon = document.getElementById("mobileNav__icon");
  let menuClose = document.getElementsByClassName("mobileNav__close");

  menuIcon.addEventListener("click", function () {
    if (menuIcon.getAttribute("name") === "close-sharp") {
      menuIcon.setAttribute("name", "menu-sharp");
      mobileLinks.style.height = "0rem";
    } else {
      menuIcon.setAttribute("name", "close-sharp");
      mobileLinks.style.height = "13rem";
    }
  });

  for (let i = 0; i < menuClose.length; i++) {
    menuClose[i].addEventListener("click", function () {
      mobileLinks.style.height = "0rem";
      menuIcon.setAttribute("name", "menu-sharp");
    });
  }

  // TypeWriter ---------------------------------------------------------------|
  // List of sentences
  let content = ["create.", "design.", "develop."];

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

  // let navButtonArray = document.querySelectorAll(".sideNav__button");
  // let active = document.querySelector(
  //   ".sideNav__button .sideNav__button--active"
  // );
  // for (let i = 0; i < navButtonArray.length; i++) {
  //   navButtonArray[i].addEventListener("click", function () {
  //     if (active) active.classList.remove("sideNav__button--active");
  //     navButtonArray[i].classList.add("sideNav__button--active");
  //   });
  // }

  // document.addEventListener("click", function (event) {
  //   let active = document.querySelector(
  //     ".sideNav__button .sideNav__button--active"
  //   );
  //   if (active) active.classList.remove("sideNav__button--active");
  //   if (event.target.classList.contains("sideNav__button")) {
  //     event.target.classList.remove("sideNav__button");
  //     event.target.classList.add("sideNav__button--active");
  //   }
  // });

  // let homeSection = document.getElementById("home");
  // let aboutSection = document.getElementById("about");
  // let sideNavAbout = document.getElementById("sideNav__about");
  // let projectsSection = document.getElementById("projects");
  // let sideNavProjects = document.getElementById("sideNav__projects");
  // console.log(aboutSection.offsetHeight);
  // window.onscroll = function () {
  //   if (window.scrollY < homeSection.offsetHeight / 1.5) {
  //     sideNavAbout.style.background = "";
  //     sideNavAbout.style.color = "";
  //   } else if (
  //     window.pageYOffset > homeSection.offsetHeight / 1.5 &&
  //     window.pageYOffset < aboutSection.offsetTop - aboutSection.offsetHeight
  //   ) {
  //     sideNavAbout.style.background = "white";
  //     sideNavAbout.style.color = "black";
  //   } else if (
  //     window.pageYOffset > aboutSection.offsetHeight / 2 &&
  //     window.pageYOffset <
  //       projectsSection.offsetTop + projectsSection.offsetHeight
  //   ) {
  //     sideNavProjects.style.background = "white";
  //     sideNavProjects.style.color = "black";
  //   } else {
  //     sideNavAbout.style.background = "";
  //     sideNavAbout.style.color = "";
  //   }
  // };
};
