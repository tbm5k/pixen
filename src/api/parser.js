import Devices from "../services/deviceCenter";

class Parser {
  constructor() {
    this.constantMacros = {
      "[WIDTH]": window.innerWidth,
      "[HEIGHT]": window.innerHeight,
      "[LANGUAGE]": navigator.language,
    };

    this.sessionId = `${Date.now()}${Math.random().toString(16).substring(1)}`;
  }

  init(options) {
    try {
      this.setConstantsMacros(options.data);
      return this.parse(options.urls, {}, false);
    } catch (err) {

    }
  }
  /**
 * ${getSessionId: function to get current session id}
 *
 * @returns {string}
 */
  getSessionId() {
    return this.sessionId;
  }

  /**
 * ${getMacro: function to get specific value from the macros such as app version, device id, OS name and etc}
 *
 * @param {string} macro
 * @returns {string}
 */
  getMacro(macro) {
    return this.constantMacros[macro] || "";
  }


  /**
 * ${setConstantsMacros: function to set the marco variables from user settings and device info}
 *
 * @param {*} userData
 */
  setConstantsMacros(userData) {
    this.constantMacros = {
      ...this.constantMacros,
      "[APP_VERSION]": window.settings.appSettings.version,
      "[APP_VER]": window.settings.appSettings.version,
      "[ADS_TRACKING]": Devices.getDeviceFieldData("getAdsTracking"),
      "[ADS_TRACKING_NUM]": +Devices.getDeviceFieldData("getAdsTracking"),
      "[ADMANAGER_ID]": "IMA",
      "[DEVICE_ID]": Devices.getDeviceFieldData("getUUID"),
      "[DEVICE_INFO]": Devices.getDeviceFieldData("getAdsTracking"),
      "[DEVICE_TYPE]": userData.ua.deviceType,
      "[DEFAULT_LANGUAGE]": "en",
      "[EXTERNAL_IP]": userData.ip,
      "[IDFA]": Devices.getDeviceFieldData("getIDFA"),
      "[IFA]": Devices.getDeviceFieldData("getIDFA") || userData.default_IFA,
      "[IFA_TYPE]": Devices.getDeviceFieldData("getIFAType"),
      "[OS_NAME]": userData.ua.osName,
      "[OS_FAMILY]": userData.ua.osFamily,
      "[PLATFORM]": window.settings.platform,
      "[PLAYER_ID]": "castify",
      "[SESSION_ID]": this.sessionId,
      "[USER_AGENT]": navigator.userAgent,
      "[USER_CITY]": userData.geoData.cityGeoData.city,
      "[USER_COUNTRYISOCODE]": userData.geoData.cityGeoData.countryIsoCode,
      "[USER_REGION]": userData.geoData.cityGeoData.region,
      "[USER_LON]": userData.geoData.cityGeoData.lon,
      "[USER_LAT]": userData.geoData.cityGeoData.lat,
      "[USER_CITYGEONAMEID]": userData.geoData.cityGeoData.cityGeoNameId,
      "[USER_TIMEZONE]": userData.geoData.cityGeoData.timeZone,
      "[USER_REGIONNAME]": userData.geoData.cityGeoData.regionName,
      "[USER_CONTINENTCODE]": userData.geoData.cityGeoData.continentCode,
      "[USER_COUNTRYNAME]": userData.geoData.cityGeoData.countryName,
      "[USER_CONNCTIONTYPE]":
        userData.geoData.connectionTypeGeoData.connectionType,
      "[USER_ISP_ID]": userData.geoData.ispGeoData.ispId,
      "[USER_ISP_NAME]": userData.geoData.ispGeoData.ispName,
      "[USER_CARRIER_ID]": "",
      "[UA_FAMILY]": userData.ua.uaFamily
    };
  }

  /**
 * ${parse: function to replace marcos values in the given url}
 *
 * @param {*} urls
 * @param {{}} [macros={}]
 * @param {boolean\} [changeTemporaryMacros=true]
 * @returns {*\}
 */
  parse(urls, macros = {}, changeTemporaryMacros = true) {
    const changeMacro = (url) => {
      if (!url) return "";
      let _url = url;

      const macrosInUrl = url.match(/\[([A-Z]+(_|)?)+\]/g);
      if (!macrosInUrl) return url;

      const _macros = {
        ...this.constantMacros,
        ...macros,
      };

      if (changeTemporaryMacros) {
        Object.assign(_macros, {
          "[TIMESTAMP]": Date.now(),
          "[REQUEST_ID]": Math.floor(Math.random() * 1000000),
        });
      }

      for (const regExMacro of macrosInUrl) {
        const macroValue = _macros[regExMacro];
        const isNullic = macroValue === null || macroValue === undefined;
        let finalMacroValue = "";

        // Before firing the url we need to remove *all* macros
        // if we don't have data for that macro set it as empty string
        if (changeTemporaryMacros) {
          finalMacroValue = isNullic ? "" : encodeURIComponent(macroValue);
        } else {
          // if we don't need to override macros and the value is nullic, skip the current item in the loop.
          if (isNullic) continue;

          finalMacroValue = encodeURIComponent(macroValue);
        }
        _url = _url.replace(regExMacro, finalMacroValue);
      }
      return _url;
    };

    // in case we are sending only one url
    if (typeof urls === "string") {
      return changeMacro(urls);
    }

    // in case we are sending list of urls
    return urls.map(changeMacro);
  }
}

export default new Parser();
