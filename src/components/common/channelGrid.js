import ChannelCard from "./channelCard";
import {
	el,
	isVideoValid,
	remove_active_class,
	wheel_magic_control
} from "../../utils";
import {
	move
} from "../../remote/keys";
import Player from "../../pages/player";
import InfoModal from "./infoModal";
import DetailedPopup from "../detailedPopup";
import ChannelInfo from "../ChannelInfo";
import Keyboard from "./Keyboard";
import GoogleAnalytics from "../../plugins/googleAnalytics";
import HlsPlayer from "./hls";
import pages from "../../remote/pages";

/**
 * ${1:Description placeholder}
 *
 * @class ChannleGrid
 * @typedef {ChannleGrid}
 */
class ChannleGrid {
	/**
	 * Creates an instance of ChannleGrid.
	 *
	 * @constructor
	 * @param {*} options
	 */
	constructor(options) {
        this.videos = options.channels;
	}

	/**
	 * ${1:Description placeholder}
	 *
	 * @param {*} index
	 * @param {*} row_index
	 * @param {*} idx
	 */
	cardMouseOver = (index, row_index, idx) => {
		if(controles.main.search.current == "search_input") {
			const input = document.getElementById("search_input");
			var has_focus = document.activeElement === input;
			if(!has_focus) {
				controles.main.search.set_current("search_results");
				controles.main.search.search_results.row = row_index;
				controles.main.search.search_results.index = idx;
				move();
			}
		} else {
			controles.main.search.search_results.index = index;
			const items = document.getElementsByClassName("channel-item-ctrl");

			remove_active_class("active")

			controles.main.search.search_results.row = row_index;
			controles.main.search.search_results.index = idx;
		}
	};

	/**
	 * ${1:Description placeholder}
	 *
	 * @param {*} item
	 */
	cardClickHandler = async (item) => {
		GoogleAnalytics.sendEvent({
			name: "content_click",
			parameters: {
				page_title: window.controles.current,
				content_id: item.video_id,
				content_title: item.title
			}
		});

        this.cardClick(item);
	};

	/**
	 * ${1:Description placeholder}
	 *
	 * @param {*} item
	 * @returns {InfoModal}
	 */
	cardClick(item) {
		if(!navigator.onLine) {
			return new InfoModal({
				title: "No internet connection"
			});
		}

		// const channel = appData.content[item.id];
		pages.set_current("player");
		let entityArr = [];

		window.player_obj = new Player(item, entityArr);
		player_obj.render();
	}

	/**
	 * ${1:Description placeholder}
	 *
	 * @returns {*}
	 */
    render() {
		const channel_grid_parent = el(
			"div",
			"channel-grid__parent",
			"channel_grid_parent"
		);

		if(Keyboard.isVisible) channel_grid_parent.classList.add("active_keyboard");
		const channel_grid = el("div", "channel-grid", "channel_grid");

		for(let i = 0; i < Math.ceil(this.videos.length / 4); i++) {
			const channel_grid_row = el(
				"div",
				"channel-grid__row",
				"channel_grid_row"
			);

            for(let j = i * 4; j < Math.min((i + 4) * 4, this.videos.length); j++) {
                const item = this.videos[j]
                const channel_card = new ChannelCard({
                    id: item.video_id,
                    title: item.title,
                    thumbnail: item.thumbnail,
                    url: item.url,
                    description: item.description,
                    parental_control: item.parental_control,
                    duration: item.duration,
                    content_type: item.content_type,
                    index: j,
                    cardClickHandler: (item) => this.cardClickHandler(item),
                    cardMouseOver: (e) => this.cardMouseOver(e, j),
                });

                channel_grid_row.appendChild(channel_card.render());
            }

			channel_grid.appendChild(channel_grid_row);
		}

		channel_grid_parent.appendChild(channel_grid);

		channel_grid_parent.onwheel = (e) => {
			wheel_magic_control(e, controles.main.search.search_results);
		};

		return channel_grid_parent;
	}
}

export default ChannleGrid;

