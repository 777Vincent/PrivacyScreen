import definePlugin from "@utils/types";
import { findByProps } from "@webpack";

// feel free to add to this list of css selectors that will be blurred
const targets = [
  "[class*='channel']",
  "[class*='people']",
  "[class*='activity']",
  "[class*='member']",
  "[class*='server']",
  "[aria-label*='channel']",
  "[aria-label*='people']",
  "[aria-label*='activity']",
  "[aria-label*='member']",
  "[aria-label*='server']",
  ".wrapper_d8bfb3",
  ".panel_c69a7b",
  ".outer_c69a7b",
  ".listItem_c96c45",
  ".children_fc4f04",
  ".messageListItem_d5deea",
];

export default definePlugin({
  name: "Privacy Screen",
  description: "Blurs messages when screensharing.",
  authors: [
    {
      name: "𓄧༝༚༝༚ ZANDER ᶠᶸᶜᵏᵧₒᵤ!",
      id: 1219097396403900466n,
    },
  ],

  start() {
    let isStreaming = false;

    // Function to check if Streamer Mode is active
    function checkStreamerMode() {
      const notice = findByProps("colorStreamerMode", "notice");
      const colorStreamerMode = findByProps("colorStreamerMode");

      if (notice && colorStreamerMode) {
        const body = document.body;

        const isStreamerModeActive =
          body.classList.contains("hideinstreamermode") &&
          body.querySelector(`.${notice.notice}`) !== null &&
          body.querySelector(`.${colorStreamerMode.colorStreamerMode}`) !==
            null;

        isStreaming = isStreamerModeActive;
      } else {
        console.warn("Streamer Mode classes not found.");
      }
    }

    const streamerModeObserver = new MutationObserver(() => {
      checkStreamerMode();
    });

    streamerModeObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    checkStreamerMode();

    const applyBlur = () => {
      const screenShareButton = document.querySelector(
        '[aria-label="Share Your Screen"]'
      );

      if (
        (screenShareButton &&
          screenShareButton.classList.contains("buttonActive_adcaac")) ||
        isStreaming
      ) {
        targets.forEach((selector) => {
          const messages = document.querySelectorAll(selector);
          messages.forEach((msg) => {
            const element = msg as HTMLElement;
            element.style.filter = "blur(8px)";
          });
        });
      } else {
        targets.forEach((selector) => {
          const messages = document.querySelectorAll(selector);
          messages.forEach((msg) => {
            const element = msg as HTMLElement;
            element.style.filter = "";
          });
        });
      }
    };

    const blurObserver = new MutationObserver(applyBlur);
    blurObserver.observe(document.body, { childList: true, subtree: true });

    this._streamerModeObserver = streamerModeObserver;
    this._blurObserver = blurObserver;

    applyBlur();
  },

  stop() {
    if (this._streamerModeObserver) {
      this._streamerModeObserver.disconnect();
    }

    if (this._blurObserver) {
      this._blurObserver.disconnect();
    }

    targets.forEach((selector) => {
      const messages = document.querySelectorAll(selector);
      messages.forEach((msg) => {
        const element = msg as HTMLElement;
        element.style.filter = "";
      });
    });
  },
});
