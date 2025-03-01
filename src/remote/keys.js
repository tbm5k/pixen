/**
 * Handleing Key Events
*/

import { displayLog } from "../components/ads";
import ScreenSaver from "../components/common/screenSaver";
import { showScreenSaver, screen_saver_timeout } from "../index";
import BrighData from "../plugins/brightData";

window.KeyCode = {
  N0: 48,
  N1: 49,
  N2: 50,
  N3: 51,
  N4: 52,
  N5: 53,
  N6: 54,
  N7: 55,
  N8: 56,
  N9: 57,
  NUM_PAD0: 96,
  NUM_PAD1: 97,
  NUM_PAD2: 98,
  NUM_PAD3: 99,
  NUM_PAD4: 100,
  NUM_PAD5: 101,
  NUM_PAD6: 102,
  NUM_PAD7: 103,
  NUM_PAD8: 104,
  NUM_PAD9: 105,

  RETURN: 10009,
  RETURN_WEB: 8,
  RETURN_WEBOS: 461,

  MUTE: 449,
  VOL_UP: 448,
  VOL_DOWN: 447,
  CH_UP: 427,
  CH_DOWN: 428,

  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,

  ENTER: 13,

  TOOLS: 10135,
  PRECH: 10190,

  INFO: 457,
  BACK: null,
  EXIT: 10182,

  RED: 403,
  GREEN: 404,
  YELLOW: 405,
  BLUE: 406,

  FAST_PREV: 412,
  FAST_NEXT: 417,

  NEXT: 10233,
  PREV: 10232,

  PAUSE: 19,
  PLAY: 415,
  STOP: 413,
  PLAYPAUSE: 10252,

  REC: 416,
  DONE: 65376,
  CANCEL: 65385,

  // web
  SPACE: 32,
};

/**
 * animation status
 *
 * @type {boolean}
 */
var is_animation = false;

/**
 * end animation
 */
var animation_end_function = function () { };

/**
 * start animation
 */
function animation_start() {
  is_animation = true;
  animation_end_function = function () { };
}

/**
 * end animation
 */
function animation_end() {
  is_animation = false;
  animation_end_function();
}

document.onkeydown = function (e) {
    console.log('key down', e.keyCode)
    displayLog(e.keyCode)
    e.preventDefault();
  clearInterval(screen_saver_timeout);
  if (window.screen_saver) {
    ScreenSaver.hide();
  }

  const screen_saver_time = 60000;

  if (+screen_saver_time) {
    showScreenSaver(+screen_saver_time);
  }

  if (!is_animation) {
    check_key(e);
  } else {
    animation_end_function = function () {
      check_key(e);
    };
  }
};

document.onkeyup = function () {
  animation_end_function = function () { };
};

document.onmousemove = function () {
  clearInterval(screen_saver_timeout);
  if (window.screen_saver) {
    ScreenSaver.hide();
  }
  const screen_saver_time = 60000;
  if (+screen_saver_time) {
    showScreenSaver(+screen_saver_time);
  }
};

/**
 * add keyName for each key events
 *
 * @param {*} e
 */
function check_key(e) {
  var key = e.keyCode;
  var name = "";

  e.keyName = e.code;

  switch (key) {
    case KeyCode.N0:
    case KeyCode.NUM_PAD0:
      name = "0";
      break;

    case KeyCode.N1:
    case KeyCode.NUM_PAD1:
      name = "1";
      break;

    case KeyCode.N2:
    case KeyCode.NUM_PAD2:
      name = "2";
      break;

    case KeyCode.N3:
    case KeyCode.NUM_PAD3:
      name = "3";
      break;

    case KeyCode.N4:
    case KeyCode.NUM_PAD4:
      name = "4";
      break;

    case KeyCode.N5:
    case KeyCode.NUM_PAD5:
      name = "5";
      break;

    case KeyCode.N6:
    case KeyCode.NUM_PAD6:
      name = "6";
      break;

    case KeyCode.N7:
    case KeyCode.NUM_PAD7:
      name = "7";
      break;

    case KeyCode.N8:
    case KeyCode.NUM_PAD8:
      name = "8";
      break;

    case KeyCode.N9:
    case KeyCode.NUM_PAD9:
      name = "9";
      break;

    case KeyCode.EXIT:
      name = "exit";
      break;

    case KeyCode.RETURN:
    case KeyCode.RETURN_WEB:
    case KeyCode.RETURN_WEBOS:
          console.log('back btn')
      name = "back";
      break;

    case KeyCode.MUTE:
      name = "mute";
      break;

    case KeyCode.VOL_UP:
      name = "volume_up";
      break;

    case KeyCode.VOL_DOWN:
      name = "volume_down";
      break;

    case KeyCode.CH_UP:
      name = "channel_up";
      break;

    case KeyCode.CH_DOWN:
      name = "channel_down";
      break;

    case KeyCode.UP:
      name = "up";
      break;

    case KeyCode.DOWN:
      name = "down";
      break;

    case KeyCode.LEFT:
          name = "left";
      break;

    case KeyCode.RIGHT:
          name = "right";
      break;

    case KeyCode.ENTER:
      name = "ok";
      break;

    case KeyCode.TOOLS:
      name = "tools";
      break;

    case KeyCode.PRECH:
      name = "prech";
      break;

    case KeyCode.INFO:
      name = "info";
      break;

    case KeyCode.EXIT:
      name = "exit";
      break;

    case KeyCode.RED:
      name = "red";
      break;

    case KeyCode.GREEN:
      name = "green";
      break;

    case KeyCode.YELLOW:
      name = "yellow";
      break;

    case KeyCode.BLUE:
      name = "blue";
      break;

    case KeyCode.FAST_PREV:
      name = "fast_prev";
      break;

    case KeyCode.FAST_NEXT:
      name = "fast_next";
      break;

    case KeyCode.PREV:
      name = "prev";
      break;

    case KeyCode.NEXT:
      name = "next";
      break;

    case KeyCode.PAUSE:
      name = "pause";
      break;

    case KeyCode.PLAY:
      name = "play";
      break;

    case KeyCode.STOP:
      name = "stop";
      break;

    case KeyCode.PLAYPAUSE:
      name = "playPause";
      break;

    case KeyCode.REC:
      name = "rec";
      break;

    case KeyCode.DONE:
      name = "done";
      break;

    case KeyCode.CANCEL:
      name = "cancel";
      break;

    case KeyCode.SPACE:
      name = "space";
      break;
  }

  if (name) e.keyName = name;

  keydown(e);
}

function keydown(e) {
  if (BrighData.isVisible) return true;

  var method = e.keyName;

  function search_method(obj) {
    try {
      if (obj["keydown"] && obj["keydown"](method, e)) return;

      if (typeof obj[method] != "function" && obj.current)
        search_method(obj[obj.current]);
      else if (obj[method]) obj[method](e);
    } catch (e) {

    }
  }

  search_method(controles);
}

/**
 * ${1:Description placeholder}
 */
function move() {
  keydown({ keyName: "move" });
}

/**
 * Set the platform key code.
 * 
 * @param {object} platformKeyCodes Platform's key code 
 */
function setKeyBinding(platformKeyCodes) {
  Object.assign(KeyCode, platformKeyCodes);
  Object.freeze(KeyCode); // prevent form modify this object accidentally
}

export { move, keydown, animation_start, animation_end, setKeyBinding };
