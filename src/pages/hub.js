/**
 * Dynamic page being render by the app settings
 */

import ChannelInfo from "../components/ChannelInfo.js";
import ChannelsList from "../components/common/channelsList.js";
import InfoModal from "../components/common/infoModal.js";
import DetailedPopup from "../components/detailedPopup.js";
import HomeHeader from "../components/home/homeHeader.js";
import SeriesSidebar from "../layouts/seriesSidebar.js";
import controles from "../remote/controles.js";
import { el, getItem, remove_active_class } from "../utils.js";
import Player from "./player.js";

class HubPage {
  /**
 * use to avoid rerendering
 *
 * @static
 * @type {boolean}
 */
  static rendered_already = false;
  /**
 * page element
 *
 * @static
 * @type {*}
 */
  static page_element = null;
  /**
 * Creates an instance of HubPage.
 *
 * @constructor
 */
  constructor() { }

  /**
 * render main page
 */
  async render() {
    if (HubPage.page_element) return;

    const root = document.getElementById("root");
    const hub_parent = el("div", "page-parent hub-parent", "hub_parent");
    const category_entity_id = getItem("current_category");

    if (category_entity_id) {
        const videos = window.categoriesData[category_entity_id];
        this.renderList([{name: category_entity_id.split('.json')[0], videos}], hub_parent);

    }

    const home_header_wrapper = el(
      "div",
      "home-header__wrapper",
      "home_header_wrapper" + "_hub"
    );

    home_header_wrapper.innerHTML = "";

    hub_parent.appendChild(home_header_wrapper);


    const sidebar = document.getElementById("sidebar_root");

    sidebar.classList.add("hidden");

    sidebar.appendChild(new SeriesSidebar().render());

    controles.set_current("hub");
    root.appendChild(hub_parent);
    HubPage.page_element = document.getElementById('hub_parent');
    pages.page_objects.hub = HubPage.page_element;
    controles.main.series_channels.row = 0;
    controles.main.series_channels.index = 0;
  }

  /**
 * render playlist
 *
 * @param {*} playlist_ids
 * @param {*} hub_parent
 */
  renderList(playlist_ids, hub_parent) {
    const _this = this;
    hub_parent.appendChild(
      new ChannelsList({
        entityArray: playlist_ids,
        cardMouseOver: this.cardMouseOver.bind(_this),
        channelsListClick: (playlist_id) => {

        },
        cardClickHandler: (item) => {
          _this.channelCardClickHandler(item, playlist_ids);
        },
      }).render('hub')
    );
  }

  /**
 * Handle the clicking event of the remote control on the channels
 *
 * @param {*} item
 * @param {*} playlist_ids
 * @returns {*}
 */
  channelCardClickHandler(item, playlist_ids) {

    if (!navigator.onLine) {
      return new InfoModal({ title: "No internet connection" });
    }

    const itemClick = () => {
      pages.set_current("player");
      window.player_obj = new Player(item, playlist_ids);
      window.player_obj.render();
    }

     itemClick(item);

  }

  /**
 * handle the hover event of the remote control on the channels
 *
 * @param {*} idx
 * @param {*} data
 * @param {*} elem
 */
  cardMouseOver(idx, data, elem) {
    remove_active_class("active")
    new HomeHeader(
      data.title,
      data.thumbnail,
      data.isLive,
      data.description,
      '',
      data.videoDuration,
      data.parental_control,
      data.resolution
    ).render();
  }
}

export default HubPage;
