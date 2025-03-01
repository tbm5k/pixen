import { underMaintenance } from "../components/underMaintenance";
// import Beacons from "../services/beacons";
import { GET } from "./get";
import errorReport from "../services/errorReport";
import Parser from "./parser";
import ChannelSettings from "../settings/channelSettings";
import DeviceCenter from "../services/deviceCenter";


/**
 * translateJson
 *
 * @param {*} json
 * @param {*} vast
 * @returns {*}
 */
const translateJson = (json, vast) => {
  switch (json.Info.class) {
    case "7":
      return v7Init(json, vast);
    default:
      throw new Error(`Unsupported json version: ${json.Info.class}`);
  }
};

/**
 * load scripts by the platform
 *
 * @param {*} options
 * @returns {*}
 */
const loadScripts = (options) => {
  const listOffScriptsToLoad = [];

  if (options.pal) {
    listOffScriptsToLoad.push(() => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "//imasdk.googleapis.com/pal/sdkloader/pal.js";
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });
    });
  }

  return Promise.all[listOffScriptsToLoad.map((promisefunc) => promisefunc())];
};

/**
 * function to initialize window settings 
 */
const setWindowData = () => {
  window.settings = {
    platform: "",
    platformSettings: {},
    appSettings: {},
    deepLinkData: {},
  };
};

/**
    *
    * @function generateLogicUrl
    * @description generates a logic url from the passed hash
    * @param {string} hash
    * @returns {string}
    *
 * Hash: TV unique id to determine a specific tv. will use to get the settings 
 * 4fpgggl6py => Fashion TV
 * njsfvtweaa => 24flix
 * s6xjws00o5 => Nollywood Capital TV
 * vklwkp7w2s => Unreal TV
 * ctxe85cvw5 => Auto Allstars
 * vwb1upv460 => Rep Dat TV
 * baqn4tlk8e => ScreenMagic TV
 * wdjzf9ayeb => DOC BOX
 * zvmhs9hfuj => black screen
 *  m1dk1729h5 => coffe jazz
 * j4lseacvi8 => bob the train
 * yzpgKjrDAM =>
 * xhxxamifyo => PopStar TV
 * 745mzqybbr => Made It Myself TV
 * j2r5jdz7xc => Brazil Times
 * 8mslt993x6 => High Octaine TV
 * 79gqu2zw9w => DangerTV
 *
 * @param {*} hash
 * @returns {string}
 */
const generateLogicUrl = (hash) => {
  return `https://logic.castify.ai/srv/logic/?hash=1rk064&cad[channel_id]=${hash}&rd=1&cad[client_type]=3&cad[channel_output]=_manifest`
}

/**
    * @function getLogicUrl
    * @description fetches the logic url of a channel hash, else defaults to high octane
    * @param {string} customHash
    * @returns {string}
    */
const getLogicUrl = (customHash) => {
    let hash;
    if (customHash) return generateLogicUrl(customHash);
    try {
        const params = new URLSearchParams(location.search);
        hash = params.get("hash");
        // hash = window.location.search.split("=")[1]; // Browser
        if (hash) return generateLogicUrl(hash);
    } catch (error) {

    }
    const elem = document.getElementById("jsonUrl"); // TV devices
    if (elem) {
        let url = elem.innerText.trim();
        if (!url) throw new Error("No url found");
        return url;
    } else {
        return generateLogicUrl("8mslt993x6") // High Octaine TV as a default
    }
};

/**
    * @async
    * @function getLogic
    * @description fetches and extracts data from the logic url - final click url and device information
    * @param {string} customHash
    * @returns {unknown}
    */
const getLogic = async (customHash) => {
    try {
        // Attempt to parse the logic URL and fetch data
        const logicUrl = Parser.parse(getLogicUrl(customHash));
        if (!logicUrl) {
            throw new Error("Failed to parse logic URL");
        }

        const response = await GET(logicUrl).catch((err) => {
            console.error("Error during GET request for logic URL:", err);
            throw new Error("Failed to fetch logic data");
        });

        const { finalClickUrl, requestData = {} } = response;

        // Validate the response structure
        if (!finalClickUrl) {
            throw new Error("Missing 'finalClickUrl' in response");
        }

        const { deviceData = {}, geoData = {} } = requestData;

        // Validate deviceData structure
        if (!deviceData.uaData) {
            throw new Error("Invalid 'deviceData': Missing 'uaData'");
        }

        // Construct userData
        const userData = {
            ip: deviceData.ip || "Unknown IP",
            default_IFA: deviceData.deviceIfa || "Unknown IFA",
            geoData: geoData || "No GeoData",
            ua: {
                osName: deviceData.uaData.osName || "Unknown OS Name",
                osFamily: deviceData.uaData.osFamily || "Unknown OS Family",
                uaFamily: deviceData.uaData.uaFamily || "Unknown UA Family",
                deviceType: deviceData.uaData.deviceType || "Unknown Device Type",
            },
        };

        // Return the final logic data
        return {
            url: finalClickUrl,
            userData,
        };
    } catch (error) {
        console.error("Error in getLogic:", error);

        // Track the error for monitoring purposes
        errorReport.trackError({
            message: error.message || "Unknown error",
            stack: error.stack || "No stack trace",
            additionalInfo: { customHash },
        });

        // Re-throw the error to propagate it
        throw error;
    }
};


/**
    * @async
    * @function destructures data from json composing the neccessary data into a menifest object
    * @param {string} url
    * @param {string} iso
    * @returns {Object}
    */
