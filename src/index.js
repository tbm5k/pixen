require("url-search-params-polyfill");
import { Discovery } from "@firebolt-js/sdk";
import SpeechText from "./components/speechText";

import pages from "./remote/pages.js";
import Sidebar from "./layouts/sidebar.js";
import ScreenSaver from "./components/common/screenSaver.js";
import Player from "./pages/player.js";
import { BASE_URL, getAppData, getCategories, getLogic } from "./api/request.js";
import "./styles/index.css";
import { el, getItem, is_restricted, setItem, assignColorCode, arrayToObject } from "./utils.js";
import channelSettings from "./settings/channelSettings.js";
import GlobalAnalytics from "./services/globalAnalytics.js";
import appSettings from "./data/appSettings.json";
import GoogleAnalytics from "./plugins/googleAnalytics";
import Devices from "../src/services/deviceCenter";

window.lg = console.log;
window.warn = console.warn;

window.OS = "";

/**
    * ${1:Description placeholder}
    *
    * @type {{}\}
    */
    export const cropedImages = {};

window.onload = function () {

    if (appSettings.production) {
        startApp();
    }
    else {
        pages.set_current("hashes")
    }

    // prevent history back in zeasn
    if(Devices.platformInstance.name === 'zeasn'){
        window.history.back = function() {
            console.log('call prevented');
        };
    } 
};

/**
    * ${1:Description placeholder}
    * @function startApp
    * @export
    * @param {*} customHash
    * @description Initializes the application by passing different scripts based on the OS
    */
    export function startApp() {

        const APP_VERSION = appSettings.version;

        if (OS == "tizen") {
            var script = document.createElement("script");
            script.onload = get_device_info;
            script.async = true;
            script.src = "$WEBAPIS/webapis/webapis.js";

            document.head.appendChild(script);
            try {
                tizen.tvinputdevice.registerKeyBatch([
                    "0",
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "ChannelUp",
                    "ChannelDown",
                    "MediaRewind",
                    "MediaFastForward",
                    "MediaPause",
                    "MediaPlay",
                    "MediaStop",
                    "MediaTrackPrevious",
                    "MediaTrackNext",
                    "MediaPlayPause",
                    "ColorF0Red",
                    "ColorF1Green",
                    "ColorF2Yellow",
                    "ColorF3Blue",
                    "ChannelList",
                ]);
            } catch (e) {
            }
        } else {
            var script = document.createElement("script");
            script.onload = getDeviceInfo();
            script.src = "webOSTV.js";

            document.head.appendChild(script);
        }

        if (window.tizen) {
            const webapisScript = document.createElement("script");
            webapisScript.src = "$WEBAPIS/webapis/webapis.js";
            webapisScript.async = true;
            document.head.appendChild(webapisScript);
        }

        // add comcast script
        // loadImaSdk();

        createStaticElements();

        const app_version = document.createElement("p");
        app_version.classList.add("app-version");
        app_version.innerHTML = `V${APP_VERSION}`;

        document.body.appendChild(app_version);

        const app_loader = document.getElementById("app_loader");
        if (app_loader) app_loader.classList.add("show");

        const init = async () => {
            try{
                // const data = await getAppData();
                // await getCategories();
                const [data, categories] = await Promise.all([getAppData(), getCategories()]);
                const categoryPromises = categories.map(async category => {
                    const url = BASE_URL + '/' + category.path;
                    const res = await fetch(url);
                    return {key: category.path, data: await res.json()}
                });

                const categoriesData = await Promise.all(categoryPromises);
                const categoriesObject = {};
                categoriesData.forEach(category => {
                    categoriesObject[category.key] = category.data;
                });
                window.categoriesData = categoriesObject;
                // console.log(categoriesData);

                if (!data.appJson) return;

                entInfo();

                // const globalAnalytics = new GlobalAnalytics();
                // globalAnalytics.sendEvent("openApp", {
                //     is_deeplink: !!videoDeepLink,
                //     content_id: videoDeepLink,
                //     source,
                // });
                GoogleAnalytics.configGtag();

                window.appData = data.appJson;
                window.appData.translations = data.translation;

                if(Array.isArray(window.appData.content)){
                    window.appData.content = arrayToObject(window.appData.content, "id")
                }

                if(Array.isArray(window.appData.playlists)){
                    window.appData.playlists = arrayToObject(window.appData.playlists, "entity_id")
                }

                let itemTitleColor = "#fff", activeTitleColor = '#111';
                assignColorCode(itemTitleColor, activeTitleColor);

                const screen_saver_time = 60000;

                if (+screen_saver_time) {
                    const screenSaver = new ScreenSaver();
                    screenSaver.render();
                    showScreenSaver(+screen_saver_time);
                }

                const video_loader_img = window.appData?.graphic?.loader_image;
                const loader_parent = document.getElementById("loader_parent");

                console.log('loader image', video_loader_img)
                if (video_loader_img) {
                    loader_parent.innerHTML = "";
                    const loader_img = document.createElement("img");
                    loader_img.src = video_loader_img;
                    loader_img.classList.add("loader-img");
                    loader_parent.appendChild(loader_img);
                }
                        const deepLinkData = window.settings?.deepLinkData || {};
                        const queries = window.location.search;
                        // const urlParams = new URLSearchParams(queries);
                        // const id = urlParams.get("id");
                        // write function that can parse url params instead of url search params
                        const id = queries.split("=")[1];

                        if (id) deepLinkData.video = id;

                        // TODO: add side menu
                        // render menu for brands that have them
                        // if (!appData.graphic.is_player_app && appData.menu) {
                            // var sidebar = new Sidebar();
                            // sidebar.mounted();
                        // }
                        var sidebar = new Sidebar();
                        sidebar.mounted();

                        let foundVideo = null;
                        let entities = null;

                        if (deepLinkData?.video) {
                            foundVideo = appData.content[deepLinkData.video];
                            entities = findEntities(deepLinkData.video);
                        }

                        if (foundVideo) {
                            pages.set_current("player");
                            const player = new Player(foundVideo, entities);
                            player.render();
                        } else {
                            pages.set_current("home");
                        }

                        const app_loader = document.getElementById("app_loader");
                
                        setTimeout(() => {
                            if (app_loader) app_loader.classList.remove("show");
                            app_version.remove();
                        }, 1000);

                const [brighData] = channelSettings.getPlugins("brighData");

                if (window.VIZIO) {
                    document.addEventListener("VIZIO_TTS_ENABLED", function () {
                        // this.vizioVoiceReader = true;
                        SpeechText.enabler(true);
                    });
                    document.addEventListener("VIZIO_TTS_DISABLED", function () {
                        // this.vizioVoiceReader = false;
                        SpeechText.enabler(false);
                    });
                    const manifest = await window.VIZIO.getDeviceManifest();
                    SpeechText.enabler(manifest.tts_enabled);
                }
                if (brighData) {
                    brighData
                        .init({
                            app_name: appData.graphic.appName,
                            app_logo: appData.graphic.appLogo,
                        })
                        .then(() => {
                            if (
                                brighData?.tag?.status == "true" &&
                                brighData?.status &&
                                !brighData?.status?.consent
                            ) {
                                brighData.enable();
                            }
                        })
                        .catch((err) => {
                            console.error(err, "-----");
                        });
                }

                window["limit"] = 3;
            }catch(err){
                console.log(err);
            }
        }

        init();
        
    }

