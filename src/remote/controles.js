/**
    * Handleing Remote Control
    */

    import HomePage from "../pages/home";
import HomeHeader from "../components/home/homeHeader";
import Sidebar from "../layouts/sidebar";
import {
    el,
    getItem,
    remove_active_class,
    remove_active_style,
    translate_list,
} from "../utils";
import { animation_end, animation_start, keydown, move } from "./keys";
import Player from "../pages/player";
import SearchPage from "../pages/search";
import pages from "./pages";
import HlsPlayer from "../components/common/hls";
import SpeechText from "../components/speechText";
import Keyboard from "../components/common/Keyboard";
import ModalComponent from "../components/modal";
import ChannelsList from "../components/common/channelsList";
import DetailedPopup from "../components/detailedPopup";
import { adsManager, displayLog } from "../components/ads";
import SeriesSidebar from "../layouts/seriesSidebar";
import GoogleAnalytics from "../plugins/googleAnalytics";

function getTransition(param) {
    if (param == "up" || param == "down") return 0;
    return 10
}

window.controles = {
    current: "",
    previous: "",

    set_current: function (current) {
        if (this.current == current) return;

        if (["sidebar"].indexOf(current) == -1) {
            this.previous = this.current;
        }

        this.current = current;
    },

    set_previous: function () {
        this.set_current(this.previous);
        keydown({ keyName: "move" });
    },

    sidebar: {
        index: 0,
        items: document.getElementsByClassName("sidebar-icon__name"),

        move: function () {
            remove_active_class("active");
            remove_active_style(this.items, "#fff");

            this.items[this.index].classList.add("active");
            if (this.items[this.index].classList.contains("active")) {
                this.items[this.index].style.color = "red";
                SpeechText.read(this.items[this.index].innerText);
            }
        },

        right: function () {
            Sidebar.hide();
        },

        up: function () {
            if (this.index == 0) {
                this.index = this.items.length - 1;
            } else {
                this.index--;
            }

            this.move();
        },

        down: function () {
            if (this.index == this.items.length - 1) {
                this.index = 0;
            } else {
                this.index++;
            }

            this.move();
        },

        ok: function () {
            this.items[this.index].click();
        },

        back: function () {
            GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                CLICK: "BACK"
            }});
            if (pages.current != 'home') { // go to home page
                Sidebar.hide();
                controles.sidebar.items[0].click();
                this.index = 0;
                move();
                pages.set_current("home");
                return;
            }
            new ModalComponent({
                title: "Exit",
                content: "Are you sure you want to exit?",
            });

            controles.set_current("modal");
            move();
        },
    },

    main: {
        current: "",
        previous: "",

        set_current: function (current) {
            if (this.current == current) return;

            if (this.current != current) this.previous = this.current;

            this.current = current;
        },

        set_previous: function () {
            this.set_current(this.previous);
            keydown({ keyName: "move" });
        },

        hashes: {
            index: 0,
            items: document.getElementsByClassName("hash-ctrl"),

            move: function () {
                remove_active_class("active");
                this.items[this.index].classList.add("active");
            },

            left: function () {
                if (this.index > 0) {
                    this.index--;
                    this.move();
                }
            },

            right: function () {
                if (this.index < this.items.length - 1) {
                    this.index++;
                    this.move();
                }
            },

            down: function () {
                if (this.index < this.items.length - 1) {
                    this.index += 5;

                    if (this.index == 28 || this.index == 29) {
                        return;
                    }
                    this.move();
                }
            },

            up: function () {
                if (this.index > 0) {
                    if (this.index - 5 > 0) {
                        this.index -= 5;
                    } else {
                        if (this.index - 5 == 0) {
                            this.index = 0;
                        }
                    }

                    this.move();
                }
            },

            ok: function () {
                this.items[this.index].click();
            },
        },

        home: {
            index: 0,
            row: 0,
            items: [],
            itemsTitle: [],
            timeout: null,
            isSomeItemActived: false,
            move: function (param) {
                displayLog(window.tizen?.application)
                try {
                    animation_start();

                    setTimeout(function () {
                        animation_end();
                    }, 300);

                    clearTimeout(this.timeout);

                    const row_items = document.getElementById('channels_list_parent').getElementsByClassName(
                        "channels-list__item"
                    );

                    if (!row_items[this.row]) return;

                    this.items =
                        row_items[this.row].getElementsByClassName("channel-item-ctrl");
                    this.itemsTitle = row_items[this.row].getElementsByClassName(
                        "channel-card__title"
                    );

                    if (this.items.length) {
                        this.isSomeItemActived = true;
                    }

                    remove_active_class("active");
                    remove_active_class("active_row");
                    row_items[this.row].classList.add("active_row");
                    // console.log("home:mouse", this.index, this.items.length)
                    if (this.index >= this.items.length) {
                        this.index = this.index % this.items.length
                    }
                    if (this.items && this.items[this.index]) {
                        this.items[this.index].classList.add("active");
                        SpeechText.read(this.items[this.index].children[1].textContent);
                    }

                    let offset;

                    if (this.index < this.items.length - 4) {
                        offset = this.items[this.index].offsetLeft;
                    } else {
                        if (this.items.length - 4 > 0) {
                            offset = this.items[this.items.length - 4].offsetLeft;
                        } else {
                            offset = 0;
                        }
                    }

                    const card_width = this.items[0].offsetWidth + 10;

                    const width = (card_width - 3.5) * this.index;
                    translate_list(
                        document.getElementsByClassName("channels-list__content")[this.row],
                        `-${width}px`,
                        "X",
                        "0s",
                        true
                    );

                    const parent = document.getElementById("channels_list_parent");

                    let parent_offset = 0;

                    parent_offset = row_items[this.row].offsetTop;

                    parent.style.transform = `translateY(-${parent_offset}px)`;

                    let current_item_id;
                    if (this.index >= this.items.length) {
                        this.index = this.index % this.items.length
                    }
                    if (this.items && this.items[this.index]) {
                        current_item_id = this.items[this.index].getAttribute("data-id");
                    }

                    const playlistName = appData[this.row].name;
                    const current_item = appData[this.row].videos[this.index];
                    const _this = this;


                    if (!HomePage.renderCategoriesList) {
                        if (current_item && pages.current == "home") {
                            new HomeHeader(
                                current_item.title,
                                current_item.thumbnail,
                                current_item.description,
                                playlistName,
                                current_item.duration,
                                current_item.parental_control,
                                current_item.resolution
                            ).render();
                        } else {
                            if (!_this.isSomeItemActived && pages.current == "home") {
                                new HomeHeader().render();
                            }
                        }
                    }
                } catch (error) {
                    console.log("home:mouse", error)
                }
            },

            left: function () {
                // if (appData.graphic.is_player_app && this.index < 1) return;
                if (this.index === 0) {
                    Sidebar.show();
                    return;
                }

                if (this.index == 0) {
                    Sidebar.show();
                    return;
                }

                this.index--;
                this.move();
            },

            right: function () {
                if (this.index < this.items.length - 1) {
                    this.index++;

                    const currentRowParent = document.getElementById('channels_list_parent').getElementsByClassName(
                        "channels-list__item"
                    )[this.row];

                    const currentRow = currentRowParent.children[1];
                    const playlistIndex = currentRow.parentElement.getAttribute("entity_id");

                    const videoEls = currentRow.children;
                    if (this.index < videoEls.length - 1) {
                        // const currentItem = appData.content[rowItemIds[this.index + 7]];
                        const currentItem = appData[playlistIndex].videos[this.index];

                        const currentItemEl = ChannelsList.renderCardHandler(
                            currentItem,
                            this.index,
                            this.row,
                            HomePage.cardClickHandler
                        );

                        if (currentItemEl) {
                            const currentItemId = currentItemEl.getAttribute("data-id");
                            const currenrtItemRow = currentItemEl.getAttribute("data-row");

                            const existingItem = document.querySelector(
                                `[data-row="${currenrtItemRow}"][data-id="${currentItemId}"]`
                            );

                            if (!existingItem) {
                                currentRow.appendChild(currentItemEl);
                            }
                        }
                    }

                    this.move();
                }
            },

            down: function () {
                const row_content_el = document.getElementsByClassName(
                    "channels-list__content"
                );

                const row_active_item = document.getElementsByClassName(
                    "channels-list__content"
                )[this.row + 1];

                // if (this.row == document.getElementsByClassName("channels-list__item").length - 1)
                if (this.row == document.getElementById("channels_list_parent").childNodes.length - 1)
                    return;
                else {
                    this.row++;
                }

                row_content_el[this.row - 1].setAttribute("active_index", this.index);
                this.index = row_active_item.getAttribute("active_index");

                // const rows_el = document.getElementById('channels_list_parent').getElementsByClassName("channels-list__item");
                const rows_el = document.getElementsByClassName("channels-list__content")[this.row - 1].parentElement;
                rows_el.classList.add("hidden");
                if (this.row > 1) {
                    if (this.row < appData.length - 1) {
                        const data = appData;

                        const channelsRow = this.row + 2 < data.length ? this.row + 2 : data.length - 1;
                        const items = data[channelsRow];
                        const channels_list_parent = document.getElementById(
                            "channels_list_parent"
                        );
                        const newRow = ChannelsList.renderRows(items, this.row, window.home_page_obj.cardClickHandler.bind(window.home_page_obj));
                        const newRowEntityId = newRow.getAttribute("entity_id");
                        const existingRow = document.querySelector(
                            `[entity_id="${newRowEntityId}"]`
                        );

                        if (!existingRow) {
                            channels_list_parent.appendChild(newRow);
                        }
                    }
                }

                // TODO: stress test playlist loading on scroll
                this.move("down");

                // add playlists if second last playlist is active
                // const hasRemainingPlaylists = Object.keys(window.appData.Info.restData).length > 0;

                // if(this.row === playlistsLength - 1 && hasRemainingPlaylists){
                //
                //     const playlistsToAdd = window.appData.Info.restData.splice(0, window.limit);
                //     const homePage = new HomePage();
                //     homePage.addData(playlistsToAdd);
                //
                // }
            },

            up: function () {
                const rows_el = document.getElementById('channels_list_parent').getElementsByClassName("channels-list__item");
                const row_content_el = document.getElementsByClassName(
                    "channels-list__content"
                );

                const row_active_item = document.getElementsByClassName(
                    "channels-list__content"
                )[this.row - 1];

                const categories_items = controles.main.categories_list.items.length;
                if (this.row == 0 && categories_items) {
                    controles.main.set_current("categories_list");
                    controles.main.categories_list.move();
                    return;
                }

                if (this.row == 0) return;
                this.row--;
                rows_el[this.row].classList.remove("hidden");
                row_content_el[this.row + 1].setAttribute("active_index", this.index);
                this.index = row_active_item.getAttribute("active_index");

                this.move("up");
            },

            ok: function () {
                if (this.items.length) {
                    this.items[this.index].click();
                }

                // FIX: temporary disable sidebar-small
                const sidebar = document.getElementById("sidebar");
                sidebar.style.display = "none";
            },

            back: function (e) {
                GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                    CLICK: "BACK"
                }});
                // console.log("closing", e)
                // e.preventDefault();
                if (appData.graphic.is_player_app) {
                    new ModalComponent({
                        title: "Exit",
                        content: "Are you sure you want to exit?",
                    });
                    controles.set_current("modal");
                    move();
                } else {
                    Sidebar.show()
                }
            },
        },

        categories_list: {
            index: 0,
            items: document.getElementsByClassName("categories-ctrl"),

            move: function () {
                remove_active_class("active");
                this.items[this.index].classList.add("active");
                SpeechText.read(this.items[this.index].children[1].textContent);

                const parent = document.getElementById("categories_list_parent");
                const width = this.items[0].clientWidth * this.index;
                if (appData.graphic.rtl) {
                    if (this.index < this.items.length - 4) {
                        translate_list(parent, width + "px", "X", "0.3s", true);
                    }
                } else {
                    if (this.index < this.items.length - 4) {
                        translate_list(parent, width + "px", "X");
                    }
                }


            },

            left: function () {
                if (this.index == 0) {
                    Sidebar.show();
                    return;
                }

                this.index--;
                this.move();
            },

            right: function () {
                if (this.index < this.items.length - 1) {
                    this.index++;
                    this.move();
                }
            },

            down: function () {
                controles.main.set_current("home");
                controles.main.home.move("down");
            },

            ok: function () {
                this.items[this.index].click();
            },

            back: function () {
                GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                    CLICK: "BACK"
                }});
                if (appData.graphic.is_player_app) {
                    new ModalComponent({
                        title: "Exit",
                        content: "Are you sure you want to exit?",
                    });
                    controles.set_current("modal");
                    move();
                } else {
                    Sidebar.show()
                }
            },
        },

        search: {
            current: "search_input",
            previous: "",

            set_current: function (current) {
                if (this.current == current) return;

                if (this.current != current) this.previous = this.current;

                this.current = current;
            },

            set_previous: function () {
                this.set_current(this.previous);
                keydown({ keyName: "move" });
            },

            search_input: {
                index: 0,
                items: document.getElementsByClassName("search-input__item"),

                move: function () {
                    remove_active_class("active");
                    this.items[this.index].classList.add("active");
                },

                down: function () {
                    if (SearchPage.foundedChannelsCount > 0) {
                        controles.main.search.set_current("search_results");
                        // set should offset to false
                        // controles.search_results.shouldOffset = false;
                        // controles.main.search.search_input.shouldOffset = false
                        controles.main.search.search_results.shouldOffset = false;
                        move();
                        // set should offset to true
                        controles.main.search.search_results.shouldOffset = true;
                        const grid_parent = document.getElementById("channel_grid_parent");
                        grid_parent.classList.add("active_grid");
                    }
                },

                ok: function (e) {
                    e.preventDefault()
                    const input = document.getElementById("search_input");
                    var has_focus = document.activeElement === input;
                    if (!has_focus) {
                        this.items[this.index].click();
                        return;
                    }

                    input.blur();
                    return;
                },

                back: function () {
                    GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                        CLICK: "BACK"
                    }});
                    Sidebar.show();
                },
                left: function () {
                    Sidebar.show()
                }
            },

            search_results: {
                index: 0,
                items: [],
                itemsTitle: [],
                row: 0,
                timeout: null,
                prevItem: null,
                shouldOffset: true,

                move: function () {
                    animation_start();

                    setTimeout(function () {
                        animation_end();
                    }, 400);

                    clearTimeout(this.timeout);

                    remove_active_class("active");

                    const grid_parent = document.getElementById("channel_grid_parent");
                    const search_input = document.getElementById("search_input");

                    const row_items =
                        document.getElementsByClassName("channel-grid__row");
                    this.itemsTitle = row_items[this.row].getElementsByClassName(
                        "channel-card__title"
                    );

                    if (search_input) {
                        search_input.blur();
                    }

                    if (grid_parent && !grid_parent.classList.contains("active_grid")) {
                        grid_parent.classList.add("active_grid");
                    }

                    if (row_items[this.row]) {
                        this.items =
                            row_items[this.row].getElementsByClassName("channel-item-ctrl");
                    }

                    if (!this.items[this.index]) {
                        this.index = this.index % this.items.length
                    }

                    const prevItemTitle = this.prevItem?.querySelector(
                        ".channel-card__title"
                    );


                    this.items[this.index].classList.add("active");
                    SpeechText.read(this.items[this.index].children[1].textContent);

                    const parent = document.getElementById("channel_grid");

                    let parent_offset = 0;

                    if (row_items[this.row]) {
                        const offSetTop = row_items[this.row].offsetTop;
                        // FIX: find out what is setting the offset to 502 instead of 252 on initial down
                        parent_offset = offSetTop == 546 ? 252 : offSetTop;
                    }

                    if(this.shouldOffset) parent.scroll(-parent_offset, "Y", 0, "px");
                },

                down: function () {
                    if (
                        this.row ==
                        document.getElementsByClassName("channel-grid__row").length - 1
                    )
                        return;

                    this.row++;
                    controles.main.search.search_results.shouldOffset = true;

                    this.prevItem = this.items[this.index];
                    this.move();
                },

                up: function () {
                    if (this.row == 0) {
                        controles.main.search.set_current("search_input");
                        move();
                        const grid_parent = document.getElementById("channel_grid_parent");
                        grid_parent.classList.remove("active_grid");
                    } else {
                        this.row--;
                        this.prevItem = this.items[this.index];
                        this.move();
                    }
                },

                left: function () {
                    if (this.index == 0) {
                        this.prevItem = this.items[this.index];
                        const prevItemTitle = this.prevItem?.querySelector(
                            ".channel-card__title"
                        );
                        console.log(prevItemTitle, "prevItemTitle");


                        Sidebar.show();
                    } else {
                        this.index--;
                        this.move();
                    }
                },

                right: function () {
                    if (this.index < this.items.length - 1) {
                        // disable offset if index is 0
                        controles.main.search.search_results.shouldOffset = this.row === 0 ? false : true;
                        this.index++;
                        this.move();
                    }
                },

                ok: function () {
                    console.log('hello')
                    const sidebar = document.getElementById("sidebar");
                    if(sidebar) sidebar.style.display = "none";
                    if (this.items.length) {
                        this.items[this.index].click();
                    }
                },

                back: function () {
                    GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                        CLICK: "BACK"
                    }});
                    Sidebar.show();
                },
            },
        },

        about: {
            move: function () {
                remove_active_class("active");
            },

            down: function () {
                const scrollBar = document.getElementById("about_content");

                scrollBar.scrollTop += 20;
            },

            up: function () {
                const scrollBar = document.getElementById("about_content");

                scrollBar.scrollTop -= 20;
            },

            left: function () {
                Sidebar.show();
            },
        },

        settings: {},

        series: {
            index: 0,
            row: 0,
            items: [],

            move: function (param) {

                const row_items = document.getElementsByClassName("series-content-row");
                this.items = row_items[this.row].getElementsByClassName("series-item-ctrl");

                remove_active_class("active");
                this.items[this.index].classList.add("active");
                SpeechText.read(this.items[this.index].children[1].textContent);

                const parent = document.getElementById("series_content_parent");

                const row = this.items[this.index].getAttribute("data-row");

                let parent_offset = 0;

                parent_offset = row_items[this.row].offsetTop;

                if (!param) {
                    parent.scroll(-parent_offset, "Y", 0, "px");
                }
            },

            left: function () {
                if (this.index == 0) {
                    Sidebar.show();
                } else {
                    this.index--;
                    this.move();
                }
            },

            right: function () {
                if (this.index < this.items.length - 1) {
                    this.index++;
                    this.move();
                }
            },

            up: function () {
                if (this.row == 0) return;

                this.row--;
                this.move();
            },

            down: function () {
                if (
                    this.row ==
                    document.getElementsByClassName("series-content-row").length - 1
                )
                    return;

                const next_row =
                    document.getElementsByClassName("series-content-row")[this.row + 1];
                const next_row_items =
                    next_row.getElementsByClassName("series-item-ctrl");
                if (
                    next_row_items.length < 3 &&
                    this.index > next_row_items.length - 1
                ) {
                    this.index = next_row_items.length - 1;
                }
                this.row++;
                this.move();
            },

            ok: function () {
                this.items[this.index].click();
            },

            back: function () {
                GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                    CLICK: "BACK"
                }});
                Sidebar.show();
            },
        },

        series_channels: {
            index: 0,
            items: [],
            itemsTitle: [],
            row: 0,
            timeout: null,

            move: function (param) {
                // animation_start();
                //
                // setTimeout(function () {
                //     animation_end();
                // }, 400);

                clearTimeout(this.timeout);
                const parent = document.getElementById("channels_list_parent_hub");
                const row_items = parent.getElementsByClassName("channels-list__item");

                this.items = row_items[this.row].getElementsByClassName("channel-item-ctrl");
                this.itemsTitle = row_items[this.row].getElementsByClassName("channel-card__title");

                remove_active_class("active");
                remove_active_class("active_row");

                row_items[this.row].classList.add("active_row");
                if (this.index >= this.items.length) {
                    this.index = this.index % this.items.length
                }
                if (this.items && this.items[this.index]) {
                    this.items[this.index].classList.add("active");
                }

                let offset;

                if (this.index < this.items.length - 4) {
                    offset = this.items[this.index].offsetLeft;
                } else {
                    if (this.items.length - 4 > 0) {
                        offset = this.items[this.items.length - 4].offsetLeft;
                    } else {
                        offset = 0;
                    }
                }

                const transition = getTransition(param)
                if (param !== "mouseenter") {
                    parent.getElementsByClassName("channels-list__content")[this.row].scroll(-offset, "X", transition, "px");
                }



                let parent_offset = 0;

                parent_offset = row_items[this.row].offsetTop;

                parent.scroll(-parent_offset, "Y", transition, "px");

                let current_item_id;
                if (this.index >= this.items.length) {
                    this.index = this.index % this.items.length
                }
                if (this.items && this.items[this.index]) {
                    current_item_id = this.items[this.index].getAttribute("data-id");
                }

                // let current_item = appData.content[current_item_id];
                const currentCategoryKey = getItem("current_category");
                const videos = window.categoriesData[currentCategoryKey]
                let current_item = videos.find(video => video.video_id === current_item_id);

                if (current_item && pages.current == "hub") {
                    new HomeHeader(
                        current_item.title,
                        current_item.thumbnail || '',
                        current_item.false,
                        current_item.description,
                        '',
                        current_item.duration
                    ).render();
                } else {
                    if (pages.current == "hub") {
                        new HomeHeader().render();
                    }
                }
            },

            ok: function () {
                this.items[this.index].click();

            },

            down: function () {
                const rows_el = document.getElementById('channels_list_parent_hub').getElementsByClassName("channels-list__item");
                const row_content_el = document.getElementsByClassName(
                    "channels-list__content"
                );

                const row_active_item = document.getElementsByClassName(
                    "channels-list__content"
                )[this.row + 1];

                if (
                    this.row ==
                    document.getElementById('channels_list_parent_hub').getElementsByClassName("channels-list__item").length - 1
                )
                    return;

                this.row++;

                rows_el[this.row - 1].classList.add("hidden");
                row_content_el[this.row - 1].setAttribute("active_index", this.index);
                this.index = row_active_item.getAttribute("active_index");

                this.move("down");
            },

            up: function () {
                const rows_el = document.getElementById('channels_list_parent_hub').getElementsByClassName("channels-list__item");
                const row_content_el = document.getElementsByClassName(
                    "channels-list__content"
                );

                const row_active_item = document.getElementsByClassName(
                    "channels-list__content"
                )[this.row - 1];

                if (this.row == 0) {
                    const parent = document.getElementById("channels_list_parent_hub");
                    const bottom_panel = document.querySelector(".play-parent");

                    parent.scroll(0, "Y", 0, "px");
                    controles.player.set_current("player_controls");
                    const player_list_wrapper = document.getElementById(
                        "player_list_wrapper"
                    );
                    player_list_wrapper.classList.remove("active-wrapper");
                    Player.isPlayerChannelsListVisible = false;
                    bottom_panel.classList.remove("hidden");
                    move();
                } else {
                    this.row--;

                    rows_el[this.row].classList.remove("hidden");
                    row_content_el[this.row + 1].setAttribute("active_index", this.index);
                    this.index = row_active_item.getAttribute("active_index");
                    this.move("up");
                }
            },

            left: function () {
                if (this.index > 0) {
                    this.index--;
                    this.move();
                } else {
                    controles.main.set_current("series_channels_back");
                    controles.main.series_channels_back.move();
                }
            },

            right: function () {
                if (this.index < this.items.length - 1) {
                    this.index++;
                    this.move();
                }
            },

            back: function () {
                GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                    CLICK: "BACK"
                }});
                controles.main.series_channels_back.ok();
            },
        },

        series_channels_back: {
            items: document.getElementsByClassName("back-icon-ctrl"),

            move: function () {
                remove_active_class("active");
                this.items[0].classList.add("active");
            },

            right: function () {
                controles.main.set_current("series_channels");
                controles.main.series_channels.move();
            },

            ok: function () {
                controles.main.series_channels.index = 0;
                controles.main.series_channels.row = 0;

                GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                    CLICK: "BACK"
                }});
                SeriesSidebar.backClick();
            },
        },

        store: {
            index: 0,
            row: 0,
            items: [],

            move: function (param) {
                const row_items = document.getElementsByClassName("store-content-row");

                this.items =
                    row_items[this.row].getElementsByClassName("store-item-ctrl");

                remove_active_class("active");
                this.items[this.index].classList.add("active");

                const parent = document.getElementById("store_content_parent");

                const row = this.items[this.index].getAttribute("data-row");

                let parent_offset = 0;

                parent_offset = row_items[this.row].offsetTop;

                if (!param) {
                    parent.scroll(-parent_offset, "Y", 0, "px");
                }
            },

            left: function () {
                if (this.index == 0) {
                    Sidebar.show();
                } else {
                    this.index--;
                    this.move();
                }
            },

            right: function () {
                if (this.index < this.items.length - 1) {
                    this.index++;
                    this.move();
                }
            },

            up: function () {
                if (this.row == 0) return;

                this.row--;
                this.move();
            },

            down: function () {
                if (
                    this.row ==
                    document.getElementsByClassName("store-content-row").length - 1
                )
                    return;

                const next_row =
                    document.getElementsByClassName("store-content-row")[this.row + 1];
                const next_row_items =
                    next_row.getElementsByClassName("store-item-ctrl");
                if (
                    next_row_items.length < 3 &&
                    this.index > next_row_items.length - 1
                ) {
                    this.index = next_row_items.length - 1;
                }
                this.row++;
                this.move();
            },

            ok: function () {
                this.items[this.index].click();
            },
        },

        empty: {
            left: function () {
                Sidebar.show();
            },

            back: function () {
                GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                    CLICK: "BACK"
                }});

                Sidebar.show();
            },
        },
    },

    modal: {
        index: 0,
        items: document.getElementsByClassName("modal-action"),

        move: function (text) {
            remove_active_class("active");

            this.items[this.index].classList.add("active");


            if(typeof text === "object"){
                const modalTitle = document.getElementById('modal_title').innerText;
                text = modalTitle + " No";

            }
            SpeechText.read(text);
        },

        left: function () {
            this.index = 0;
            const optionText = this.items[this.index].innerText
            this.move(optionText);
        },

        right: function () {
            this.index = 1;
            const optionText = this.items[this.index].innerText
            this.move(optionText);
        },

        ok: function () {
            this.items[this.index].click();
        },
        back: function () {
            GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                CLICK: "BACK"
            }});
            this.items[0].click();
        }
    },

    info_modal: {
        items: document.getElementsByClassName("info-modal-ctrl"),

        ok: function () {
            if (this.items.length > 0) {
                this.items[0].click();
            }
        },
    },

    player: {
        current: "player_controls",
        previous: "",

        set_current: function (current) {
            if (this.current == current) return;

            if (this.current != current) this.previous = this.current;

            this.current = current;
        },

        set_previous: function () {
            this.set_current(this.previous);
            keydown({ keyName: "move" });
        },

        keydown: function () {
            if (!Player.isControlsVisible && !Player.isAdPlaying) {
                Player.showPlayerControls(true);
                return true;
            }
        },

        player_controls: {
            current: "play_pause",
            previous: "",

            togglePlayerList: function () {
                const bottom_panel = document.querySelector(".play-parent");
                bottom_panel.classList.add("hidden");
                controles.player.set_current("player_list");
                const player_list_wrapper = document.getElementById(
                    "player_list_wrapper"
                );

                player_list_wrapper.classList.add("active-wrapper");
                Player.isPlayerChannelsListVisible = true;
                controles.player.player_list.move("down");
            },

            keydown: function (keyName) {
                if (keyName === "back") return false;

                console.log(Player.isAdPlaying, "Player.isAdPlaying");
                if (Player.isAdPlaying) {
                    return true;
                }
            },

            set_current: function (current) {
                if (this.current == current) return;

                if (this.current != current) this.previous = this.current;

                this.current = current;
            },

            set_previous: function () {
                this.set_current(this.previous);
                keydown({ keyName: "move" });
            },

            play_pause: {
                index: 0,
                items: document.getElementsByClassName("play-pause-ctrl"),

                move: function () {
                    const my_list_button = document.querySelector(
                        ".addto-mylist__button"
                    );

                    const replay_button = document.querySelector(".replay__button");

                    if (my_list_button && my_list_button.classList.contains("visible")) {
                        my_list_button.classList.remove("visible");
                    }

                    if (replay_button && replay_button.classList.contains("visible")) {
                        replay_button.classList.remove("visible");
                    }
                    remove_active_class("active");
                    this.items[this.index].classList.add("active");
                },

                left: function () {
                    if (this.index > 0) {
                        this.index--;
                        this.move();
                    } else {
                        if (controles.player.player_controls.epg.items.length) {
                            controles.player.player_controls.set_current("epg");
                            controles.player.player_controls.epg.move();
                        }
                    }
                },

                right: function () {
                    if (this.index < this.items.length - 1) {
                        this.index++;
                        this.move();
                    }
                },

                up: function () {
                    if (controles.player.player_controls.progress.items.length) {
                        controles.player.player_controls.set_current("progress");
                        controles.player.player_controls.progress.move();
                    } else {
                        controles.player.player_controls.set_current("back_btn");
                        controles.player.player_controls.back_btn.move();
                    }
                },

                down: function () {
                    controles.player.player_controls.togglePlayerList();
                },

                ok: function () {
                    this.items[this.index].click();
                },

                space: function () {
                    this.ok();
                },

                playPause: function () {
                    console.log("play_pause");
                    HlsPlayer.togglePlay();
                },
            },

            progress: {
                index: 0,
                items: document.getElementsByClassName("progress-ctrl"),

                move: function () {
                    const my_list_button = document.querySelector(
                        ".addto-mylist__button"
                    );

                    const replay_button = document.querySelector(".replay__button");

                    if (my_list_button && my_list_button.classList.contains("visible")) {
                        my_list_button.classList.remove("visible");
                    }

                    if (replay_button && replay_button.classList.contains("visible")) {
                        replay_button.classList.remove("visible");
                    }

                    remove_active_class("active");
                    this.items[this.index].classList.add("active");
                },

                left: function () {
                    HlsPlayer.prev();
                },

                right: function () {
                    HlsPlayer.next();
                },

                up: function () {
                    if (controles.player.player_controls.video_settings.items.length) {
                        controles.player.player_controls.set_current("back_btn");
                        controles.player.player_controls.back_btn.move();
                    }
                },

                down: function () {
                    controles.player.player_controls.set_current("play_pause");
                    controles.player.player_controls.play_pause.move();
                },

                space: function () {
                    controles.player.player_controls.play_pause.ok();
                },
            },

            video_settings: {
                index: 0,
                items: document.getElementsByClassName("settings-ctrl"),

                move: function () {
                    const player_settings_parent = document.querySelector(
                        ".player-settings-parent"
                    );

                    remove_active_class("active");
                    this.items[this.index].classList.add("active");

                    if (this.index == 0 && Player.hasSubtitles) {
                        this.items[0].classList.add("active-sub");
                    } else {
                        this.items[0].classList.remove("active-sub");
                    }

                    if (player_settings_parent.classList.contains("active")) {
                        for (let i = 0; i < this.items.length; i++) {
                            this.items[i].classList.remove("hidden");
                            this.items[i].classList.add("visible");
                        }
                    }
                },

                left: function () {
                    if (this.index < this.items.length - 1) {
                        this.index++;
                        this.move();
                    } else {
                        this.moveToBackBtn();
                    }
                },

                moveToBackBtn: function () {
                    controles.player.player_controls.set_current("back_btn");
                    controles.player.player_controls.back_btn.move();

                    const my_list_button = document.querySelector(
                        ".addto-mylist__button"
                    );

                    const replay__button = document.querySelector(".replay__button");

                    const detailed_button = document.querySelector(
                        ".detailed-popup__item"
                    );

                    const toggle_subtitles__btn = document.querySelector(
                        ".toggle-subtitles__button"
                    );

                    if (my_list_button) {
                        my_list_button.classList.remove("visible");
                    }

                    if (replay__button) {
                        replay__button.classList.remove("visible");
                    }

                    if (toggle_subtitles__btn) {
                        toggle_subtitles__btn.classList.remove("visible");
                    }

                    if (detailed_button) {
                        detailed_button.classList.remove("visible");
                    }
                },

                right: function () {
                    if (this.index > 0) {
                        this.index--;
                        this.move();
                    }
                },

                down: function () {
                    const subItems = document.getElementsByClassName("sub-ctrl");

                    const isOnSubItem = this.items[this.index].classList.contains(
                        "toggle-subtitles__button"
                    );

                    if (subItems.length > 1 && isOnSubItem) {
                        controles.player.player_controls.set_current("subtitles");
                        controles.player.player_controls.subtitles.move();
                        return;
                    }

                    const my_list_button = document.querySelector(
                        ".addto-mylist__button"
                    );
                    const replay__button = document.querySelector(".replay__button");

                    const toggle_subtitles__btn = document.querySelector(
                        ".toggle-subtitles__button"
                    );

                    const detailed_button = document.querySelector(
                        ".detailed-popup__item"
                    );

                    if (controles.player.player_controls.progress.items.length) {
                        controles.player.player_controls.set_current("progress");
                        controles.player.player_controls.progress.move();
                    } else {
                        controles.player.player_controls.set_current("play_pause");
                        controles.player.player_controls.play_pause.move();
                    }

                    if (my_list_button) {
                        my_list_button.classList.remove("visible");
                    }

                    if (replay__button) {
                        replay__button.classList.remove("visible");
                    }

                    if (toggle_subtitles__btn) {
                        toggle_subtitles__btn.classList.remove("visible");
                    }

                    if (detailed_button) {
                        detailed_button.classList.remove("visible");
                    }
                },

                ok: function () {
                    this.items[this.index].click();
                },

                back: function () {
                    HlsPlayer.hlsPLayer.detachMedia();
                    pages.set_previous();
                    GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                        CLICK: "BACK"
                    }});
                },
            },

            subtitles: {
                index: 0,
                items: document.getElementsByClassName("sub-ctrl"),

                move: function () {
                    remove_active_class("active");
                    this.items[this.index].classList.add("active");
                },

                up: function () {
                    if (this.index > 0) {
                        this.index--;
                        this.move();
                    } else {
                        controles.player.player_controls.set_current("video_settings");
                        controles.player.player_controls.video_settings.move();
                    }
                },

                down: function () {
                    if (this.index < this.items.length - 1) {
                        this.index++;
                        this.move();
                    }
                },

                ok: function () {
                    this.items[this.index].click();
                },
            },

            back_btn: {
                index: 0,
                items: document.getElementsByClassName("back-ctrl"),

                move: function () {
                    remove_active_class("active");
                    this.items[this.index].classList.add("active");
                },

                right: function () {
                    const video_ctrl = controles.player.player_controls.video_settings;
                    if (video_ctrl.items.length) {
                        controles.player.player_controls.set_current("video_settings");

                        if (video_ctrl.items.length == 5) {
                            video_ctrl.index = 4;
                        } else if (video_ctrl.items.length == 4) {
                            video_ctrl.index = 3;
                        } else {
                            if (video_ctrl.items.length > 2) {
                                video_ctrl.index = 2;
                            } else {
                                video_ctrl.index = 1;
                            }
                        }

                        video_ctrl.move();
                    }
                },

                down: function () {
                    if (controles.player.player_controls.progress.items.length) {
                        controles.player.player_controls.set_current("progress");
                        controles.player.player_controls.progress.move();
                    } else {
                        controles.player.player_controls.set_current("play_pause");
                        controles.player.player_controls.play_pause.move();
                    }
                },

                ok: function () {
                    controles.player.player_controls.back();
                },
            },

            epg: {
                index: 0,
                items: document.getElementsByClassName("epg-ctrl"),

                move: function () {
                    remove_active_class("active");
                    this.items[this.index].classList.add("active");
                },

                up: function () {
                    if (controles.player.player_controls.progress.items.length) {
                        controles.player.player_controls.set_current("progress");
                        controles.player.player_controls.progress.move();
                    } else {
                        if (controles.player.player_controls.video_settings.items.length) {
                            controles.player.player_controls.set_current("video_settings");
                            controles.player.player_controls.video_settings.index = 1;
                            controles.player.player_controls.video_settings.move();
                        }
                    }
                },

                down: function () {
                    controles.player.player_controls.togglePlayerList();
                },

                right: function () {
                    controles.player.player_controls.set_current("play_pause");
                    controles.player.player_controls.play_pause.move();
                },

                ok: function () {
                    GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                        CLICK: "BACK"
                    }});
                    this.items[this.index].click();
                },
            },

            back: function () {
                const sidebar = document.getElementById("sidebar");
                if(sidebar){
                    sidebar.style.display = "block";
                }
                // GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                //     CLICK: "BACK"
                // }});
                // const video = document.querySelector("video");
                // if (video) {
                //     const id = video.getAttribute("data-id");
                //     HlsPlayer.addToContinueWatchingList(id, video.currentTime);
                //
                //     if(!video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA) {
                //         video.pause();
                //     }
                // }
                //
                const app_loader = document.querySelector(".app-loader");
                if (app_loader) {
                    app_loader.classList.remove("show");
                }
                const frame = document.getElementsByTagName("iframe");

                // Player.page_element.remove();
                // video.removeAttribute('src'); // empty source prevents loading in the background
                // video.remove();
                pages.set_previous();
            },

            playPause: function () {
                HlsPlayer.togglePlay();
            },
        },

        player_list: {
            index: 0,
            items: [],
            itemsTitle: [],
            row: 0,
            timeout: null,

            move: function (param) {
                animation_start();

                setTimeout(function () {
                    animation_end();
                }, 400);

                clearTimeout(this.timeout);
                const parent = document.getElementById("channels_list_parent_player");
                const row_items = parent.getElementsByClassName(
                    "channels-list__item"
                );

                this.items = row_items[this.row].getElementsByClassName("channel-item-ctrl");
                this.itemsTitle = row_items[this.row].getElementsByClassName(
                    "channel-card__title"
                );

                remove_active_class("active");
                remove_active_class("active_row");
                row_items[this.row].classList.add("active_row");
                if (this.index >= this.items.length) {
                    this.index = this.index % this.items.length
                }
                if (this.items && this.items[this.index]) {
                    this.items[this.index].classList.add("active");

                }

                let offset;

                if (this.index < this.items.length - 4) {
                    offset = this.items[this.index].offsetLeft;
                } else {
                    if (this.items.length - 4 > 0) {
                        offset = this.items[this.items.length - 4].offsetLeft;
                    } else {
                        offset = 0;
                    }
                }

                if (param !== "mouseenter") {
                    const transition = getTransition(param);
                    parent.getElementsByClassName("channels-list__content")[this.row].scroll(-offset, "X", transition, "px");
                }



                let parent_offset = 0;

                if (param !== "mouseenter") {
                    parent_offset =
                        row_items[this.row].offsetTop +
                        row_items[this.row].offsetHeight +
                        50;
                } else {
                    parent_offset = row_items[this.row].offsetTop;
                }
                const transition = getTransition(param);
                parent.scroll(-parent_offset, "Y", transition, "px");
            },

            ok: function () {
                this.items[this.index].click();
            },

            down: function () {
                const rows_el = document.getElementById('channels_list_parent_player').getElementsByClassName("channels-list__item");
                const row_content_el = document.getElementsByClassName(
                    "channels-list__content"
                );

                const row_active_item = document.getElementsByClassName(
                    "channels-list__content"
                )[this.row + 1];

                if (
                    this.row ==
                    document.getElementById('channels_list_parent_player').getElementsByClassName("channels-list__item").length - 1
                )
                    return;

                this.row++;

                rows_el[this.row - 1].classList.add("hidden");
                row_content_el[this.row - 1].setAttribute("active_index", this.index);
                this.index = row_active_item.getAttribute("active_index");

                if (this.row > 1) {
                    if (this.row < Player.channelsData.length - 1) {
                        const channelsRow =
                            this.row + 2 < Player.channelsData.length
                            ? this.row + 2
                            : Player.channelsData.length - 1;

                        const items = Player.channelsData[channelsRow];

                        const channels_list_parent = document.getElementById(
                            "channels_list_parent" + "_player"
                        );

                        const newRow = ChannelsList.renderRows(items, this.row, window.player_obj.cardClickHandler.bind(window.player_obj));

                        const newRowEntityId = newRow.getAttribute("entity_id");

                        const existingRow = document.querySelector(
                            `[entity_id="${newRowEntityId}"]`
                        );

                        if (!existingRow) {
                            channels_list_parent.appendChild(newRow);
                        }
                    }
                }

                this.move("down");
            },

            up: function () {
                const rows_el = document.getElementById('channels_list_parent_player').getElementsByClassName("channels-list__item");
                const row_content_el = document.getElementsByClassName(
                    "channels-list__content"
                );

                const row_active_item = document.getElementsByClassName(
                    "channels-list__content"
                )[this.row - 1];

                if (this.row == 0) {
                    const parent = document.getElementById("channels_list_parent" + "_player");
                    const bottom_panel = document.querySelector(".play-parent");

                    parent.scroll(0, "Y", 0, "px");
                    controles.player.set_current("player_controls");
                    const player_list_wrapper = document.getElementById(
                        "player_list_wrapper"
                    );
                    player_list_wrapper.classList.remove("active-wrapper");
                    Player.isPlayerChannelsListVisible = false;
                    bottom_panel.classList.remove("hidden");
                    move();
                } else {
                    this.row--;

                    rows_el[this.row].classList.remove("hidden");
                    row_content_el[this.row + 1].setAttribute("active_index", this.index);
                    this.index = row_active_item.getAttribute("active_index");
                    this.move("up");
                }
            },

            left: function () {
                if (this.index > 0) {
                    this.index--;
                    this.move();
                }
            },

            right: function () {
                if (this.index < this.items.length - 1) {
                    this.index++;

                    const currentRowParent = document.getElementById('channels_list_parent_player').getElementsByClassName(
                        "channels-list__item"
                    )[this.row];

                    const rowEntity = currentRowParent.getAttribute("entity_id");

                    const currentRow = currentRowParent.children[1];

                    const rowItems = Player.channelsData.find(
                        (item) => item.entity_id == rowEntity
                    );

                    const rowItemIds = rowItems.itemIds;

                    if (this.index < rowItemIds.length - 1) {
                        const currentItem = appData.content[rowItemIds[this.index + 7]];

                        const currentItemEl = ChannelsList.renderCardHandler(
                            currentItem,
                            this.index,
                            this.row,
                            Player.cardClickHandler
                        );

                        if (currentItemEl) {
                            const currentItemId = currentItemEl.getAttribute("data-id");
                            const currenrtItemRow = currentItemEl.getAttribute("data-row");

                            const existingItem = document.querySelector(
                                `[data-row="${currenrtItemRow}"][data-id="${currentItemId}"]`
                            );

                            if (!existingItem) {
                                currentRow.appendChild(currentItemEl);
                            }
                        }
                    }
                    this.move();
                }
            },

            back: function () {
                GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                    CLICK: "BACK"
                }});
                Player.hidePlayerControls();
            },

            play_pause: function () {
                console.log("play_pause");
                HlsPlayer.togglePlay();
            },
        },

        play: function () {
            HlsPlayer.play();
        },

        pause: function () {
            HlsPlayer.pause();
        },

        stop: function () {
            HlsPlayer.stop();
        },
    },

    detailed_popup: {
        current: "",
        previous: "",

        set_current: function (current) {
            if (this.current == current) return;

            if (this.current != current) this.previous = this.current;

            this.current = current;
        },

        set_previous: function () {
            this.set_current(this.previous);
            keydown({ keyName: "move" });
        },

        channel_info: {
            index: 0,
            items: document.getElementsByClassName("popup-ctrl"),

            move: function () {
                console.warn("move");
                remove_active_class("active");
                this.items[this.index].classList.add("active");
            },

            down: function () {
                if (this.index < this.items.length - 1) {
                    this.index++;
                    this.move();
                } else {
                    const channel_info__description = document.querySelector(
                        ".channel-info__description"
                    );

                    if (channel_info__description) {
                        const height = channel_info__description.offsetHeight;

                        if (height > 470) {
                            controles.detailed_popup.set_current("description");
                            controles.detailed_popup.description.move();
                        }
                    }
                }
            },

            up: function () {
                if (this.index > 0) {
                    this.index--;
                    this.move();
                }
            },

            left: function () {
                controles.detailed_popup.set_current("back_btn");
                controles.detailed_popup.back_btn.move();
            },

            ok: function () {
                this.items[this.index].click();
            },
        },

        description: {
            index: 0,
            items: document.getElementsByClassName("description-ctrl"),

            move: function () {
                remove_active_class("active");
            },

            up: function () {
                const scrollBar = document.querySelector(
                    ".channel-info__description-parent"
                );

                if (scrollBar) {
                    if (scrollBar.scrollTop - 20 < 0) {
                        scrollBar.scrollTop = 0;
                    } else {
                        scrollBar.scrollTop -= 20;
                    }

                    if (scrollBar.scrollTop <= 0) {
                        controles.detailed_popup.set_current("channel_info");
                        controles.detailed_popup.channel_info.move();
                    }
                }
            },

            down: function () {
                const scrollBar = document.querySelector(
                    ".channel-info__description-parent"
                );

                if (scrollBar) {
                    scrollBar.scrollTop += 20;
                }
            },
        },

        epg: {
            index: 0,
            items: document.getElementsByClassName("epg-item-ctrl"),

            move: function () {
                remove_active_class("active");
                this.items[this.index].classList.add("active");

                const today_epg_list = document.getElementById("today_epg_list");

                if (today_epg_list) {
                    if (this.index > 2) {
                        let offset;

                        if (this.index < this.items.length - 4) {
                            offset = this.items[this.index - 2].offsetTop;

                            today_epg_list.style.transform = `translateY(-${offset}px)`;
                        } else {
                            if (this.items.length - 4 > 0) {
                                offset = this.items[this.items.length - 6].offsetTop;

                                today_epg_list.style.transform = `translateY(-${offset}px)`;
                            } else {
                                offset = 0;

                                today_epg_list.style.transform = `translateY(-${offset}px)`;
                            }
                        }
                    } else {
                        today_epg_list.style.transform = `translateY(0px)`;
                    }
                }
            },

            down: function () {
                if (this.index < this.items.length - 1) {
                    this.index++;
                    this.move();
                }
            },

            up: function () {
                if (this.index > 0) {
                    this.index--;
                    this.move();
                }
            },

            left: function () {
                controles.detailed_popup.set_current("back_btn");
                controles.detailed_popup.back_btn.move();
            },

            ok: function () {
                this.items[this.index].click();
            },
        },

        back_btn: {
            index: 0,
            items: document.getElementsByClassName("popup-back-ctrl"),

            move: function () {
                remove_active_class("active");
                this.items[this.index].classList.add("active");
            },

            right: function () {
                const currentPage = pages.current;

                if (currentPage == "player") {
                    if (DetailedPopup.isInfoOpened) {
                        if (controles.detailed_popup.channel_info.items.length) {
                            controles.detailed_popup.set_current("channel_info");
                            controles.detailed_popup.channel_info.move();
                        }
                    } else {
                        controles.detailed_popup.set_current("epg");
                        controles.detailed_popup.epg.move();
                    }
                } else {
                    controles.detailed_popup.set_current("channel_info");
                    controles.detailed_popup.channel_info.move();
                }
            },

            ok: function () {
                GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                    CLICK: "BACK"
                }});
                this.items[this.index].click();
            },
        },

        back: function () {
            GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                CLICK: "BACK"
            }});
            DetailedPopup.destroy();
        },
    },

    brighData: {
        index: 0,
        items: document.getElementsByClassName("brighdata-ctrl"),

        move: function () {
            remove_active_class("active");
            this.items[this.index].classList.add("active");
        },

            ok: function () {
                this.items[this.index].click();
            },

            left: function () {
                Sidebar.show();
            },
    },

    keyboard: {
        index: 0,
            row: 0,

            getRowIndex: function () {
                const rows = document.getElementsByClassName("row-ctrl");
                const row = rows[this.row];
                const items = row.getElementsByClassName("key-ctrl");

                return items.length;
            },

            move: function () {
                remove_active_class();

                const rows = document.getElementsByClassName("row-ctrl");
                const row = rows[this.row];
                const items = row.getElementsByClassName("key-ctrl");

                items[this.index].classList.add("active");
                const specialKeys = {
                    'Delete': 'Delete key',
                    ',': 'Comma',
                    '.': 'Full stop',
                    '-': 'Hyphen',
                    '"': 'Quotes',
                    ':': 'Colon',
                    '(': 'Left parenthesis',
                        ')': 'Right parenthesis',
                    '[': 'Open square brackets',
                        ']': 'Close square brackets',
                    '^': 'Caret',
                    '?': 'Question mark',
                    '!': 'Exclamation',
                    '#': 'Hash',
                    '123': 'Numerics',
                    'Eng': 'Alphabets',
                    'bspace': 'Backspace',
                };

                const btn = items[this.index];
                // const text = specialKeys[text] || text;
                // const text = btn.innerHTML || specialKeys[btn.id];
                const text = specialKeys[btn.id] || btn.id;

                SpeechText.read(text)
            },

            left: function () {
                if (this.index > 0) {
                    this.index--;
                } else {
                    this.index = this.getRowIndex() - 1;
                }

                this.move();
            },

            right: function () {
                const rows = document.getElementsByClassName("row-ctrl");
                const row = rows[this.row];
                const items = row.getElementsByClassName("key-ctrl");

                if (this.index < items.length - 1) {
                    this.index++;
                } else {
                    this.index = 0;
                }

                this.move();
            },

            up: function () {
                const rows = document.getElementsByClassName("row-ctrl");

                if (this.row > 0) {
                    this.row--;
                }

                if (this.row == 2) {
                    if (this.index == 1) {
                        this.index = rows[2].getAttribute("data-index");
                    } else if (this.index == 2) {
                        this.index = 7;
                    } else if (this.index == 3) {
                        this.index = 8;
                    } else if (this.index == 4) {
                        this.index = 9;
                    }
                }

                this.move();
            },

            down: function () {
                const rows = document.getElementsByClassName("row-ctrl");
                const row = rows[this.row];

                if (this.row < rows.length - 1) {
                    this.row++;
                }

                if (this.row == 3) {
                    row.setAttribute("data-index", this.index);
                }

                if (this.row == rows.length - 1) {
                    if (this.index == 0) {
                        this.index = 0;
                    } else if (this.index > 0 && this.index < 7) {
                        this.index = 1;
                    } else if (this.index == 7) {
                        this.index = 2;
                    } else if (this.index == 8) {
                        this.index = 3;
                    }
                }

                if (this.index > this.getRowIndex() - 1) {
                    this.index = this.getRowIndex() - 1;
                }

                this.move();
            },

            ok: function () {
                const rows = document.getElementsByClassName("row-ctrl");
                const row = rows[this.row];
                const items = row.getElementsByClassName("key-ctrl");

                items[this.index].click();
            },

            back: function () {
                GoogleAnalytics.sendEvent({name: "clicks", parameters: {
                    CLICK: "BACK"
                }});
                Keyboard.hide();
                // document.getElementById("keyboard_back").click();
                controles.set_previous();
            },
    },
};

export default controles;
