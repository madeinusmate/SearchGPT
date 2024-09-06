chrome.omnibox.setDefaultSuggestion({
  description: "Ask ChatGPT: %s",
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  // Redirect to ChatGPT page
  let chatUrl = `https://chatgpt.com/`;
  chrome.tabs.create({ url: chatUrl }, (tab) => {
    // Listen for the tab to be fully loaded
    chrome.webNavigation.onCompleted.addListener(function listener(details) {
      if (details.tabId === tab.id && details.url.includes("chatgpt.com")) {
        // Inject the query into the chat input box
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: injectQueryToChatGPT,
          args: [text],
        });
      }
      chrome.webNavigation.onCompleted.removeListener(listener);
    });
  });
});

// Function to inject the query into ChatGPT's input box and press enter
function injectQueryToChatGPT(query) {
  const interval = setInterval(() => {
    const inputBox = document.querySelector("textarea#prompt-textarea");
    if (inputBox) {
      inputBox.value = query;
      inputBox.dispatchEvent(new Event("input", { bubbles: true }));
      // Create and dispatch the Enter key event
      const enterEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Enter",
        code: "Enter",
        keyCode: 13,
      });
      inputBox.dispatchEvent(enterEvent);
      clearInterval(interval); // Stop checking once the input is set and Enter is pressed
    }
  }, 100); // Keep trying until the input box is found
}
