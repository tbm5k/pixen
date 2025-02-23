/**
 * Zeasn Device Center
 */

export default class Zeasn {
	/**
 * Creates an instance of Zeasn.
 *
 * @constructor
 */
	constructor() {
		this.name = "zeasn";
		this.device = "";
		this.adsTracking = false;
		this.IFAType = "ppid";
	}

	initDevice = async () => {
		try {
			this.device = await this.loadScripts(); // load zeasn SDK
			const urlParams = new URLSearchParams(window.location.search);

			return {
				keys: Zeasn.buildKeys(),
				deepLinkData: {
					video: urlParams.get("video_id"),
					source: urlParams.get("source"),
					carousel: urlParams.get("carousel")
				},
				platformSettings: {
					animation: false,
					keyboard: true,
					cursor: false,
					encoding: "normal",
					subtitles: true,
					hlsHelp: false
				}
			}
		} catch (err) {
			throw err
		}
	}

	loadScripts() {
		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = "https://cache.zeasn.tv/webstatic/homepage_web/deviceinfo/zeasn_deviceInfo_sdk.js"
			script.type = "text/javascript";
			script.onload = () => {
				window.onDeviceInfoReady(resolve)
			}
			script.onerror = reject
			document.body.appendChild(script);
		})

	}

	/**
 * build keys
 *
 * @returns {{ BACK: any; STOP: any; FORWARD: any; REWIND: any; PLAY: any; PAUSE: any; LEFT: any; RIGHT: any; UP: any; DOWN: any; ENTER: any; }\}
 */
	static buildKeys = () => {
		if ((/Android/i).test(navigator.userAgent))
			return {
				BACK: window.KEYCODE_BACK,
				STOP: window.KEYCODE_MEDIA_STOP,
				FORWARD: window.KEYCODE_MEDIA_FAST_FOWARD,
				REWIND: window.KEYCODE_MEDIA_REWIND,
				PLAY: window.KEYCODE_MEDIA_PLAY,
				PAUSE: window.KEYCODE_MEDIA_PAUSE,
				LEFT: window.KEYCODE_DPAD_LEFT,
				RIGHT: window.KEYCODE_DPAD_RIGHT,
				UP: window.KEYCODE_DPAD_UP,
				DOWN: window.KEYCODE_DPAD_DOWN,
				ENTER: window.KEYCODE_ENTER
			}

		return {
			BACK: window.VK_BACK,
			STOP: window.VK_STOP,
			FORWARD: window.VK_FAST_FWD,
			REWIND: window.VK_REWIND,
			PLAY: window.VK_PLAY,
			PAUSE: window.VK_PAUSE,
			LEFT: window.VK_LEFT,
			RIGHT: window.VK_RIGHT,
			UP: window.VK_UP,
			DOWN: window.VK_DOWN,
			ENTER: window.VK_ENTER
		}
	};

	/**
	* function to exit the application
	*
	* @returns {*}
	*/

	exitApp = () => window.close();
	getDeviceDetailed = () => this.device && `year: ${this.device.Product.year} vendor: ${this.device.Channel.vendor}`;
	getAdsTracking = () => this.adsTracking;
	getIDFA = () => this.device && this.device.Product.WhaleAdID;
	getUUID = () => this.device && this.device.Product.deviceID;
	/**
   * Identifier for Advertising 
   *
   * @returns {string}
   */
	getIFAType = () => this.IFAType;
}