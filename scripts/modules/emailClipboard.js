export function initEmailClipboard() {
  // Get the email button
  const emailButtons = document.querySelectorAll(".button--email");
  emailButtons.forEach((emailButton) => {
    // Flag to track if animation is in progress
    let isAnimating = false;

    if (emailButton) {
      emailButton.addEventListener("click", function (event) {
        // If animation is already in progress, do nothing
        if (isAnimating) return;

        // Prevent the default email client from opening
        event.preventDefault();

        // Get the email address from the href attribute
        const emailAddress = "alejandrormont@gmail.com";

        // Copy the email to clipboard
        navigator.clipboard
          .writeText(emailAddress)
          .then(() => {
            // Set animation flag to true
            isAnimating = true;

            // Create the "Copied!" notification
            const notification = document.createElement("div");
            notification.textContent = "Copied!";
            notification.style.cssText = `
                position: absolute;
                background-color: rgba(0, 0, 0, 0.75);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 18px;
                pointer-events: none;
                opacity: 1;
                transition: opacity 1s ease, transform 1s ease;
                transform: translateY(0);
                z-index: 1000;
                font-family: "Montserrat", sans-serif;
              `;

            // Position the notification above the click point
            notification.style.left = event.pageX - 30 + "px";
            notification.style.top = event.pageY - 40 + "px";

            // Add the notification to the document
            document.body.appendChild(notification);

            // Fade out and remove the notification after animation
            setTimeout(() => {
              notification.style.opacity = "0";
              notification.style.transform = "translateY(-20px)";
            }, 200);

            // Reset animation flag when animation is complete
            setTimeout(() => {
              document.body.removeChild(notification);
              isAnimating = false;
            }, 1000);
          })
          .catch((err) => {
            console.error("Failed to copy email: ", err);

            // If clipboard API fails, fallback to creating a temporary input
            const tempInput = document.createElement("input");
            tempInput.value = emailAddress;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);

            // Show notification for fallback method
            alert("Email copied: " + emailAddress);
          });
      });
    }
  });
}
