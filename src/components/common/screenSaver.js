import controles from "../../remote/controles";
import { el } from "../../utils";

/**
 * ${1:Description placeholder}
 *
 * @type {*}
 */
let screen_timer = null;
/**
 * ${1:Description placeholder}
 *
 * @type {*}
 */
let timer = null;

/**
    * @class ScreenSaver
    * @classdesc render when inactive
    * */
class ScreenSaver {
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {boolean}
 */
static isScreenSaverVisible = false;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {number}
 */
static counter = 1;

  /**
 * ${1:Description placeholder}
 *
 * @static
 */
static show() {
    const screenSaver = document.getElementById("screen_saver");
    screenSaver.classList.add("show");
    ScreenSaver.update();
    controles.set_current("empty_block");
    ScreenSaver.isScreenSaverVisible = true;
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 */
static hide() {
    const screenSaver = document.getElementById("screen_saver");
    screenSaver.classList.remove("show");
    clearInterval(timer);
    if (ScreenSaver.isScreenSaverVisible) {
      controles.set_previous();
    }

    ScreenSaver.isScreenSaverVisible = false;

    clearTimeout(screen_timer);
  }

    /**
        * @description periodically updated the information
        * @static
        */
static update() {
    clearInterval(timer);

    timer = setInterval(() => {
      if (ScreenSaver.isScreenSaverVisible) {
        const channel = Object.values(appData.content)[ScreenSaver.counter];
        ScreenSaver.changeInfo(channel);
      }
    }, 15000);
  }

    /**
        * @description changes the rendered information
        * @static
        * @param {*} channel
        */
static changeInfo(channel) {
    const screen_saver = document.getElementById("screen_saver");
    const screenSaverImg = document.getElementById("screen_saver_bg");
    const channelTitle = document.getElementById("screen_saver_title");

    ScreenSaver.counter++;

    clearTimeout(screen_timer);
    screen_saver.classList.add("load");

    setTimeout(function () {
      screenSaverImg.src = channel.thumbnail;
      channelTitle.innerHTML = channel.title;
    }, 500);

    screen_timer = setTimeout(function () {
      screen_saver.classList.remove("load");
    }, 1500);
  }

  /**
 * ${1:Description placeholder}
 */
render() {
    // const channel = Object.values(appData.content)[0];
    const screenSaver = el("div", "screen-saver", "screen_saver");
    const screenSaverImg = el("img", "screen-saver__bg", "screen_saver_bg");
    const brandLogo = el("img", "screen-saver__logo", "screen_saver_logo");
    const channelInfoParent = el("div", "screen-saver__info__parent");
    const channelTitle = el("p", "screen-saver__title", "screen_saver_title");
    const appLogo = el(
      "img",
      "screen-saver__app-logo",
      "screen_saver_app_logo"
    );

    // screenSaverImg.src = channel.thumbnail;
    screenSaverImg.src = window.appData[0].videos[0].thumbnail;
    channelTitle.innerHTML = "ctv";
    // brandLogo.src = appData.graphic.watermark_image;
    // appLogo.src = appData.graphic.appLogo;
    brandLogo.src = "";
    appLogo.src = "";

    channelInfoParent.appendChild(channelTitle);
    channelInfoParent.appendChild(appLogo);
    screenSaver.appendChild(screenSaverImg);
    screenSaver.appendChild(brandLogo);
    screenSaver.appendChild(channelInfoParent);
    document.body.appendChild(screenSaver);
  }
}

export default ScreenSaver;
