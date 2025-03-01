
import InfoModal from "./components/common/infoModal";
import Devices from "./services/deviceCenter";
import pages from "./remote/pages";
import GlobalAnalytics from "./services/globalAnalytics";
import Analytics from "./services/analytics";
import { displayLog } from "./components/ads";
import GoogleAnalytics from "./plugins/googleAnalytics";

/**
    * @function el
    * @description creates a html dom element
    * @param {*} tagName
    * @param {*} className
    * @param {*} id
    * @returns {*}
 */
function el(tagName, className, id) {
  var tag = document.createElement(tagName);

  if (className) tag.className = className;

  if (id) tag.id = id;

  return tag;
}

/**
 * element scroll
 *
 * @param {float} offset
 * @param {X or Y} xy
 * @param {float} time
 * @returns {px} type
 */


Element.prototype.scroll = function (offset, xy, time, type) {
    if (!this.offset) this.offset = 0;
    offset = parseInt(offset);
    cancelAnimationFrame(this.anim);
    this.offset = offset;
    this.style.transform = "translate" + xy + "(" + this.offset + type + ")";


  // if (!this.offset) this.offset = 0;
  //
  // var self = this;
  //
  // offset = parseInt(offset);
  //
  // cancelAnimationFrame(this.anim);
  //
  // var k = (this.offset - offset) / (time + 0.001);
  //
  // if (k < 0) k *= -1;
  //
  // self.anim = requestAnimationFrame(function animate() {
  //   if (self.offset == offset) return;
  //   if (self.offset < offset) {
  //     self.offset += k;
  //     if (self.offset > offset) self.offset = offset;
  //   } else {
  //     self.offset -= k;
  //     if (self.offset < offset) self.offset = offset;
  //   }
  //   console.log("scroll:", self.offset, offset)
  //   self.style.transform = "translate" + xy + "(" + self.offset + type + ")";
  //   self.anim = requestAnimationFrame(animate);
  // });
};

/**
 * use to remove the focus from actived item
 *
 * @param {*} className
 */
function remove_active_class(className) {
  var active;
  if (!className) {
    className = "active";
  }

  active = document.getElementsByClassName(className);

  for (var i = 0; i < active.length; i++) {
    active[i].classList.remove(className);
  }
}

/**
 * use to remove the focus styling from actived item
 *
 * @param {*} items
 * @param {*} color
 */
function remove_active_style(items, color) {
  for (var i = 0; i < items.length; i++) {
    items[i].style.color = color;
  }
}

/**
    * @function detect_page
    * @description returns the page details to the passed page path
    * @param {string} path
    * @returns {string}
 */
function detect_page(path) {
  if (window.appData?.menu?.pages) {
    const pages = appData.menu.pages;

    let current_page = "";

    const items = Object.values(pages);

    if (path === "home") {
      return items.find((page) => page.page_path === "/");
    }

    items.forEach((page) => {
      if (path == page.page_path.split("/")[1]) {
        current_page = page;
      }
    });

    return current_page;
  }
}

/**
 * ${1:Description placeholder}
 *
 * @param {*} data
 * @param {*} index
 * @param {*} each_row
 * @param {*} r
 * @param {*} row
 * @param {*} category_name
 */
function changeLastRowData(data, index, each_row, r, row, category_name) {
  const current_row_index = row + 3;

  each_row.style.top = `${current_row_index * 30.7}rem`;
  each_row.classList.remove("hidden");

  each_row.firstElementChild.innerHTML = category_name;

  const each_row_children = each_row.children[1].children[index];

  each_row_children.setAttribute("data-id", data.id);

  const img = each_row_children.children[0].firstElementChild;
  const title = each_row_children.children[1].firstElementChild;

  requestAnimationFrame(() => {
    // img.src = data.thumbnail;
    img.src = window.appImages[data.id];

    // img.src = window.appImages[data.id];

    title.innerHTML = data.title;
  });
}

/**
 * ${1:Description placeholder}
 *
 * @param {*} time
 * @returns {string}
 */
