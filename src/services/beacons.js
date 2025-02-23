/**
 * Beacons.
 */

import { GET } from "../api/get";
import Parser from "../api/parser";

class Beacons {
  /**
 * Creates an instance of Beacons.
 *
 * @constructor
 */
  constructor() {
    this.beaconUrl = "";
    this.sessionBeacon = "";
    this.videoBeacon = "";
    this.inVideoSession = "";
    this.oldVideoSession = "";
  }

  init(urls) {
    this.beaconUrl = urls.beaconUrl;
    this.sessionBeacon = urls.beaconSession;
    this.videoBeacon = urls.beaconVideo;

    this.sendEvent({ "[EVENT_ID]": 24 }, "session");
  }

  generateVideoSession(video) {
    let pageId = "";

    let selectedMenu = document.querySelector(".sidebar-list__item.selected");

    if (selectedMenu) {
      pageId = selectedMenu.getAttribute("page_id");
    }

    const macros = {
      "[CONTENT_SESSION_ID]":
        Date.now() + Math.floor(100000 + Math.random() * 900000),
      "[VIDEO_CONTENT_ID]": video.id,
      "[VIDEO_TITLE]": video.title,
      "[PLAYLIST_ID]": window.selectedPlaylistId,
      "[CATEGORY_ID]": window.selectedCategoryId,
      "[PAGE_ID]": pageId,
    };

    this.inVideoSession = Parser.parse(this.videoBeacon, macros, false);
    this.oldVideoSession = Parser.parse(this.beaconUrl, macros, false);
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} type
 * @returns {{}\}
 */
  urlsToFire(type) {
    switch (type) {
      case "session":
        return [this.sessionBeacon];
      case "video":
        return [this.inVideoSession, this.oldVideoSession];
      default:
        return [this.beaconUrl, this.videoBeacon];
    }
  }

  /**
 * ${1:Description placeholder}
 *
 * @async
 * @param {{}} [macros={}]
 * @param {*\} type
 * @returns {*\}
 */
  async sendEvent(macros = {}, type) {
    const urls = this.urlsToFire(type);


    for (const beaconUrl of urls) {
      const _beacon = Parser.parse(beaconUrl, macros);
      this.fireBeacon(_beacon);
    }
  }

  /**
 * ${1:Description placeholder}
 *
 * @async
 * @param {{}} [moreMacros={}]
 * @param {*\} type
 * @returns {*\}
 */
  async sendError(moreMacros = {}, type) {
    const urls = this.urlsToFire(type);

    for (const beaconUrl of urls) {
      const _beacon = Parser.parse(beaconUrl, moreMacros);
      this.fireBeacon(_beacon);
    }
  }

  /**
 * ${1:Description placeholder}
 *
 * @async
 * @param {*} url
 * @returns {unknown}
 */
  async fireBeacon(url) {
    if (!url) return;
    try {
        if (navigator.sendBeacon) {
            const success = navigator.sendBeacon(url);
            if (!success) {
                let res = await fetch(url, { method: 'GET' });
            }
        } else {
            await fetch(url, { method: 'GET' });
        }
    } catch (error) {
        console.error("Error sending beacon or GET request:", error);
    }
}
}

export default new Beacons();
