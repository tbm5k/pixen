/**
 * Google Analytics
 */

import ChannelSettings from "../settings/channelSettings";
import getEventData from "./types";
import Beacons from "./beacons";

/**
 *
 * @class GlobalAnalytics
 * @typedef {GlobalAnalytics}
 */
class GlobalAnalytics {
  /**
 * track the channel data which playing currently
 *
 * @param {*} video
 */
setVideoSession(video) {
    Beacons.generateVideoSession(video);
  }

  /**
 * send event
 *
 * @param {*} event
 * @param {*} eventData
 * @param {*} type
 * @returns {*}
 */
sendEvent(event, eventData, type) {
    const data = getEventData(event, eventData);
    if (!data) return console.error("no valid event");

    const analyticsPlugins = ChannelSettings.getPlugins("analytics");

    Beacons.sendEvent(data.castify, type);

    if (analyticsPlugins) {
      for (const plugin of analyticsPlugins) {
        try {
          plugin.sendEvent(data[plugin.name]);
        } catch (err) {
          console.warn(`Sending event for: ${plugin.name} failed`, err);
        }
      }
    }
  }

  /**
 * send error
 *
 * @param {*} eventType
 * @param {*} errorData
 * @param {*} type
 * @returns {*}
 */
sendError(eventType, errorData, type) {
    const data = getEventData(eventType, errorData);
    const analyticsPlugins = ChannelSettings.getPlugins("analytics");

    if (!data) return console.error(`No valid error event ${eventType}`);

    Beacons.sendError(data.castify, type);

    if (analyticsPlugins)
      for (const plugin of analyticsPlugins) {
        try {
          plugin.sendError(data[plugin.name]);
        } catch (err) {
          console.warn(`Sending event for: ${plugin.name} failed`, err);
        }
      }
  }
}

export default GlobalAnalytics;
