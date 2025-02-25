import controles from "../../remote/controles.js";
import pages from "../../remote/pages.js";
import { el, wheel_magic_control } from "../../utils.js";
import ChannelCard from "./channelCard.js";

/**
 * ${1:Description placeholder}
 *
 * @class CategoryCard
 * @typedef {CategoryCard}
 */
class CategoryCard {
  /**
 * Creates an instance of CategoryCard.
 *
 * @constructor
 * @param {*} options
 */
constructor(options) {
    this.category = options.category;
    this.categoryCardClick = options.categoryCardClick;
    this.row = options.row_index;
    this.index = options.index;
  }

  /**
 * ${1:Description placeholder}
 *
 * @returns {*}
 */
render() {
    const series_category_card = el(
      "div",
      "series-category__card series-item-ctrl"
    );

    series_category_card.setAttribute("data-index", this.index % 3);

    const series_category_card_name = el("div", "series-category-card__name");
    series_category_card_name.innerHTML = this.category.name;

    const image_el = el("img", "series-category-card__img");
    const image = new Image();
    image.src = this.category.thumbnail;

    image.onload = () => {
      image_el.src= ChannelCard.getCompressedImage(this.category.thumbnail, 528, 315);
    };

    image.onerror = () => {
      // image_el.src = appData.graphic.appLogo;
      image_el.src = this.category.thumbnail;
      image_el.classList.add("error");
    };

    series_category_card.appendChild(image_el);
    series_category_card.appendChild(series_category_card_name);

    series_category_card.addEventListener("click", () => {
      this.categoryCardClick(this.category);
    });

    series_category_card.onmouseover = this.seriesCardMouseOver;
    series_category_card.onwheel = (e) => {
      switch (pages.current) {
        case "series":
          wheel_magic_control(e, controles.main.series);
          break;
        default:
          break;
      }
    };

    return series_category_card;
  }

  /**
 * ${1:Description placeholder}
 */
seriesCardMouseOver() {
    controles.main.series.index = this.getAttribute("data-index");
    const parent = this.parentElement;
    const row_index = parseInt(parent.getAttribute("data-row")) - 1;
    controles.main.series.row = row_index;
    controles.main.series.move(true);
  }
}

export default CategoryCard;
