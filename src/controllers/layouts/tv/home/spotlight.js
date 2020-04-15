import imagehelper from "components/layouts/tv/imagehelper";
import visibleinviewport from "visibleinviewport";
import itemShortcuts from "itemShortcuts";
import browser from "browser";

function loadItemIntoSpotlight(card, item, width) {
    if (!item.BackdropImageTags || !item.BackdropImageTags.length) {
        return;
    }
    if (document.activeElement === card) {
        card.dispatchEvent(new CustomEvent("focus"));
    }
    const imgUrl = imagehelper.getbackdropImageUrl(item, {
        maxWidth: width
    });
    const cardImageContainer = card.querySelector(".cardImage");
    const newCardImageContainer = document.createElement("div");
    newCardImageContainer.className = cardImageContainer.className;
    newCardImageContainer.style.backgroundImage = "url('" + imgUrl + "')";
    card.querySelector(".cardText").innerHTML = item.Taglines && item.Taglines.length ? item.Taglines[0] : item.Name;
    card.setAttribute("data-id", item.Id);
    card.setAttribute("data-serverid", item.ServerId);
    card.setAttribute("data-type", item.Type);
    card.setAttribute("data-isfolder", item.IsFolder.toString());
    card.setAttribute("data-action", "link");
    card.classList.add("itemAction");
    cardImageContainer.parentNode.appendChild(newCardImageContainer);
    const onAnimationFinished = () => {
        const parentNode = cardImageContainer.parentNode;
        if (parentNode) {
            parentNode.removeChild(cardImageContainer);
        }
    };
    if (newCardImageContainer.animate) {
        const keyframes = [{
            opacity: "0",
            offset: 0
        }, {
            opacity: "1",
            offset: 1
        }];
        const timing = {
            duration: 900,
            iterations: 1
        };
        newCardImageContainer.animate(keyframes, timing).onfinish = onAnimationFinished;
    } else {
        onAnimationFinished();
    }
}
export class spotlight {
    constructor(card, items, width) {
        itemShortcuts.on(card);
        this.items = items;
        this.card = card;
        this.width = width;
        this.start();
    }
    start() {
        const items = this.items;
        const card = this.card;
        const width = this.width;
        if (!items.length) {
            return;
        }
        loadItemIntoSpotlight(card, items[0], width);
        if (items.length === 1) {
            return;
        }
        if (browser.slow) {
            return;
        }
        this.index = 1;
        const intervalMs = browser.animate ? 10000 : 30000;
        this.interval = setInterval(this.onInterval.bind(this), intervalMs);
    }
    onInterval() {
        const items = this.items;
        const card = this.card;
        const width = this.width;
        if (!document.body.contains(card)) {
            clearInterval(this.interval);
            return;
        }
        if (!visibleinviewport(card, false, 0)) {
            return;
        }
        if (this.index >= items.length) {
            this.index = 0;
        }
        loadItemIntoSpotlight(card, items[this.index], width);
        this.index++;
    }
    destroy() {
        itemShortcuts.off(this.card);
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = null;
        this.items = null;
        this.card = null;
    }
}

export default spotlight;

