import definePlugin from "@utils/types";

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
        const applyBlur = () => {
            const screenShareButton = document.querySelector(
                '[aria-label="Share Your Screen"]'
            );

            if (
                screenShareButton &&
                screenShareButton.classList.contains("buttonActive_adcaac")
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

        const observer = new MutationObserver(applyBlur);
        observer.observe(document.body, { childList: true, subtree: true });

        this._observer = observer;
        applyBlur();
    },

    stop() {
        if (this._observer) {
            this._observer.disconnect();
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
