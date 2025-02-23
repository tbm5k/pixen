/**
 * Ads management
 * Reference:  https://developers.google.com/ad-manager/pal/ctv
 */

import Player from "../pages/player";
import GlobalAnalytics from "../services/globalAnalytics";
import Analytics from "../services/analytics";
import parser from "../api/parser";
import HlsPlayer from "./common/hls";
import {el} from "../utils";
import appSettings from "../data/appSettings.json";
import Devices from "../services/deviceCenter";
import Hls from "hls.js";


var adContainer;
var adDisplayContainer;
var adsLoader;
export var adsManager;
var videoElement;
var adInterval; //the interval between ads in seconds
var adRetrials = 0
let nonceLoader;
let managerPromise;
let storageConsent = true;
let isPostRollAd;
function initializeIMA() {
    videoElement = document.getElementById("video");
   try {
        if (!google) return
        adContainer = document.getElementById("ad_parent")
        adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement);
   } catch (error) {
    console.error(error)
   }
}


function requestAds(adInfo) {
    adsLoader = new google.ima.AdsLoader(adDisplayContainer);
    adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        (event)=>{onAdsManagerLoaded(event, adInfo)},
        false
    );
    adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        (event) => {onAdError(event, adInfo)},
        false
    );
    const adsRequest = new google.ima.AdsRequest();
    var url = appData.Ads.vastURL;
    let channelInfo = adInfo.channelInfo;
    const macros = {
        "[VIDEO_TITLE]": channelInfo.title,
        "[VIDEO_CONTENT_ID]": channelInfo.id
        // "[PAL_STRING]": nonceManager?.nonce || ""
    };
    url = parser.parse(url, macros);
    // url = "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator="
    adsRequest.adTagUrl = url;
    adsRequest.linearAdSlotWidth = adContainer.offsetWidth;
    adsRequest.linearAdSlotHeight = adContainer.offsetHeight;
    adsRequest.nonLinearAdSlotWidth = adContainer.offsetWidth;
    adsRequest.nonLinearAdSlotHeight = adContainer.offsetHeight / 3;
    sendAnalytics("adRequest");
    adsLoader.requestAds(adsRequest);
}


