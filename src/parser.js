// es6 class parse to es5
// class Parser {
//     constructor() {
//       /**
//        * Macros which won't change durning the whole session.
//        */
//       this.constantMacros = {
//         "[WIDTH]": window.innerWidth,
//         "[HEIGHT]": window.innerHeight,
//         "[LANGUAGE]": navigator.language,
//       };
//       /**
//        * @type {String} represent user activity- all events will attach to this ID
//        */
//       this.sessionId = `${Date.now()}${Math.random().toString(16).substring(1)}`;
//     }

//     /**
//      * Init parser module. parsed passed urls.
//      *
//      * @param {object} options
//      * @param {object} options.data Macros data.
//      * @param {Array} options.urls list of urls to change.
//      *
//      * @returns list of parsed urls
//      */
//     init(options) {
//       try {
//         this.setConstantsMacros(options.data);
//         return this.parse(options.urls, {}, false);
//       } catch (err) {
//         console.log(err);
//       }
//     }

//     /**
//      * @description Get the session ID
//      * @returns The session ID
//      */
//     getSessionId() {
//       return this.sessionId;
//     }

//     /**
//      * Get macro by key - don't forget [].
//      *
//      * @returns Foramtted logic JSON
//      */
//     getMacro(macro) {
//       return this.constantMacros[macro] || "";
//     }

//     /**
//      * Set the constant macros which won't change the whole session.
//      *
//      * @param userData Data related to the user device like: user agent, logic data
//      */
//     setConstantsMacros(userData) {
//       this.constantMacros = {
//         ...this.constantMacros,
//         "[APP_VERSION]": window.settings.appSettings.version,
//         "[APP_VER]": window.settings.appSettings.version,
//         "[ADS_TRACKING]": Devices.getDeviceFieldData("getAdsTracking"),
//         "[ADS_TRACKING_NUM]": +Devices.getDeviceFieldData("getAdsTracking"),
//         "[ADMANAGER_ID]": "IMA",
//         "[DEVICE_ID]": Devices.getDeviceFieldData("getUUID"),
//         "[DEVICE_INFO]": Devices.getDeviceFieldData("getAdsTracking"),
//         "[DEVICE_TYPE]": userData.ua.deviceType,
//         "[DEFAULT_LANGUAGE]": "en",
//         "[EXTERNAL_IP]": userData.ip,
//         "[IDFA]": Devices.getDeviceFieldData("getIDFA"),
//         "[IFA]": Devices.getDeviceFieldData("getIDFA") || userData.default_IFA,
//         "[IFA_TYPE]": Devices.getDeviceFieldData("getIFAType"),
//         "[OS_NAME]": userData.ua.osName,
//         "[OS_FAMILY]": userData.ua.osFamily,
//         "[PLATFORM]": window.settings.platform,
//         "[PLAYER_ID]": "castify",
//         "[SESSION_ID]": this.sessionId,
//         "[USER_AGENT]": navigator.userAgent,
//         "[USER_CITY]": userData.geoData.cityGeoData.city,
//         "[USER_COUNTRYISOCODE]": userData.geoData.cityGeoData.countryIsoCode,
//         "[USER_REGION]": userData.geoData.cityGeoData.region,
//         "[USER_LON]": userData.geoData.cityGeoData.lon,
//         "[USER_LAT]": userData.geoData.cityGeoData.lat,
//         "[USER_CITYGEONAMEID]": userData.geoData.cityGeoData.cityGeoNameId,
//         "[USER_TIMEZONE]": userData.geoData.cityGeoData.timeZone,
//         "[USER_REGIONNAME]": userData.geoData.cityGeoData.regionName,
//         "[USER_CONTINENTCODE]": userData.geoData.cityGeoData.continentCode,
//         "[USER_COUNTRYNAME]": userData.geoData.cityGeoData.countryName,
//         "[USER_CONNCTIONTYPE]":
//           userData.geoData.connectionTypeGeoData.connectionType,
//         "[USER_ISP_ID]": userData.geoData.ispGeoData.ispId,
//         "[USER_ISP_NAME]": userData.geoData.ispGeoData.ispName,
//         "[USER_CARRIER_ID]": "",
//         "[UA_FAMILY]": userData.ua.uaFamily,
//       };
//     }

//     /**
//      * Change url macros to pre-defined data
//      *
//      * @param urls Url or array of urls to change
//      * @param macros Additional macros
//      * @param changeTemporaryMacros in case true change all macros, and delete the macros we didn't find data
//      */
//     parse(urls, macros = {}, changeTemporaryMacros = true) {
//       const changeMacro = (url) => {
//         if (!url) return "";
//         let _url = url;

//         const macrosInUrl = url.match(/\[([A-Z]+(_|)?)+\]/g);

//         if (!macrosInUrl) return url;

//         const _macros = {
//           ...this.constantMacros,
//           ...macros,
//         };

//         if (changeTemporaryMacros) {
//           Object.assign(_macros, {
//             "[TIMESTAMP]": Date.now(),
//             "[REQUEST_ID]": Math.floor(Math.random() * 1000000),
//           });
//         }

//         for (const regExMacro of macrosInUrl) {
//           const macroValue = _macros[regExMacro];
//           const isNullic = macroValue === null || macroValue === undefined;
//           let finalMacroValue = "";

//           // Before firing the url we need to remove *all* macros
//           // if we don't have data for that macro set it as empty string
//           if (changeTemporaryMacros) {
//             finalMacroValue = isNullic ? "" : encodeURIComponent(macroValue);
//           } else {
//             // if we don't need to override macros and the value is nullic, skip the current item in the loop.
//             if (isNullic) continue;

//             finalMacroValue = encodeURIComponent(macroValue);
//           }

//           _url = _url.replace(regExMacro, finalMacroValue);
//         }

//         return _url;
//       };

//       // in case we are sending only one url
//       if (typeof urls === "string") {
//         return changeMacro(urls);
//       }

//       // in case we are sending list of urls
//       return urls.map(changeMacro);
//     }
//   }

/**
 * ${1:Description placeholder}
 *
 * @returns
 */
function Parser() {
  this.sessionId = Math.floor(Math.random() * 1000000);
  this.constantMacros = {};

  /**
   * Get the constant macros which won't change the whole session.
   * @param macro
   * @returns {string}
   * @private
   * @deprecated
   * @see getConstantMacros
   *
   *
   *  */

  this.getMacro = function (macro) {
    return this.constantMacros[macro];
  };

  this.getConstantMacros = function () {
    return this.constantMacros;
  };

  this.setConstantMacros = function (macros) {
    this.constantMacros = macros;
  };

  this.setSessionId = function (sessionId) {
    this.sessionId = sessionId;
  };

  this.getSessionId = function () {
    return this.sessionId;
  };
}