const getManifest = async (url, iso) => {
    try {
        // Fetch the manifest data
        const manifest = await GET(url).catch((err) => {
            console.error("Error during GET request for manifest:", err);
            throw new Error("Failed to fetch manifest data");
        });

        // Validate manifest structure
        if (!manifest) {
            throw new Error("Manifest data is undefined or null");
        }

        const channelStatus = manifest.channel_status;

        // Check the channel status
        if (channelStatus && channelStatus !== "Live") {
            throw new Error(`App status: ${channelStatus}`, { cause: channelStatus });
        }

        // Validate required fields in manifest
        if (!manifest.translation_url) {
            console.warn("Missing 'translation_url' in manifest");
        }

        if (!manifest.beacons) {
            console.warn("Missing 'beacons' in manifest");
        }

        if (!manifest.channel_settings_url) {
            console.warn("Missing 'channel_settings_url' in manifest");
        }

        // Return the processed manifest data
        return {
            translation_url: manifest.translation_url || null,
            splash_screen: manifest.splash_screen || null,
            feed: manifest.multi_geo_content?.[iso] || manifest.multi_geo_content?.all || null,
            beacons: manifest.beacons || null,
            channel_settings_url: manifest.channel_settings_url || null,
        };
    } catch (error) {
        console.error("Error in getManifest:", error);

        // Track the error for monitoring purposes
        errorReport.trackError({
            message: error.message || "Unknown error",
            stack: error.stack || "No stack trace",
            additionalInfo: { url, iso },
        });

        // Re-throw the error to propagate it
        throw error;
    }
};


/**
 * use to get app data
 *
 * @async
 * @param {*} apiUrl
 * @param {*} dataToReplace
 * @returns {unknown}
 */
// export const BASE_URL = "https://pixen.b-cdn.net";
export const BASE_URL = "https://cdn.jsdelivr.net/gh/ayodorigan/pixent-tv-assets";

const getAppJson = async (page) => {
    try{
        const res = await fetch(`${BASE_URL}/${page}.json`);
        const data = await res.json();

        return data;
    }catch(err){
        underMaintenance(err);
    }
};

/**
 * Get translations
 *
 * @async
 * @param {*} url
 * @returns {unknown}
 */
const getTranslation = async (url) => {
  if (!url) return langData;

  try {
    return await GET(url);
  } catch (error) {
    return langData;
  }
};


/**
 * Get channel settings
 *
 * @async
 * @param {*} channelSettingsHash
 * @returns {unknown}
 */

const getSettings = async (channelSettingsHash) => {
    try {
        // Check if channelSettingsHash is provided
        if (!channelSettingsHash) {
            console.warn("No channelSettingsHash provided. Initializing default settings.");
            return ChannelSettings.init();
        }

        // Fetch settings data
        const settings = await GET(channelSettingsHash).catch((err) => {
            console.error("Error during GET request for channel settings:", err);
            throw new Error("Failed to fetch channel settings");
        });

        // Initialize ChannelSettings with fetched data
        return ChannelSettings.init(settings);
    } catch (error) {
        console.error("Error in getSettings:", error);

        // Log the error for monitoring
        errorReport.trackError({
            message: error.message || "Unknown error",
            stack: error.stack || "No stack trace",
            additionalInfo: { channelSettingsHash },
        });

        // Fallback to default settings in case of any errors
        console.warn("Falling back to default channel settings.");
        return ChannelSettings.init();
    }
};

/**
 * Get app data with the hash id
 *
 * @async
 * @param {string} customHash
 * @returns {object}
 */

const getAppData = async () => {
    try {
        // Set initial window data
        // try {
        //     setWindowData();
        // } catch (err) {
        //     console.error("Error in setWindowData:", err);
        //     throw err;
        // }

        // Ensure required data is present
        const appJson = await getAppJson('home');

        // Load additional scripts based on appJson
        try {
            // loadScripts({
            //     pal: appJson.value.Ads?.sdk_type === "pal",
            // });
        } catch (err) {
            console.error("Error in loadScripts:", err);
            throw err;
        }

        // Initialize parser and beacons
        try {
            // const [beaconUrl, beaconSession, beaconVideo, vastURL] = Parser.init({
            //     data: logic.userData,
            //     urls: [
            //         manifest.beacons.url,
            //         manifest.beacons.url_session,
            //         manifest.beacons.url_video,
            //         appJson.value.Ads?.vastURL,
            //     ],
            // });
            //
            // console.log("VAST URL:", vastURL);

            // Beacons.init({ beaconUrl, beaconSession, beaconVideo });
        } catch (err) {
            console.error("Error in Parser or Beacons initialization:", err);
            throw err;
        }

        // Return required data
        return {
            appJson,
            // translation: translation.value,
        };
    } catch (error) {
        console.error("Error in getAppData:", error);

        // Report error and display maintenance screen
        // errorReport.trackError({
        //     message: error?.message || "Unknown error",
        //     stack: error?.stack || "No stack trace",
        //     additionalInfo: { customHash: '' },
        // });

        const app_loader = document.getElementById("app_loader");
        if (app_loader) app_loader.classList.remove("show");

        underMaintenance();

        // Re-throw the error to propagate it
        throw error;
    }
};

const getCategories = async () => {
    try{
        const response = await fetch(`${BASE_URL}/pixen_categories.json`);
        const categories = await response.json();
        window.categories = categories;
        return categories;
    }catch(err){
        console.log(err);
    }
}

// Global listener for unhandled rejections
window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled rejection:", event.reason?.stack || event.reason);
    // errorReport.trackError({
    //     message: event.reason?.message || "Unhandled rejection",
    //     stack: event.reason?.stack || "No stack trace",
    // });
});


// Global listener for unhandled rejections
window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled rejection:", event.reason?.stack || event.reason);
    // errorReport.trackError({
    //     message: event.reason?.message || "Unhandled rejection",
    //     stack: event.reason?.stack || "No stack trace",
    // });
});


export { getLogic, getAppData, getCategories };
