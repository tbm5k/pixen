import { el } from "../utils";

import "../styles/detailedPopup.css";
import controles from "../remote/controles";
import pages from "../remote/pages";
import Player from "../pages/player";

/**
    * @class detailedPopup
    * @description component to render content information 
    * */
class DetailedPopup {

    /**
        * @param {Object} options 
        * */
  constructor(options) {
    this.children = options.children;
    this.info = options.info;
  }

    /**
        * @description hide and unhide state
        * @static
        * @type {boolean}
        */
static isShown = false;
  /**
 * @description render state
 * @static
 * @type {boolean}
 */
static isInfoOpened = false;

  /**
 * ${1:Description placeholder}
 */
render () {
    const root = document.getElementById("root");
    const parent = document.getElementById("popup");
    const popupParent = el("div", "popup-parent");
    const popupOverlay = el("div", "popup-overlay");
    const content = el("div", "popup-content");

    const closeBtn = el("div", "channel-info__close-btn popup-back-ctrl");
    closeBtn.innerHTML = "&#10005;";

    this.children.forEach((child) => {
      content.appendChild(child);
    });

    if (this.info) {
      DetailedPopup.isInfoOpened = true;
    } else {
      DetailedPopup.isInfoOpened = false;
    }

    popupParent.appendChild(content);
    popupParent.appendChild(closeBtn);

    parent.appendChild(popupParent);
    root.appendChild(popupOverlay);

    closeBtn.addEventListener("click", () => {
      DetailedPopup.destroy();
    });
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 */
static show () {
    const parent = document.getElementById("popup");
    parent.classList.add("visible");
    DetailedPopup.isShown = true;
  }

  static hide () {
    const parent = document.getElementById("popup");
    parent.classList.remove("visible");
    DetailedPopup.isShown = false;
  }

  /**
 * @description cleanup fn
 * @static
 * @param {boolean} [fromPlayBtn=false]
 */
static destroy (fromPlayBtn = false) {
    const root = document.getElementById("root");
    const parent = document.getElementById("popup");
    const currentPage = pages.current;

    root.removeChild(document.querySelector(".popup-overlay"));
    parent.innerHTML = "";
    DetailedPopup.hide();
    if (currentPage == "player") {
      if (Player.isControlsVisible) {
        controles.set_previous();
      } else {
        controles.set_current("player");
        controles.player.set_current("player_controls");
        controles.player.player_controls.set_current("epg");
        controles.player.player_controls.epg.move();
      }
      // controles.player.player_controls.video_settings.moveToBackBtn();
    } else {
      controles.set_previous();
    }
  }
}

export default DetailedPopup;
