import ChannelEpg from "../components/channelEpg.js";
import {
    el,
    convertTime,
    getItem,
    setItem
} from "../utils";
import {
    get_word
} from "../utils.js";
import HlsPlayer from "./common/hls.js";

import ScreenSaver from "../components/common/screenSaver.js";
import Player from "../pages/player";

import {
    screen_saver_timeout,
    showScreenSaver
} from "../index.js";
import ChannelsList from "./common/channelsList";
import pages from "../remote/pages.js";
import controles from "../remote/controles.js";
import {
    infoSvg
} from "./svgs.js";
import DetailedPopup from "./detailedPopup.js";
import ChannelInfo from "./ChannelInfo.js";

/**
 * @class VideoControles
 * @typedef {VideoControles}
 * @description video controls component
 */
class VideoControles {
    /**
     * Creates an instance of VideoControles.
     *
     * @constructor
     * @param {*} channel
     * @param {*} nextChannel
     * @param {*} playNextChannel
     * @param {*} changeSubtitle
     */
    constructor(channel, nextChannel, playNextChannel, changeSubtitle) {
        this.channel = channel;
        this.nextChannel = nextChannel || {};
        this.playNextChannel = playNextChannel;
        this.changeSubtitle = changeSubtitle;
    }

    /**
     * @description renders player controls
     * @returns {*}
     */
    renderControls() {
        const _this = this;
        const controls = el("div", "player-controls");
        const play_parent = el("div", "play-parent");
        const back_button = el("div", "back-button back-ctrl");
        const replay_button = el("div", "replay__button settings-ctrl");
        const replay_img_parent = el("div", "replay__img-parent");
        const toggle_subs_parent = el("div", "toggle-subtitles-parent");
        const detailed_popup_item = el("div", "detailed-popup__item settings-ctrl");
        const detailed_popup_text = el("p", "detailed-popup__text");
        const detailed_popup_item_img = el("div", "detailed-popup__item-img");
        const sub_items_parent = el("div", "sub-items");
        const toggle_subtitles_button = el(
            "div",
            "toggle-subtitles__button settings-ctrl"
        );
        const replay_text = el("p", "replay-text");

        // const hasDetailedInfo = false;

        replay_text.innerHTML = "Replay";

        if(_this.channel.captions) {
            const off_subs = el("p", "off-subs sub-item sub-ctrl selected");
            off_subs.innerHTML = "Off";

            off_subs.onclick = function() {
                const sub_items = document.getElementsByClassName("sub-item");
                for(let i = 0; i < sub_items.length; i++) {
                    sub_items[i].classList.remove("selected");
                }
                if(_this.changeSubtitle) {
                    _this.changeSubtitle("off");
                }

                off_subs.classList.add("selected");
            };

            sub_items_parent.appendChild(off_subs);
            for(let i = 0; i < _this.channel.captions.length; i++) {
                const lang = el("p", "sub-item sub-ctrl");
                lang.innerHTML = _this.channel.captions[i].label;

                lang.onclick = function() {
                    if(_this.changeSubtitle) {
                        off_subs.classList.remove("selected");
                        lang.classList.remove("selected");

                        _this.changeSubtitle(_this.channel.captions[i].src);

                        lang.classList.add("selected");
                    }
                };

                sub_items_parent.appendChild(lang);
            }
        }

        if(!_this.channel.is_live_streaming) {
            const progress_bar_parent = el("div", "progress-bar-parent");
            const durationCurrentTime = el("div", "duration-current-time");

            const currentTime = el("p", "video-current_time");
            currentTime.innerHTML = "00:00";

            const duration_tooltip = el(
                "div",
                "duration-tooltip",
                "duration_tooltip"
            );

            const progress_bar = el(
                "div",
                "progress-bar progress-ctrl",
                "progress_bar"
            );

            const progress_bar_inner = el(
                "div",
                "progress-bar-inner",
                "progress_bar_inner"
            );

            durationCurrentTime.innerHTML = `
      <p class="video-current_time" id="current_time">00:00</p>
      <span>/</span>
      <p class="video-current_time" id="duration_time">00:00</p>
      `;

            // progress_bar.appendChild(duration_tooltip);
            progress_bar.appendChild(progress_bar_inner);
            progress_bar_parent.appendChild(progress_bar);
            play_parent.appendChild(progress_bar_parent);
            // play_parent.appendChild(durationCurrentTime);

            progress_bar_parent.onmouseenter = _this.progresBarMouseEnter;
            progress_bar_parent.onmousemove = _this.progresBarMouseMove.bind(_this);
            progress_bar_parent.onmouseleave = _this.progresBarMouseLeave;
            progress_bar_parent.onclick = _this.progresBarClick;
        }

        const back_button_icon = el(
            "span",
            "material-symbols-outlined back-button_icon"
        );

        const settings_button_img = `
    <svg
    viewBox="0 0 15 15"
    class="settings-button__icon"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="#fff"
      clip-rule="evenodd"
      d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z"
      fill="#fff"
    />
  </svg>
    `;

        const replay_img = `
    <svg xmlns="http://www.w3.org/2000/svg" class="replay-svg" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
    `;

        const back_button_img = `
    <svg width="40px" height="40px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="#fff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_iconCarrier"><path fill="#fff" d="M224 480h640a32 32 0 110 64H224a32 32 0 010-64z"></path><path fill="#fff" d="M237.248 512l265.408 265.344a32 32 0 01-45.312 45.312l-288-288a32 32 0 010-45.312l288-288a32 32 0 1145.312 45.312L237.248 512z"></path></g></svg>
    `;

        const subtitle_icon = `
    <svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12zM7 15h3c.55 0 1-.45 1-1v-1H9.5v.5h-2v-3h2v.5H11v-1c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm7 0h3c.55 0 1-.45 1-1v-1h-1.5v.5h-2v-3h2v.5H18v-1c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1z"></path></svg>
    `;

        back_button_icon.innerHTML = back_button_img;

        const replay_icon = el("span", "material-symbols-outlined replay-icon");
        replay_icon.innerHTML = "replay";

        back_button.appendChild(back_button_icon);

        const add_to_mylist_button = el(
            "div",
            "addto-mylist__button vod settings-ctrl"
        );
        const add_to_list_text = el("p", "addto-mylist__text");
        const channel_info_parent = el("div", "channel-info__parent");
        const channel_name = el("p", "channel-info__name");

        const channel_info_live = el("p", "channel-info__live");
        const play_button_parent = el("div", "play-button__parent play-pause-ctrl");

        const play_next_parent = el(
            "div",
            "play-next__parent play-pause-ctrl",
            "next_button"
        );
        const play_next_info_parent = el("div", "play-next-info__parent");
        const play_next_img = el("img", "play-next__img");
        const play_next_overlay = el("div", "play-next__overlay");
        const play_next_icon = `
          <svg class="play-next__icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"></path></svg>
        `;
        const play_next_title = el("p", "play-next-info__title");
        const play_next_name = el("p", "play-next-info__name");

        add_to_list_text.innerText = _this.isChannelOnMyList(_this.channel.id) ?
            "Remove from List" :
            "Add to List";

        if(_this.isChannelOnMyList(_this.channel.id)) {
            add_to_mylist_button.classList.remove("vod");
        }

        // replay_button.appendChild(replay_icon);
        replay_button.appendChild(replay_text);

        // if (window.appData.graphic.detailed_popup) {
        if(true) {
            detailed_popup_item_img.innerHTML = infoSvg;
            detailed_popup_text.innerHTML = "Info";
            detailed_popup_item.appendChild(detailed_popup_item_img);
            detailed_popup_item.appendChild(detailed_popup_text);
            controls.appendChild(detailed_popup_item);

            detailed_popup_item.addEventListener("click", (e) => {
                e.stopPropagation();

                const channelInfo = new ChannelInfo({
                    id: _this.channel.id,
                    title: _this.channel.title,
                    thumbnail: _this.channel.thumbnail,
                    thumbnail_playlist: _this.channel.thumbnail_playlist,
                    description: _this.channel.description,
                    isLive: _this.channel.is_live_streaming,
                    index: _this.channel.index,
                    row: _this.channel.row,
                    videoDuration: _this.channel.videoDuration,
                    resolution: _this.channel.resolution,
                    parental_control: _this.channel.parental_control,
                    isMovieCarousel: _this.channel.isMovieCarousel,
                    cardClickHandler: _this.cardClick,
                    cardMouseOver: _this.cardMouseOver,
                    content_type: _this.channel.content_type,
                    playBtn: false,
                });

                const detailPopupOptions = {
                    children: [channelInfo.render()],
                    info: true,
                };

                const detailedPopup = new DetailedPopup(detailPopupOptions);
                detailedPopup.render();

                DetailedPopup.show();

                controles.set_current("detailed_popup");
                if(pages.current != "player") {
                    controles.detailed_popup.set_current("channel_info");
                    controles.detailed_popup.channel_info.move();
                } else {
                    controles.detailed_popup.set_current("back_btn");
                    controles.detailed_popup.back_btn.move();
                }
            });
        }

        if(_this.channel.captions && _this.channel.captions.length) {
            toggle_subtitles_button.innerHTML = subtitle_icon;

            const toggle_subtitles__button = document.querySelector(
                ".toggle-subtitles__button"
            );

            toggle_subs_parent.appendChild(toggle_subtitles_button);
            toggle_subs_parent.appendChild(sub_items_parent);
            controls.appendChild(toggle_subs_parent);

            if(ChannelsList.isMyListVisible && !_this.channel.is_live_streaming) {
                toggle_subs_parent.classList.add("right");
            } else {
                toggle_subs_parent.classList.remove("right");
            }
        }

        if(!_this.channel.is_live_streaming) {
            replay_img_parent.innerHTML = replay_img;
            replay_button.appendChild(replay_img_parent);
            controls.appendChild(replay_button);
        }

        if(ChannelsList.isMyListVisible) {
            add_to_mylist_button.appendChild(add_to_list_text);
            controls.appendChild(add_to_mylist_button);
            replay_button.classList.remove("start");
        } else {
            replay_button.classList.add("start");
        }

        channel_name.innerHTML = _this.channel.title;
        channel_info_live.innerHTML = get_word("live");
        channel_info_parent.appendChild(channel_name);

        if(_this.channel.is_live_streaming) {
            channel_info_parent.appendChild(channel_info_live);
        }

        play_next_title.innerHTML = get_word("playNext");
        play_next_name.innerHTML = _this.nextChannel.title || "";

        const image = new Image();
        image.src = _this.nextChannel.thumbnail;
        image.onload = () => {
            play_next_img.src = _this.nextChannel.thumbnail;
        };

        image.onerror = () => {
            play_next_img.src = appData[0].videos[0].thumbnail;
        };

        play_next_info_parent.appendChild(play_next_title);
        play_next_info_parent.appendChild(play_next_name);
        play_next_parent.innerHTML = play_next_icon;
        play_next_parent.appendChild(play_next_info_parent);
        play_next_parent.appendChild(play_next_img);
        play_next_parent.appendChild(play_next_overlay);

        play_parent.appendChild(channel_info_parent);
        play_button_parent.innerHTML = Player.play_button_icon;

        play_parent.appendChild(play_button_parent);

        // const isLastChannel =
        //   Object.values(appData.content).findIndex(
        //     (channel) => channel.id === _this.channel.id
        //   ) ===
        //   Object.values(appData.content).length - 1;

        for(const playlist of appData) {
            let found = false;
            // for(const video of playlist.videos){
            for(let i = 0; i < playlist.videos.length; i++) {
                const video = playlist.videos[i];
                if(video.video_id === this.channel.video_id) {
                    found = true;
                    if(i === playlist.videos - 1) {
                        // isLastChannel = true;
                        Player.lastChannel = true;
                        break;
                    }
                    Player.lastChannel = false;
                    break;
                }
            }
            if(found) break;
        }

        // const homePage = Object.values(appData.menu.pages).find(
        //   (page) => page.menu_title === "Home"
        // );

        // const lastPlaylistId = Object.values(homePage.playlists)[
        //   Object.values(homePage.playlists).length - 1
        // ];
        // const lastPlaylist = appData.playlists[lastPlaylistId];
        // const lastPlaylistItemIds = lastPlaylist.itemIds;
        // const lastItem = lastPlaylistItemIds[lastPlaylistItemIds.length - 1];
        // const isLastItem = _this.channel.id === lastItem;

        if(Object.keys(this.nextChannel)
            .length == 0 || Player.lastChannel) {
            play_next_parent.classList.add('hidden');
        }
        play_parent.appendChild(play_next_parent);
        if(_this.channel.epg) {
            const epg_link = _this.channel.epg.link;
            new ChannelEpg(epg_link);
        }

        play_button_parent.onclick = Player.playPause;

        play_button_parent.addEventListener("mouseover", (e) => {
            e.stopPropagation();

            controles.player.player_controls.set_current("play_pause");
            controles.player.player_controls.play_pause.index = 0;
            controles.player.player_controls.play_pause.move();
        });

        play_next_parent.addEventListener("click", () => {
            _this.playNextChannel();
        });

        play_next_parent.addEventListener("mouseover", (e) => {
            e.stopPropagation();

            controles.player.player_controls.set_current("play_pause");
            controles.player.player_controls.play_pause.index = 1;
            controles.player.player_controls.play_pause.move();
        });

        add_to_mylist_button.addEventListener("mouseover", (e) => {
            e.stopPropagation();
            controles.player.player_controls.set_current("video_settings");

            if(controles.player.player_controls.video_settings.items.length == 3) {
                controles.player.player_controls.video_settings.index = 1;
            } else {
                controles.player.player_controls.video_settings.index = 0;
            }

            controles.player.player_controls.video_settings.move();
        });

        replay_button.addEventListener("click", () => {
            HlsPlayer.replay();
        });

        replay_button.addEventListener("mouseover", (e) => {
            e.stopPropagation();
            controles.player.player_controls.set_current("video_settings");
            controles.player.player_controls.video_settings.index = 0;
            controles.player.player_controls.video_settings.move();
        });

        add_to_mylist_button.addEventListener("click", () => {
            if(ChannelsList.isMyListVisible) {
                _this.addToMyListHandler(_this.channel.id);
            } else {
                HlsPlayer.replay();
            }
        });

        controls.addEventListener("mousemove", (e) => {
            clearInterval(screen_saver_timeout);
            if(window.screen_saver) {
                ScreenSaver.hide();
            }
            const screen_saver_time = 60000;

            if(+screen_saver_time) {
                showScreenSaver(+screen_saver_time);
            }

            e.preventDefault();
            e.stopPropagation();
            Player.showPlayerControls(true);
        });

        back_button.addEventListener("mouseover", () => {
            const sidebar = document.getElementById("sidebar");
            if(sidebar) {
                sidebar.style.display = "block";
            }
            const video = document.querySelector("video");
            if(video) {
                HlsPlayer.sendVideoEndEvent();
                const id = video.getAttribute("data-id");
                const channel = appData.content[id];
                if(!channel?.is_live_streaming) {
                    HlsPlayer.addToContinueWatchingList(id, video.currentTime);
                }

                if(!video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA) {
                    video.pause();
                }

                video.onplay = () => {
                    video.pause();
                    video.remove();
                }

            }

            const app_loader = document.querySelector(".app-loader");
            if(app_loader) {
                app_loader.classList.remove("show");
            }

            const adParent = document.getElementById("ad_parent");
            if(adParent) {
                adParent.remove();
            }



            controles.player.player_controls.set_current("back_btn");
            controles.player.player_controls.back_btn.move();

            if(add_to_mylist_button) {
                add_to_mylist_button.classList.remove("visible");
            }

            if(replay_button) {
                replay_button.classList.remove("visible");
            }
        });

        back_button.addEventListener("click", () => {
            pages.set_previous();
            const app_loader = document.getElementById("app_loader");
            if(app_loader) app_loader.classList.remove("show");
            Player.destroy()
        });

        controls.appendChild(back_button);

        controls.appendChild(play_parent);

        controls.onwheel = (e) => {
            const delta = e.deltaY || e.detail || e.wheelDelta;
            if(delta > 0 && !Player.isPlayerChannelsListVisible) {
                controles.player.player_controls.togglePlayerList();
            }
        };
        return controls;
    }

