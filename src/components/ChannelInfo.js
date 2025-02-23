import { convertTime, el, getItem, setItem } from "../utils";
import {
  addToListSvg,
  closeSvg,
  durationSvg,
  liveSvg,
  playSvg,
  removeFromListSvg,
} from "./svgs";

import "../styles/channelInfo.css";
import DetailedPopup from "./detailedPopup";
import ChannelsList from "./common/channelsList";
import controles from "../remote/controles";
import pages from "../remote/pages";

class ChannelInfo {
  constructor({
    id,
    title,
    thumbnail,
    description,
    index,
    row,
    category,
    duration,
    resolution,
    parental_control,
    isMovieCarousel,
    cardClickHandler,
    cardMouseOver,
    content_type,
    playBtn = true,
  }) {
    this.data = {};
    this.data.id = id;
    this.data.title = title;
    this.data.thumbnail = thumbnail;
    this.data.description = description;
    this.data.category = category;
    this.data.index = index;
    this.data.row = row;
    this.data.duration = duration;
    this.data.resolution = resolution;
    this.data.parental_control = parental_control;
    this.data.isMovieCarousel = isMovieCarousel;
    this.data.cardClickHandler = cardClickHandler;
    this.data.cardMouseOver = cardMouseOver;
    this.data.content_type = content_type;
    this.data.playBtn = playBtn;
  }

  /**
 * ${1:Description placeholder}
 *
 * @returns {*}
 */
render() {
    const parent = el("div", "channel-info__main");
    const contentParent = el("div", "channel-info__content-parent");
    const imageParent = el("div", "channel-info__image-parent");
    const image = el("img", "channel-info__image");
    const playButton = el("div", "channel-info__play-button popup-ctrl");

    const tagsParent = el("div", "channel-info__tags-parent");

    if (ChannelsList.isMyListVisible) {
      const localMyList = JSON.parse(getItem("myList") || "[]");

      const addToMyList = el("div", "channel-info__addtolist popup-ctrl");

      if (localMyList.includes(this.data.id)) {
        addToMyList.innerHTML = removeFromListSvg;
        addToMyList.append("Remove from My List");
      } else {
        addToMyList.innerHTML = addToListSvg;
        addToMyList.append("Add to My List");
      }

      addToMyList.addEventListener("click", () => {
        this.addRemoveFromMyList();
      });
      tagsParent.appendChild(addToMyList);
    }

    const title = el("div", "channel-info__title");
    const descriptionParent = el("div", "channel-info__description-parent");
    const description = el("div", "channel-info__description");

    if (this.data.videoDuration) {
      const video_duration = el("div", "channel-info__tag");
      const duration_img = el("div");
      duration_img.innerHTML = durationSvg;
      video_duration.appendChild(duration_img);

      tagsParent.appendChild(video_duration);
      const convertedDuration = convertTime(this.data.videoDuration);

      if (video_duration) {
        video_duration.append(convertedDuration);
      }
    }

    if (this.data.isLive) {
      const live_block = el("div", "live-block");

      const live_img = el("div");
      live_img.innerHTML = liveSvg;
      const live_text = el("span", "live-text");
      live_text.innerHTML = "Live";

      live_block.appendChild(live_img);
      live_block.appendChild(live_text);
      tagsParent.appendChild(live_block);
    }

    const img = new Image();
    img.src = this.data.thumbnail;

    img.onload = () => {
      image.src = this.data.thumbnail;
    };

    img.onerror = () => {
      image.src = this.data.thumbnail_playlist;
    };

    title.innerHTML = this.data.title;
    description.innerHTML = this.data.description;

    playButton.innerHTML = playSvg;

    imageParent.appendChild(image);

    if (this.data.playBtn) {
      imageParent.appendChild(playButton);
    }

    parent.appendChild(imageParent);
    contentParent.appendChild(title);
    descriptionParent.appendChild(description);
    contentParent.appendChild(tagsParent);
    contentParent.appendChild(descriptionParent);
    parent.appendChild(contentParent);

    playButton.addEventListener("click", () => {
      DetailedPopup.destroy();
      this.data.cardClickHandler(this.data);
    });

    return parent;
  }

  /**
 * ${1:Description placeholder}
 */
addRemoveFromMyList() {
    const localMyList = JSON.parse(getItem("myList") || "[]");
    if (localMyList.includes(this.data.id)) {
      const index = localMyList.indexOf(this.data.id);
      localMyList.splice(index, 1);
      setItem("myList", JSON.stringify(localMyList));
    } else {
      localMyList.push(this.data.id);
      setItem("myList", JSON.stringify(localMyList));
    }

    ChannelInfo.toggleMyList(localMyList.includes(this.data.id), this.data);
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @param {*} isOnMyList
 * @param {*} item
 */
static toggleMyList(isOnMyList, item) {
    const addToMyList = document.querySelector(".channel-info__addtolist");
    const myList = JSON.parse(getItem("myList") || "[]");
    const myListRowParent = document.querySelector(".channels-list__item");
    const listParent = document.querySelector(".channels-list__parent");

    if (isOnMyList) {
      addToMyList.innerHTML = removeFromListSvg;
      addToMyList.append("Remove from My List");

      if (pages.current !== "home" && pages.current !== "player") return;

      const myListRowContent = myListRowParent.querySelector(
        ".channels-list__content"
      );

      if (myList.length && myList.length != 1) {
  
        const newCard = ChannelsList.renderCardHandler(item);
        myListRowContent.appendChild(newCard);
      } else {
        const myListData = Object.values(appData.playlists)?.find(
          (item) => item.feature_client == "my_list"
        );

        if (myListData) {
          myListData.itemIds = [];

          myListData.itemIds.push(item.id);
          const newMylistRow = ChannelsList.renderRows(myListData);
          listParent.insertBefore(newMylistRow, listParent.firstChild);
        }
      }
    } else {
      addToMyList.innerHTML = addToListSvg;
      addToMyList.append("Add to My List");

      if (pages.current !== "home" && pages.current !== "player") return;

      const myListRowContent = myListRowParent.querySelector(
        ".channels-list__content"
      );

      const myListRowCard = myListRowContent.querySelector(
        `.channel-card__parent[data-id="${item.id}"]`
      );

      if (!myList.length) {
        myListRowParent.remove();
      } else {
        myListRowCard.remove();
        if (controles.main.home.index > 0) {
          controles.main.home.index--;
        }
      }
    }
  }
}

export default ChannelInfo;
