/**
 * Vidaa Device Center
 */
export default class Vidaa {
	/**
 * Creates an instance of Vidaa.
 *
 * @constructor
 */
	constructor() {
		this.name = "vidaa";
		this.IFAType = "ppid";
		this.IDFA = "";
		this.adsTracking = "";

		this.uuid = window.Hisense_GetDeviceID ? window.Hisense_GetDeviceID() : "";
		this.canPlay4k = window.Hisense_Get4KSupportState ? window.Hisense_Get4KSupportState() : "";
	}

	initDevice = async () => {
		window.Hisense_enableVKB && window.Hisense_enableVKB();

		const urlParams = new URLSearchParams(window.location.search);

		return {
			keys: {
				BACK: window.VK_BACK_SPACE,
				STOP: window.VK_STOP,
				FORWARD: window.VK_FAST_FWD,
				REWIND: window.VK_REWIND,
				PLAY: window.VK_PLAY,
				PAUSE: window.VK_PAUSE,
				TOGGLE_PLAY: window.VK_PLAY_PAUSE,
				LEFT: window.VK_LEFT,
				RIGHT: window.VK_RIGHT,
				UP: window.VK_UP,
				DOWN: window.VK_DOWN,
				ENTER: window.VK_ENTER
			},
			deepLinkData: {
				video: urlParams.get("video_id"),
				source: urlParams.get("source"),
				carousel: urlParams.get("carousel")
			},
			platformSettings: {
				animation: false,
				keyboard: false,
				cursor: false,
				encoding: "normal",
				subtitles: true,
				hlsHelp: false
			}
		}
	}

	exitApp = () => window.close();

	getDeviceDetailed = () => {
		let text = ""

		if (window.Hisense_GetFirmWareVersion)
			text += `firmware: ${window.Hisense_GetFirmWareVersion()}`
		if (window.Hisense_GetModelName)
			text += ` model: ${window.Hisense_GetModelName()}`
		if (window.Hisense_GetBrand)
			text += ` brand: ${window.Hisense_GetBrand()}`

		return text
	}

	getAdsTracking = () => this.adsTracking;

	getIDFA = () => this.IDFA;

	getUUID = () => this.uuid

  /**
 * Identifier for Advertising 
 *
 * @returns {string}
 */
	getIFAType = () => this.IFAType;
}

