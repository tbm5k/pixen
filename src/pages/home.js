/**
    * Home page layout
    */

    import ChannelInfo from "../components/ChannelInfo";
import CategoriesList from "../components/common/categoriesList";
import ChannelsList from "../components/common/channelsList";
import HlsPlayer from "../components/common/hls";
import InfoModal from "../components/common/infoModal";
import DetailedPopup from "../components/detailedPopup";
import HomeHeader from "../components/home/homeHeader";
import GoogleAnalytics from "../plugins/googleAnalytics";
import controles from "../remote/controles";
import { move } from "../remote/keys";
import pages from "../remote/pages";
import { el, isVideoValid, remove_active_class } from "../utils";
import Player from "./player";
import Devices from "../services/deviceCenter";

class HomePage {
    /**
        * Creates an instance of HomePage.
        *
        * @constructor
        */
        constructor() {
            this.entityArray = [];
            this.selectedCategoryIndex = 0;
            this.isMovieCarousel = false;
            this.categoriesData = {};
            this.arrangedCategories = [];
            this.isLoading = false;
            this.page_element = null;
        }
    /**
        * If the categories list rendered, this will be true
        *
        * @static
        * @type {boolean}
        */
        static renderCategoriesList = false;
    /**
        * use to avoid re-rendering of home page
        *
        * @static
        * @type {boolean}
        */
        static rendered_already = false;
    /**
        * page element
        *
        * @static
        * @type {*}
        */
        static page_element = null;
    /**
        * card clicking handler
        *
        * @static
        * @type {*}
        */
        static cardClickHandler;
    /**
        * channels data
        *
        * @static
        * @type {{}\}
        */
        static channelsData = [];

    render() {
        this.isLoading = true;
        var current = "_" + pages.current;
        if (pages.current) current = '_home'

        // HomePage.renderCategoriesList = appData.hasOwnProperty("categories");
        // const home_page = appData.menu?.pages && Object.values(appData.menu.pages).find(
            //   (page) => page.page_path === "/"
            // );

        // let home_page = null;
        // if(appData.menu?.pages){
        //     home_page = Object.values(appData.menu.pages).find(
        //         (page) => page.page_path === "/"
        //     );
        // }

        // let hasPagePlaylists = null;
        // if(home_page){
        //     hasPagePlaylists = home_page.hasOwnProperty("playlists");
        // } else if(!home_page && !appData.menu && appData.playlists) {
        //     hasPagePlaylists = true;
        // }

        // console.log(appData)
        // if (hasPagePlaylists) {
        //     HomePage.renderCategoriesList = false;
        //     // this.entityArray = home_page ? home_page.playlists : Object.keys(appData.playlists);
        //     this.entityArray = appData;
        //     window.entityArray = this.entityArray;
        // }
        HomePage.renderCategoriesList = false;
        this.entityArray = appData;
        window.entityArray = this.entityArray;

        const root = document.getElementById("root");
        const home_parent = el("div", "page-parent home-parent", "home_parent");
        const home_header_wrapper = el(
            "div",
            "home-header__wrapper",
            "home_header_wrapper" + current
        );

        if (!HomePage.rendered_already) {
            controles.main.home.index = 0;
            controles.main.home.row = 0;
            HomePage.rendered_already = true;
        }


        home_parent.innerHTML = "";
        controles.main.home.isSomeItemActived = false;

        home_header_wrapper.innerHTML = "";

        home_parent.appendChild(home_header_wrapper);
        const _this = this;

        if (!HomePage.cardClickHandler)
            HomePage.cardClickHandler = this.cardClickHandler.bind(this);

        home_parent.appendChild(
            new ChannelsList({
                entityArray: this.entityArray,
                listMouseOver: this.listMouseOverHandler.bind(_this),
                cardClickHandler: this.cardClickHandler.bind(_this),
                cardMouseOver: this.cardMouseOver.bind(_this),
                channelListCallback: this.displayCategoriesList.bind(_this),
            }).render()
        );

        this.isLoading = false;

        root.appendChild(home_parent);
        HomePage.page_element = document.getElementById('home_parent');
        pages.page_objects.home = HomePage.page_element;

        if (this.isMovieCarousel) {
            const channels_parent = home_parent.children[1];
            channels_parent.classList.add("top");
        }

        controles.set_current("main");
        controles.main.set_current("home");

        move();
    }