function convertTime(time) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time - hours * 3600) / 60);
  const seconds = Math.floor(time - hours * 3600 - minutes * 60);

  return `${hours ? hours + ":" : ""}${minutes < 10 ? "0" + minutes : minutes
    }:${seconds < 10 ? "0" + seconds : seconds}`;
}

/**
 * ${1:Description placeholder}
 *
 * @param {*} parent
 * @param {*} width
 * @param {*} direction
 * @param {*} transition
 * @param {*} rtl
 */
function translate_list(parent, width, direction, transition, rtl) {
  if (!direction) direction = "left";
  if (!transition) {
    displayLog(transition);
      transition = "0.3s";
  }

  var translate;

  if (rtl) {
    translate = `translateX(${width})`;
  } else {
    translate = `translateX(-${width})`;
  }

    displayLog("transform started")
  // parent.style.transition = "transform " + transition;
  parent.style.transform = translate;
    displayLog("transform ended")
}

/**
 * ${1:Description placeholder}
 *
 * @type {*}
 */
let wheel_interval = null;
/**
 * ${1:Description placeholder}
 *
 * @type {boolean}
 */
let isMoving = false;

/**
 * ${1:Description placeholder}
 *
 * @param {*} e
 * @param {*} fn
 */
function wheel_magic_control(e, fn) {
  if (!isMoving) {
    clearTimeout(wheel_interval);
    var delta = e.deltaY || e.detail || e.wheelDelta;
    if (delta > 0) {
      fn.down();
      isMoving = true
      wheel_interval = setTimeout(() => {
        isMoving = false
      }, 800);
    } else {
      fn.up();
      isMoving = true
      wheel_interval = setTimeout(() => {
        isMoving = false
      }, 800);
    }
  }
}

/**
 * ${1:Description placeholder}
 */
function application_exit() {
  try {
    const globalAnalytics = new GlobalAnalytics();
    const analytics = new Analytics(globalAnalytics);
    analytics.sendEvent("exitApp");
      GoogleAnalytics.sendEvent({name: "clicks", parameters: {
          CLICK: "DIALOG_EXIT"
      }});
    Devices.platformInstance.exitApp()
  } catch (error) {
    console.log(error)
  }
}

/**
 * ${1:Description placeholder}
 *
 * @param {*} key
 * @returns {*}
 */
function get_word(key) {
    return '';
  // return window.appData.translations[key] || key;
}

/**
 * ${1:Description placeholder}
 *
 * @param {*} item
 * @returns {*}
 */
function is_restricted(item) {
  const isoCode = window.settings.appSettings.isoCode;
  // const isoCode = "AM";

  if (item && item.restrictions && item.restrictions.geos) {
    const { whitelist_countries, blacklist_countries } = item.restrictions.geos;

    if (whitelist_countries) return !whitelist_countries.includes(isoCode);

    if (blacklist_countries) return blacklist_countries.includes(isoCode);
  }

  return false;
}

/**
 * ${1:Description placeholder}
 *
 * @param {*} key
 * @returns {*}
 */
function getItem(key) {
  if (window.localStorage) {
    return localStorage.getItem(key);
  }

  return sessionStorage.getItem(key);
}

/**
 * ${1:Description placeholder}
 *
 * @param {*} key
 * @param {*} value
 * @returns {*}
 */
function setItem(key, value) {
  if (window.localStorage) {
    return localStorage.setItem(key, value);
  }

  sessionStorage.setItem(key, value);
}

window.onoffline = function () {
    const infoModalOptions = {
        title:
        "You are not connected to the internet, please check your internet connection",
        hideButton: true,
        fullScreen: true,
    };
    new InfoModal(infoModalOptions);

  // const video = document.getElementById("video");
  //
  // if (pages.current === "player") {
  //   // video.pause();
  // }
};

window.ononline = function () {
    new InfoModal({
        title: "Network connection restored",
        hideAfterRestore: true,
    });

  // const video = document.getElementById("video");

  // if (pages.current === "player") {
  //   video.play();
  // }
};

