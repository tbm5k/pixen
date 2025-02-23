import ChannelCard from "./channelCard";
import { el, isVideoValid, remove_active_class, wheel_magic_control } from "../../utils";
import { move } from "../../remote/keys";
import Player from "../../pages/player";
import InfoModal from "./infoModal";
import DetailedPopup from "../detailedPopup";
import ChannelInfo from "../ChannelInfo";
import Keyboard from "./Keyboard";
import GoogleAnalytics from "../../plugins/googleAnalytics";
import HlsPlayer from "./hls";

/**
 * ${1:Description placeholder}
 *
 * @class ChannleGrid
 * @typedef {ChannleGrid}
 */
class ChannleGrid {
  /**
 * Creates an instance of ChannleGrid.
 *
 * @constructor
 * @param {*} options
 */
  constructor(options) {
    this.channels = options.channels;
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} index
 * @param {*} row_index
 * @param {*} idx
 */
  cardMouseOver = (index, row_index, idx) => {
    if (controles.main.search.current == "search_input") {
      const input = document.getElementById("search_input");
      var has_focus = document.activeElement === input;
      if (!has_focus) {
        controles.main.search.set_current("search_results");
        controles.main.search.search_results.row = row_index;
        controles.main.search.search_results.index = idx;
        move();
      }
    } else {
      controles.main.search.search_results.index = index;
      const items = document.getElementsByClassName("channel-item-ctrl");

      remove_active_class("active")

      controles.main.search.search_results.row = row_index;
      controles.main.search.search_results.index = idx;
    }
  };

  /**
 * ${1:Description placeholder}
 *
 * @param {*} item
 */
  cardClickHandler = async (item) => {
      const streamUrl = appData.content[item.id].streamURL;
      const videoValid = item.content_type == "audio" ? true : await isVideoValid(HlsPlayer.extractStreamUrl(streamUrl));
      if(!videoValid) {
          // GoogleAnalytics.sendError(`Video with id: ${item.id} could not be played`)
          const sidebar = document.getElementById("sidebar");
          if(sidebar){
              sidebar.style.display = "block";
          }
          new InfoModal({
              title: "Video is currently unavailable",
          });
          controles.set_current("info_modal");
          return;
      }

      GoogleAnalytics.sendEvent({name: "content_click", parameters: {
          hash: window.appData.Info.hash,
          page_title: window.controles.current,
          content_id: item.id,
          content_title: item.title
      }});

    const detailedPopup = window.appData.graphic.detailed_popup;

    if (detailedPopup) {
      const channelInfo = new ChannelInfo({
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
        thumbnail_playlist: item.thumbnail_playlist,
        description: item.description,
        isLive: item.isLive,
        index: item.index,
        row: item.row,
        videoDuration: item.videoDuration,
        resolution: item.resolution,
        parental_control: item.parental_control,
        isMovieCarousel: item.isMovieCarousel,
        cardClickHandler: this.cardClick,
        cardMouseOver: this.cardMouseOver,
        content_type: item.content_type,
      });

      const detailPopupOptions = {
        children: [channelInfo.render()],
      };
      const detailedPopup = new DetailedPopup(detailPopupOptions);
      detailedPopup.render();

      DetailedPopup.show();

      controles.set_current("detailed_popup");
      controles.detailed_popup.set_current("channel_info");
      controles.detailed_popup.channel_info.move();
    } else {
      this.cardClick(item);
    }
  };

  /**
 * ${1:Description placeholder}
 *
 * @param {*} item
 * @returns {InfoModal}
 */
  cardClick(item) {
    if (!navigator.onLine) {
      return new InfoModal({ title: "No internet connection" });
    }

    const channel = appData.content[item.id];

    pages.set_current("player");

    let entityArr = [];


    for (let i = 0; i < Object.keys(appData.playlists).length; i++) {
      if (
        appData.playlists[Object.keys(appData.playlists)[i]].itemIds.includes(
          channel.id
        )
      ) {
        entityArr.push(
          appData.playlists[Object.keys(appData.playlists)[i]].entity_id
        );
        break;
      }
    }

    if (!entityArr.length) {
      entityArr = [
        appData.playlists[Object.keys(appData.playlists)[0]].entity_id,
      ];
    }


    window.player_obj = new Player(channel, entityArr);
    player_obj.render();
  }

  /**
 * ${1:Description placeholder}
 *
 * @returns {*}
 */
  render() {
    const channel_grid_parent = el(
      "div",
      "channel-grid__parent",
      "channel_grid_parent"
    );

    if (Keyboard.isVisible) {
      channel_grid_parent.classList.add("active_keyboard");
    }
    const channel_grid = el("div", "channel-grid", "channel_grid");

    for (let i = 0; i < Math.ceil(Object.keys(this.channels).length / 5); i++) {
      const channel_grid_row = el(
        "div",
        "channel-grid__row",
        "channel_grid_row"
      );

      for (let j = 0; j < 5; j++) {
        const item = this.channels[Object.keys(this.channels)[i * 5 + j]];

        if (item) {
          const channel_card = new ChannelCard({
            id: item.id,
            title: item.title,
            thumbnail: item.thumbnail,
            thumbnail_playlist: item.thumbnail_playlist,
            description: item.description,
            isLive: item.isLive,
            parental_control: item.parental_control,
            videoDuration: item.videoDuration,
            content_type: item.content_type,
            index: i * 5 + j,
            cardClickHandler: (item) => this.cardClickHandler(item),
            cardMouseOver: (e) => this.cardMouseOver(e, i, j),
          });

          channel_grid_row.appendChild(channel_card.render());
        }
      }

      channel_grid.appendChild(channel_grid_row);
    }

    channel_grid_parent.appendChild(channel_grid);

    channel_grid_parent.onwheel = (e) => {
      wheel_magic_control(e, controles.main.search.search_results);
    };

    return channel_grid_parent;
  }
}

export default ChannleGrid;
