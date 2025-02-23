import { el } from "../utils";

/**
    *
    * @function loader
    * @description loader component
    * @returns {*}
    */
export const loader = () => {
  const app_loader = el("div", "app-loader", "app_loader");

  const loader_parent = el("div", "loader-parent", "loader_parent");
  const loader_item1 = el("div", "loader-item1", "loader_item1");
  const loader_item2 = el("div", "loader-item2", "loader_item2");

  const video_loader_img = window.appData?.graphic?.loader_image;

  if (video_loader_img) {
    const loader_img = el("img", "loader-img", "loader_img");
    loader_img.src = video_loader_img;

    loader_parent.appendChild(loader_img);
  } else {
    loader_parent.appendChild(loader_item1);
    loader_parent.appendChild(loader_item2);
  }

  app_loader.appendChild(loader_parent);

  return app_loader;
};