/**
    * @function loadImaSdk
    * @description integrates multimedia ads
    */
    function loadImaSdk() {
        const imaSdkScript = document.createElement("script");
        imaSdkScript.src = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
        imaSdkScript.defer = true;
        document.head.appendChild(imaSdkScript);
    }

/**
    * @funtion createStaticElements
    * @description loads static elements on the app
    */
    function createStaticElements() {
        const sidebar_root = el("div", "sidebar-root", "sidebar_root");

        const keyboard_root = el("div", "keyboard-root", "keyboard_root");

        const popup = el("div", "popup", "popup");

        const video_loader_img = window.appData?.graphic?.loader_image;

        const app_loader_parent = el("div", "app-loader", "app_loader");
        const loader_parent = el("div", "loader-parent", "loader_parent");
        const loader_item1 = el("div", "loader-item1", "loader_item1");
        const loader_item2 = el("div", "loader-item2", "loader_item2");

        const modal_root = el("div", "modal-root", "modal_root");
        const info_modal = el("div", "info-modal", "info_modal");

        if (video_loader_img) {
            const loader_img = el("img", "loader-img", "loader_img");
            loader_img.src = video_loader_img;

            loader_parent.appendChild(loader_img);
        } else {
            loader_parent.appendChild(loader_item1);
            loader_parent.appendChild(loader_item2);
        }

        const splashImage = document.createElement('img');
        splashImage.setAttribute('id', 'splash');
        splashImage.setAttribute('src', '/splash.png');
        splashImage.style.width = "100%"

        app_loader_parent.appendChild(splashImage);

        const ad_log_view = el(
            "div",
            "app-log-parent",
            "app_log_parent"
        );
        ad_log_view.style.zIndex = 10000;
        document.body.appendChild(ad_log_view);

        document.body.insertAdjacentElement("afterbegin", sidebar_root);
        document.body.appendChild(keyboard_root);
        document.body.appendChild(popup);
        document.body.appendChild(app_loader_parent);
        document.body.appendChild(modal_root);
        document.body.appendChild(info_modal);
    }

