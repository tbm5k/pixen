/**
 * LG Device Center
 */

class LG {
  constructor() {
    this.name = "lg";
    this.deviceInfo = null;
    this.systemInfo = null;
    this.IFAType = "ppid";
    this.adsTracking = false;
  }

  async initDevice() {
    try {
      this.deviceInfo = await this.getDeviceInfo();
      this.systemInfo = await this.getSystemInfo();

      return {
        keys: {
          BACK: 461,
          EXIT: 10182,
          TOGGLE_PLAY: 10252,
        },
        deepLinkData: {
          video: "",
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
    } catch (err) {

      throw err;
    }
  }

  static requestLGService(params) {
    return new Promise((resolve, reject) => {
      const { url, method, parameters } = params;

      window.webOS.service.request(url, {
        method,
        parameters,
        onSuccess: resolve,
        onFailure: reject,
      });
    });
  }

  getDeviceInfo = async () => {
    const params = {
      url: "luna://com.webos.service.sm",
      method: "deviceid/getIDs",
      parameters: { idType: ["LGUDID"] },
    };

    try {
      return await LG.requestLGService(params);
    } catch (error) {
      throw error;
    }
  };

  getSystemInfo = async () => {
    const params = {
      url: "luna://com.webos.service.tv.systemproperty",
      method: "getSystemInfo",
      parameters: {
        keys: ["modelName", "firmwareVersion", "UHD", "sdkVersion"],
      },
    };

    try {
      return await LG.requestLGService(params);
    } catch (error) {
      throw error;
    }
  };

  getUUID = () => this.deviceInfo && this.deviceInfo.idList[0].idValue;
  getDeviceDetailed = () =>
    this.systemInfo &&
    `model name: ${this.systemInfo.modelName}, firmware: ${this.systemInfo.firmwareVersion}`;
  getIDFA = () => this.deviceInfo && this.deviceInfo.idList[0].idValue;
  getAdsTracking = () => this.adsTracking;

  /**
 * Identifier for Advertising 
 *
 * @returns {string}
 */
getIFAType = () => this.IFAType;


onDocumentHide = () => {
    document.addEventListener("webOSLaunch", function (inData) {}, true);
    document.addEventListener("webOSRelaunch", function (inData) {}, true);
  };

  /**
 * function to exit the application
 *
 * @returns {*}
 */
exitApp = () => window.close();

  /**
 * function to open the app on the app store
 *
 * @param {*} appId
 */
openStore(appId) {
    const params = {
      url: "luna://com.webos.applicationManager",
      method: "launch",
      parameters: {
        id: appId,
      },
    };

    LG.requestLGService(params);
  }
}

export default LG;
