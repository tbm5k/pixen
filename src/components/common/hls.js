import Hls from "hls.js";
import Player from "../../pages/player.js";
import { el, getItem, setItem } from "../../utils.js";
import Subtitles from "../subtitles.js";
import GlobalAnalytics from "../../services/globalAnalytics.js";
import Analytics from "../../services/analytics.js";
import { convertTime } from "../../utils.js";
import {
  adsManager,
  loadAds,
  showImaAds,
  hasAds,
  configAdBreak,
  displayLog,
  start_ads,
  playAds
} from "../ads.js";
import InfoModal from "../common/infoModal";
import GoogleAnalytics from "../../plugins/googleAnalytics.js";
import Devices from "../../services/deviceCenter";

/**
 * ${1:Description placeholder}
 *
 * @type {*}
 */
let videoTimer = null;
/**
 * ${1:Description placeholder}
 *
 * @type {*}
 */
let fastForwardTimer = null;
/**
 * ${1:Description placeholder}
 *
 * @type {*}
 */
let backForwardTimer = null;

 var adpos;
class HlsPlayer {
  constructor(channel, nextChannelUrl, use_hls, isVideoWatchedTime) {
    this.channel = channel;

    Player.isLiveStreaming = channel.is_live_streaming;

    HlsPlayer.current_channel = channel;
    this.nextChannelUrl = nextChannelUrl;
    this.useHls = use_hls;
    HlsPlayer.useHls = use_hls;
    this.isVideoWatchedTime = isVideoWatchedTime;

    const globalAnalytics = new GlobalAnalytics();
    HlsPlayer.analytics = new Analytics(globalAnalytics);
    HlsPlayer.analytics.setVideoSession(this.channel);
    HlsPlayer.analytics.sendEvent("startVideo");
    displayLog("Send Video-Start Event")
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {number}
 */
  static videoTime = 0;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {boolean}
 */
  static isPaused = false;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {boolean}
 */
  static isPlaying = false;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {string}
 */
  static currentVideoUrl = "";
  static fastForwardCount = 10;
  static backForwardCount = 10;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {*}
 */
  static hlsPLayer = null;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {*}
 */
  static current_channel;
  static analytics = null;
  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {boolean}
 */
  static useHls = false;

  static showLoading() {
    const video_loader_img = window.appData?.graphic?.loader_image;

    const video_loader = el("div", "video-loader", "video_loader");

    const video_loader_parent = el("div", "loader-parent");

    if (video_loader_img) {
      const video_loader_img_el = el("img", "loader-img");
      video_loader_img_el.src = video_loader_img;
      video_loader_parent.appendChild(video_loader_img_el);
    } else {
      const video_loader_item1 = el("div", "loader-item1");
      const video_loader_item2 = el("div", "loader-item2");

      video_loader_parent.appendChild(video_loader_item1);
      video_loader_parent.appendChild(video_loader_item2);
    }
    video_loader.appendChild(video_loader_parent);

    const video_parent = document.getElementById("video_parent");
    video_parent.appendChild(video_loader);
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @param {*} e
 */
  static seek(e) {
      displayLog('Seek')
    const video = document.getElementById("video");
    const progress_bar = document.getElementById("progress_bar");
    const progress_bar_inner = document.getElementById("progress_bar_inner");

    const el_width = progress_bar.offsetWidth;
    const el_percentage = (e.offsetX / el_width) * 100;

    if (progress_bar_inner)
      progress_bar_inner.style.width = `${el_percentage}%`;

    HlsPlayer.videoTime = (video.duration / 100) * el_percentage;
    video.currentTime = HlsPlayer.videoTime
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 */
  static replay() {
    const video = document.getElementById("video");
    HlsPlayer.pause();

    HlsPlayer.videoTime = 0;

    const progress_bar_inner = document.getElementById("progress_bar_inner");
    if (progress_bar_inner) progress_bar_inner.style.width = "0%";

    clearTimeout(videoTimer);
    videoTimer = setTimeout(function () {
      video.currentTime = HlsPlayer.videoTime;
      HlsPlayer.play();
    }, 1000);
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @param {*} id
 * @param {*} time
 */
  static addToContinueWatchingList(id, time) {
    const video = document.getElementById("video");

    if (HlsPlayer?.currentVideoUrl !== video.src) return;

    let continueWatchingList = JSON.parse(
      getItem("continueWatchingList") || "[]"
    );

    const foundVideo = continueWatchingList.find((item) => item.id === id);

    if (!foundVideo) {
      continueWatchingList.unshift({
        id,
        time: Math.floor(time),
      });
    } else {
      continueWatchingList.forEach((item) => {
        if (item.id === id) {
          item.time = Math.floor(time);
          continueWatchingList = continueWatchingList.filter(
            (item) => item.id !== id
          );
          continueWatchingList.unshift({
            id,
            time: Math.floor(time),
          });
        }
      });
    }

    setItem("continueWatchingList", JSON.stringify(continueWatchingList));
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @param {*} id
 */
  static removeContinueWatchingList(id) {
    let continueWatchingList = JSON.parse(
      getItem("continueWatchingList") || "[]"
    );

    continueWatchingList = continueWatchingList.filter(
      (item) => item.id !== id
    );

    setItem("continueWatchingList", JSON.stringify(continueWatchingList));
  }

  static pause() {
    const video = document.getElementById("video");

    video.pause();
    HlsPlayer.isPaused = true;

    const play_button_parent = document.querySelector(".play-button__parent");
    play_button_parent.innerHTML = Player.pause_button_icon;
  }

  static play() {
    const video = document.getElementById("video");
    video.play();
    HlsPlayer.isPaused = false;

    const play_button_parent = document.querySelector(".play-button__parent");
    play_button_parent.innerHTML = Player.play_button_icon;
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 */
  static stop() {

    const video = document.getElementById("video");
    video.currentTime = 0;
    HlsPlayer.isPaused = true;
    HlsPlayer.isPlaying = false;
    video.pause();

    const play_button_parent = document.querySelector(".play-button__parent");
    play_button_parent.innerHTML = Player.pause_button_icon;

    const progress_bar_inner = document.getElementById("progress_bar_inner");
    if (progress_bar_inner) progress_bar_inner.style.width = "0%";

    const videoCurrentTime =
      document.getElementsByClassName("video-current_time");

    if (videoCurrentTime && videoCurrentTime.length) {
      videoCurrentTime[0].innerHTML = "00:00";
      videoCurrentTime[1].innerHTML = "00:00";
    }
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {boolean}
 */
  static isVideoEndedEventSent = false;

  /**
 * ${1:Description placeholder}
 *
 * @static
 */
  static togglePlay() {
    const video = document.getElementById("video");
    if (video.paused) {
      HlsPlayer.play();
    } else {
      HlsPlayer.pause();
    }
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 */
  static next() {
      const video = document.getElementById("video");
      const fastForwardValue = HlsPlayer.videoTime + HlsPlayer.fastForward()
      const maxForward = video.duration - 5;
      if(fastForwardValue >= maxForward) {
          if(video.paused){
              HlsPlayer.videoTime = maxForward;
              video.currentTime = maxForward;
              HlsPlayer.play();
          }
          return;
      }
      if (HlsPlayer.isPlaying) {
          HlsPlayer.pause();
      }
      clearTimeout(videoTimer);
      if (fastForwardValue > video.duration) {
          HlsPlayer.videoTime = video.duration;
      } else {
          HlsPlayer.videoTime += HlsPlayer.fastForward();
      }
      HlsPlayer.backForwardCount = 10;
      const progress = (HlsPlayer.videoTime / video.duration) * 100;
      const progress_bar_inner = document.getElementById("progress_bar_inner");
      if (progress_bar_inner) progress_bar_inner.style.width = `${progress}%`;
      HlsPlayer.updateCurrentTime()
      videoTimer = setTimeout(function () {
          video.currentTime = HlsPlayer.videoTime;
          HlsPlayer.play();
          clearTimeout(videoTimer);
      }, 1000);
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 */
  static prev() {
    const video = document.getElementById("video");
    if (HlsPlayer.isPlaying) {
      HlsPlayer.pause();
    }
    HlsPlayer.videoTime -= HlsPlayer.backForward();
    if (HlsPlayer.videoTime < 0) HlsPlayer.videoTime = 0
    HlsPlayer.fastForwardCount = 10;
    clearTimeout(videoTimer);
    const progress = (HlsPlayer.videoTime / video.duration) * 100;
    const progress_bar_inner = document.getElementById("progress_bar_inner");
    if (progress_bar_inner) progress_bar_inner.style.width = `${progress}%`;
    HlsPlayer.updateCurrentTime()
    videoTimer = setTimeout(function () {
      video.currentTime = HlsPlayer.videoTime;
      HlsPlayer.play();
      clearTimeout(videoTimer);
    }, 1000);
  }

  static updateCurrentTime() {
    const underProgressCurrentTime = document.getElementById("current_time");
    if (underProgressCurrentTime) {
      underProgressCurrentTime.innerHTML = convertTime(HlsPlayer.videoTime);
    }
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @returns {number}
 */
  static fastForward() {
    if (HlsPlayer.fastForwardCount < 50) {
      fastForwardTimer = setTimeout(function () {
        HlsPlayer.fastForwardCount += 2;
      }, 1000);
    }

    return HlsPlayer.fastForwardCount;
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @returns {number}
 */
  static backForward() {
    if (HlsPlayer.backForwardCount < 50) {
      backForwardTimer = setTimeout(function () {
        HlsPlayer.backForwardCount += 2;
      }, 1000);
    }

    return HlsPlayer.backForwardCount;
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 */
  static sendVideoEndEvent() {
    if (!HlsPlayer.isVideoEndedEventSent) {
      displayLog("Send Video-End Event")
      HlsPlayer.analytics.sendEvent("endVideo");
      HlsPlayer.isVideoEndedEventSent = true;
        GoogleAnalytics.sendEvent({name: "video_events", parameters: {
            CONTENT: "END"
        }});
    } else {
      displayLog("Already Sent!")
    }
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 */
  static endVideoListener() {
      if (Player.isLiveStreaming){
          displayLog("Ad is supposed to be playing");
      } else if (!Player.isAdPlaying) {
          displayLog("Ad is not playing, going to next video");
          HlsPlayer.autoPlayNext();
      }
  }

  /**
 * ${1:Description placeholder}
 */
  detachMedia() {
    this.hls.detachMedia();
  }

  createAdContainer() {
    const current_channel = this.channel;
    if (document.getElementById("ad_parent")) {
      document.getElementById("ad_parent").remove();
    }

    const ad_parent = el("div", "ad-parent", "ad_parent");
    const ad_overlay = el("div", "overlay");

    ad_parent.appendChild(ad_overlay);

    ad_overlay.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
    };

    ad_parent.style.position = "fixed";
    ad_parent.style.zIndex = 9;
    ad_parent.style.width = window.innerWidth + "px";
    ad_parent.style.height = window.innerHeight + "px";

    const ad_duration_parent = el(
      "div",
      "ad-duration-parent hidden",
      "ad_duration_parent"
    );

    ad_duration_parent.style.zIndex = 1;

    const ad_content_wrapper = el("div", "ad-content-wrapper");
    const ad_duration_text = el("div", "ad-duration-text", "ad_duration_text");
    const ad_total_count = el("div", "ad-total-count", "ad_total_count");
    const ad_video_image = el("img", "ad-video-image", "ad_video_image");

    const image = new Image();

    image.src = current_channel.thumbnail;

    image.onload = () => {
      ad_video_image.src = current_channel.thumbnail;
    };

    image.onerror = () => {
      ad_video_image.src = appData.graphic.defaultThumbnail;
    };

    ad_duration_parent.appendChild(ad_video_image);

    ad_content_wrapper.appendChild(ad_duration_text);
    ad_content_wrapper.appendChild(ad_total_count);
    ad_duration_parent.appendChild(ad_content_wrapper);

    ad_parent.appendChild(ad_duration_parent);

    document.getElementById("video_parent").appendChild(ad_parent);
  }

  async render() {
      
      const video = document.getElementById("video");

      this.channel.url = this.channel.url.replace("youtube.com", "youtube-nocookie.com/embed")
      this.channel.url = this.channel.url + "&autoplay=1"
      HlsPlayer.currentVideoUrl = this.channel.url
      video.src = this.channel.url;

  }

  /**
 * ${1:Description placeholder}
 */
  timeUpdate(e, video) {
    if (!video) {
      video = document.getElementById("video")
    }
  
    if (video) {
      const currentTime = video.currentTime;
      const duration = video.duration;
      const progress = (currentTime / duration) * 100;
      const underProgressDuration = document.getElementById("duration_time");
      const underProgressCurrentTime = document.getElementById("current_time");

      if (Player.showSubtitles) {
        Subtitles.setSubtitles(currentTime);
      }

      if (!HlsPlayer.isPaused) {
        const progress_bar_inner =
          document.getElementById("progress_bar_inner");
        HlsPlayer.fastForwardCount = 0;
        HlsPlayer.backForwardCount = 0;
        if (progress_bar_inner) progress_bar_inner.style.width = `${progress}%`;
        HlsPlayer.videoTime = video.currentTime;
      }

      if (underProgressDuration) {
        if (duration) {
          underProgressDuration.innerHTML = convertTime(duration);
        }
      }

      if (underProgressCurrentTime) {
        if (currentTime) {
          underProgressCurrentTime.innerHTML = convertTime(currentTime);
        }
      }
      
      try {
        if (this.channel.show_ads !== false) {
          if (video.getAttribute('data-content-type') === "content") {
              if (video.currentTime >= adpos && adpos < video.duration) {
                try {
                      HlsPlayer.analytics.sendEvent("adOpportunity");
                } catch (error) {
                  console.log(error)
                }
                let nextAdBreak =( Math.floor(Math.random() * (10 - 5 + 1)) + 5) * 60
                adpos = video.currentTime  + nextAdBreak
                playAds(this.channel, {currentTime: video.currentTime} ) // midroll
              }   
              
              if (!adpos && video.duration) {
                if (video.duration <= (10 * 60)) {
                    adpos = video.duration / 2
                } else {
                  adpos =  (Math.floor(Math.random() * (10 - 5 + 1)) + 5) * 60;;
                } 
              } 
            }   
          }
      } catch (error) {
        console.error(error)
      }
    }
  }



  /**
 * ${1:Description placeholder}
 */
  onPlaying() {
    const app_loader = document.getElementById("app_loader");
    if (app_loader) app_loader.classList.remove("show");

    HlsPlayer.isVideoEndedEventSent = false;

    HlsPlayer.isPaused = false;
    HlsPlayer.isPlaying = true;

    Player.showPlayerControls(false);

    const video_loader = document.getElementById("video_loader");
    if (video_loader) {
      video_loader.remove();
    }
  }

  /**
 * ${1:Description placeholder}
 */
  videoWaitingHandler() {
    const video_loader = document.getElementById("video_loader");
    if (video_loader) {
      video_loader.remove();
      HlsPlayer.isPlaying = false;
    }
    Player.showPlayerControls(true);
    HlsPlayer.showLoading();
    HlsPlayer.fastForwardCount = 0;
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 */
  static autoPlayNext() {
    try {
      const video = document.getElementById("video");
      if (HlsPlayer.isPlaying) {
        HlsPlayer.pause();
        HlsPlayer.videoTime = 0;
      }

      const progress_bar_inner = document.getElementById("progress_bar_inner");
      if (progress_bar_inner) progress_bar_inner.style.width = "0%";

      clearTimeout(videoTimer);

      const next_button = document.getElementById("next_button");
      next_button.click();

      const id = video.getAttribute("data-id");
      const continueWatchingList = JSON.parse(
        getItem("continueWatchingList") || "[]"
      );

      const index = continueWatchingList.findIndex((item) => item.id === id);
      // check if the video is not ad video

      if (index !== -1) {
        continueWatchingList.splice(index, 1);
        setItem("continueWatchingList", JSON.stringify(continueWatchingList));
      }
    } catch (error) {

    }

  }

  /**
 * ${1:Description placeholder}
 */
  destroy() {
    const app_loader = document.getElementById("app_loader");
    if (app_loader) app_loader.classList.remove("show");
    this.hls.destroy();
  }
}

export default HlsPlayer;
