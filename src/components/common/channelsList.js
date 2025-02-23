import ChannelCard from "./channelCard";
import { el, getItem, wheel_magic_control } from "../../utils";
import controles from "../../remote/controles";
import HlsPlayer from "./hls";
import HomeHeader from "../home/homeHeader";
import HomePage from "../../pages/home";
import Player from "../../pages/player";

class ChannelsList {
  constructor(options) {
    this.activeIndex = options?.activeIndex || 0;
    this.entityArray = options.entityArray;
    this.className = options.className;
    this.cardMouseOverHandler = options.cardMouseOver;
    this.listMouseOverHandler = options.listMouseOver;
    this.myListArray = [];
    this.continueWatchingArray = [];
    this.checkMyList();
    this.checkContinueWatching();
    this.cardClickHandler = null;
    this.cardClickHandler = options.cardClickHandler;
    this.channelListCallback = options.channelListCallback;
    this.isMovieCarousel = false; // for positioning the channels list
    this.is_movie_carousel = false; // for checking if the current channel type is movie_carousel

    ChannelsList.cardOnClick = this.cardClickHandler;
    ChannelsList.cardOnMouseOver = this.cardMouseOver;
    this.startRow = pages.previous == "home" ? controles.main.home.row : 0;
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {number}
 */
static startRow = 0;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {number}
 */
static endRow = 5;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {number}
 */
static currentRow = 0;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {boolean}
 */
static isMyListVisible = false;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {{}\}
 */
static channelsData = [];
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {*}
 */
static cardOnClick = null;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {*}
 */
static cardOnMouseOver = null;

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @param {*} item
 * @param {*} i
 * @param {*} cardClickHandler
 * @returns {*}
 */
static renderRows(item, i, cardClickHandler) {
    let row_counter = 0;

    if (!item?.videos) return
    const channel_list_item = el("div", "channels-list__item");


    const channel_list_content = el("div", "channels-list__content");
    channel_list_content.style.width = `${item.videos.length * 32.6}rem`;

    channel_list_content.setAttribute("active_index", 0);
    // channel_list_item.setAttribute("entity_id", item.entity_id);
    channel_list_item.setAttribute("entity_id", i);
    // channel_list_content.setAttribute("entity_id", item.entity_id);

    const category_name = el("h2", "category-name");
    category_name.style.color = "#ffffff";
    category_name.innerHTML = item.name;

    if (item.keyword === "movie_carousel") {
        channel_list_content.classList.add("movie-carousel");
        this.isMovieCarousel = true;
    }

    if (item.keyword === "movie_carousel") {
        this.is_movie_carousel = true;
    } else {
        this.is_movie_carousel = false;
    }
    if(this.startRow==0)  this.startRow = pages.previous == "home" ? controles.main.home.row : 0;
    let render_count = 8;
    if (this.startRow == i && controles.main.home.index > render_count)
        render_count = Math.ceil((controles.main.home.index + 1) / 8) * 8
    // let render_index = this.startRow == i ? controles.main.home.index : 0
    // const render_index = 0
    for(let index = 0; index < item.videos.length; index++){
        const video = item.videos[index];
        const channel_card = ChannelsList.renderCardHandler(
            video,
            index,
            row_counter,
            cardClickHandler
        );
        if (channel_card) {
            channel_list_content.appendChild(channel_card);
        }
        if (this.channelListCallback) {
            this.channelListCallback(this.isMovieCarousel);
        }
    }
    // for (let index = render_index; index < render_count; index++) {
    //     // const channel_el = appData.content[item.itemIds[index]];
    //     const channel_el = appData.content[item.itemIds[index]];
    //     const channel_card = ChannelsList.renderCardHandler(
    //         channel_el,
    //         index,
    //         row_counter,
    //         cardClickHandler
    //     );
    //     if (channel_card) {
    //         channel_list_content.appendChild(channel_card);
    //     }
    //     if (this.channelListCallback) {
    //         this.channelListCallback(this.isMovieCarousel);
    //     }
    // }

    row_counter++;

    channel_list_item.appendChild(category_name);

    channel_list_item.appendChild(channel_list_content);

    return channel_list_item;
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @param {*} channel_el
 * @param {*} index
 * @param {*} row_counter
 * @param {*} cardClickHandler
 * @returns {*}
 */
static renderCardHandler(channel_el, index, row_counter, cardClickHandler) {
    let channel_card = null;

    if (channel_el) {
      channel_card = new ChannelCard({
        id: channel_el.video_id,
        title: channel_el.title,
        description: channel_el.description,
        thumbnail: channel_el.thumbnail,
        index,
        row: row_counter,
        duration: channel_el.duration,
        resolution: '',
        parental_control: null,
        isMovieCarousel: this.is_movie_carousel,
        cardClickHandler: (elem) => cardClickHandler ? cardClickHandler(channel_el) : () => { ChannelsList.cardOnClick(channel_el) },
        cardMouseOver: (idx, data, target) =>
          ChannelsList.cardOnMouseOver(idx, data, target),
      }).render();
    }
    return channel_card;
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} item
 * @returns {*}
 */
renderMyList(item) {
    const channel_list_item = el("div", "channels-list__item");

    channel_list_item.style.position = "static";

    channel_list_item.style.top = 0;

    const channel_list_content = el("div", "channels-list__content empty");
    channel_list_content.setAttribute("active_index", 0);
    channel_list_content.setAttribute("entity_id", item.entity_id);
    const category_name = el("h2", "category-name");
    const empty_text = el("p", "empty-list__text", "empty_text");
    empty_text.innerHTML = "Everything you added to your list will be here";

    channel_list_content.appendChild(empty_text);
    category_name.style.color = item.title_color;
    category_name.innerHTML = item.name;
    channel_list_item.appendChild(category_name);
    channel_list_item.appendChild(channel_list_content);
    return channel_list_item;
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} item
 * @returns {*}
 */
renderContinueWatchingList(item) {
    const channel_list_item = el("div", "channels-list__item");

    channel_list_item.style.position = "static";

    channel_list_item.style.top = 0;

    const channel_list_content = el("div", "channels-list__content empty");
    channel_list_content.setAttribute("active_index", 0);
    channel_list_content.setAttribute("entity_id", item.entity_id);
    const category_name = el("h2", "category-name");

    category_name.style.color = item.title_color;
    category_name.innerHTML = item.name;
    channel_list_item.appendChild(category_name);
    channel_list_item.appendChild(channel_list_content);
    return channel_list_item;
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} suffix
 * @returns {*}
 */
render(suffix) {
    let id = 'channels_list_parent'
    if (suffix)
      id = "channels_list_parent" + "_" + suffix;


    const channels_list_parent = el(
      "div",
      "channels-list__parent",
      id,
    );

    if (this.className) {
      channels_list_parent.classList.add(this.className);
    }

    let appPlaylists = this.entityArray;

    let channels_data = appPlaylists;

    const playlists = appPlaylists;
    const myList = playlists.find((item) => item.feature_client === "my_list");
    const continueWatching = playlists.find(
      (item) => item.feature_client === "continue_watching"
    );

    if (myList) {
      myList.itemIds = this.myListArray;
      ChannelsList.isMyListVisible = true;
    }

    if (continueWatching) {
      continueWatching.itemIds = this.continueWatchingArray;
    }

    let sortedChannelsData = channels_data.filter(
      (item) => item.feature_client !== "my_list"
    );

    if (myList) {
      sortedChannelsData.unshift(myList);
    }

    if (continueWatching) {
      sortedChannelsData = sortedChannelsData.filter(
        (item) => item.feature_client !== "continue_watching"
      );
      sortedChannelsData.unshift(continueWatching);
    }

    let itemsLength = sortedChannelsData.length

    ChannelsList.channelsData = sortedChannelsData;
    if (pages.current == 'home') {
        // TODO: paginate home page data
        // We need a limit, the first set will be rendered while the others stored
        // in the global variable. On down, we fetch more playlists as per the limit
        const temp = sortedChannelsData;
        sortedChannelsData = [];
        temp.forEach(content => {
            if(!content.feature_client) {
                sortedChannelsData.push(content);
            } else if (content.feature_client && content.itemIds.length > 0) {
                sortedChannelsData.push(content);
            }
        });

        HomePage.channelsData = sortedChannelsData;
        window.home_channels_data = sortedChannelsData;

        itemsLength = sortedChannelsData.length;
    }
    else if (pages.current == 'player')
      Player.channelsData = sortedChannelsData;



    for (let i = this.startRow; i < itemsLength; i++) {
      const item = sortedChannelsData[i];
        if (item.videos?.length) {
          channels_list_parent.appendChild(ChannelsList.renderRows(item, i, this.cardClickHandler.bind(this)));
      }
    }

    channels_list_parent.onwheel = (e) => {
      switch (pages.current) {
        case "player":
          wheel_magic_control(e, controles.player.player_list);
          break;
        default:
          wheel_magic_control(e, controles.main.home);
          break;
      }
    };

    channels_list_parent.onmouseenter = (e) => {
      e.stopPropagation();
      if (this.listMouseOverHandler) {
        this.listMouseOverHandler(true);
      }
    };

    channels_list_parent.onmouseleave = (e) => {
      e.stopPropagation();
      if (this.listMouseOverHandler) {
        this.listMouseOverHandler(false);
      }
    };

    return channels_list_parent;
  }

  /**
 * ${1:Description placeholder}
 */
checkMyList() {
    if (getItem("myList")) {
      const myListArr = JSON.parse(getItem("myList") || "[]");
      this.myListArray = myListArr;
    }
  }

  /**
 * ${1:Description placeholder}
 */
checkContinueWatching() {
    if (getItem("continueWatchingList")) {
      const continueWatchingArr = JSON.parse(
        getItem("continueWatchingList") || "[]"
      );
      if (continueWatchingArr && continueWatchingArr.length > 0) {
        continueWatchingArr.forEach((item) => {
          if (item.time) {
            const channel = appData.content[item.id];

            if (channel) {
              this.continueWatchingArray.push(channel.id);
            }
          }
        });
      }
    }
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} item
 */
static cardClickHandler = (item) => {
    const channel = appData.content[item.id];
    const nextChannel =
      appData.content[Object.keys(appData.content)[item.index + 1]];

    if (pages.current == "player" && !Player.isLiveStreaming) {
      const video = document.getElementById("video");
      const id = video.getAttribute("data-id");

      if (!channel.is_live_streaming) {
        HlsPlayer.addToContinueWatchingList(id, video.currentTime);
      }
    }

    pages.set_current("player");
    window.player_obj = new Player(channel, nextChannel);
    window.player_obj.render();
  };

  /**
 * ${1:Description placeholder}
 *
 * @param {*} idx
 * @param {*} data
 * @param {*} target
 */
cardMouseOver = (idx, data, target) => {
    if (this.cardMouseOverHandler) {
      this.cardMouseOverHandler(idx, data, target);
    }
  };
}

export default ChannelsList;
