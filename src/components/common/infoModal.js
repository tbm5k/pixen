import { el, get_word } from "../../utils";

/**
 * ${1:Description placeholder}
 *
 * @type {*}
 */
let hideTimeout = null;

class InfoModal {
  /**
 * Creates an instance of InfoModal.
 *
 * @constructor
 * @param {*} options
 */
constructor(options) {
    this.modal = document.getElementById("info_modal");
    this.title = options.title || "";
    this.children = options.children || [];
    this.hideButton = options.hideButton || false;
    this.fullScreen = options.fullScreen || false;

    this.hideAfterRestore = options.hideAfterRestore || false;

    this.render();
  }

  /**
 * ${1:Description placeholder}
 */
render() {
    const _this = this;
    this.modal.innerHTML = "";
    controles.set_current("info_modal");
    var modal_overlay = el("div", "info-modal-overlay", "info_modal_overlay");
    var modal_content = el("div", "info-modal-content");
    var modal_title = el("h1", "info-modal-title", "info_modal_title");
    var modal_ok = el("div", "info-modal-ok info-modal-ctrl", "info_modal_ok");

    modal_title.innerHTML = this.title;
    modal_ok.innerHTML = get_word("ok");

    modal_content.appendChild(modal_title);

    if (this.children) {
      this.children.forEach((child) => {
        modal_content.appendChild(child);
      });
    }

    if (!this.hideButton) {
      modal_content.appendChild(modal_ok);
    } else {
      modal_title.style.marginBottom = "0";
    }

    if (this.fullScreen) {
      modal_overlay.classList.add("full-screen");
    }

    if (this.hideAfterRestore) {
      clearTimeout(hideTimeout);

      hideTimeout = setTimeout(function () {
        _this.closeTheModal();
      }, 5000);
    }

    modal_ok.onclick = function () {
      _this.closeTheModal();
    };

    modal_overlay.appendChild(modal_content);

    this.modal.appendChild(modal_overlay);
  }

  /**
 * ${1:Description placeholder}
 */
closeTheModal() {
    this.modal.innerHTML = "";
    controles.set_previous();
  }
}

export default InfoModal;
