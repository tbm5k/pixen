import Keyboard from "../components/common/Keyboard";
import ChannelGrid from "../components/common/channelGrid";
import controles from "../remote/controles";
import {
    move
} from "../remote/keys";
import { el,get_word } from "../utils";
import GoogleAnalytics from "../plugins/googleAnalytics";
import { displayLog } from "../components/ads";

/**
 * use timeout to improve user experience while displaying the search result.
 * @type {*}
 */
let eventTimer;
/**
 * theme data such as background, text, border colors
 *
 * @type {*}
 */
let graphic = {
    page_background_color: '#000',
    text_color: '#fff',
    title_color: '#fff'
}
class SearchPage {
    /**
     * Creates an instance of SearchPage.
     *
     * @constructor
     */
    constructor() {
        this.data = {
            title: "Search",
            page: "search",
        };

        this.channels = appData;
        this.firstTwentyfiveItems = [];

        // this.page = detect_page(this.data.page);
        this.page = this.data.page;
    }

    /**
     * search result's count
     *
     * @static
     * @type {number}
     */
    static foundedChannelsCount = 0;
    /**
     * page element
     *
     * @static
     * @type {*}
     */
    static page_element = null;

    render() {
        console.log('render')
        if(SearchPage.page_element) return;
        let root = document.getElementById("root");
        root.style.background = graphic.page_background_color;

        let styleElement = document.createElement('style');
        styleElement.innerHTML = '.search-input::placeholder { color: ' + graphic.text_color + '; }';
        document.head.appendChild(styleElement);

        let search_parent = el("div", "page-parent search-parent", "search_parent");
        let search_result_parent = el(
            "div", "search-result-parent", "search_result_parent"
        );
        let search_page_title = el("h1", "page-title");
        search_page_title.style.color = graphic.title_color;

        let search_input_parent = el("div", "search-input__parent", "search-input__parent");
        let search_input = el(
            "div", "search-input__item search-input", "search_input"
        );
        search_input.style.color = graphic.text_color;
        search_input.style.borderColor = graphic.text_color;

        let founded_items_count = el(
            "p", "founded-items-count", "founded_items_count"
        );

        let not_found_message = el("p", "not-found-message", "not_found_message");

        SearchPage.foundedChannelsCount = this.channels.length;

        search_input.placeholder = get_word("search_placeholder");
        search_input_parent.appendChild(search_input);
        search_input_parent.appendChild(founded_items_count);

        search_page_title.innerHTML =
            // appData.graphic.appName +
            'hello' +
            `<span class='app-name__border' style='background-color: ${graphic.text_color};'></span>` +
            this.page.page_title;
        search_parent.appendChild(search_page_title);
        search_parent.appendChild(search_input_parent);
        search_parent.appendChild(not_found_message);

        search_input.onmouseover = this.searchInputMouseOver;
        search_input.oninput = this.searchInputChange;
        search_input.onclick = this.searchInputClick.bind(this);

        // this.firstTwentyfiveItems = this.channels.slice(0, 25);
        this.channels.slice(0, 25).forEach(playlist => {
            playlist.videos.forEach(video => this.firstTwentyfiveItems.push(video))
        });

        search_result_parent.appendChild(
            new ChannelGrid({
                channels: this.firstTwentyfiveItems
            })
            .render()
        );

        search_parent.appendChild(search_result_parent);

        const resultCount = el('div', '', 'resultCount');
        resultCount.style.display = 'none';

        search_result_parent.parentNode.insertBefore(resultCount, search_result_parent);

        root.appendChild(search_parent);

        SearchPage.page_element = document.getElementById('search_parent');
        pages.page_objects.search = SearchPage.page_element;

        controles.main.search.search_results.index = 0;
        controles.main.search.search_results.row = 0;
    }

    /**
     * handle the remote control over event on the search input
     */
    searchInputMouseOver() {
        if(controles.main.search.current !== "search_input") {
            controles.main.search.set_current("search_input");
            move();
        }
    }

    /**
     * handle the changed value on the search input
     *
     * @param {*} e
     * @param {*} isKeyboard
     * @param {*} val
     */

