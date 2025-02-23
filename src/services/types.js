export default (event, data) => {
  const macrosData = {
    play: () => {
      return {
        googleAnalytics: new GoogleAnalyticsVideo("Play"),
        castify: new CastifyEvent(21),
      };
    },

    pause: () => {
      return {
        googleAnalytics: new GoogleAnalyticsVideo("Pause"),
        castify: new CastifyEvent(22),
      };
    },

    openApp: (deepLinkData) => {
      return {
        googleAnalytics: new GoogleAnalyticsApp("Open app", true),
        castify: new CastifyEvent(24, deepLinkData),
      };
    },

    carouselClick: (content_id) => {
      return {
        googleAnalytics: new GoogleAnalyticsApp("Carousel click"),
        castify: new CastifyEvent(23, { content_id }),
      };
    },

    exitApp: () => ({
      googleAnalytics: new GoogleAnalyticsApp("Exit app", true),
      castify: new CastifyEvent(25),
    }),
    adRequest: () => ({
      googleAnalytics: new GoogleAnalyticsAds("Ad request"),
      castify: new CastifyEvent(26),
    }),
    impression: () => ({
      googleAnalytics: new GoogleAnalyticsAds("Ad impression"),
      castify: new CastifyEvent(27),
    }),
    adComplete: () => ({
      googleAnalytics: new GoogleAnalyticsAds("Ad complete"),
      castify: new CastifyEvent(28),
    }),
    startVideo: () => ({
      googleAnalytics: new GoogleAnalyticsVideo("Start video"),
      castify: new CastifyEvent(29),
    }),
    adOpportunity: () => ({
      googleAnalytics: new GoogleAnalyticsAds("Ad Opportunity"),
      castify: new CastifyEvent(31),
    }),
    endVideo: () => {
      return {
        googleAnalytics: new GoogleAnalyticsVideo("End Video", true),
        castify: new CastifyEvent(32),
      };
    },
    adStarted: (adInfo) => {
      return {
        googleAnalytics: new GoogleAnalyticsAds("Ad started"),
        castify: new CastifyEvent(34, adInfo),
      };
    },
    firstQuartile: (adInfo) => ({
      googleAnalytics: new GoogleAnalyticsAds("Ad first quartile", true),
      castify: new CastifyEvent(35, adInfo),
    }),
    thirdQuartile: (adInfo) => ({
      googleAnalytics: new GoogleAnalyticsAds("Ad third quartile", true),
      castify: new CastifyEvent(37, adInfo),
    }),
    pageVisit: (pageData) => ({
      googleAnalytics: new GoogleAnalyticsApp("Page visit"),
      castify: new CastifyEvent(40, pageData),
    }),
    adBreakStarted: () => ({
      googleAnalytics: new GoogleAnalyticsAds("Ad break started", true),
      castify: new CastifyEvent(43),
    }),
    adBreakCompleted: () => ({
      googleAnalytics: new GoogleAnalyticsAds("Ad break finished", true),
      castify: new CastifyEvent(44),
    }),
    adError: (err) => ({
      googleAnalytics: new GoogleAnalyticsAds("Ad Error"),
      castify: new CastifyError(err),
    }),
    videoError: (err) => ({
      googleAnalytics: new GoogleAnalyticsError(
        `Video: ${err.videoId} failed, url: ${err.url}.`,
        false
      ),
      castify: new CastifyError(err),
    }),
  };
  const eventData = macrosData[event];

  return eventData ? eventData(data) : undefined;
};

/**
 * ${1:Description placeholder}
 *
 * @class GoogleAnalytics
 * @typedef {GoogleAnalytics}
 */
class GoogleAnalytics {  
  /**
 * Creates an instance of GoogleAnalytics.
 *
 * @constructor
 * @param {*} eventName
 * @param {boolean} [nonInteraction=false]
 */
constructor(eventName, nonInteraction = false) {    
    this.eventName = eventName;
    this.non_interaction = nonInteraction;
  }
}

/**
 * ${1:Description placeholder}
 *
 * @class GoogleAnalyticsApp
 * @typedef {GoogleAnalyticsApp}
 * @extends {GoogleAnalytics}
 */
class GoogleAnalyticsApp extends GoogleAnalytics {
  /**
 * Creates an instance of GoogleAnalyticsApp.
 *
 * @constructor
 * @param {*} eventName
 */
constructor(eventName) {
    super(eventName, true);
    this.parameters = {
      event_category: "App",
    };
  }
}

/**
 * ${1:Description placeholder}
 *
 * @class GoogleAnalyticsAds
 * @typedef {GoogleAnalyticsAds}
 * @extends {GoogleAnalytics}
 */
class GoogleAnalyticsAds extends GoogleAnalytics {
  /**
 * Creates an instance of GoogleAnalyticsAds.
 *
 * @constructor
 * @param {*} eventName
 */
constructor(eventName) {
    super(eventName);
    this.parameters = {
      event_category: "Ads",
    };
  }
}

/**
 * ${1:Description placeholder}
 *
 * @class GoogleAnalyticsVideo
 * @typedef {GoogleAnalyticsVideo}
 * @extends {GoogleAnalytics}
 */
class GoogleAnalyticsVideo extends GoogleAnalytics {
  /**
 * Creates an instance of GoogleAnalyticsVideo.
 *
 * @constructor
 * @param {*} eventName
 */
constructor(eventName) {
    super(eventName);
    this.parameters = {
      event_category: "Video",
    };
  }
}

/**
 * ${1:Description placeholder}
 *
 * @class GoogleAnalyticsError
 * @typedef {GoogleAnalyticsError}
 */
class GoogleAnalyticsError {
  /**
 * Creates an instance of GoogleAnalyticsError.
 *
 * @constructor
 * @param {*} description
 * @param {*} fatal
 */
constructor(description, fatal) {
    this.description = description;
    this.fatal = fatal;
  }
}

/**
 * ${1:Description placeholder}
 *
 * @class CastifyEvent
 * @typedef {CastifyEvent}
 */
class CastifyEvent {
  /**
 * Creates an instance of CastifyEvent.
 *
 * @constructor
 * @param {*} eventID
 * @param {*} eventValue
 */
constructor(eventID, eventValue) {
    this["[EVENT_ID]"] = eventID;

    if (eventValue) {
      this["[EVENT_VALUE]"] = JSON.stringify(eventValue);
    }
  }
}

/**
 * ${1:Description placeholder}
 *
 * @class CastifyError
 * @typedef {CastifyError}
 * @extends {CastifyEvent}
 */
class CastifyError extends CastifyEvent {
  /**
 * Creates an instance of CastifyError.
 *
 * @constructor
 * @param {*} error
 */
constructor(error) {
    super(30);
    this["[ERROR_ID]"] = JSON.stringify(error);
  }
}