    /**
     * ${1:Description placeholder}
     *
     * @param {*} e
     */
    progresBarMouseMove(e) {
        const video = document.getElementById("video");
        const progress_bar = document.getElementById("progress_bar");
        const duration_tooltip = document.getElementById("duration_tooltip");
        const el_width = progress_bar.offsetWidth;
        const el_percentage = (e.offsetX / el_width) * 100;

        duration_tooltip.style.left = `${el_percentage}%`;

        duration_tooltip.classList.add("visible");

        const duration = video.duration;

        const mouseLocaiton = (e.offsetX / el_width) * 100;
        const currentTime = (duration * mouseLocaiton) / 100;

        duration_tooltip.innerText = convertTime(currentTime);
    }

    /**
     * ${1:Description placeholder}
     */
    progresBarMouseLeave() {
        const duration_tooltip = document.getElementById("duration_tooltip");
        duration_tooltip.classList.remove("visible");
    }

    /**
     * ${1:Description placeholder}
     */
    progresBarMouseEnter() {
        controles.player.player_controls.set_current("progress");
        controles.player.player_controls.progress.move();
    }

    /**
     * ${1:Description placeholder}
     *
     * @param {*} e
     */
    progresBarClick(e) {
        HlsPlayer.seek(e);
    }

    /**
     * ${1:Description placeholder}
     *
     * @param {*} channelId
     * @returns {*}
     */
    isChannelOnMyList(channelId) {
        const localMyList = JSON.parse(getItem("myList") || "[]");
        return localMyList.includes(channelId);
    }

    /**
     * ${1:Description placeholder}
     *
     * @param {*} channelId
     */
    addToMyListHandler(channelId) {
        const localMyList = JSON.parse(getItem("myList") || "[]");
        const addto_mylist_button = document.querySelector(".addto-mylist__button");
        const add_to_list_text = document.querySelector(".addto-mylist__text");

        if(localMyList.includes(channelId)) {
            localMyList.splice(localMyList.indexOf(channelId), 1);
            add_to_list_text.innerText = get_word("addToList");
            if(!addto_mylist_button.classList.contains("vod")) {
                addto_mylist_button.classList.add("vod");
            }
        } else {
            localMyList.push(channelId);
            add_to_list_text.innerText = get_word("removeFromList");
            addto_mylist_button.classList.remove("vod");
        }

        setItem("myList", JSON.stringify(localMyList));
    }
}

export default VideoControles;

