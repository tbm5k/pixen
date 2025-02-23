import { el } from "../../utils.js";

/**
    * @class StoreItem
    * @classdesc channel store items
    * @typedef {StoreItem}
    */
class StoreItem {
  /**
 * Creates an instance of StoreItem; receives position properties
 *
 * @constructor
 * @param {{ item: any; row_index: any; index: any; storeItemClick: any; }} param0
 * @param {*} param0.item
 * @param {*} param0.row_index
 * @param {*} param0.index
 * @param {*\} param0.storeItemClick
 */
constructor({ item, row_index, index, storeItemClick }) {
    this.item = item;
    this.row_index = row_index;
    this.index = index;
    this.storeItemClick = storeItemClick;
  }

  /**
 * ${1:Description placeholder}
 *
 * @returns {*}
 */
render() {
    const item = this.item;
    const item_parent = el("div", "store-item-parent store-item-ctrl");
    item_parent.setAttribute("data-item", this.index + 1);
    item_parent.setAttribute("data-row", this.row_index + 1);

    const item_image = el("img", "store-item-image");
    item_image.src = item.item_image;

    const item_title = el("div", "store-item-title");
    item_title.innerHTML = item.item_title;

    const item_price = el("div", "store-item-price");
    item_price.innerHTML = "$ " + item.item_retail_price;

    const scan_wrapper = el("div", "scan-wrapper");
    const scan_text_parent = el("div", "scan-text-parent");
    const scan_link = el("p", "scan-link");
    const scan_text = el("p", "scan-text");
    const scan_img = el("img", "scan-img");

    scan_link.innerHTML = item.short_link_url;
    scan_text.innerHTML = "Or scan the Qr code";
    scan_text_parent.appendChild(scan_link);
    scan_text_parent.appendChild(scan_text);

    const image = new Image();
    image.src = item.item_image;

    image.onload = () => {
      item_image.src = item.item_image;
    };

    scan_img.src = item.qr_img;
    scan_img.style.width = 10 + "rem";
    scan_img.style.height = 10 + "rem";

    scan_wrapper.appendChild(scan_text_parent);
    scan_wrapper.appendChild(scan_img);

    item_parent.appendChild(item_image);
    item_parent.appendChild(item_title);
    item_parent.appendChild(item_price);
    item_parent.appendChild(scan_wrapper);

    return item_parent;
  }
}

export default StoreItem;
