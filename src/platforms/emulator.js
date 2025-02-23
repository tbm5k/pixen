/**
 * Emulator Device Center
 */

import GoogleAnalytics from "../plugins/googleAnalytics";

class Emulator {
  /**
 * Creates an instance of Emulator.
 *
 * @constructor
 */
  constructor() {
    this.name = "emulator";
    this.IFAType = "ppid";
    this.IDFA = undefined;
    this.adsTracking = false;
    this.uuid = undefined;
  }

  /**
* initialize device with key codes
* @async 
*/

  async initDevice() {
    try {
      const queries = window.location.search;
      const splitQueries = queries.split("&");
      const urlParams = new Map();
      splitQueries.forEach((query) => {
        const [key, value] = query.split("=");
        urlParams.set(key, value);
      });

      const video = urlParams.get("video_id");
      const source = urlParams.get("source");
      const carousel = urlParams.get("carousel");

      return {
        keys: {
          BACK: 27,
          STOP: 101,
          TOGGLE_PLAY: 32,
          REWIND: 102,
          FORWARD: 106,
          PLAY: 103,
          EXIT: 220,
          RED: 86,
        },
        deepLinkData: {
          video,
          source,
          carousel,
        },
        platformSettings: {
          animation: true,
          keyboard: true,
          cursor: true,
          encoding: "blob",
          playerCrossorigin: false,
          subtitles: true,
          hlsHelp: true,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  /**
 * function to check unsupported device such as phone, microsoft edge, explorer and etc
 *
 * @static
 * @param {*} uaData
 * @returns {boolean}
 */
  static isNotSupportedDevice(uaData) {
    const unSupportedBrowsers = "explorer,edge,Microsoft Edge";
    const unSupportedDevices = "smartphone,mobile";

    const { uaFamily, deviceType } = uaData.ua;
    const browserRegex = new RegExp(uaFamily, "gi");
    const deviceRegex = new RegExp(deviceType, "gi");
    return (
      browserRegex.test(unSupportedBrowsers) ||
      deviceRegex.test(unSupportedDevices)
    );
  }

  getUUID = () => this.uuid;
  exitApp = () => {
      GoogleAnalytics.sendEvent({name: "app_events", parameters: {
          APP: "EXIT"
      }});
      window.close()
  };
  getDeviceDetailed = () => navigator.platform;
  getAdsTracking = () => this.adsTracking;
  getIDFA = () => this.IDFA;
  
  /**
 * Identifier for Advertising 
 *
 * @returns {string}
 */
  getIFAType = () => this.IFAType;
}

export default Emulator;
