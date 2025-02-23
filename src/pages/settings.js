/**
 * Settings page layout
 */

import controles from "../remote/controles";
import channelSettings from "../settings/channelSettings";
import { el, detect_page } from "../utils";

class SettingsPage {
  /**
 * Creates an instance of SettingsPage.
 *
 * @constructor
 */
  constructor() {
    this.data = {
      title: "Settings",
      page: "settings",
    };

    this.brighDataEnabled = false;

    this.page = detect_page(this.data.page);
  }
  /**
 * page element
 *
 * @static
 * @type {*}
 */
  static page_element = null;

  render() {
    if (SettingsPage.page_element) {
      SettingsPage.page_element.remove();
      SettingsPage.page_element = null;
    }
    var root = document.getElementById("root");
    var settings_parent = el(
      "div",
      "page-parent settings-parent",
      "settings_page"
    );
    var settings_title = el("h1", "page-title");
    settings_title.innerHTML =
      appData.graphic.appName +
      `<span class='app-name__border'></span>` +
      this.page.page_title;

    const settings_bg = el("img", "settings-bg");

    const image = new Image();
    image.src = this.page.background_image;

    image.onload = function () {
      settings_bg.src = image.src;
      settings_parent.appendChild(settings_bg);
    };

    const settings_description = el("p", "settings-description");
    settings_description.innerHTML = this.page.page_descrtipion;

    settings_parent.appendChild(settings_title);
    settings_parent.appendChild(settings_description);

    const [brighData] = channelSettings.getPlugins("brighData");

    if (brighData?.status?.consent) {
      this.brighDataEnabled = true;
    }

    if (brighData && brighData.tag && brighData.tag.status) {
      const brighdataEl = `<div class="brigh_data_content">
      <div class="brigh_data_header">
        <h2 class="brigh_data_title">Enable web indexing</h2>
        <label class="menu_switch brighdata-ctrl" id="toggle_brighdata">
          <span
            class="menu_slider round ${this.brighDataEnabled ? "checked" : ""}"
            id="brighdata_slider"
          ></span>
        </label>
      </div>

      <p class="brigh_data_info">Get more info by scanning QR</p>
      <p>
      <svg
      class="brigh_data_qr"
      viewBox="-1 -1 31 31"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <rect
        id="qr background"
        fillOpacity="1"
        fill="rgb(255, 255, 255)"
        x="-1"
        y="-1"
        width="31"
        height="31"
      ></rect>
      <path
        fillOpacity="1"
        fill="rgb(0, 0, 0)"
        id="qr dark pixels"
        fillRule="evenodd"
        d="M 10 0 L 11 0 L 11 2 L 10 2 z M 12 0 L 14 0 L 14 1 L 16 1 L 16 0 L 20 0 L 20 1 L 18 1 L 18 2 L 16 2 L 16 3 L 15 3 L 15 4 L 14 4 L 14 5 L 16 5 L 16 6 L 15 6 L 15 7 L 14 7 L 14 6 L 13 6 L 13 7 L 12 7 L 12 6 L 11 6 L 11 5 L 13 5 L 13 4 L 12 4 L 12 2 L 13 2 L 13 3 L 14 3 L 14 2 L 13 2 L 13 1 L 12 1 z M 8 1 L 9 1 L 9 2 L 8 2 z M 20 1 L 21 1 L 21 3 L 20 3 z M 8 3 L 11 3 L 11 4 L 10 4 L 10 6 L 9 6 L 9 7 L 8 7 L 8 5 L 9 5 L 9 4 L 8 4 z M 17 3 L 18 3 L 18 4 L 17 4 z M 19 3 L 20 3 L 20 4 L 21 4 L 21 8 L 20 8 L 20 9 L 21 9 L 21 8 L 22 8 L 22 9 L 23 9 L 23 8 L 24 8 L 24 9 L 25 9 L 25 10 L 24 10 L 24 11 L 26 11 L 26 12 L 27 12 L 27 13 L 25 13 L 25 12 L 23 12 L 23 11 L 22 11 L 22 12 L 21 12 L 21 11 L 20 11 L 20 10 L 18 10 L 18 9 L 19 9 L 19 7 L 20 7 L 20 5 L 19 5 z M 16 4 L 17 4 L 17 5 L 16 5 z M 17 5 L 19 5 L 19 7 L 18 7 L 18 6 L 17 6 z M 10 6 L 11 6 L 11 7 L 12 7 L 12 9 L 11 9 L 11 8 L 10 8 L 10 9 L 6 9 L 6 8 L 9 8 L 9 7 L 10 7 z M 16 6 L 17 6 L 17 8 L 18 8 L 18 9 L 17 9 L 17 11 L 16 11 L 16 13 L 14 13 L 14 12 L 15 12 L 15 11 L 14 11 L 14 12 L 13 12 L 13 13 L 12 13 L 12 11 L 13 11 L 13 10 L 12 10 L 12 9 L 14 9 L 14 10 L 16 10 L 16 9 L 15 9 L 15 7 L 16 7 z M 0 8 L 5 8 L 5 9 L 2 9 L 2 10 L 0 10 z M 25 8 L 26 8 L 26 9 L 25 9 z M 27 8 L 28 8 L 28 9 L 27 9 z M 10 9 L 11 9 L 11 11 L 10 11 z M 28 9 L 29 9 L 29 10 L 28 10 z M 2 10 L 4 10 L 4 11 L 3 11 L 3 13 L 4 13 L 4 12 L 5 12 L 5 11 L 6 11 L 6 12 L 7 12 L 7 11 L 6 11 L 6 10 L 9 10 L 9 12 L 8 12 L 8 13 L 5 13 L 5 14 L 3 14 L 3 15 L 2 15 L 2 14 L 0 14 L 0 11 L 2 11 z M 18 11 L 20 11 L 20 12 L 18 12 z M 27 11 L 28 11 L 28 12 L 27 12 z M 9 12 L 11 12 L 11 13 L 9 13 z M 17 12 L 18 12 L 18 13 L 21 13 L 21 14 L 19 14 L 19 15 L 17 15 L 17 16 L 14 16 L 14 15 L 15 15 L 15 14 L 16 14 L 16 13 L 17 13 z M 22 13 L 25 13 L 25 14 L 27 14 L 27 15 L 23 15 L 23 14 L 22 14 z M 28 13 L 29 13 L 29 14 L 28 14 z M 6 14 L 7 14 L 7 15 L 6 15 z M 10 14 L 13 14 L 13 15 L 12 15 L 12 17 L 11 17 L 11 16 L 10 16 L 10 17 L 9 17 L 9 15 L 10 15 z M 0 15 L 1 15 L 1 17 L 2 17 L 2 18 L 1 18 L 1 21 L 0 21 z M 3 15 L 4 15 L 4 17 L 2 17 L 2 16 L 3 16 z M 19 15 L 22 15 L 22 16 L 20 16 L 20 18 L 18 18 L 18 19 L 17 19 L 17 18 L 16 18 L 16 17 L 17 17 L 17 16 L 19 16 z M 27 15 L 28 15 L 28 16 L 27 16 z M 6 16 L 8 16 L 8 18 L 10 18 L 10 19 L 9 19 L 9 21 L 10 21 L 10 22 L 9 22 L 9 23 L 8 23 L 8 21 L 5 21 L 5 20 L 8 20 L 8 19 L 6 19 L 6 18 L 7 18 L 7 17 L 6 17 z M 25 16 L 27 16 L 27 19 L 26 19 L 26 17 L 25 17 z M 4 17 L 6 17 L 6 18 L 4 18 z M 10 17 L 11 17 L 11 18 L 10 18 z M 12 17 L 15 17 L 15 18 L 16 18 L 16 19 L 14 19 L 14 20 L 13 20 L 13 21 L 12 21 L 12 19 L 13 19 L 13 18 L 12 18 z M 21 17 L 25 17 L 25 18 L 21 18 z M 28 17 L 29 17 L 29 18 L 28 18 z M 3 18 L 4 18 L 4 19 L 3 19 z M 20 18 L 21 18 L 21 19 L 20 19 z M 4 19 L 5 19 L 5 20 L 4 20 z M 21 19 L 22 19 L 22 20 L 21 20 z M 24 19 L 25 19 L 25 20 L 24 20 z M 27 19 L 28 19 L 28 20 L 29 20 L 29 22 L 27 22 L 27 23 L 25 23 L 25 21 L 26 21 L 26 20 L 27 20 z M 2 20 L 3 20 L 3 21 L 2 21 z M 14 20 L 18 20 L 18 21 L 19 21 L 19 22 L 20 22 L 20 24 L 19 24 L 19 23 L 18 23 L 18 22 L 17 22 L 17 24 L 16 24 L 16 23 L 15 23 L 15 22 L 16 22 L 16 21 L 14 21 z M 10 22 L 13 22 L 13 23 L 12 23 L 12 25 L 11 25 L 11 24 L 10 24 L 10 25 L 9 25 L 9 27 L 10 27 L 10 28 L 9 28 L 9 29 L 8 29 L 8 24 L 9 24 L 9 23 L 10 23 z M 14 23 L 15 23 L 15 24 L 14 24 z M 27 23 L 29 23 L 29 24 L 27 24 z M 17 24 L 18 24 L 18 25 L 19 25 L 19 26 L 18 26 L 18 27 L 17 27 L 17 26 L 16 26 L 16 25 L 17 25 z M 26 24 L 27 24 L 27 25 L 29 25 L 29 26 L 28 26 L 28 28 L 27 28 L 27 27 L 26 27 L 26 28 L 25 28 L 25 27 L 22 27 L 22 28 L 20 28 L 20 29 L 19 29 L 19 28 L 18 28 L 18 27 L 19 27 L 19 26 L 20 26 L 20 27 L 21 27 L 21 26 L 23 26 L 23 25 L 24 25 L 24 26 L 25 26 L 25 25 L 26 25 z M 12 25 L 15 25 L 15 26 L 16 26 L 16 27 L 14 27 L 14 28 L 13 28 L 13 29 L 12 29 L 12 27 L 13 27 L 13 26 L 12 26 z M 10 26 L 11 26 L 11 27 L 10 27 z M 16 27 L 17 27 L 17 28 L 16 28 z M 10 28 L 11 28 L 11 29 L 10 29 z M 14 28 L 16 28 L 16 29 L 14 29 z M 17 28 L 18 28 L 18 29 L 17 29 z M 24 28 L 25 28 L 25 29 L 24 29 z M 26 28 L 27 28 L 27 29 L 26 29 z"
      ></path>
      <path
        id="qr squares"
        d="M0,0h7h0v0v7v0h0h-7h0v0v-7v0h0zM1,1h5h0v0v5v0h0h-5h0v0v-5v0h0zM2,2h3h0v0v3v0h0h-3h0v0v-3v0h0z M22,0h7h0v0v7v0h0h-7h0v0v-7v0h0zM23,1h5h0v0v5v0h0h-5h0v0v-5v0h0zM24,2h3h0v0v3v0h0h-3h0v0v-3v0h0z M0,22h7h0v0v7v0h0h-7h0v0v-7v0h0zM1,23h5h0v0v5v0h0h-5h0v0v-5v0h0zM2,24h3h0v0v3v0h0h-3h0v0v-3v0h0zM20,20h5h0v0v5v0h0h-5h0v0v-5v0h0zM21,21h3h0v0v3v0h0h-3h0v0v-3v0h0zM22,22h1h0v0v1v0h0h-1h0v0v-1v0h0z"
        fillRule="evenodd"
        fillOpacity="1"
        fill="rgb(0, 0, 0)"
      ></path>
    </svg>
      </p>
    </div>`;

      const brighDataParent = el("div", "brighDataParent");
      brighDataParent.innerHTML = brighdataEl;
      settings_parent.appendChild(brighDataParent);
    } else {
      controles.set_current("main");
      controles.main.set_current("empty");
    }

    // const btn = el('p', '', 'user_centrics');
    // const userCentrics = `<a style="color: white; text-decoration: none;" href="#" onClick="UC_UI.showSecondLayer();">Update Privacy Settings</a>`;
    //
    // btn.innerHTML = userCentrics;
    //
    // settings_parent.appendChild(btn);
    root.appendChild(settings_parent);

    if (brighData && brighData.status) {
      controles.set_current("brighData");
      controles.brighData.move();
    }

    const toggle_brighdata = document.getElementById("toggle_brighdata");
    const brighdata_slider = document.getElementById("brighdata_slider");

    if (toggle_brighdata) {
      toggle_brighdata.addEventListener("click", () => {
        this.brighDataEnabled = !this.brighDataEnabled;
        brighdata_slider.classList.toggle("checked");

        if (brighData && brighData.status) {
          if (brighData.status.consent) {
            brighData && brighData.disable();
          } else {
            brighData && brighData.enable();
          }
        }
      });
    }
    SettingsPage.page_element = document.getElementById('settings_page');
    pages.page_objects.settings = SettingsPage.page_element;
  }

  /**
 * rendering the settings page layout
 */
  mounted() {
    this.render();
  }
}

export default SettingsPage;
