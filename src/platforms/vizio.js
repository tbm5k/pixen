/**
 * Vizio Device Center
 */

import PlatformEvents from "../utils/eventsBus";

export default class Vizio {
	/**
 * Creates an instance of Vizio.
 *
 * @constructor
 */
	constructor() {
		this.name = "vizio";
		this.advertiserID = "";
		this.deviceId = "";
		this.firmwareVersion = "";
		this.PlatformEvents = new PlatformEvents();
	}

 	/**
	* initialize device. and returns key codes on vizio , deep link data and platform settings
	*
	* @returns {*}
	*/
	async initDevice() {
		try {
			await this.loadScripts();
			this.registerListeners();
			await this.getDeviceData();

			const urlParams = new URLSearchParams(window.location.search);

			return {
				keys: {
					BACK: 8,
					EXIT: 27,
					TOGGLE_PLAY: 19,
					FORWARD: 417,
					REWIND: 412,
					STOP: 413,
					PAUSE: 19,
					PLAY: 415,
				},
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
					playerCrossorigin: true,
					subtitles: true,
					hlsHelp: true
				}
			}
		}
		catch (err) {
			throw err;
		}
	}

	async getDeviceData() {
		const getDeviceData = (field) => {
			return new Promise((resolve, reject) => {
				window.VIZIO[field](data => {
					try {
						resolve(data);
					} catch (err) {
						reject(err);
					}
				});
			})
		}

		const vizioData = await Promise.all([
			getDeviceData("setAdvertiserIDListener"),
			getDeviceData("getFirmwareVersion"),
			getDeviceData("getDeviceId")
		]);

		this.advertiserID = vizioData[0];
		this.firmwareVersion = vizioData[1];
		this.deviceId = vizioData[2];
	}

	registerListeners() {
		// cc toggle event
		window.VIZIO.setClosedCaptionHandler((isCCEnabled) => {
			const toggleCaptionEvent = this.PlatformEvents.get("toggleCaptions");

			if (!toggleCaptionEvent) return;

			// check if we registered event called "toggleCaptions", if so send the CC state (on/off)
			for (const event of toggleCaptionEvent) {
				event(isCCEnabled);
			}
		});

		window.VIZIO.setContentChangeHandler((contentURL) => {
			const contentChangeEvent = this.PlatformEvents.get("contentChange");

			if (!contentChangeEvent) return;

			// check if we registered event called "contentChange", if so send the path (will be the video id)
			for (const event of contentChangeEvent) {
				event(contentURL.substring(contentURL.lastIndexOf("/") + 1));
			}
		});
	}

	loadScripts() {
		return new Promise((resolve, reject) => {
			try {
				const script = document.createElement("script");
				script.src = "http://localhost:12345/scfs/cl/js/vizio-companion-lib.js";
				script.type = "text/javascript";
				script.onload = () => {
					document.addEventListener("VIZIO_LIBRARY_DID_LOAD", resolve);
				}
				script.onerror = reject;
				document.body.appendChild(script);
			}
			catch (err) {
				reject();
			}
		})
	}

	/**
	* function to exit the application
	*
	* @returns {*}
	*/

	exitApp = () => window.VIZIO.exitApplication();

	getDeviceDetailed = () => `firmware: ${this.firmwareVersion} model: ${window.VIZIO.deviceModel}`

	getAdsTracking = () => this.advertiserID.LMT ? true : false;

	getIDFA = () => this.advertiserID.IFA;

	getIFAType = () => this.advertiserID.IFA_TYPE;

	/**
 * ${1:Description placeholder}
 *
 * @returns {string}
 */
	getUUID = () => this.deviceId;
}