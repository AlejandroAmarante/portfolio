/**
 * Initialize typewriter effect
 */
export function initTypewriter() {
  const content = ["design.", "develop.", "disrupt.", "deliver."];
  const textElement = document.querySelector(".typewriter__dynamic-text");
  const cursor = document.querySelector(".typewriter__cursor");

  if (!textElement || !cursor) {
    console.warn("Typewriter elements not found");
    return;
  }

  let contentIndex = 0;
  let characterIndex = 0;
  let typingInterval;

  // Start the typewriting effect
  startTyping();

  /**
   * Start the typing sequence
   */
  function startTyping() {
    typingInterval = setInterval(typeText, 100);
  }

  /**
   * Type text letter by letter
   */
  function typeText() {
    // Remove cursor blinking animation during typing
    cursor.style.animation = "none";

    // Get current word's substring based on characterIndex
    const text = content[contentIndex].substring(0, characterIndex + 1);
    textElement.textContent = text;
    characterIndex++;

    // If word is complete, wait and start deleting
    if (text === content[contentIndex]) {
      clearInterval(typingInterval);
      cursor.style.animation = "blink 1s step-end infinite";

      // Wait 2 seconds before starting to delete
      setTimeout(() => {
        typingInterval = setInterval(deleteText, 50);
      }, 2000);
    }
  }

  /**
   * Delete text letter by letter
   */
  function deleteText() {
    // Remove cursor blinking animation during deletion
    cursor.style.animation = "none";

    // Get current word's substring based on characterIndex
    const text = content[contentIndex].substring(0, characterIndex - 1);
    textElement.textContent = text;
    characterIndex--;

    // If deletion is complete, move to next word
    if (text === "") {
      clearInterval(typingInterval);

      // Move to next word or loop back to first word
      contentIndex = contentIndex === content.length - 1 ? 0 : contentIndex + 1;
      characterIndex = 0;

      // Wait briefly before typing next word
      setTimeout(() => {
        cursor.style.display = "inline-block";
        startTyping();
      }, 200);
    }
  }
}
