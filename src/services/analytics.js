/**
 * Analytics
 */

class Analytics {  
  /**
 * Creates an instance of Analytics.
 *
 * @constructor
 * @param {*} analytics
 */
constructor(analytics) {
    this.analytics = analytics;    
  }

  /**
 * send event
 *
 * @async
 * @param {*} eventType
 * @param {*} eventData
 * @returns {*}
 */
async sendEvent(eventType, eventData) {
    if (!this.analytics) return;


    this.analytics.sendEvent(eventType, eventData, "video");
  }

  /**
 * send ad event
 *
 * @async
 * @param {*} eventType
 * @param {*} adEvent
 * @returns {*}
 */
async sendAdEvent(eventType, adEvent) {
    if (!this.analytics) return;
    let eventInfo = {};

    if (adEvent) {
      const adData = adEvent.getAd();

      if (adData) {
        const podInfo = adData.getAdPodInfo();
        eventInfo = {
          adId: adData.getAdId(),
          adSystem: adData.getAdSystem(),
          advertiserName: adData.getAdvertiserName(),
          creativeId: adData.getCreativeId(),
          title: adData.getTitle(),
          mediaUrl: adData.getMediaUrl(),
          adPodInfo: {
            totalAds: podInfo.getTotalAds(),
            maxDuration: podInfo.getMaxDuration(),
          },
        };
      }
    }

    this.analytics.sendEvent(eventType, eventInfo, "video");
  }

  /**
 * send error event
 *
 * @async
 * @param {*} eventType
 * @param {*} errorData
 * @returns {*}
 */
async sendError(eventType, errorData) {
    if (!this.analytics) return;

    this.analytics.sendError(eventType, errorData, "video");
  }

  /**
 * set the channel data which is playing currently
 *
 * @param {*} video
 */
setVideoSession(video) {
    if (!this.analytics) return;

    this.analytics.setVideoSession(video);
  }
}

export default Analytics;
