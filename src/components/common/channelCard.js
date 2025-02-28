import { detect_page, el } from "../../utils";
import { cropedImages } from "../../index";
import GoogleAnalytics from "../../plugins/googleAnalytics";
import GlobalAnalytics from "../../services/globalAnalytics";
import pages from "../../remote/pages";

/**
 * ${1:Description placeholder}
 *
 * @class ChannelCard
 * @typedef {ChannelCard}
 */
class ChannelCard {
  /**
 * Creates an instance of ChannelCard.
 *
 * @constructor
 * @param {{ id: any; title: any; thumbnail: any; description: any; url: string; index: any; row: any; duration: any; resolution: any; isMovieCarousel: any; cardClickHandler: any; cardMouseOver: any; }} param0
 * @param {*} param0.id
 * @param {*} param0.title
 * @param {*} param0.thumbnail
 * @param {*} param0.url
 * @param {*} param0.description
 * @param {*} param0.index
 * @param {*} param0.row
 * @param {*} param0.duration
 * @param {*} param0.resolution
 * @param {*} param0.isMovieCarousel
 * @param {*} param0.cardClickHandler
 * @param {*} param0.cardMouseOver
 */
constructor({
    id,
    title,
    thumbnail,
    url,
    description,
    index,
    row,
    duration,
    resolution,
    isMovieCarousel,
    cardClickHandler,
    cardMouseOver,
  }) {
    this.data = {
      id,
      title,
      thumbnail,
    url,
      description,
      index,
      row,
      duration,
      resolution,
      isMovieCarousel,
      cardClickHandler,
      cardMouseOver,
    };
  }

    /**
        *
        * @description retrieves optimized images
        * @static
        * @param {*} imgSrc
        * @param {*} imgWidth
        * @param {*} imgHeight
        * @returns {string}
        */
static getCompressedImage(imgSrc, imgWidth, imgHeight){
    let imgSize = `w=${imgWidth}&h=${imgHeight}`;  
    let src = `https://images.weserv.nl/?url=${imgSrc}&${imgSize}&q=100&con=0&l=1`;
    
    src=`https://ik.imagekit.io/030om0emf/${imgSrc}?tr=w-${imgWidth},h-${imgHeight}`

    return src;
  }
  /**
 * ${1:Description placeholder}
 *
 * @returns {*}
 */
render() {
    const channel_parent = el("div", "channel-card__parent channel-item-ctrl");

    channel_parent.setAttribute("data-id", this.data.id);
    channel_parent.setAttribute("data-index", this.data.index);
    channel_parent.setAttribute("data-row", this.data.row);

    const channel_img = el("div", "channel-card__img");
    const channel_inner_img = el("img", "channel-card__inner-img");

    if (this.isMovieCarousel) {
      channel_inner_img.style.width = "25.1rem";
      channel_inner_img.style.height = "36.7rem";
    } else {
      channel_inner_img.style.width = "31.6rem";
      channel_inner_img.style.height = "17.7rem";
    }

    const channel_content = el("div", "channel-card__content");
    const channel_title = el("p", "channel-card__title");
    channel_title.innerHTML = this.data.title;
    channel_title.style.color = "#fff";

    if (channel_parent.classList.contains("active")) {
        channel_title.style.color = "#000";
    }

    const image = new Image();

    image.src = this.data.thumbnail;

    const imgSrc = this.data.thumbnail_playlist || this.data.thumbnail;
    const imgSize = this.data.isMovieCarousel ? "251x367" : "316x178";
    let imgWidth=this.data.isMovieCarousel ? 251 : 361;
    let imgHeight=this.data.isMovieCarousel ? 367 : 178;
    image.onload = () => {  
      channel_inner_img.src = ChannelCard.getCompressedImage(imgSrc, imgWidth, imgHeight);
    };

    // image.onerror = () => {
    //   channel_inner_img.src = appData.graphic.defaultThumbnail;
    // };
    
    let image_size = "316x177";

    if (this.isMovieCarousel) {
      image_size = "251x367";
    }

    channel_img.appendChild(channel_inner_img);

    channel_parent.appendChild(channel_img);
    channel_content.appendChild(channel_title);
    const live_block = el("div", "channel-live__block empty");
    if (this.data.isLive) {
      if (!this.data.isMovieCarousel) {
        const live_text = el("span", "channel-live__text");
        live_text.innerHTML = "Live";
        live_block.appendChild(live_text);
        live_block.classList.remove("empty");
      }
    } else {
      if (!this.data.isMovieCarousel && this.data.videoDuration) {
        const video_duration = el("span", "channel-video-duration");
        video_duration.innerHTML = this.convertDuration(this.data.duration);

        live_block.appendChild(video_duration);
        live_block.classList.remove("empty");
      }
    }

    channel_img.appendChild(live_block);

    if (
      this.data.parental_control &&
      this.data.parental_control.length &&
      !this.data.isMovieCarousel
    ) {
      const parental_img = el("img", "channel-parental__img");

      const image = new Image();
      image.src = this.data.parental_control[0].image;

      const parentalImgSrc = this.data.parental_control[0].image;
      
      image.onload = () => {
        parental_img.src = ChannelCard.getCompressedImage(parentalImgSrc, 50, 50);        
      };

      // image.onerror = () => {
      //   parental_img.src = appData.graphic.defaultThumbnail;
      // };

      channel_img.appendChild(parental_img);
    }

    channel_parent.appendChild(channel_content);
    const _this = this;

    channel_parent.onclick = () => {      
      const channel_parent_parentElement = channel_parent.parentElement;

      if (channel_parent_parentElement) {
        const parentEntityId =
          channel_parent_parentElement.getAttribute("entity_id");
        window.selectedPlaylistId = parentEntityId;
      }

      const globalAnalytics = new GlobalAnalytics();

      globalAnalytics.sendEvent("carouselClick", _this.data.id);

      const item = {
        id: _this.data.id,
        index: _this.data.index,
        title: _this.data.title,
        thumbnail: _this.data.thumbnail,
        url: _this.data.url,
        duration: _this.data.duration,
        description: _this.data.description,
      };            
      _this.data.cardClickHandler(item);
    };

    channel_parent.onmouseenter = (e) => {
        _this.data.cardMouseOver(_this.data.index, _this.data, e.target);
        channel_parent.classList.add("active");
        channel_parent.setAttribute("data-id", this.data.id);

        let itemTitleColor = "#fff";
        channel_title.style.color = "red"; // active color

        const channel_titles = document.querySelectorAll(".channel-card__title");

        for (let i = 0; i < channel_titles.length; i++) {
            channel_titles[i].style.color = itemTitleColor;
        }
    };



    return channel_parent;
  }

  /**
 * @description formatting
 * @param {*} duration
 * @returns {string}
 */
convertDuration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration - hours * 3600) / 60);
    const seconds = duration - hours * 3600 - minutes * 60;
    if (duration < 3600) {
      return `${minutes < 10 ? "0" + minutes : minutes}:${
        seconds < 10 ? "0" + seconds : seconds
      }`;
    } else {
      return `${hours < 10 ? "0" + hours : hours}:${
        minutes < 10 ? "0" + minutes : minutes
      }:${seconds < 10 ? "0" + seconds : seconds}`;
    }
  }
}

export default ChannelCard;