    searchInputChange(e, isKeyboard, val) {
        clearTimeout(eventTimer);

        let value = "";

        // val = val.split('undefined')[1];
        const input = document.getElementById("search_input");
        input.innerText = val;

        if(input.scrollWidth > input.clientWidth) input.scrollLeft = input.scrollWidth;

        if(isKeyboard) {
            value = val;
        } else {
            value = e.target.value;
        }

        //FIX: here
        // const channels = Object.keys(appData.content).filter((key, index) => {
        //   const channel = appData.content[key];
        //   return channel.title.toLowerCase().includes(value?.toLowerCase());
        //
        // });

        const channels = [];
        for(let i = 0; i < appData.length; i++) {
            const playlist = appData[i];
            for(let j = 0; j < playlist.videos.length; j++) {
                const video = playlist.videos[j];
                if(video.title.toLowerCase()
                    .includes(value.toLowerCase(0))) {
                    channels.push(video);
                }
            }
        }

        const filtered_channels = [];

        let not_found_message = document.getElementById("not_found_message");
        not_found_message.style.color = graphic.text_color;

        let founded_items_count = document.getElementById("founded_items_count");
        founded_items_count.style.color = graphic.text_color;
        if(!channels.length) {
            const resultCount = document.getElementById("resultCount");
            resultCount.innerHTML = '';
            not_found_message.classList.add("visible");
            not_found_message.innerHTML = `Search not found`;
            // not_found_message.innerHTML = `${get_word("searchNoResults")} the search`;
            founded_items_count.innerHTML = "";
        } else {
            not_found_message.classList.remove("visible");
            if(channels.length < 100) {
                if(value.length) {
                    const resultCount = document.getElementById("resultCount");
                    resultCount.innerHTML = '';
                    resultCount.textContent = `${channels.length} results`;
                    resultCount.style.display = 'block';

                    // founded_items_count.innerHTML = `${get_word("found")} ${channels.length
                    //   } videos`;
                } else {
                    founded_items_count.innerHTML = "";
                }
            } else {
                founded_items_count.innerHTML = "";
            }
            // const resultCount = document.getElementById("resultCount");
            // resultCount.innerHTML = '';
            // resultCount.textContent = `${channels.length} results`;
            // resultCount.style.display = 'block';
        }

        SearchPage.foundedChannelsCount = channels.length;

        for(let x = 0; x < channels.length; x++) {
            if(x < 25) {
                // filtered_channels[channels[i]] = appData.content[channels[i]];
                filtered_channels.push(channels[x]);
            } else break;
        }


        const search_result_parent = document.getElementById(
            "search_result_parent"
        );

        search_result_parent.innerHTML = "";
        search_result_parent.appendChild(
            new ChannelGrid({
                channels: filtered_channels
            })
            .render()
        );

        // send value after a second of inactivity
        eventTimer = setTimeout(() => {
            GoogleAnalytics.sendEvent({
                name: "search_value",
                parameters: {
                    value: value
                }
            })
        }, 1000);

        // }, 500);
    }

    /**
     * handle the clicking event on the search input
     */
    searchInputClick() {
        displayLog('search input click');
        const _this = this;
        const input = document.getElementById("search_input");
        var has_focus = document.activeElement === input;
        if(controles.main.search.current !== "search_input") {
            controles.main.search.set_current("search_input");
            move();
        }

        if(!has_focus) { // then focus to input element or show built in keyboard
            // if (window.settings?.platformSettings?.keyboard) {
            const target = document.getElementById("search_input");
            if(!("value" in target)) {
                target.value = "";
            }
            const keyboardOptions = {
                el: target,
                changeValue: (value) => {
                    _this.searchInputChange(null, true, value);
                },
            };
            const keyboard = new Keyboard(keyboardOptions);
            keyboard.render();
            const grid_parent = document.getElementById("channel_grid_parent");
            if(grid_parent && !grid_parent.classList.contains("active_keyboard")) {
                grid_parent.classList.add("active_keyboard");
            }
            // } else {
            //   input.focus();
            // }
        }
    }

    /**
     * start rendering of the search page
     */
    mounted() {
        this.render();
    }
}

export default SearchPage;

