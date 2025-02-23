/**
 * Store page layout
 */

import StoreItem from "../components/common/storeItem.js";
import { el } from "../utils.js";

class StorePage {
  static page_element = null;
  /**
 * render Store page layout
 */
  render() {
    if (StorePage.page_element) {
      StorePage.page_element.remove();
      StorePage.page_element = null;
    }
    const root = document.getElementById("root");
    const store_parent = el("div", "page-parent store-parent", "store_page");
    store_parent.innerHTML = "";
    const store_title = el("h1", "page-title");
    store_title.innerHTML =
      appData.graphic.appName + `<span class='app-name__border'></span> Store`;
    const store_content_parent = el(
      "div",
      "store-content-parent",
      "store_content_parent"
    );

    store_parent.appendChild(store_title);
    store_parent.appendChild(store_content_parent);

    const store_page = Object.values(appData.menu.pages).find(
      (page) => page.page_client_class === "store"
    );
    const items = store_page.items;

    store_content_parent.appendChild(this.renderStoreItems(items));

    root.appendChild(store_parent);
    StorePage.page_element = document.getElementById('store_page');
    pages.page_objects.store = StorePage.page_element;
  }

  /**
 * render store items
 *
 * @param {*} items
 * @returns {*}
 */
  renderStoreItems(items) {
    const store_content_parent = el("div", "store-content-parent");

    for (let i = 0; i < Math.ceil(Object.keys(items).length / 4); i++) {
      const row = el("div", "store-content-row");
      row.setAttribute("data-row", i + 1);

      for (let j = 0; j < 4; j++) {
        const index = i * 4 + j;
        const item = items[index];
        if (item) {
          row.appendChild(
            new StoreItem({
              item,
              row_index: i,
              index,
              storeItemClick: (item) => this.storeItemClickHandler(item),
            }).render()
          );
        }
      }

      store_content_parent.appendChild(row);
    }

    return store_content_parent;
  }
}

export default StorePage;
