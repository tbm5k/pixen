/**
 * Device Center
 */

import LG from "../platforms/lg";
import Samsung from "../platforms/samsung";
import Emulator from "../platforms/emulator";
import Zeasn from "../platforms/zeasn";
import Vizio from "../platforms/vizio";
import Vidaa from "../platforms/vidaa";
import appSettings from "../data/appSettings.json";
import { setKeyBinding } from "../remote/keys";

class Devices {
  constructor() {
    this.platformInstance = Devices._getInstance();
  }

  // !NOTE detecting the platform by userAgent is not the best way..it can be changed by the user
  static _getInstance() {
    const userAgent = navigator.userAgent.toLocaleLowerCase();
    if ((/webos|web0s/i).test(userAgent)) // LG
      return new LG();
    else if ((/tizen/i).test(userAgent)) // samsung
      return new Samsung();
    else if ((/nettv|sraf|tcl|iserver|whaletv|philipstv/i).test(userAgent)) // zeasn
      return new Zeasn();
    else if ((/vizio|smartcast|conjure/i).test(userAgent)) // vizio
      return new Vizio();
    else if ((/"vidaa|hisense/i).test(userAgent)) // vidaa
      return new Vidaa();
    else
      return new Emulator();
  }

  async init() {
    const platformInfo = await this.platformInstance.initDevice();

    window.settings.platform = this.platformInstance.name;
    window.settings.platformSettings = { ...platformInfo.platformSettings };
    window.settings.appSettings = {
      ...appSettings,
      isoCode: '',
      approved_sensitive_content: false,
    };
    window.settings.deepLinkData = { ...platformInfo.deepLinkData };

    setKeyBinding(platformInfo.keys);
  }

  /**
 * get a specific key value from the platform instance
 *
 * @param {*} value
 * @returns {*}
 */
getDeviceFieldData(value) {
    try {
      return this.platformInstance[value]();
    } catch (err) {
      return "";
    }
  }
}

export default new Devices();
