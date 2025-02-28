/**
 * SideBar layout
 */

import controles from "../remote/controles.js";
import pages from "../remote/pages.js";
import ModalComponent from "../components/modal.js";
import { move } from "../remote/keys.js";
import { el, remove_active_style, get_word } from "../utils.js";
import GoogleAnalytics from "../plugins/googleAnalytics.js";

/**
 * Sidebar on the home page
 *
 * @returns
 */
function Sidebar() {
    this.data = {
        sidebar_items: [],

        // top_image_open_menu: appData.menu.graphics.top_image_open_menu,
        // top_image_close_menu: appData.menu.graphics.top_image_close_menu,
        // bottom_image_open_menu: appData.menu.graphics.bottom_image_open_menu,
        // bottom_image_close_menu: appData.menu.graphics.bottom_image_close_menu,

        top_image_open_menu: 'open',
        top_image_close_menu: 'close',
        bottom_image_open_menu: 'botton open',
        bottom_image_close_menu: 'botton close',
    };

  function getItemHeight(size) {
    return Math.max(3 - ((size - 8) * 0.1), 2);
  }

    // const {
    //     menu_text_color,
    //     menu_text_color_hover,
    //     menu_background_color,
    //     menu_background_opacity,
    //     menu_text_color_selected,
    // } = appData.menu;

    const menu_text_color = "#fff";
    const menu_text_color_hover = "red";
  this.methods = {
    exitModalHandler: function () {
      Sidebar.hide();

      new ModalComponent({
        title: "Exit",
        content: "Are you sure you want to exit?",
      });

      controles.set_current("modal");
      move();
    },
    // handle the event when clicking a side bar item
    sidebarItemClick: function (items, index) {
        const item = items[index];
        // var page_path = item.page_path.replace("/", "");

        // if (item.page_path == "/")
        //     page_path = "home";

        // if (!item.page_path) {
        //     if (item.page_client_class === "hub") {
        //         page_path = "series";
        //     } else if (item.page_client_class === "store") {
        //         page_path = "store";
        //     }
        // }

        if (item == pages.current) return Sidebar.hide();
        GoogleAnalytics.sendEvent({name: "page_navigation", parameters: {
            PAGE: item.toUpperCase(),
        }})

        pages.set_current(item);

        var sidebar_items = document.getElementsByClassName("sidebar-list__item");
        for (let i = 0; i < sidebar_items.length; i++) {

            sidebar_items[i].style.borderRightColor = "transparent";

            if (i == index) {
                sidebar_items[i].style.borderRightColor = menu_text_color_hover;
                sidebar_items[i].classList.add("selected");
            }
        }
    },

    render: function () {
      var root = document.getElementById("sidebar_root");
      var sidebar_parent = el("div", "sidebar-parent", "sidebar_parent");
      var opened_sidebar = el("div", "opened-sidebar", "opened_sidebar");
      var sidebar_wrapper = el("div", "sidebar-wrapper");
      var sidebar = el("div", "sidebar-small", "sidebar");
      var sidebar_icons_parent = el("ul", "sidebar-icons__parent");
      var sidebar_logo = el("div", "sidebar-logo");

      // Side Bar top logo
      var sidebar_large_logo = el("div", "sidebar-large__logo");
      sidebar_large_logo.style.backgroundImage = "url(" + this.data.top_image_open_menu + ")";

      if (this.data.bottom_image_close_menu) {
        var sidebar_bottom_logo = el("div", "sidebar-bottom__logo");
        var sidebar_bottom_large_logo = el("div", "sidebar-bottom-large__logo");

        sidebar_bottom_logo.style.backgroundImage = "url(" + this.data.bottom_image_close_menu + ")";
        sidebar_bottom_large_logo.style.backgroundImage = "url(" + this.data.bottom_image_open_menu + ")";

        sidebar.appendChild(sidebar_bottom_logo);
        sidebar.appendChild(sidebar_bottom_large_logo);
      }

        const items = ['home', 'search', 'categories'];
      for (var i = 0; i < items.length; i++) {
        var sidebar_list_item = el("li", "sidebar-list__item");
        var sidebar_item_name = el("p", "sidebar-icon__name sidebar-icon__name" + (i + 1));

        sidebar_list_item.setAttribute("page_id", items[i]);

        if (i == 0) {
            sidebar_list_item.style.borderRightColor = menu_text_color_hover;
            sidebar_list_item.classList.add("selected");
        }

        sidebar_list_item.style.color = menu_text_color;

        sidebar_item_name.innerHTML = items[i];

        sidebar_list_item.appendChild(sidebar_item_name);
        sidebar_icons_parent.appendChild(sidebar_list_item);



        sidebar_list_item.onclick = this.methods.sidebarItemClick.bind(
          this,
          items,
          i
        );

        sidebar_list_item.onmouseover = function () {
          const items = document.getElementsByClassName("sidebar-icon__name");
          remove_active_style(items, menu_text_color);
          this.childNodes[0].style.color = menu_text_color_hover;
        };
      }

      // exist item in the side bar
      var exit_item = el("li", "sidebar-list__item");
      var exit_item_name = el("p", "sidebar-icon__name sidebar-icon__name5");
      exit_item_name.innerHTML = get_word("exit");

      exit_item.appendChild(exit_item_name);
      exit_item.onclick = this.methods.exitModalHandler;
      sidebar_icons_parent.appendChild(exit_item);

      exit_item.onmouseover = function () {
        const items = document.getElementsByClassName("sidebar-icon__name");
        remove_active_style(items, menu_text_color);
        this.childNodes[0].style.color = menu_text_color_hover;
      };

      sidebar.appendChild(sidebar_logo);
      sidebar.appendChild(sidebar_large_logo);

      sidebar.appendChild(sidebar_icons_parent);

      sidebar_parent.appendChild(sidebar);
      root.appendChild(sidebar);
      root.appendChild(sidebar_wrapper);
      root.appendChild(opened_sidebar);
    },
  };

  this.mounted = function () {
    this.methods.render.apply(this);
  };

  this.destroy = function () {
    // destroy
  };
}

/**
 * Use to open side bar
 */

Sidebar.show = function () {
  const sidebar_items = document.getElementsByClassName("sidebar-list__item");
  for (var i = 0; i < sidebar_items.length; i++) {
    if (sidebar_items[i].classList.contains("active_page")) {
      controles.sidebar.index = i;
      break;
    }
  }
  sidebar_root.classList.add("show");
  controles.set_current("sidebar");
  move();
};

/**
 * Use to close side bar
 */
Sidebar.hide = function () {
  sidebar_root.classList.remove("show");
  controles.set_current("main");
  // move();
};

export default Sidebar;