    addData(playlists) {
        const parentList = document.getElementById("channels_list_parent")
        // home_parent.appendChild(
        //     new ChannelsList({
        //         entityArray: this.entityArray,
        //         listMouseOver: null,
        //         cardMouseOver: this.cardMouseOver,
        //         cardClickHandler: this.cardClickHandler.bind(_this),
        //         channelListCallback: this.displayCategoriesList.bind(_this),
        //     }).render()
        // );
        for(let i = 0; i < playlists.length; i++){
            const playlist = playlists[i];
            const row = ChannelsList.renderRows(playlist, i, this.cardClickHandler.bind(playlist));
            parentList.appendChild(row)
        }
        HomePage.channelsData = [...HomePage.channelsData, ...playlists]
    }

    /**
        * initialize isMovieCarousel to disolay the categories list
        *
        * @param {*} isMovieCarousel
        */
        displayCategoriesList(isMovieCarousel) {
            this.isMovieCarousel = isMovieCarousel;
        }

    /**
        * index value of the selected category
        *
        * @param {*} index
        */
        selecteCategory(index) {
            controles.main.home.index = 0;
            controles.main.home.row = 0;

            this.selectedCategoryIndex = index;
            const _this = this;

            // channels list parent
            const channel_list_parent = document.getElementById("channels_list_parent");
            const category_entities =
                appData.categories[
                    this.arrangedCategories.children_category_ids[
                        this.selectedCategoryIndex
                    ]
                ];


            if (category_entities && category_entities.playlist_ids) {
                this.entityArray = category_entities.playlist_ids;
            }
            window.entityArray = this.entityArray;

            // categorys list items
            const categories_list_items = document.querySelectorAll(
                ".categories-list__item"
            );

            categories_list_items.forEach((item) => {
                item.classList.remove("selected");
            });

            categories_list_items[index].classList.add("selected");

            home_parent.removeChild(channel_list_parent);
            home_parent.appendChild(
                new ChannelsList({
                    entityArray: this.entityArray,
                    listMouseOver: null,
                    cardMouseOver: this.cardMouseOver,
                    cardClickHandler: this.cardClickHandler.bind(_this),
                    channelListCallback: this.displayCategoriesList.bind(_this),
                }).render()
            );
        }

    /**
        * Handle the clicking event of the categories list item
        *
        * @param {int} index
        */
        onMouseEnterHandler(index) {
            if (controles.main.current != "categories_list") {
                controles.main.set_current("categories_list");
            }
        }

    /**
        * handle the hover event of the remote control on the channels list
        *
        * @param {*} idx
        * @param {*} data
        * @param {*} elem
        */
        listMouseOverHandler(idx, data, elem) {
            if (controles.main.current != "home") {
                controles.main.set_current("home");
            }
        }


    /**
        * handle the clicking event of the channel item
        *
        * @param {*} item
        */
        cardClickHandler = async (item) => {
            
            GoogleAnalytics.sendEvent({name: 'content_click', parameters: {
                page_title: window.controles.current || 'home',
                video: item.video_id,
                title: item.title
            }})

            // TODO: prevent keydown operations from operation
            const keydown = document.onkeydown;
            document.onkeydown = null;
            document.onkeydown = keydown;

            this.cardClick(item);
            return;
        };

    /**
        * handle the clicking event of the video item
        *
        * @param {*} item
        * @returns {*}
        */
        cardClick = (item) => {
            if (!navigator.onLine) {
                return new InfoModal({ title: "No internet connection" });
            }
            // const video = appData[item.video_id];
            pages.set_current("player");
            const entityArray = this.entityArray.length > 0 ? this.entityArray : window.entityArray;
            window.player_obj = new Player(item, entityArray);
            window.player_obj.render();
        };

    /**
        * handle the card hover event of the remote control on the categories
        *
        * @param {int} idx
        * @param {*} data
        * @param {*} elem
        */
        cardMouseOver(idx, data, elem) {

            remove_active_class("active");

            controles.main.home.index = idx;

            const entity_index = elem.parentElement.parentElement.getAttribute("entity_id");

            const playlistName = appData[entity_index].name;

            if (!HomePage.renderCategoriesList) {
                new HomeHeader(
                    data.title,
                    data.thumbnail,
                    data.description,
                    playlistName,
                    data.duration,
                    data.parental_control,
                    data.resolution
                ).render();
            } else {
                // const categories = new CategoriesList(appData.categories).render();
            }
        }

    /**
        * to render the home page, call this function
        */
        mounted() {
            if (!HomePage.rendered_already)
                this.render();
            else {
                if (HomePage.page_element) {
                    HomePage.page_element.style.display = 'block';
                }


                controles.set_current("main");
                controles.main.set_current("home");
                move();
            }
        }
}

export default HomePage;
