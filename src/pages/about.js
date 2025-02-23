/**
 * About page layout
 */

import { el, detect_page } from "../utils";

class AboutPage {
  /**
 * Creates an instance of AboutPage.
 *
 * @constructor
 */
  constructor() {
    this.data = {
      title: "About",
      page: "about",
    };

    this.page = detect_page(this.data.page);
  }
  /**
 * page_element: page element
 *
 * @static
 * @type {*}
 */
  static page_element = null;

  render() {
    if (AboutPage.page_element) {
      AboutPage.page_element.remove();
      AboutPage.page_element = null;
    }
    var root = document.getElementById("root");

    var about_parent = el("div", "page-parent about-parent", "about_page");

    about_parent.innerHTML = "";

    const about_content = el("div", "about-content", "about_content");

    var about_title = el("h1", "page-title");
    about_title.innerHTML =
      appData.graphic.appName +
      `<span class='app-name__border'></span>` +
      this.page.page_title;
    const about_bg = el("img", "about-bg");
    about_bg.src = this.page.page_image;

    const about_description_parent = el("div", "about-description-parent");
    const about_description = el("p", "about-description", "about_description");
    about_description.innerHTML = this.page.page_descrtipion;

    about_parent.appendChild(about_title);
    about_description_parent.appendChild(about_description);
    about_content.appendChild(about_description_parent);
    about_parent.appendChild(about_bg);

    const about_content_wrapper = el("div", "about-content-wrapper");
    const about_content_parent = el("div", "about-content-parent");

    if (this.page && this.page.items) {
      this.page.items.forEach((item) => {
        const about_content_item = el("div", "about-content-item");
        const about_content_item_img = el("img", "about-content-item__img");
        const about_qr_img = el("img", "about-qr-img");
        const about_content_item_title = el("p", "about-content-item-title");
        const about_short_link = el("p", "about-sub-title");

        about_content_item_img.src = item.item_image;
        about_qr_img.src = item.qr_img;
        about_content_item_title.innerHTML = item.item_sub_type_id_name;
        about_short_link.innerHTML = item.short_link_url;

        about_content_item.appendChild(about_content_item_img);
        about_content_item.appendChild(about_content_item_title);
        // about_content_item.appendChild(about_qr_img);
        about_content_item.appendChild(about_short_link);
        about_content_parent.appendChild(about_content_item);
      });
    }

    about_content_wrapper.appendChild(about_content_parent);

    about_content.appendChild(about_content_wrapper);

    about_parent.appendChild(about_content);

    root.appendChild(about_parent);
    AboutPage.page_element = document.getElementById('about_page');
    pages.page_objects.about = AboutPage.page_element;
  }

  /**
 * render AboutPage
 */
  mounted() {
    this.render();
  }
}

export default AboutPage;
