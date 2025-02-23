/**
 * Series page layout
 */

import { el, setItem } from "../utils.js";
import CategoryCard from "../components/common/categoryCard";
import pages from "../remote/pages.js";
import ChannleGrid from "../components/common/channelGrid.js";

/**
 * @class SeriesPage
 * @typedef {SeriesPage}
 */
class SeriesPage {
  /**
 *use to avoid re-rendering of series page
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
 * Creates an instance of SeriesPage.
 *
 * @constructor
 */
  constructor() {

  }

  /**
 * rendering the series layout
 */
  render() {
    if (SeriesPage.page_element)
      return;
    const root = document.getElementById("root");
    const categories = Object.values(appData.categories);

    const series_page = pages.page_data || Object.values(appData.menu.pages).find(
      (page) => page.page_client_class === "hub"
    );

    const series_parent = el(
      "div",
      "page-parent series-parent",
      "series_parent"
    );
    const series_page_title = el("h1", "page-title");
    const series_content_main = el("div", "series-content-main");
    const series_content_wrapper = el("div", "series-content-wrapper");
    const series_content_parent = el(
      "div",
      "series-content-parent",
      "series_content_parent"
    );

    series_page_title.innerHTML =
      appData.graphic.appName + `<span class='app-name__border'></span> ${series_page.menu_title || "Series"}`;

    series_content_wrapper.appendChild(series_content_parent);
    series_content_main.appendChild(series_content_wrapper);
    series_parent.appendChild(series_page_title);
    series_parent.appendChild(series_content_main);

    const filteredCategoryItems = [];
      series_page.categories.forEach(key => {
        const category = appData.categories[key];
        if(category && category.playlist_ids) {
            filteredCategoryItems.push(category);
        }
    });

    // for (let i = 0; i < Math.ceil(series_page.categories.length / 3); i++) {
        let oindex = 0;
        for (let i = 0; i < Math.ceil(filteredCategoryItems.length / 3); i++) {
            const row = el("div", "series-content-row");

            const subList = filteredCategoryItems.slice(oindex, oindex + 3);
            for (let j = 0; j < subList.length; j++) {
                oindex++;
                const index = i * 3 + j;
                const category = subList[j]
                row.setAttribute("data-row", i + 1);
                row.appendChild(new CategoryCard({
                    category,
                    row_index: i,
                    index,
                    categoryCardClick: (category) =>
                    this.categoryCardClickHandler(category),
                }).render());
            }

            series_content_parent.appendChild(row);
        }

    root.appendChild(series_parent);
    SeriesPage.page_element = document.getElementById('series_parent');
    pages.page_objects.series = SeriesPage.page_element;
    controles.main.series.row = 0;
    controles.main.series.index = 0;
  }

  /**
 * Handle the clicking event on the category item
 *
 * @param {*} category
 */
  categoryCardClickHandler(category) {
    setItem("current_category", category.entity_id);
    pages.set_current("hub");

      const sidebar = document.getElementById("sidebar");
      sidebar.style.display = "none";
  }
}

export default SeriesPage;
