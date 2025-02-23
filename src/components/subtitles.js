import Player from "../pages/player";

/**
 * ${1:Description placeholder}
 *
 * @type {*}
 */
let subTimeout;

/**
    * @class Subtitles
    * @description this component renders subtitles
    * */
class Subtitles {
  /**
 * Creates an instance of Subtitles.
 *
 * @constructor
 * @param {Object} options
 */
constructor(options) {
    this.captions = options.captions;
    this.selectedSub = options.selected;

    this.getSubtitles();
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {{}\}
 */
static subtitleObj = {};

  /**
        *
        * @description retrieves subtitle
        */
getSubtitles() {
    if (this.selectedSub == "off") {
      Player.showSubtitles = false;

      return this.offSubtitles();
    }

    const subtitles_parent = document.getElementById("subtitles_parent");
    subtitles_parent.classList.add("visible");

    const _this = this;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", this.selectedSub, true);
    xhr.onload = function () {
      if (this.status === 200) {
        _this.normalizeSubtitles(this.responseText);
        Player.showSubtitles = true;
      }
    };

    xhr.send();
  }

    /**
        * @description disables subtitles
        */
offSubtitles() {
    const subtitles_parent = document.getElementById("subtitles_parent");
    subtitles_parent.classList.remove("visible");
    subtitles_parent.innerHTML = "";
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @param {*} currentTime
 */
static setSubtitles(currentTime) {
    let subtitle = Subtitles.subtitleObj[Math.floor(currentTime)];
    const subtitles_parent = document.getElementById("subtitles_parent");

    if (subtitle) {
      Subtitles.isRenderOpenSubtitleCalled = true;
      subtitles_parent.innerHTML = subtitle.text;

      if (subTimeout) {
        clearTimeout(subTimeout);
      }

      subTimeout = setTimeout(function () {
        subtitles_parent.innerHTML = "";
        Subtitles.isRenderOpenSubtitleCalled = false;
      }, subtitle.duration * 1000);
    }
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} str
 * @returns {*}
 */
getSeconds(str) {
    var seconds = 0;
    var time = str;
    var timeS = time.split(",");
    var timeArr = timeS[0].split(":");
    seconds = +timeArr[0] * 60 * 60 + +timeArr[1] * 60 + +timeArr[2];
    return Math.floor(seconds);
  }

    /**
        * @description process subtitles in srt format
        * @param {*} subs
        */
normalizeSubtitles(subs) {
    let sub_arr = subs.split("\n");

    for (let i = 0; i < sub_arr.length; i++) {
      let sub_obj = {};

      let sub = sub_arr[i].trim().split(" --> ");

      let is_time = sub[0].split(":").length === 3;

      if (is_time) {
        let time_start = this.getSeconds(sub[0]);
        sub_obj.time = time_start;
        sub_obj.time_end = this.getSeconds(sub[1]);
        sub_obj.text = sub_arr[i + 1];

        Subtitles.subtitleObj[time_start] = {
          text: sub_obj.text,
          duration: sub_obj.time_end - sub_obj.time,
        };
      }
    }
  }
}

export default Subtitles;
