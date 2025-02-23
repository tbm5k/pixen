import InfoModal from "./common/infoModal";
import { el } from "../utils";
import controles from "../remote/controles";
import DetailedPopup from "./detailedPopup";
import EpgItem from "./EpgItem";
/**
 * ${1:Description placeholder}
 *
 * @type {*}
 */
var parser = require("xml2json-light");

class ChannelEpg {
  /**
 * Creates an instance of ChannelEpg.
 *
 * @constructor
 * @param {*} link
 */
constructor(link) {
    this.epgLink = link;

    this.todayEpg = [];
    this.openedIndex = null;

    this.epgData = null;

    this.getEpg();
  }

  async render(epgObj) {
    const _this = this;
    const epgContainer = el("div", "epg-container epg-ctrl");

    if (epgObj && epgObj.current && !Object.keys(epgObj.current).length) {
      const play_parent = document.querySelector(".play-parent");
      const noEpg = el("p", "no-epg");
      noEpg.innerHTML = "No program found";
      epgContainer.appendChild(noEpg);
      play_parent.appendChild(epgContainer);
    } else {
      const currentEpg = epgObj.current;
      const nextEpg = epgObj.next;
      const play_parent = document.querySelector(".play-parent");

      // const epgContainer = el("div", "epg-container epg-ctrl");
      if (currentEpg) {
        const currentParent = el("div", "current-parent");
        const epgTitle = el("p", "epg-title");
        const epgTime = el("p", "epg-time");

        epgTitle.innerHTML = currentEpg.title;

        epgTime.innerHTML = `${ChannelEpg.formatTime(
          currentEpg.start_time
        )} - ${ChannelEpg.formatTime(currentEpg.end_time)}`;

        currentParent.appendChild(epgTitle);
        currentParent.appendChild(epgTime);
        epgContainer.appendChild(currentParent);
      }

      if (nextEpg) {
        const nextParent = el("div", "next-parent");
        const nextTitle = el("p", "next-title");
        const nextTime = el("p", "next-time");
        nextTitle.innerHTML = nextEpg.title;
        nextTime.innerHTML = `${ChannelEpg.formatTime(
          nextEpg.start_time
        )} - ${ChannelEpg.formatTime(nextEpg.end_time)}`;
        nextParent.appendChild(nextTitle);
        nextParent.appendChild(nextTime);

        epgContainer.appendChild(nextParent);
      }

      epgContainer.onmouseover = function () {
        if (currentEpg) {
          _this.epgContainerMouseOver();
        }
      };

      play_parent.appendChild(epgContainer);
    }
    epgContainer.onclick = function () {
      if (_this.epgData && Object.keys(_this.epgData).length) {
        _this.showEpgInfo();
      }
      // }
    };
  }

  /**
 * ${1:Description placeholder}
 */
showEpgInfo() {
    const todayEpgEl = this.renderTodayEpgList();

    const detailPopupOptions = {
      children: [todayEpgEl],
    };
    const detailPopup = new DetailedPopup(detailPopupOptions);
    detailPopup.render();
    DetailedPopup.show();

    controles.detailed_popup.epg.index = 0;
    controles.set_current("detailed_popup");
    controles.detailed_popup.set_current("epg");
    controles.detailed_popup.epg.move();
  }

