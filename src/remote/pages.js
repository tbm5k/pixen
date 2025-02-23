/**
 * Page Navigation
*/

import HashesPage from "../pages/hashes.js";
import Sidebar from "../layouts/sidebar.js";
import HomePage from "../pages/home.js";
import SearchPage from "../pages/search.js";
import AboutPage from "../pages/about.js";
import SettingsPage from "../pages/settings.js";
import SeriesPage from "../pages/series.js";
import HubPage from "../pages/hub.js";
import StorePage from "../pages/store.js";
import { move } from "./keys.js";
import controles from "./controles.js";
import GlobalAnalytics from "../services/globalAnalytics.js";
import { detect_page } from "../utils.js";
import SpeechText from "../components/speechText.js";
import GoogleAnalytics from "../plugins/googleAnalytics.js";

window.pages = {
  current: "",
  page_data: null,
  previous: "",
  pageVisited: false,
  page_objects: {},

  /**
   * set current page name
  */
  set_current: function (current, page_data = null) {
    if (!current) current = "home";

    const current_page = detect_page(current);
    const globalAnalytics = new GlobalAnalytics();

    if (this.pageVisited) {
        globalAnalytics.sendEvent("pageVisit", {
            page_ID: current_page?.page_id || null,
            page_title: current_page?.page_title || "home",
        });

    }

    this.pageVisited = true;

    if (current !== "hashes") {
      Sidebar.hide();
    }

    if (SeriesPage.page_element != null && this.current === current) {
      SeriesPage.page_element.remove();
      SeriesPage.page_element = null;
    }

    /**
        prevent the set current page action if the screen is already rendered
    */
    if (current != this.current) {
      switch (this.current) {
        case 'series':
          if (current != 'hub' && current != 'player') {
            SeriesPage.page_element.remove();
            SeriesPage.page_element = null;
          }
          break;
        case 'hub':
          if (current != 'series' && current != 'player') {
            SeriesPage.page_element.remove();
            SeriesPage.page_element = null;
          }
          break;
        case 'player':
          break;
      }
      switch (current) {
        case "hub":
          if (this.current != 'player') {
            if (HubPage.page_element) {
              HubPage.page_element.remove();
              HubPage.page_element = null;
            }
          }
          break;
        case 'search':
          if (this.current != 'player') {
            if (SearchPage.page_element) {
              SearchPage.page_element.remove();
              SearchPage.page_element = null;
            }
          }
          break;
      }
      if (page_data != null) {
        this[this.current].hide();
      }
      if (this.page_objects[this.current])
        this.page_objects[this.current].style.display = 'none';
      if (this.page_objects[current])
        this.page_objects[current].style.display = 'block';
      this.previous = this.current;
    }
    this.page_data = page_data;
    this.current = current;
    this[current].show();
  },
  /**
    * back to previous page
   */
  set_previous: function () {
    this.set_current(this.previous);
      // FIX: if previous is hub, hide sidebar
      if(this.current === 'hub'){
          const sidebar = document.getElementById("sidebar");
          sidebar.style.display = "none";
      }
  },

  /**
      * Show/Hide Hashes page
  */
  hashes: {
    show: function () {
      new HashesPage().render();
    },

    hide: function () {
      // destroy
    },
  },
  /**
      * Show/Hide Home page
  */
  home: {
    show: function () {
      if (!HomePage.rendered_already)
        window.home_page_obj = new HomePage();
      window.home_page_obj.mounted();

    },

    hide: function () {
      // destroy
    },
  },

  /**
       * Show/Hide Search page
   */
  search: {
    show: function () {
      new SearchPage().mounted();
      controles.set_current("main");
      controles.main.set_current("search");
      move();
    },

    hide: function () {
      // destroy
    },
  },

  /**
        * Show/Hide About page
    */
  about: {
    show: function () {
      new AboutPage().mounted();
      controles.set_current("main");

      const about_description = document.getElementById("about_content");

      SpeechText.read(about_description.innerText)

      const height = about_description.offsetHeight;

      if (height > 850) {
        controles.main.set_current("about");
        controles.main.about.move();
      } else {
        controles.main.set_current("empty");
      }
    },

    hide: function () {
      // destroy
    },
  },

  /**
      * Show/Hide Settings page
  */
  settings: {
    show: function () {
      new SettingsPage().mounted();
      const settings_description = document.getElementById("settings_page");
      SpeechText.read(settings_description.innerText)
    },

    hide: function () { },
  },

  /**
      * Show/Hide Player page
  */
  player: {
    show: function () {},
    hide: function () {},
  },

  /**
      * Show/Hide Series page
  */
  series: {
    show: function () {

      new SeriesPage().render();
      controles.set_current("main");
      controles.main.set_current("series");
      controles.main.series.move();
    },
    hide: function () {
      // destroy
    },
  },

  /**
      * Show/Hide Hub page
  */
  hub: {
    show: function () {
      new HubPage().render();
      controles.set_current("main");
      controles.main.set_current("series_channels");
      controles.main.series_channels.move();
    },
    hide: function () {

    },
  },

  /**
      * Show/Hide Store page
  */
  store: {
    show: function () {
      new StorePage().render();
      controles.set_current("main");
      controles.main.set_current("store");
      controles.main.store.move();
    },
    hide: function () {
      // destroy
    },
  },
};

export default pages;
