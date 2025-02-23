export default class Youbora {
  /**
 * Creates an instance of Youbora.
 *
 * @constructor
 * @param {*} accountCode
 */
constructor(accountCode) {
    this.name = "yoboara";
    this.ver = "6.7.2";
    this.type = "video";
    this.accountCode = accountCode;
    this.plugin = {};
  }

  /**
 * ${1:Description placeholder}
 *
 * @returns {*}
 */
load() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://smartplugin.youbora.com/v6/js/adapters/html5/${this.ver}/sp.min.js`;
      script.type = "text/javascript";

      script.onerror = (err) => reject(err);
      script.onload = () => {
        this.plugin = new window.youbora.Plugin({
          accountCode: this.accountCode,
        });
        resolve(this);
      };

      document.body.appendChild(script);
    });
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} video
 */
init(video) {
    this.setOptions(video);
    this.plugin.setAdapter(new window.youbora.adapters.Html5("castifyPlayer"));
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} video
 */
videoChanged(video) {
    this.setOptions(video);
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} video
 */
setOptions(video) {
    this.plugin.setOptions({
      "content.title": video.title,
      "content.isLive": video.is_live_streaming,
      "content.id": video.id,
      "content.resource": video.streamURL,
      "content.package": video.carouselTitle,
      "content.episodeTitle": video.carouselId,
    });
  }
}