  /**
 * ${1:Description placeholder}
 *
 * @returns {*}
 */
renderTodayEpgList() {
    const todayEpgList = el("div", "today-epg-list");
    const todayEpgListTitle = el("p", "today-epg-list-title");
    todayEpgListTitle.innerHTML = "Today EPG";
    todayEpgList.appendChild(todayEpgListTitle);

    const todayEpgListItemsParent = el("div", "today-epg-list-items-parent");
    const todayEpgListItems = el(
      "div",
      "today-epg-list-items",
      "today_epg_list"
    );

    this.todayEpg.forEach((item, index) => {
      const epgItem = new EpgItem({
        image: item.icon?.url,
        imageWidth: item.icon?.width,
        imageHeight: item.icon?.height,
        description: item.description,
        title: item.title,
        isVisible: false,
        start_time: item.start_time,
        end_time: item.end_time,
        clickHandler: () => this.clickEpgItem(item, index),
      });

      todayEpgListItems.appendChild(epgItem.render());
    });

    todayEpgListItemsParent.appendChild(todayEpgListItems);
    todayEpgList.appendChild(todayEpgListItemsParent);

    return todayEpgList;
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} item
 * @param {*} index
 */
clickEpgItem(item, index) {
    const todayEpgListItems = document.querySelector(".today-epg-list-items");
    const descriptionParent = todayEpgListItems.querySelectorAll(
      ".epg-item__description-parent"
    );

    if (this.openedIndex == index) {
      descriptionParent.forEach((item, index) => {
        item.classList.remove("visible");
      });
      this.openedIndex = null;
      return;
    }

    this.openedIndex = index;

    descriptionParent.forEach((item, index) => {
      item.classList.remove("visible");
    });

    descriptionParent[index].classList.add("visible");
  }

  /**
 * ${1:Description placeholder}
 */
epgContainerMouseOver() {
    controles.player.player_controls.set_current("epg");
    controles.player.player_controls.epg.move();
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @param {*} time
 * @returns {string}
 */
static formatTime(time) {
    const hours =
      new Date(time).getHours() < 10
        ? `0${new Date(time).getHours()}`
        : new Date(time).getHours();
    const minutes =
      new Date(time).getMinutes() < 10
        ? `0${new Date(time).getMinutes()}`
        : new Date(time).getMinutes();
    const seconds =
      new Date(time).getSeconds() < 10
        ? `0${new Date(time).getSeconds()}`
        : new Date(time).getSeconds();
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
 * ${1:Description placeholder}
 *
 * @async
 * @param {*} data
 * @returns {*}
 */
async findCurrentEpg(data) {
    const today = new Date();
    const currentTime = today.getTime();

    let current_epg = {};
    let next_epg = {};
    let next_index;

    const year = today.getFullYear();
    const month =
      today.getMonth() + 1 < 10
        ? `0${today.getMonth() + 1}`
        : today.getMonth() + 1;

    const day = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();

    const todayDateWithoutTime = `${year}-${month}-${day}`;

    const foundItem = data[todayDateWithoutTime];

    if (foundItem) {
      this.todayEpg = foundItem;

      foundItem.forEach((item, index) => {
        let epgObj = {};

        const startTime = new Date(item.start_time * 1000);
        const endTime = new Date(item.end_time * 1000);

        const startDate = new Date(startTime * 1000);
        const endDate = new Date(endTime + 1000);

        const timezoneOffset = startDate.getTimezoneOffset();
        const timezoneOffset2 = endDate.getTimezoneOffset();

        epgObj.start_time = startTime.setMinutes(
          startTime.getMinutes() + timezoneOffset
        );

        epgObj.end_time = endTime.setMinutes(
          endTime.getMinutes() + timezoneOffset2
        );

        epgObj.title = item.title;

        if (epgObj.start_time < currentTime && epgObj.end_time > currentTime) {
          current_epg = epgObj;
          next_index = index + 1;
        }

        if (next_index == index) {
          next_epg = epgObj;
        }
      });
    }

    if (current_epg) {
      this.render({ current: current_epg, next: next_epg });
    } else {
      this.render({ current: null, next: null });
    }
  }

  /**
 * ${1:Description placeholder}
 *
 * @async
 * @returns {*}
 */
async getEpg() {
    const _this = this;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", this.epgLink, true);
    xhr.onload = function () {
      if (this.status === 200) {
        const data = JSON.parse(this.responseText);
        _this.epgData = data;
        _this.findCurrentEpg(data);
      } else {
      
      }
    };

    xhr.send();
  }
}

export default ChannelEpg;
