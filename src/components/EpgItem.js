import { el } from "../utils";
import ChannelEpg from "./channelEpg";

import "../styles/epgItem.css";

/**
 * ${1:Description placeholder}
 *
 * @class EpgItem
 * @typedef {EpgItem}
 */
class EpgItem {
  /**
 * Creates an instance of EpgItem.
 *
 * @constructor
 * @param {*} options
 */
constructor(options) {
    this.image = options.image;
    this.imageWidth = options.imageWidth || 320;
    this.imageHeight = options.imageHeight || 180;
    this.title = options.title;
    this.description = options.description;
    this.isVisible = options.isVisible;
    this.start_time = options.start_time;
    this.end_time = options.end_time;
    this.clickHandler = options.clickHandler;
  }

  /**
 * ${1:Description placeholder}
 *
 * @returns {*}
 */
render() {
    const epgItemMain = el("div", "epg-item-main");
    const epgItem = el("div", "epg-item epg-item-ctrl");
    const epgImg = el("img", "epg-item__img");
    const contentParent = el("div", "epg-item__content-parent");
    const descriptionParent = el("div", "epg-item__description-parent");
    const description = el("p", "epg-item__description");
    const epgItemTitle = el("p", "epg-item__title");
    const epgItemTime = el("p", "epg-item__time");

    if (this.isVisible) {
      descriptionParent.classList.add("visible");
    } else {
      descriptionParent.classList.remove("visible");
    }

    epgImg.src = this.image;
    // epgImg.style.width = this.imageWidth + "px";
    // epgImg.style.height = this.imageHeight + "px";

    epgItemTitle.innerHTML = this.title;
    epgItemTime.innerHTML = `${ChannelEpg.formatTime(
      this.start_time
    )} - ${ChannelEpg.formatTime(this.end_time)}`;

    contentParent.appendChild(epgItemTitle);
    contentParent.appendChild(epgItemTime);

    if (this.description) {
      description.innerHTML = this.description;
    } else {
      description.innerHTML =
        "<p class='no-epg-description'>No description</p>";
    }

    descriptionParent.appendChild(description);

    epgItem.appendChild(epgImg);
    epgItem.appendChild(contentParent);
    epgItemMain.appendChild(epgItem);
    epgItemMain.appendChild(descriptionParent);

    epgItemMain.addEventListener("click", () => {
      this.clickHandler();
    });

    return epgItemMain;
  }
}

export default EpgItem;
