/**
 * Samsung Device Center
 */
export default class Samsung {
  /**
 * Creates an instance of Samsung.
 *
 * @constructor
 */
  constructor() {
    this.name = "samsung";
    this.IFAType = "tifa";
  }

  async initDevice() {
    this.getKeys();

    return {
      keys: {
        BACK: 10009,
        EXIT: 10182,
        TOGGLE_PLAY: 10252,
      },
      deepLinkData: {
        video: this.getDeepLinkVideo(),
        source: "",
        carousel: "",
      },
      platformSettings: {
        animation: true,
        keyboard: false,
        cursor: true,
        encoding: "normal",
        subtitles: true,
        hlsHelp: false,
      },
    };
  }

  getUUID = () => {
    try {
      return window.webapis.appcommon.getUuid();
    } catch {
      return null;
    }
  };
  getDeviceDetailed = () => {
    try {
      return `version: ${window.webapis.network.getVersion()}`;
    } catch {
      return null;
    }
  };
  getAdsTracking = () => {
    try {
      return window.webapis.adinfo.isLATEnabled();
    } catch {
      return null;
    }
  };
  getIDFA = () => {
    try {
      return window.webapis.adinfo.getTIFA();
    } catch {
      return null;
    }
  };
  /**
 * Identifier for Advertising 
 *
 * @returns {string}
 */
  getIFAType = () => this.IFAType;

  /**
 * function to get keys
 */
  getKeys = () => {
    const keys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "ChannelUp",
      "ChannelDown",
      "MediaRewind",
      "MediaFastForward",
      "MediaPause",
      "MediaPlay",
      "MediaStop",
      "MediaTrackPrevious",
      "MediaTrackNext",
      "MediaPlayPause",
      "ColorF0Red",
      "ColorF1Green",
      "ColorF2Yellow",
      "ColorF3Blue",
      "ChannelList",
    ];
    try {
      window.tizen.tvinputdevice.registerKeyBatch(keys);
    } catch (e) {
    }
  };

  onDocumentHide = () => {
    try {
      window.tizen.application.getCurrentApplication().hide();
    } catch (e) {

    }
  };

  /**
 * function to exit the application
 *
 * @returns {*}
 */
  exitApp = () => {
    try {
      window.tizen.application.getCurrentApplication().exit();
    } catch (e) {

    }
  };

  /**
 * ${1:Description placeholder}
 *
 * @returns {*}
 */
  getDeepLinkVideo = () => {

    const requestedAppControl = window.tizen?.application
      .getCurrentApplication()
      .getRequestedAppControl();

    if (!requestedAppControl) return;

    const appControl = requestedAppControl.appControl.data;


    for (const obj of appControl) {

      if (obj.key === "PAYLOAD") {

        try {

          const actionDataValues = JSON.parse(obj.value[0]).values;
          return JSON.parse(actionDataValues).videoIdx

        } catch (e) {
          return;
        }

      }

    }

  };
}
