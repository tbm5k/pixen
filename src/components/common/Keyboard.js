import "../../styles/keyboard.css";
import { removeSvg, shiftSvg } from "../svgs";
import controles from "../../remote/controles";
import { el, setItem } from "../../utils";

/**
    * @class Keyboard
    * @description Custom keyboard
    * */
    class Keyboard {
        /**
            * Creates an instance of Keyboard.
            *
            * @constructor
            * @param {*} options
            */
            constructor(options) {
                this.el = options.el;
                this.changeValue = options.changeValue;
                this.doneCallback = options.doneCallback;
                this.backHandler = options.backHandler;
                this.value = "";

                this.enKeyboard = [
                    ["a", "b", "c", "d", "e", "f", "g", "h", "i", "bspace"],
                    ["j", "k", "l", "m", "n", "o", "p", "q", "r", "Clean"],
                    ["s", "t", "u", "v", "w", "x", "y", "z", "-", "123"],
                    ["?", "Space", ",", ".", "Done"],
                ];

                this.numKeyboard = [
                    ["1", "2", "3", "&", "#", "(", ")", "@", "!", "bspace"],
                    ["4", "5", "6", '"', ":", "-", "^", "[", "]", "Clean"],
                    ["7", "8", "9", "0", "/", "$", "%", "+", "-", "Eng"],
                    ["?", "Space", ",", ".", "Done"],
                ];
            }

        /**
            * @description hold render state
            * @static
            * @type {boolean}
            */
            static isRendered = false;

        /**
            * @description activates uppercase characters
            * @static
            * @type {boolean}
            */
            static isUpperCase = false;

        /**
            * @description hides or unhides the keyboard 
            * @static
            * @type {boolean}
            */
            static isVisible = false;

        /**
            *
            * @static
            * @type {*}
            */
            static target = null;

        /**
            * ${1:Description placeholder}
            *
            * @static
            * @type {{}\}
            */
            static statics = [
                "/",
                "\\",
                "bspace",
                "Done",
                "Shift",
                "?",
                "Clean",
                "123",
                "Space",
                "Fr",
            ];

        /**
            *
            * @description cleanup method
            * @static
            */
            static destroy() {
                const keyboard = document.querySelector(".keyboard_parent");

                if (!keyboard) return;

                keyboard.remove();

                Keyboard.isRendered = false;

                controles.keyboard.index = 0;
                controles.keyboard.row = 0;
            }

        render(lng) {
            // const root = document.getElementById("keyboard_root");

            // offset the keyboard
            // const results = document.getElementById("channel_grid_parent");
            // results.style.top = "72%";

            // check if keyboard parent exists, if it does remove hidden property
            if(Keyboard.isRendered && !Keyboard.isVisible) {
                const keyboardparent = document.getElementById("keyboard_parent");

                if(!keyboardparent) {
                    Keyboard.isRendered = false;
                    Keyboard.isVisible = false;
                    this.render(lng);
                    return;
                }
                keyboardparent.classList.remove("hidden");
                keyboardparent.style.display = 'block';

                Keyboard.isRendered = true;
                Keyboard.target = this.el;
                Keyboard.isVisible = true;

                controles.set_current("keyboard");
                controles.keyboard.move();
                return;
            }

            // if both are true this means we are toggling between numeric and alphabetical
            if(Keyboard.isRendered && Keyboard.isVisible) {
                const keyboardparent = document.getElementById("keyboard_parent");
                keyboardparent.remove();
                // return;
            }

            const root = document.getElementById("search-input__parent");
            const keyboardItems = lng || this.enKeyboard;

            // const backHidden = el("div", "back_hiden d-none", "keyboard_back");

            const keyboardParent = el("div", "keyboard_parent", "keyboard_parent");
            const keyboard = el("div", "keyboard");

            // keyboard.appendChild(backHidden);

            keyboardItems.forEach((row) => {
                const rowParent = el("div", "keyboard_row row-ctrl");

                row.forEach((key) => {
                    const keyParent = el("div", "keyboard_key key-ctrl", key);

                    if (Keyboard.statics.includes(key)) {
                        keyParent.innerHTML = key;
                    } else {
                        keyParent.innerHTML = Keyboard.isUpperCase ? key.toUpperCase() : key;
                    }

                    if (key === "bspace") {
                        keyParent.classList.add("keyboard_key-backspace");
                        keyParent.innerHTML = removeSvg();
                    } else if (key === "Done") {
                        keyParent.classList.add("keyboard_key-done");
                    } else if (key === "Clean") {
                        keyParent.classList.add("keyboard_key-clean");
                    } else if (key === "Shift") {
                        keyParent.classList.add("keyboard_key-shift");
                        keyParent.innerHTML = shiftSvg();
                    } else if (key === "Eng") {
                        keyParent.classList.add("keyboard_key-eng");
                        keyParent.innerHTML = "abc";
                    } else if (key === "123") {
                        keyParent.classList.add("keyboard_key-123");
                        keyParent.innerHTML = "#@!$";
                    } else if (key === "Space") {
                        keyParent.classList.add("keyboard_key-space");
                    }

                    rowParent.appendChild(keyParent);

                    keyParent.addEventListener("click", () => {
                        this.clickHandler(key);
                    });
                });

                keyboard.appendChild(rowParent);
            });

            // backHidden.addEventListener("click", () => {
            //     if (this.backHandler) {
            //         this.backHandler();
            //     }
            // });

            keyboardParent.appendChild(keyboard);

            Keyboard.isRendered = true;

            // root.innerHTML = "";

            root.appendChild(keyboardParent)
            // root.appendChild(keyboardParent);

            Keyboard.target = this.el;

            Keyboard.isVisible = true;

            controles.set_current("keyboard");
            controles.keyboard.move();
        }

        /**
            * ${1:Description placeholder}
            *
            * @param {*} key
            */
            clickHandler(key) {
                if (key === "bspace") {
                    this.backspaceHandler();
                } else if (key === "Done") {
                    this.doneHandler();
                } else if (key === "Clean") {
                    this.cleanHandler();
                } else if (key === "Shift") {
                    this.shiftHandler();
                } else if (key === "123") {
                    this.numbersHandler();
                } else if (key === "Space") {
                    this.spaceHandler();
                } else if (key === "Eng") {
                    this.engHandler();
                } else if (key === "Fr") {
                    this.frHandler();
                } else {
                    this.keyHandler(key);
                }
            }

        /**
            * ${1:Description placeholder}
            *
            * @param {*} key
            */
            keyHandler(key) {
                this.el.value += Keyboard.isUpperCase ? key.toUpperCase() : key;

                if (this.changeValue) {
                    this.changeValue(this.el.value);
                }
            }

        /**
            * ${1:Description placeholder}
            */
            backspaceHandler() {
                this.el.value = this.el.value.slice(0, -1);

                if (this.changeValue) {
                    this.changeValue(this.el.value);
                }

                this.value = this.el.value;
            }

        /**
            * ${1:Description placeholder}
            */
            doneHandler() {
                if (this.doneCallback) {
                    this.doneCallback();
                } else {
                    Keyboard.hide();
                    controles.set_previous();
                }
            }

        /**
            * ${1:Description placeholder}
            */
            cleanHandler() {
                this.el.value = "";
                this.changeValue(this.el.value);
            }

        /**
            * ${1:Description placeholder}
            */
            engHandler() {
                Keyboard.isUpperCase = false;
                this.render(this.enKeyboard);
            }

        /**
            * ${1:Description placeholder}
            */
            frHandler() {
                Keyboard.isUpperCase = false;
                this.render(this.frKeyboard);
            }

        /**
            * ${1:Description placeholder}
            */
            numbersHandler() {
                this.render(this.numKeyboard);
                controles.keyboard.index = 0;
                controles.keyboard.row = 0;
                controles.keyboard.move();
            }

        /**
            * ${1:Description placeholder}
            */
            spaceHandler() {
                this.el.value += " ";
            }

        /**
            * ${1:Description placeholder}
            */
            shiftHandler() {
                Keyboard.isUpperCase = !Keyboard.isUpperCase;

                this.render(this.enKeyboard);
            }

        /**
            * ${1:Description placeholder}
            *
            * @param {*} el
            */
            updateEl(el) {
                this.el = el;
            }

        /**
            * ${1:Description placeholder}
            *
            * @param {*} link
            * @returns {boolean}
            */
            isXtreamAccountHandler(link) {
                var url = link;

                if (!url) return false;

                var host = url.split("?")[0];
                var query = url.split("?")[1];

                if (!host || !query || host.indexOf("get.php") == -1) return false;

                query = query.split("&");

                if (query.length < 2) return false;

                var username = "";
                var password = "";

                for (var i = 0; i < query.length; i++) {
                    var key = query[i].split("=")[0];
                    var value = query[i].split("=")[1];

                    if (key == "username") username = value;
                    if (key == "password") password = value;
                }

                if (!username || !password) return false;

                var xtream_account = {
                    host: host.replace("/get.php", ""),
                    username: username,
                    password: password,
                };

                setItem("selectedPlaylist", JSON.stringify(xtream_account));
            }

        /**
            * ${1:Description placeholder}
            *
            * @static
            */
            static hide() {
                const keyboard = document.getElementById("keyboard_parent");
                const grid_parent = document.getElementById("channel_grid_parent");
                if (grid_parent && grid_parent.classList.contains("active_keyboard")) {
                  grid_parent.classList.remove("active_keyboard");
                }
                if (!keyboard) return;

                // keyboard.classList.add("hidden");
                Keyboard.isVisible = false;
                keyboard.style.display = 'none';
                this.isVisible = false;

                // offset the keyboard
                // const results = document.getElementById("channel_grid_parent");
                // results.style.top = "40%";
            }

        /**
            * ${1:Description placeholder}
            *
            * @static
            */
            static show() {
                const keyboard = document.querySelector(".keyboard_parent");

                if (!keyboard) return;

                keyboard.classList.remove("hidden");
                Keyboard.isVisible = true;

                controles.set_current("keyboard");
                controles.keyboard.move();
            }
    }

export default Keyboard;
