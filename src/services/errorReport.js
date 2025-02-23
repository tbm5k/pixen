/**
 * Error Report
 */

import beacons from "./beacons";

/**
 * ErrorReport
 *
 * @class ErrorReport
 * @typedef {ErrorReport}
 */
class ErrorReport {
  /**
 * Creates an instance of ErrorReport.
 *
 * @constructor
 */
constructor() {
    this.generalErrorsBeacon =
      "https://castify-trk.playitviral.com/video/stats/ping.php?DATA_SOURCE_HASH=7tkrb5&";
  }

  /**
 * report error event
 *
 * @async
 * @param {*} errorData
 * @returns {*}
 */
async trackError(errorData) {
    // const finalError = {
    //   EVENT: 30,
    //   APP_HASH: "",
    //   DATETIME: Date.now(),
    //   PLATFORM: window.settings?.platform || "",
    //   APP_VERSION: window.settings.appSettings.version || "",
    //   IP: window.settings.appSettings.isoCode,
    //   ADDITIONAL_DATA: JSON.stringify(errorData),
    // };

    // beacons.fireBeacon(
    //   this.generalErrorsBeacon + new URLSearchParams(finalError).toString()
    // );
  }
}

export default new ErrorReport();
