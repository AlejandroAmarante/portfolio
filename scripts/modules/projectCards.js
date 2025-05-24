// modules/mouseFollowingCards.js

export function initProjectCards() {
  const cards = document.querySelectorAll(".project-card");

  if (!cards.length) {
    console.warn("No project cards found for mouse following effect");
    return;
  }

  cards.forEach((card) => {
    // Check if card has a data-link attribute for navigation
    const cardLink = card.getAttribute("data-link");
    const openInNewTab = card.getAttribute("data-target") === "_blank";

    // Set initial transition for smooth entry
    card.addEventListener("mouseenter", function () {
      card.style.transition = "transform 0.1s ease-out";

      // Add cursor pointer if card is clickable
      if (cardLink) {
        card.style.cursor = "pointer";
      }
    });

    // Handle mouse movement for 3D rotation effect
    card.addEventListener("mousemove", function (e) {
      // Don't prevent event propagation for links inside the card
      if (e.target.closest("a")) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Calculate relative position from card center
      const deltaX = mouseX - cardCenterX;
      const deltaY = mouseY - cardCenterY;

      // Convert to rotation angles (max ±20 degrees)
      const rotateX = (deltaY / rect.height) * -20;
      const rotateY = (deltaX / rect.width) * 20;

      // Apply 3D transform
      card.style.transform = `
          perspective(1000px) 
          rotateX(${rotateX}deg) 
          rotateY(${rotateY}deg) 
          scale(1.02)
          translateZ(10px)
        `;
    });

    // Handle card click for navigation
    card.addEventListener("click", function (e) {
      // Don't navigate if clicking on a link inside the card
      if (e.target.closest("a")) {
        return;
      }

      if (cardLink) {
        if (openInNewTab) {
          window.open(cardLink, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = cardLink;
        }
      }
    });

    // Reset card position when mouse leaves
    card.addEventListener("mouseleave", function () {
      card.style.transition = "transform 0.3s ease-out";
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)";

      // Reset cursor
      if (cardLink) {
        card.style.cursor = "pointer";
      }
    });
  });

  console.log(
    `Mouse following effect initialized for ${cards.length} project cards`
  );
}
