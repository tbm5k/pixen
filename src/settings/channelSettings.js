import GoogleAnalytics from "../plugins/googleAnalytics";
import Youbora from "../plugins/youbora";
import DefaultValues from "./channelDefault.json";
import BrighData from "../plugins/brightData";

class ChannelSettings {
  /**
 * Creates an instance of ChannelSettings.
 *
 * @constructor
 */
constructor() {
    this.generals = DefaultValues.generals;
    this.plugins = [];
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @async
 * @param {*} _plugins
 * @returns {unknown}
 */
static async loadPlugins(_plugins) {
    const pluginsList = {
      // googleAnalytics: GoogleAnalytics,
      youbora: Youbora,
      brighData: BrighData,
    };

    try {
      if (typeof _plugins != "object") return Promise.resolve();

      let plugins = [];

      if (Array.isArray(_plugins)) {
        plugins = _plugins;        
      } else {
        for (let key in _plugins) {
          let value = _plugins[key];          

          if (pluginsList[key]) {
            switch (key) {
              case "googleAnalytics":                
                plugins.push({
                  name: "googleAnalytics",
                  type: "analytics",
                    value: value,
                  src:
                    "https://cdn.castify.ai/files/plugins/googleAnalytics.js?tag=" +
                    value,
                });
                break;
              case "youbora":
                plugins.push({
                  name: "youbora",
                  accountCode: value,
                });
            }
          }
        }
      }

      plugins = plugins.filter((plugin) => pluginsList[plugin.name]);

      const downloadedPlugins = await Promise.all(
        plugins.map((plugin) => {
          let { name } = plugin;

          return new Promise((resolve, reject) => {
            //check if this plugin in pluginList
            const pluginRef = pluginsList[name];

            if (!pluginRef) {
              let error = new Error(`Unknown or unsupported plugin: ${name}`);
              window.dispatchEvent(new ErrorEvent("error", { error }));
              return reject(name);
            }

            // initialize the plugin with data
            const initPlugin = new pluginRef(plugin);

            try {
              initPlugin.load().then(resolve);
            } catch (err) {
              let error = new Error(`Plugin installing failed: ${name}`);
              window.dispatchEvent(new ErrorEvent("error", { error }));
              reject(name);
            }
          });
        })
      );

      return downloadedPlugins.reduce((total, current) => {
        const type = current.type || "other";
        const info = total[type] || [];

        return { ...total, [type]: [...info, current] };
      }, {});
    } catch (err) {
      throw err;
    }
  }

  /**
 * ${1:Description placeholder}
 *
 * @static
 * @async
 * @param {*} scripts
 * @returns {unknown}
 */
static async loadScripts(scripts) {
    if (!scripts || (scripts && !scripts.length)) return [];

    const head = document.head;

    return Promise.all(
      scripts.map((script) => {
        return new Promise((resolve, reject) => {
          const scriptElem = document.createElement("script");
          scriptElem.src = script.src;
          scriptElem.onload = () => resolve(script);
          scriptElem.onerror = () => reject(script);
          head.appendChild(scriptElem);
        });
      })
    );
  }

  async init(settings) {
    if (!settings) return;
    
    const loaderHandler = await Promise.all([
      ChannelSettings.loadPlugins(settings.plugins),
      ChannelSettings.loadScripts(settings.additionalScripts),
    ]);

    this.plugins = loaderHandler[0];
    this.scripts = loaderHandler[1];

    Object.assign(this.generals, settings.generals);
  }

  getPlugins(pluginName) {
    return this.plugins[pluginName] || [];
  }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} field
 * @returns {*}
 */
getSettings(field) {
    return this.generals[field];
  }
}

export default new ChannelSettings();