document.addEventListener("visibilitychange", function () {
  const platformName = Devices.platformInstance.name;
  const video = document.getElementById("video");

  if (document.visibilityState === "hidden") {
    if (pages.current === "player") {
      if (platformName === "samsung") {
        window.webapis.avplay.suspend();
      } else {
        // video.pause();
      }
    }
  } else {
    if (pages.current === "player") {
      if (platformName === "samsung") {
        window.webapis.avplay.resume();
      } else {
        // video.play();
      }
    }
  }
});

/**
 * ${1:Description placeholder}
 *
 * @param {*} item
 * @param {*} itemsTitle
 * @param {*} index
 * @param {*} prevItem
 */
function set_item_color(item, itemsTitle, index, prevItem) {
  const firstPlaylist = Object.values(appData.playlists)[0];

  let itemTitleColor = "#fff";

  if (firstPlaylist) {
    if (firstPlaylist.graphic && firstPlaylist.graphic.title_color) {
      itemTitleColor = firstPlaylist.graphic.title_color;
    } else if (firstPlaylist.title_color) {
      itemTitleColor = firstPlaylist.title_color;
    } else {
      itemTitleColor = appData.graphic.mainColor;
    }
  }

  for (let i = 0; i < itemsTitle.length; i++) {
    if (i != index) {
      itemsTitle[i].style.color = itemTitleColor;
    }
  }

  if (prevItem) {
    prevItem.style.color = itemTitleColor;
  }

  if (item) {
    if (firstPlaylist.graphic && firstPlaylist.graphic.active_item_color) {
      itemsTitle[index].style.color = firstPlaylist.graphic.active_item_color;
    } else if (firstPlaylist.color) {
      itemsTitle[index].style.color = firstPlaylist.active_item_color;
    } else {
      itemsTitle[index].style.color = appData.graphic.activeItemColor;
    }
  } else {
    itemsTitle[index].style.color = "#fff";
  }
}

/**
 * ${1:Description placeholder}
 *
 * @param {*} titleColor
 * @param {*} activeTitleColor
 */
function assignColorCode(titleColor, activeTitleColor) {
  var styleString =
    `
      .channel-card__title {color: ${titleColor} !important;}
      .active .channel-card__title {color: ${activeTitleColor} !important;}
    `
  var styleTag = document.createElement("style");
  styleTag.appendChild(document.createTextNode(styleString));
  document.head.appendChild(styleTag);
}

function arrayToObject(arr, key) {
    return arr.reduce((acc, item) => {
        acc[item[key]] = item
        return acc;
    }, {})
}

    function isValidMediaFile(filename) {
        const filePattern = /\.(mp4|mov|wmv|avi|flv|mkv|webm|m4v|3gp|mpeg|mpg|ogv|vob|mts|m2ts|rmvb|f4v|divx|ts|mp3|wav|flac|aac|ogg|wma|m4a|alac|aiff|dsd|pcm|amr|opus|au|mid|midi|m3u8)/i;
        const valid = filePattern.test(filename);
        return valid;
    }

    async function isVideoValid (url) {
        try {

            // whitelist fashion tv
            if(appData.Info.family_hash == "4fpgggl6py") return true;
            if(!isValidMediaFile(url)) return false;

            const controller = new AbortController();
            const {signal} = controller;

            // prevent certificate error
            if(Devices.platformInstance.name === 'zeasn' && url.startsWith('https')){
                url = url.replace('https', 'http');
                console.log('manipulated', url);
            }

            const response = await fetch(url, {signal});
            const type = response.headers.get('Content-Type');

            if (response.ok && /video|mpegurl|application\/x-mpegURL/.test(type || '')) {
                controller.abort();
                return true
            }

            controller.abort();
            return false
        } catch (err) {
            console.log('error:', err);
            return false;
        }
    }


export {
    isVideoValid,
  el,
  remove_active_class,
  remove_active_style,
  detect_page,
  getItem,
  setItem,
  wheel_magic_control,
  changeLastRowData,
  translate_list,
  convertTime,
  is_restricted,
  application_exit,
  get_word,
  set_item_color,
  assignColorCode,
    arrayToObject
};
