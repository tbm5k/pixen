import GoogleAnalytics from "../plugins/googleAnalytics.js";
import controles from "../remote/controles.js";
import { el, application_exit, get_word } from "../utils.js";

/**
    * @class ModalComponent
    * @typedef {ModalComponent}
    * @description Popup component
    */
class ModalComponent {
  /**
 * Creates an instance of ModalComponent.
 *
 * @constructor
 * @param {*} options
 */
constructor(options) {
    this.parent = document.getElementById("modal_root");
    this.title = options.title;
    this.content = options.content;
    this.buttons = options.buttons;

    this.render();
  }

  /**
 * @description closes the modal
 * @param {*} exit
 */
closeModal(exit) {
    if (exit) {
      application_exit();
    } else {
      GoogleAnalytics.sendEvent({name: "clicks", parameters: {
          CLICK: "DIALOG_CANCEL"
      }});
      this.parent.innerHTML = "";
      controles.set_previous();
    }
  }

    /**
        * @description render dynamic popup elements
        */
render() {
    var modal_parent = this.parent;
    modal_parent.innerHTML = "";
    var modal_overlay = el("div", "modal-overlay", "modal_overlay");
    var modal_content = el("div", "modal-content", "modal");
    var modal_title = el("h1", "modal-title", "modal_title");
    var modal_action_parent = el("div", "modal-action__parent", "modal_action");
    var modal_action_no = el(
      "div",
      "modal-action modal-action-no active",
      "modal_action_no"
    );

    var modal_action_yes = el(
      "div",
      "modal-action modal-action-yes",
      "modal_action_yes"
    );

    modal_title.innerHTML = get_word("exitText");
    modal_action_no.innerHTML = get_word("no");
    modal_action_yes.innerHTML = get_word("yes");

    modal_content.appendChild(modal_title);
    modal_action_parent.appendChild(modal_action_no);
    modal_action_parent.appendChild(modal_action_yes);
    modal_content.appendChild(modal_action_parent);

    modal_action_no.onclick = this.closeModal.bind(this, false);
    modal_action_yes.onclick = this.closeModal.bind(this, true);

    modal_overlay.appendChild(modal_content);

    modal_parent.appendChild(modal_overlay);
  }
}

export default ModalComponent;
