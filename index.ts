import definePlugin, { OptionType } from "@utils/types";
import { findByProps } from "@webpack";
import { FluxDispatcher, UserStore } from "@webpack/common";
import { definePluginSettings } from "@api/Settings";

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

const settings = definePluginSettings({
  detectStreaming: {
    type: OptionType.BOOLEAN,
    description: "Detect streaming.",
    default: false,
    oncheck: handleDetectStreamingChange,
  },
  hotkey: {
    type: OptionType.STRING,
    description:
      "The hotkey you would like to set to unblur hovered elements (uses event.key).",
    default: "Alt",
  },
});

let isStreaming = false;
let isScreenSharing = false;
let mutationObserver: MutationObserver | null = null;

export default definePlugin({
  name: "Privacy Screen",
  description: "Blurs messages when screensharing or streaming.",
  authors: [
    {
      name: "𓄧༝༚༝༚ ZANDER ᶠᶸᶜᵏᵧₒᵤ!",
      id: 1219097396403900466n,
    },
  ],
  settings,

  start() {
    if (settings.store.detectStreaming) {
      startScreensharingCheck();
      startStreamingCheck();
    }
    document.addEventListener("keydown", handleKeyDown);
  },

  stop() {
    stopScreensharingCheck();
    stopStreamingCheck();
    unblurMessages();
    document.removeEventListener("keydown", handleKeyDown);
  },
});

function handleDetectStreamingChange() {
  if (settings.store.detectStreaming) {
    startScreensharingCheck();
    startStreamingCheck();
  } else {
    stopScreensharingCheck();
    stopStreamingCheck();
    unblurMessages();
  }
}

function startScreensharingCheck() {
  const screenshareModule = findByProps("isScreenSharing");

  if (!screenshareModule) {
    console.error("Screensharing detection module not found.");
    return;
  }

  function checkScreensharing() {
    const previousState = isScreenSharing;
    isScreenSharing = screenshareModule.isScreenSharing();

    if (previousState !== isScreenSharing) {
      applyBlur();
    }
  }

  mutationObserver = new MutationObserver(checkScreensharing);
  mutationObserver.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  checkScreensharing();
}

function stopScreensharingCheck() {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
  isScreenSharing = false;
}

function startStreamingCheck() {
  FluxDispatcher.subscribe("STREAMER_MODE_UPDATE", handleStreamerModeUpdate);
}

function stopStreamingCheck() {
  FluxDispatcher.unsubscribe("STREAMER_MODE_UPDATE", handleStreamerModeUpdate);
}

function handleStreamerModeUpdate(action: { key: string; value: boolean }) {
  if (action.key === "enabled") {
    isStreaming = action.value;
    applyBlur();
  }
}

function applyBlur() {
  if (isStreaming || isScreenSharing) {
    targets.forEach((selector) => {
      const messages = document.querySelectorAll(selector);
      messages.forEach((msg) => {
        const element = msg as HTMLElement;
        element.style.filter = "blur(8px)";
      });
    });
  } else {
    unblurMessages();
  }
}

function unblurMessages() {
  targets.forEach((selector) => {
    const messages = document.querySelectorAll(selector);
    messages.forEach((msg) => {
      const element = msg as HTMLElement;
      element.style.filter = "";
    });
  });
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === settings.store.hotkey) {
    targets.forEach((selector) => {
      const messages = document.querySelectorAll(selector);
      messages.forEach((msg) => {
        const element = msg as HTMLElement;
        if (element.matches(":hover")) {
          element.style.filter = "";
        }
      });
    });
  }
}
