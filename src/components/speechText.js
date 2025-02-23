import { displayLog } from "./ads";

class SpeechText {
    /**
        * Creates an instance of SpeechText.
        *
        * @constructor
        */
    constructor() {
        this.element = Object.assign(document.createElement("div"), {
            id: "voiceReader",
            tabIndex: -1,
        });

        this.vizioVoiceReader = false;
        (async() => {
            if(!window.VIZIO) return;
            const manifest = await window.VIZIO.getDeviceManifest();
            this.vizioVoiceReader = manifest.tts_enabled;
            console.log('tts_enabled: ', manifest.tts_enabled)
        })();
        document.body.appendChild(this.element);
    }

  /**
 * ${1:Description placeholder}
 *
 * @param {*} text
 * @param {*} addtionalText
 */
  read(text, addtionalText) {

      if(!this.vizioVoiceReader) return;
      clearTimeout(this.setSpeekTimeout);
      if (this.element.innerText == text) {
          return
      }
      this.element.innerText = "";
      if (text) {
          this.element.innerText = text;
      }

      if (addtionalText) {
          this.element.innerText += addtionalText;
      }

      if (window.VIZIO) {
          window.VIZIO.Chromevox.cancel();
          this.setSpeekTimeout = setTimeout(() => {
              window.VIZIO.Chromevox.play(text);
          }, 500);
      }

      if (window.OS == "webOS") {
          // speak text by luna service
          window.webOS.service.request("luna://com.webos.service.tts", {
              method: "speak",
              parameters: {
                  text: text,
                  clear: true,
              },
              onSuccess: function (res) { },
              onFailure: function (err) { },
          });
      }

      if (window.OS = "web") {
          var msg = new SpeechSynthesisUtterance();
          msg.text = text;
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(msg);
      }

      this.element.blur();
      this.element.focus();
  }

    enabler(shouldEnable) {
        this.vizioVoiceReader = shouldEnable;
    }
}

export default new SpeechText();
