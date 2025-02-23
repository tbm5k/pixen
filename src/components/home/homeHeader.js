import { el, convertTime } from "../../utils";
import ChannelCard from "../common/channelCard";
/**
* @class HomeHeader
* @typedef {HomeHeader}
*/
class HomeHeader {
    /**
    * Creates an instance of HomeHeader.
    *
    * @constructor
    * @param {*} channelTitle
    * @param {*} channelImg
    * @param {*} isLive
    * @param {*} description
    * @param {*} category
    * @param {*} videoDuration
    * @param {*} parental_control
    * @param {*} resolution
    */
    constructor(
        channelTitle,
        channelImg,
        isLive,
        description,
        category,
        videoDuration,
        parental_control,
        resolution
    ) {
        this.data = {
            channelTitle,
            channelImg,
            isLive,
            description,
            category,
            videoDuration,
            parental_control,
            resolution,
        };
        this.time = 500;
        this.previoous_image = null;
    }

    /**
    * ${1:Description placeholder}
    */
    render() {
        if (!this.data.channelImg) {
            // TODO In the future, we might determine whether or not the "my list" is empty before setting the time to zero.
                this.time = 0;
        }

        var current = "_" + pages.current;
        const header_parent = el("div", "home-header__parent", "header_parent" + current);

        header_parent.innerHTML = "";

        const header_img = el("div", "home-header__img", "home_header_img" + current);
        const header_content = el("div", "home-content", "home_content" + current);
        const header_title = el("h1", "home-header__title", "home_header_title" + current);
        const header_tags = el("div", "home-header__tags", "home_header_tags" + current);
        const live_block = el("div", "live-block");
        const live_text = el("span", "live-text");

        if (this.data.category) {
            live_text.innerHTML = this.data.category;
            live_block.classList.remove("empty");
        } else {
            live_block.classList.add("empty");
        }

        const header_is_live_img = `
            <svg class="live-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g>
            <path fill="none" d="M0 0h24v24H0z"/>
            <path fill-rule="nonzero" d="M16 4a1 1 0 0 1 1 1v4.2l5.213-3.65a.5.5 0 0 1 .787.41v12.08a.5.5 0 0 1-.787.41L17 14.8V19a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h14zm-1 2H3v12h12V6zM7.4 8.829a.4.4 0 0 1 .215.062l4.355 2.772a.4.4 0 0 1 0 .674L7.615 15.11A.4.4 0 0 1 7 14.77V9.23c0-.221.18-.4.4-.4zM21 8.84l-4 2.8v.718l4 2.8V8.84z"/>
            </g>
            </svg>
            `;

        const header_description = el(
            "p",
            "home-header__description",
            "home_header_description" + current
        );

        header_title.innerHTML = this.data.channelTitle;

        header_description.innerHTML = this.data.description;
        let img = "";


        if (this.data.channelImg) {
            const image = new Image();
            const imgSrc = ChannelCard.getCompressedImage(this.data.channelImg, 1535, 864);
            image.src = imgSrc;

            image.onload = () => {
                img = image.src;
                setHeaderImage(img);
            };

            image.onerror = () => {
                img = appData.graphic.defaultThumbnail;
                setHeaderImage(img);
            };
        } else {
            img = appData.graphic.defaultThumbnail;
            setHeaderImage(img);
        }

        const setHeaderImage = (img) => {
            requestAnimationFrame(() => {
                if (this.previous_image !== img) {
                    header_img.style.backgroundImage = `url(${img})`;
                    this.previous_image = img;
                }
            });
        };

        header_parent.appendChild(header_img);
        if (this.data.channelTitle) {
            header_content.appendChild(header_title);
        }

        live_block.innerHTML = header_is_live_img;
        live_block.appendChild(live_text);

        header_tags.appendChild(live_block);

        if (this.data.description) {
            header_content.appendChild(header_description);
        }

        if (this.data.videoDuration) {
            const video_duration = el("div", "channel-info__tag");
            const duration_img = el("img", "tag-icon");
            duration_img.src = "https://cdn.castify.ai/files/app/clock.svg";
            if (video_duration) {
                video_duration.innerHTML = duration_img;
            }
            header_tags.appendChild(video_duration);
            const convertedDuration = convertTime(this.data.videoDuration);

            if (video_duration) {

                video_duration.innerHTML = convertedDuration;
            }
        }

        if (this.data.resolution) {
            const resolution = el("div", "channel-info__tag");
            resolution.innerHTML = this.data.resolution;
            header_tags.appendChild(resolution);
        }

        if (this.data.parental_control && this.data.parental_control.length) {
            const parental_control = el("div", "channel-info__tag");
            const parental_control_img = el("img", "tag-icon");

            parental_control_img.src =
                "https://cdn.castify.ai/files/app/parentControl.svg";
            parental_control.appendChild(parental_control_img);
            parental_control.innerHTML = this.data.parental_control[0].title;
            header_tags.appendChild(parental_control);
        }

        header_content.appendChild(header_tags);

        header_parent.appendChild(header_content);

        const home_header_wrapper = document.getElementById("home_header_wrapper" + current);
        if (!home_header_wrapper) return;
        home_header_wrapper.innerHTML = "";
        home_header_wrapper.appendChild(header_parent);
    }
}

export default HomeHeader;