function onAdsManagerLoaded(event, adInfo) {
    adsManager = event.getAdsManager(videoElement);
    adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, (event)=>{onAdError(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_READY, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_STARTED, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_ENDED, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.IMPRESSION, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.FIRST_QUARTILE, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.MIDPOINT, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.THIRD_QUARTILE, (event)=>{onAdEvent(event, adInfo)});
    adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, (event)=>{onAdError(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_FETCH_ERROR, (event)=>{onAdError(event, adInfo)});
    adsManager.addEventListener(google.ima.AdEvent.Type.LOG, onAdLog);
    try {
        adsManager.init(adContainer.offsetWidth, adContainer.offsetHeight, google.ima.ViewMode.NORMAL);
        adsManager.start();
    } catch (adError) {
        console.error('adEror:', adError);
        videoElement.play();
    }
}

function onAdError (event, adInfo) {
    Player.isAdPlaying = false;
    videoElement.setAttribute('data-content-type', 'content');
    console.error('adEror:', event.getError());
    if (adsManager) adsManager.destroy();
    let { channelInfo, isPostRoll = false, currentTime = 0 } = adInfo || {};
    if (isPostRoll) {
        destroyAd()
        return
    }
    videoElement.play();
    if (adRetrials < 3) {
        adRetrials += 1
        playAds(channelInfo,  {isPostRoll , currentTime}) // ad fail retrial
    }
}

function onAdLog(event) {

}

function onContentPauseRequested() {
    videoElement.pause();
}

function onContentResumeRequested(adInfo) {
    videoElement.setAttribute('data-content-type', 'content');
    if (videoElement.paused) {
        resetVizio(adInfo)
        console.log("content resuming");
        videoElement.play().catch((err) => console.error('Error resuming playback:', err));
    }
}

export function playAds( channelInfo, {isPostRoll = false, currentTime = 0} = {} ) {
    if (!adDisplayContainer) {
        initializeIMA()
    }

    if (!adDisplayContainer) {
        videoElement.play()
        return
    }
    if (isPostRoll && adsLoader) {
        console.log(`adEvent-roll: post-roll`)
        adsLoader.contentComplete();
    }
    isPostRollAd = isPostRoll
    adDisplayContainer.initialize();
    requestAds({channelInfo: channelInfo, currentTime: currentTime, isPostRoll: isPostRoll});
}

export function destroyAd({
    forceDestroy = false,
    forceResume = false,
    adInfo = {}
} = {}) {
    Player.isAdPlaying = false;
    const ad_duration_parent = document.getElementById("ad_duration_parent");
    if (ad_duration_parent) {
        ad_duration_parent.classList.add("hidden");
    }

    if (forceDestroy || isPostRollAd) {
        if (adsManager) {
            adsManager.destroy();
            adsManager = null;
        }
        if (adContainer) {
            adContainer.remove();
        }
        clearInterval(adInterval);
        adsLoader = null;
        adDisplayContainer = null;
        adInterval = null;
        if (!forceDestroy) {
            HlsPlayer.autoPlayNext()
        }
        return;
    }
    if (forceResume && videoElement.paused) {
        videoElement.play()
    }
}

function resetVizio(adInfo) {
    if (videoElement.paused) {
        // if (Devices.platformInstance.name === 'vizio') {
            const id = videoElement.getAttribute('data-id');
            // if (id) {
                const source = adInfo.channelInfo.streamURL;//appData.content[id]?.streamURL;
                const isHlsVideo = source.includes('.m3u8');
                if (source && isHlsVideo && Hls.isSupported) {
                    const hls = new Hls();
                    hls.loadSource(source);
                    hls.attachMedia(videoElement);
                } else {
                    videoElement.src = source;
                }
                videoElement.currentTime = adInfo.currentTime;    
                console.log("currentTime: " + videoElement.currentTime);
                            
            // }
        // }
    }
}

/**
 * A placeholder for the publisher's own method of obtaining user
 * consent, either by integrating with a CMP or based on other
 * methods the publisher chooses to handle storage consent.
 * @return {boolean} Whether storage consent has been given.
 */
function getConsentToStorage() {
    return storageConsent;
}

/**
 * generate nonce
 */
function generateNonce() {
    try {
        // The default value for `allowStorage` is false, but can be changed once the appropriate consent has been gathered.
        const consentSettings = new goog.ctv.pal.ConsentSettings();
        consentSettings.allowStorage = getConsentToStorage();
        nonceLoader = new goog.ctv.pal.NonceLoader(consentSettings);
        const request = new goog.ctv.pal.NonceRequest();
        request.adWillAutoPlay = false;
        request.adWillPlayMuted = false;
        request.continuousPlayback = false;
        request.iconsSupported = true;
        request.playerType = 'HlsPlayer';
        request.playerVersion = '1.0';
        request.ppid = generateRandomString(20);
        request.sessionId = channelInfo?.content_session_id;
        // Player support for VPAID 2.0, OMID 1.0, and SIMID 1.1
        request.supportedApiFrameworks = '2,7,9';
        request.url = 'https://developers.google.com/ad-manager/pal/ctv';
        request.videoHeight = videoElement?.clientHeight || 1080;
        request.videoWidth = videoElement?.clientWidth || 1920;

        managerPromise = nonceLoader.loadNonceManager(request);
        managerPromise.then((manager) => {
            nonceManager = manager;
        }).catch((error) => {
            console.error(error)
        });
    } catch (error) {
        console.error(error)
    }
}

/**
 * generate a radom string with given lenth
 * @param {*} length
 * @returns {*}
 */
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result.toUpperCase();
}

function onAdLoaded(adEvent) {
    sendAnalytics("adBreakStarted")
    // when ad got stuck, resume to next video automatically after ad duration.
    setTimeout(() => {
        if (Player.isAdPlaying) {
            destroyAd({
                forceResume: true
            });
            // sendAnalytics("adComplete")
        } else {
            displayLog("LOADED:TIMEOUT-> isAdPlaying: false")
        }
    }, (adsManager.getRemainingTime() * 1000) + 1000);
    window.time_load = new Date().getSeconds(); // the seconds of ad started      
}

function onAdStarted() {
    videoElement.setAttribute('data-content-type', 'ad');
    adRetrials = 0
    window.time_start = new Date().getSeconds(); // the seconds of ad started
    sendAnalytics("adStarted");
    clearInterval(adInterval);
    const ad_duration_parent = document.getElementById("ad_duration_parent");
    const ad_duration_text = document.getElementById("ad_duration_text");
    ad_duration_parent.classList.remove("hidden");
    if (document.getElementById("app_loader")) {
        document.getElementById("app_loader").classList.remove("show");
    }
    Player.hidePlayerControls();
    Player.isAdPlaying = true;
    adInterval = setInterval(() => {
        var remainingTime = adsManager.getRemainingTime();
        ad_duration_text.innerHTML = "The video will start " + parseInt(remainingTime) + "s";
    }, 300);
}

/**
 * all different ad events will be trigger here.
 * @param {*} adEvent
 */
function onAdEvent(adEvent, adInfo) {    
    switch (adEvent.type) {
        case google.ima.AdEvent.Type.LOADED:
            onAdLoaded(adEvent)
            break;
        case google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED:
            onContentPauseRequested()
            break;
        case google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED:
            onContentResumeRequested(adInfo)
            break;
        case google.ima.AdEvent.Type.STARTED:
            onAdStarted()
            break;
        case google.ima.AdEvent.Type.IMPRESSION:
            sendAnalytics("impression");
            break;
        case google.ima.AdEvent.Type.COMPLETE:
            sendAnalytics("adComplete")
            destroyAd()
            break;
        case google.ima.AdEvent.Type.AD_BREAK_READY:
        case google.ima.AdEvent.Type.AD_PROGRESS:
        case google.ima.AdEvent.Type.FIRST_QUARTILE:
        case google.ima.AdEvent.Type.THIRD_QUARTILE:
            sendAnalytics(adEvent.type)
            break;
        case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
            sendAnalytics("adBreakCompleted")
            break;
    }
}

function sendAnalytics(event) {
    console.log("eventeventevent: " + event);
    const googleAnalytics = new GlobalAnalytics();
    const analytics = new Analytics(googleAnalytics);
    analytics.sendEvent(event);
}

function displayLog(text) {
    if (appSettings.enable_log) {
        const app_log_parent = document.getElementById("app_log_parent");
        if (app_log_parent) {
            const count = document.getElementsByClassName("app-log-text").length
            const log_text = el("div", "app-log-text");
            log_text.innerHTML = (count + 1) + " " + text
            app_log_parent.prepend(log_text)
        }
    }
}
export {
    displayLog
}
