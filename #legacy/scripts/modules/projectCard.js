// modules/mouseFollowingCards.js
export function initProjectCard() {
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

      // Calculate distance from center for intensity scaling
      const maxDistance = Math.sqrt(
        (rect.width / 2) ** 2 + (rect.height / 2) ** 2
      );
      const currentDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const distanceRatio = Math.min(currentDistance / maxDistance, 1);

      // Normalize deltas to card dimensions
      const normalizedX = (deltaX / rect.width) * 2; // Range: -1 to 1
      const normalizedY = (deltaY / rect.height) * 2;

      // Apply smooth intensity scaling and clamp
      const intensity = 0.8 * distanceRatio; // Scale down as distance increases
      const maxRotation = 20; // Maximum rotation angle

      const rotateX = Math.max(
        -maxRotation,
        Math.min(maxRotation, normalizedY * -maxRotation * intensity)
      );
      const rotateY = Math.max(
        -maxRotation,
        Math.min(maxRotation, normalizedX * maxRotation * intensity)
      );

      // Apply 3D transform with smoother transitions
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
}
