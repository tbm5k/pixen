export default class BrighData {
  /**
 * Creates an instance of BrighData.
 *
 * @constructor
 * @param {*} tag
 */
constructor(tag) {
    this.name = "brighData";
    this.type = "brighData";
    this.tag = tag;
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @type {boolean}
 */
static isVisible = false;

  /**
 * ${1:Description placeholder}
 *
 * @param {*} data
 * @returns {*}
 */
init(data) {
    let { app_name, app_logo } = data;

    return new Promise((resolve, reject) => {
      if (window.webOS && window.webOS.platform && window.webOS.platform.tv) {
        let script = document.createElement("script");

        script.src = "./brd_api.js";

        script.onload = () => {
          try {
            if (!window.brd_api) return reject("BRD API not found");

            this.brd_api = window.brd_api;

            let api_settings = {
              agree_btn: "Remove Ads",
              disagree_btn: "I prefer to see ads",
              opt_out_instructions: " ",
              app_name,
              app_logo,
              benefit_txt:
                "By accepting this form you can watch favorite content ad free",
              on_status_change: () => {
                try {
                  this.status = this.brd_api.get_status();
                  if (
                    this.statusChanged &&
                    typeof this.statusChanged == "function"
                  )
                    this.statusChanged(this.status);

                } catch (e) {
               
                }
              },
              on_dialog_shown: () => {
                BrighData.isVisible = true;
              },
              on_dialog_closed: () => {
                BrighData.isVisible = false;
              },
              iframe: false,
            };

            this.brd_api.init(api_settings, {
              on_failure: (message) => {
                reject(message);
              },
              on_success: () => {
                this.status = this.brd_api.get_status();
                resolve();
              },
            });
          } catch ({ message }) {
            reject(message);
          }
        };

        script.onerror = () => {
          reject("BRD API script load error");
        };

        document.head.appendChild(script);
      } else {
        reject("BRD API can't run on this platform");
      }
    });
  }

  /**
 * ${1:Description placeholder}
 *
 * @returns {*}
 */
load() {
    return new Promise((resolve, reject) => {
      resolve(this);
    });
  }

  /**
 * ${1:Description placeholder}
 */
enable() {
    if (!this.brd_api) return ;

    try {
      this.brd_api.show_consent({
        on_failure: () => {
       
        },
        on_success: () => {
        
        },
      });
    } catch (e) {
     
    }
  }

  /**
 * ${1:Description placeholder}
 */
disable() {
    if (!this.brd_api) return ;

    try {
      this.brd_api.opt_out({
        on_failure: () => {
   
        },
        on_success: () => {
     
        },
      });
    } catch (e) {
    
    }
  }
}
