/**
 * Seires SideBar layout
 */

import HubPage from "../pages/hub.js";
import controles from "../remote/controles.js";
import { el } from "../utils.js";

/**
 * Left Side Bar on the series category page.
 *
 * @class SeriesSidebar
 * @typedef {SeriesSidebar}
 */
class SeriesSidebar {
  render() {
    const series_sidebar = el("div", "series-sidebar", "series_sidebar");
    // series_sidebar.style.backgroundColor = appData.menu.graphics.menu_background_color;
    // series_sidebar.style.opacity = appData.menu.graphics.menu_background_opacity;
    series_sidebar.style.backgroundColor = "#000";
    series_sidebar.style.opacity = 0.5;
    const back_icon_parent = el("div", "back-icon-parent back-icon-ctrl");

    const back_svg = `
    <svg xmlns="http://www.w3.org/2000/svg" class="back-svg" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
    `;

    back_icon_parent.innerHTML = back_svg;
    series_sidebar.appendChild(back_icon_parent);

    back_icon_parent.onclick = SeriesSidebar.backClick.bind(this);
    back_icon_parent.onmouseover = this.backMouseOver.bind(this);

    return series_sidebar;
  }

  /**
 * handle back button clicking on the series category page
 */
  static backClick = function () {
    HubPage.page_element.remove();
    HubPage.page_element = null;
    pages.set_current("series");
    const sidebar_parent = document.getElementById("sidebar_root");
    const series_sidebar = document.getElementById("series_sidebar");
    sidebar_parent.classList.remove("hidden");
    series_sidebar.remove();
    controles.main.series.move();

      const sidebar = document.getElementById("sidebar");
      sidebar.style.display = "block";
  }

  backMouseOver() {
    controles.main.set_current("series_channels_back");
    controles.main.series_channels_back.move();
  }
}

export default SeriesSidebar;
