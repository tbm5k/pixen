/**
    * Player layout
    */

import ChannelsList from "../components/common/channelsList.js";
import HlsPlayer from "../components/common/hls.js";
import Subtitles from "../components/subtitles.js";
import controles from "../remote/controles.js";
import { el, getItem, remove_active_class } from "../utils.js";
import VideoControles from "../components/videoControles.js";
import GlobalAnalytics from "../services/globalAnalytics.js";
import Analytics from "../services/analytics.js";

import { destroyAd, displayLog, playAds } from "../components/ads.js";
import channelSettings from "../settings/channelSettings.js";
import DetailedPopup from "../components/detailedPopup.js";
import InfoModal from "../components/common/infoModal.js";
import GoogleAnalytics from "../plugins/googleAnalytics.js";
import pages from "../remote/pages.js";

/**
    * Player layout
    *
    * @type {*}
    */
    let keydown_timer = null;
    let videoPlayedTimer = null;
    let delayTimer = null;

// <iframe 
//     width="560" 
//     height="315" 
//     src="https://www.youtube-nocookie.com/embed/wBtFWKSCKZ4?controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&autoplay=1"
//     frameborder="0" 
//     allow='autoplay'
//     allowfullscreen>
// </iframe>
// <iframe 
//     width="560" 
//     height="315" 
//     src="https://www.youtube-nocookie.com/embed/wBtFWKSCKZ4?controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&autoplay=1"
//     frameborder="0" 
//     allow='autoplay'
//     allowfullscreen>
// </iframe>
class Player {
    constructor(channel = {}, entityArray = []) {
        this.video = document.createElement("iframe");
        this.video.id = "video";
        // this.video.setAttribute("autoplay", "autoplay");
        this.video.setAttribute("playsinline", "playsinline");
        this.video.setAttribute("webkit-playsinline", "webkit-playsinline");
        this.video.setAttribute("data-id", channel.video_id);
        this.video.setAttribute("width", 560);
        this.video.setAttribute("height", 315);
        this.video.setAttribute("allowfullscreen", true);
        this.video.setAttribute("frameborder", 0);
        this.video.setAttribute("allow", "autoplay");

        this.channel = channel;
        this.currentRow = 0;

        this.entityArray = entityArray;

        // this.nextChannel = this.findNextChannel(this.channel.video_id)[0];
        if (Player.page_element)
            Player.page_element.remove();
        Player.page_element = null;

        document.addEventListener("keydown", this.playerKeyDownHandler);

        this.video.addEventListener("mousemove", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!Player.isAdPlaying) {
                Player.showPlayerControls(true);
            }
        });
    }

    /**
        * If the channel playing currently is last one, make true otherwise, this will be always false
        *
        * @static
        * @type {boolean}
        */
        static lastChannel = false;
    /**
        * Video Control bar's visibility
        *
        * @static
        * @type {boolean}
        */
        static isControlsVisible = true;
    /**
        * Settings's visibility
        *
        * @static
        * @type {boolean}
        */
        static isSettingsActive = false;
    /**
        * channels list's visibility
        *
        * @static
        * @type {boolean}
        */
        static isPlayerChannelsListVisible = false;

    /**
        *   the streaming type of the channel that playing currently
        *
        * @static
        * @type {boolean}
        */
        static isLiveStreaming = false;
    /**
        * Subtitle's visible status
        *
        * @static
        * @type {boolean}
        */
        static showSubtitles = false;
    /**
        * If the channel has subtitles, it's true. otherwise it's false
        *
        * @static
        * @type {boolean}
        */
        static hasSubtitles = false;
    /**
        * ad playing status
        *
        * @static
        * @type {boolean}
        */
        static isAdPlaying = false;
    /**
        * play button icon
        *
        * @static
        * @type {string}
        */
        static play_button_icon = `
        <?xml version="1.0" encoding="iso-8859-1"?>
        <svg version="1.1" id="Layer_1" fill="#fff" class="play-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    viewBox="0 0 365 300" style="enable-background:new 0 0 365 365;" xml:space="preserve">
        <g>
        <rect x="74.5" width="73" height="365"/>
        <rect x="217.5" width="73" height="365"/>
        </g>
        </svg>
        `;

    /**
        * pause button icon
        *
        * @static
        * @type {string}
        */
        static pause_button_icon = `
        <svg class="pause-button__icon" fill="#fff" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><title>ionicons-v5-c</title><path d="M133,440a35.37,35.37,0,0,1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37,7.46-27.53,19.46-34.33a35.13,35.13,0,0,1,35.77.45L399.12,225.48a36,36,0,0,1,0,61L151.23,434.88A35.5,35.5,0,0,1,133,440Z"/></svg>
        `;

    /**
        * card click handler
        *
        * @static
        * @type {*}
        */
        static cardClickHandler;


    /**
        * channel data
        *
        * @static
        * @type {*}
        */
        static channel = null;
    /**
        * index of ad break that currently playing
        *
        * @static
        * @type {number}
        */
        static current_ad_break_index = 0;

    render() {
        Player.cardClickHandler = this.cardClickHandler.bind(this);
        const root = document.getElementById("root");
        controles.player.player_list.index = 0;
        controles.player.player_list.row = 0;

        Player.isLiveStreaming = this.channel.is_live_streaming;

        const video_parent = el("div", "video-parent", "video_parent");

        video_parent.appendChild(this.video);

        const video_controles = new VideoControles(
            this.channel,
            this.nextChannel,
            this.playNextChannel.bind(this),
            this.changeSubtitle.bind(this)
        );

        video_parent.appendChild(video_controles.renderControls());


        const player_list_wrapper = el(
            "div",
            "player-list-wrapper",
            "player_list_wrapper"
        );

        if (this.channel.content_type === "audio") {
            this.radioContent(this.channel);
        } else {
            this.video.classList.remove("audio");
            this.video.backgroundImage = "none";
        }

        const player_overlay = el("div", "player-overlay", "player_overlay");

        const _this = this;
        player_list_wrapper.appendChild(
            new ChannelsList({
                entityArray: this.entityArray,
                className: "player",
                cardClickHandler: this.cardClickHandler.bind(_this),
                cardMouseOver: this.cardMouseOver.bind(_this),
                listMouseOver: (show) => _this.listMouseOverHandler.bind(_this, show),
            }).render('player')
        );


        video_parent.appendChild(player_list_wrapper);
        video_parent.appendChild(player_overlay);

        const subtitles_parent = el("div", "subtitles-parent", "subtitles_parent");

        if (this.channel.captions) {
            video_parent.appendChild(subtitles_parent);

            Player.showSubtitles = true;
            Player.hasSubtitles = true;
        }

        root.appendChild(video_parent);
        Player.page_element = document.getElementById('video_parent');
        pages.page_objects.player = Player.page_element;

        this.playChannel(this.channel);

        const video_settings_ctrls = document.querySelectorAll(".settings-ctrl");
        if (video_settings_ctrls.length) {
            const detailed_info_btn = document.querySelector(".detailed-popup__item");

            if (detailed_info_btn) {
                switch (video_settings_ctrls.length) {
                    case 2:
                        detailed_info_btn.classList.add("two");
                        break;
                    case 3:
                        detailed_info_btn.classList.add("three");
                        break;
                    case 4:
                        detailed_info_btn.classList.add("four");
                        break;
                    case 5:
                        detailed_info_btn.classList.add("five");
                    default:
                        break;
                }
            }
        }
        controles.set_current("player");
        controles.player.set_current("player_controls");
        controles.player.player_controls.set_current("play_pause");
        controles.player.player_controls.play_pause.move();

        video_parent.addEventListener("onclick", (e) => {
            e.stopPropagation();
            Player.playPause();
        });

        this.video.addEventListener("click", (e) => {
            e.stopPropagation();
            Player.playPause();
        });
    }

    playerKeyDownHandler(e) {
        if (
            pages.current == "player" &&
            !Player.isAdPlaying &&
            !DetailedPopup.isShown
        ) {
            e.stopPropagation();
            clearTimeout(keydown_timer);
            Player.showPlayerControls(true);
        }
    }

    listMouseOverHandler(context, show) {
        if (show) {
            if (controles.player.current != "player_list") {
            }
        } else {
        }
    }

    toggleBottomPanel(visibility) {
        const bottom_panel = document.querySelector(".play-parent");
        const addto_mylist__button = document.querySelector(
            ".addto-mylist__button"
        );

        if (visibility) {
            bottom_panel.classList.add("hidden");
            addto_mylist__button.classList.remove("visible");
        } else {
            bottom_panel.classList.remove("hidden");
        }
    }

    // combine all channel ids from the playlist
    combineChannels() {
        const combinedChannels = [];

        for (let i = 0; i < this.entityArray.length; i++) {
            const item = this.entityArray[i];

            if (appData.playlists[item]) {
                const channelIds = appData.playlists[item].itemIds;
                combinedChannels.push(...channelIds);
            }
        }

        return combinedChannels;
    }
    /**
        * get the next channel from the playlist
        *
        * @param {*} id
        * @returns {*}
        */
        findNextChannel(id) {
            // const combinedContents = this.combineChannels();
            const nextChannelIndex = this.entityArray.findIndex(
                (item) => item === id
            );

            if (nextChannelIndex === combinedContents.length - 1) {
                return appData.content[combinedContents[0]];
            }
            return [appData.content[combinedContents[nextChannelIndex + 1]], nextChannelIndex];
        }

    /**
        * to play next channel
        */
        playNextChannel() {
            GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                CLICK: "NEXT"
            }});
            HlsPlayer.sendVideoEndEvent();
            // const nextChannel = this.findNextChannel(this.channel.id)[0];
            this.playChannel(this.nextChannel);
            this.channel = this.nextChannel;
        }

    /**
        * to change subtitle
        *
        * @param {*} subtitle
        */
        changeSubtitle(subtitle) {
            GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                CLICK: "CAPTIONS"
            }});
            if (this.channel.captions) {
                const subOptions = {
                    captions: this.channel.captions,
                    selected: subtitle,
                };
                new Subtitles(subOptions);
            }
        }

    reRenderVideoControles(nextChannel, afterNextChannel) {
        const video_parent = document.getElementById("video_parent");

        video_parent.removeChild(document.querySelector(".player-controls"));

        const video_controles = new VideoControles(
            nextChannel,
            afterNextChannel,
            this.playNextChannel.bind(this),
            this.changeSubtitle.bind(this)
        );
        video_parent.appendChild(video_controles.renderControls());
    }

    /**
        * Handle the clicking event on the playlist
        *
        * @param {*} item
        * @param {*} context
        */
        cardClickHandler(item, context) {
            this.cardClick(item, context);
        }

    /**
        * Handle the clicking event on the playlist
        *
        * @param {*} item
        * @param {*} context
        */
        cardClick(item, context) {
            const channel = appData.content[item.id];
            try {
                HlsPlayer.sendVideoEndEvent();
            } catch (e) {
            }
            this.playChannel(channel, context)
            if (Player.isPlayerChannelsListVisible && !DetailedPopup.isShown) {
                Player.toggleChannelsList();
            }
        }

    /**
        * handle the over event on the playlist
        *
        * @param {*} idx
        * @param {*} ee
        * @param {*} target
        */
        cardMouseOver(idx, ee, target) {
            this.currentRow = parseInt(target.getAttribute("data-row"));
            remove_active_class("active")
            controles.player.player_list.index = idx;

            clearTimeout(keydown_timer);
            Player.showPlayerControls(true);
        }

    /**
        * to play the selected channel
        *
        * @param {*} channel
        */
        playChannel(channel, context) {
            if(!channel){
                pages.set_previous();
                return
            }
            videoPlayedTimer = null;
            Player.channel = channel;
            // this.nextChannel = this.findNextChannel(channel.video_id)[0];
            const videoWatchedTime = Player.isVideoWatched(channel.video_id);
            const hlsPlayer = new HlsPlayer(
                channel,
                this.nextChannel?.url,
                false,
                videoWatchedTime
            );
            hlsPlayer.render();

            let [brighData] = channelSettings.getPlugins("brighData");

            const videoEl = document.getElementById("video");
            videoEl.setAttribute('data-content-type', 'content');
            if (videoEl) {
                // destroyAd({forceDestroy: true})
                videoEl.addEventListener('ended', ()=>{this.onVideoEnd()});
                videoEl.setAttribute("data-id", channel.id);

                clearTimeout(delayTimer);
                videoEl.addEventListener('loadeddata', () => {
                    const app_loader = document.getElementById("app_loader");
                    if (app_loader) app_loader.classList.remove("show");
                    // FIXME: temporarily fix video not playing
                    delayTimer = setTimeout(() => {
                        videoEl.play();
                    }, 1000);
                    displayLog('data pause status: ', videoEl.paused);
                    GoogleAnalytics.sendEvent({name: "video_events", parameters: {
                        CONTENT: "PLAY"
                    }});
                });
                Player.showPlayerControls(false);
            }
           
            if (channel.content_type === "audio" && context) {
                context.radioContent(channel);
            } else {
                this.video.classList.remove("audio");
                this.video.backgroundImage = "none";
            }
            this.reRenderVideoControles(channel, this.nextChannel);
        }

        onVideoEnd() {
            if (this.channel.show_ads == false) {
                HlsPlayer.endVideoListener()
                return;
            }

            if (this.channel.show_ads !== false) {
                if (this.video.getAttribute('data-content-type') === "content") {
                    console.log("onVideoEnd3: ");
                    playAds(this.channel, {isPostRoll: true}) // postroll
                }
            }
        }
    /**
        * while playing audio, display background image
        *
        * @param {*} channel
        */
        radioContent(channel) {
            this.video.classList.add("audio");
            const image = new Image();
            image.src = channel.thumbnail || channel.thumbnail_playlist;

            image.onload = () => {
                this.video.style.backgroundImage = `url(${image.src})`;
            };

            image.onerror = () => {
                this.video.style.backgroundImage = `url(${appData.graphic.defaultThumbnail})`;
            };
        }

    static toggleChannelsList() {
        Player.isPlayerChannelsListVisible = false;

        const channels_list_parent = document.getElementById(
            "channels_list_parent_player"
        );

        if (channels_list_parent && channels_list_parent.style.transform) {
            const channels_list_parent_translate =
                channels_list_parent.style.transform
                .split("(")[1]
                    .split(")")[0]
                .replace(/px/g, "");

            if (controles.player.current == "player_list") {
                const player_list_wrapper = document.getElementById(
                    "player_list_wrapper"
                );

                player_list_wrapper.classList.remove("active-wrapper");
                const row = controles.player.player_list.row;
                const current_row = document.getElementById('channels_list_parent_player').querySelectorAll(".channels-list__item")[
                    row
                ];

                const row_height = current_row.offsetHeight;

                channels_list_parent.scroll(
                    +channels_list_parent_translate + row_height + 50,
                    "Y",
                    0,
                    "px"
                );
            }
        }
    }

    /**
        * handle player control bar
        *
        * @static
        * @param {*} show
        */
        static showPlayerControls(show) {
            if(show && Player.isControlsVisible ) return
            Player.isControlsVisible = true;
            const my_list_button = document.querySelector(".addto-mylist__button");
            const replay__button = document.querySelector(".replay__button");
            const detailed_info_btn = document.querySelector(".detailed-popup__item");

            if (my_list_button) {
                my_list_button.classList.remove("hidden");
            }

            if (replay__button) {
                replay__button.classList.remove("hidden");
            }

            if (detailed_info_btn) {
                detailed_info_btn.classList.remove("hidden");
            }

            const video_parent = document.querySelector(".video-parent");
            if (video_parent) {
                video_parent.classList.remove("hidden");
            }

            const toggle_subtitles__button = document.querySelector(
                ".toggle-subtitles__button"
            );
            const sub_items = document.querySelector(".sub-items");

            if (
                toggle_subtitles__button &&
                controles.current == "player" &&
                controles.player.player_controls.current == "subtitles"
            ) {
                toggle_subtitles__button.classList.add("active-sub");
            }

            if (sub_items) {
                sub_items.classList.remove("hidden");
            }

            const play_parent = document.querySelector(".play-parent");

            if (
                controles.player.current == "player_list" &&
                !Player.isPlayerChannelsListVisible
            ) {
                play_parent.classList.remove("hidden");
                controles.player.set_current("player_controls");
                controles.player.player_controls.set_current("play_pause");
                controles.player.player_controls.play_pause.move();
            }

            const app_loader = document.getElementById("app_loader");

            clearTimeout(keydown_timer);

            if (
                (!HlsPlayer.isPlaying && show) ||
                (app_loader && app_loader.classList.contains("show")) // TODO check this class
            )
                return;

            keydown_timer = setTimeout(function () {
                Player.hidePlayerControls();
            }, 3000);
        }

    /**
        * Hide player control bar
        *
        * @static
        */
        static hidePlayerControls() {
            const channels_list_item = document.getElementById("channels_list_item");
            const my_list_button = document.querySelector(".addto-mylist__button");
            const detailed_info_btn = document.querySelector(".detailed-popup__item");
            const replay__button = document.querySelector(".replay__button");
            if (my_list_button) {
                my_list_button.classList.add("hidden");
            }
            if (replay__button) {
                replay__button.classList.add("hidden");
            }

            if (detailed_info_btn) {
                detailed_info_btn.classList.add("hidden");
            }

            if (!DetailedPopup.isShown) {
                Player.isControlsVisible = false;
                Player.toggleChannelsList(false);
            }
            const video_parent = document.querySelector(".video-parent");
            if (video_parent) {
                video_parent.classList.add("hidden");
                const toggle_subtitles__button = document.querySelector(
                    ".toggle-subtitles__button"
                );
                const sub_items = document.querySelector(".sub-items");
                if (toggle_subtitles__button) {
                    toggle_subtitles__button.classList.remove("active-sub");
                }
                if (sub_items) {
                    sub_items.classList.add("hidden");
                }
            }
        }

    /**
        * play or pause the playback
        *
        * @static
        */
        static playPause() {
            const play_button_parent = document.querySelector(".play-button__parent");
            const video = document.getElementById("video");
            const globalAnalytics = new GlobalAnalytics();
            const analytics = new Analytics(globalAnalytics);

            if (video.paused) {
                analytics.sendEvent("play");
                video.play();
                play_button_parent.innerHTML = Player.play_button_icon;
                HlsPlayer.isPaused = false;
                GoogleAnalytics.sendEvent({name: "video_events", parameters: {
                    CONTENT: "RESUME"
                }});
            } else {
                analytics.sendEvent("pause");
                video.pause();
                play_button_parent.innerHTML = Player.pause_button_icon;
                HlsPlayer.isPaused = true;
                GoogleAnalytics.sendEvent({name: "video_events", parameters: {
                    CONTENT: "PAUSE"
                }});
            }
        }

    /**
        * the channel's watched status
        *
        * @static
        * @param {*} id
        * @returns {*}
        */
        static isVideoWatched(id) {
            const watchedList = JSON.parse(getItem("continueWatchingList") || "[]");
            const foundVideo = watchedList.find((item) => item.id == id);
            if (foundVideo) return foundVideo.time;
            return false;
        }


    /**
        * destroy page element when the app exit from the player page
        *
        * @static
        */
        static destroy() {
            if (Player.page_element) {
                Player.page_element.remove();
                Player.page_element = null;
            }
        }
}

export default Player;
