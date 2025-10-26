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
            const copiedPopup = document.createElement("div");
            copiedPopup.classList.add("copied-popup");
            copiedPopup.textContent = "Copied!";

            // Position the notification above the click point
            copiedPopup.style.left = event.pageX - 30 + "px";
            copiedPopup.style.top = event.pageY - 40 + "px";

            // Add the notification to the document
            document.body.appendChild(copiedPopup);

            // Fade out and remove the notification after animation
            setTimeout(() => {
              copiedPopup.style.opacity = "0";
              copiedPopup.style.transform = "translateY(-20px)";
            }, 200);

            // Reset animation flag when animation is complete
            setTimeout(() => {
              document.body.removeChild(copiedPopup);
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