/**
    * ${1:Description placeholder}
    * @function showSplashScreen
    * @description renders the application splashscreen
    * @param {*} img
    * @param {*} callback
    */
    function showSplashScreen(img, callback) {
        const splash_screen = document.createElement("div");
        const app_version = document.querySelector(".app-version");
        splash_screen.classList.add("splash-screen");
        splash_screen.style.backgroundImage = `url(${img})`;
        document.body.appendChild(splash_screen);

        GoogleAnalytics.sendEvent({name: "page_navigation", parameters: {
            PAGE: "SPLASHSCREEN",
        }})

        setTimeout(function () {
            splash_screen.remove();
            app_version.remove();
            callback();
        }, 500);
    }

/**
    * ${1:Description placeholder}
    *
    * @type {*}
    */
    export let screen_saver_timeout = null;
/**
    * ${1:Description placeholder}
    *
    * @param {*} time
    */
    export const showScreenSaver = (time) => {
        screen_saver_timeout = setInterval(() => {
            if (!ScreenSaver.isScreenSaverVisible && pages.current !== "player") {
                ScreenSaver.show();
            }
        }, time * 1000);
    };

/**
    * ${1:Description placeholder}
    * @function getDeviceInfo
    * @description sets device OS to the window object
    */
    function getDeviceInfo() {
        if (window.tizen) {
            window.OS = "tizen";
        } else {
            if (window.webOS && window.webOS.platform && window.webOS.platform.tv) {
                window.OS = "webOS";
            } else {
                window.OS = "web";
            }
        }
    }

/**
    * ${1:Description placeholder}
    *
    * @param {string} [videoId=""]
    * @returns {{}\}
    */
    function findEntities(videoId = "") {
        const entityArr = [];

        videoId = videoId.toString();


        for (let i = 0; i < Object.keys(appData.playlists).length; i++) {
            if (
                appData.playlists[Object.keys(appData.playlists)[i]].itemIds.includes(
                    videoId
                )
            ) {
                entityArr.push(
                    appData.playlists[Object.keys(appData.playlists)[i]].entity_id
                );
            }
        }

        return entityArr;
    }

/**
    * ${1:Description placeholder}
    */
    function entInfo() {
        Discovery.entityInfo(function (parameters) {

            return Promise.resolve({
                expires: "2025-01-01T00:00:00.000Z",
                entity: {
                    identifiers: {
                        entityId: "14259747",
                    },
                    entityType: "program",
                    programType: "movie",
                    title: "Cool Runnings ---",
                    synopsis:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pulvinar sapien et ligula ullamcorper malesuada proin libero nunc.",
                    releaseDate: "1993-01-01T00:00:00.000Z",
                    contentRatings: [
                        {
                            scheme: "US-Movie",
                            rating: "PG",
                        },
                        {
                            scheme: "CA-Movie",
                            rating: "G",
                        },
                    ],
                    waysToWatch: [
                        {
                            identifiers: {
                                assetId: "123",
                            },
                            expires: "2025-01-01T00:00:00.000Z",
                            entitled: true,
                            entitledExpires: "2025-01-01T00:00:00.000Z",
                            offeringType: "buy",
                            price: 2.99,
                            videoQuality: ["UHD"],
                            audioProfile: ["dolbyAtmos"],
                            audioLanguages: ["en"],
                            closedCaptions: ["en"],
                            subtitles: ["es"],
                            audioDescriptions: ["en"],
                        },
                    ],
                },
            });
        })
            .then((success) => {

            })
            .catch((error) => {

            });

        ;

        window.dis = Discovery;

        Discovery.watchNext(function (parameters) {

            return Promise.resolve({
                expires: "2025-01-01T00:00:00.000Z",
                watchNext: [
                    {
                        identifiers: {
                            entityId: "14259747",
                        },
                        expires: "2025-01-01T00:00:00.000Z",
                        entitled: true,
                        entitledExpires: "2025-01-01T00:00:00.000Z",
                        offeringType: "buy",
                        price: 2.99,
                        videoQuality: ["UHD"],
                        audioProfile: ["dolbyAtmos"],
                        audioLanguages: ["en"],
                        closedCaptions: ["en"],
                        subtitles: ["es"],
                        audioDescriptions: ["en"],
                    },
                ],
            });
        })
            .then((success) => {

            })
            .catch((error) => {

            });
    }
