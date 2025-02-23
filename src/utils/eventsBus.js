
/**
 * Event bus will register events under event name and will run them all when needed.
 */
export default class EventsBus {
  /**
 * Creates an instance of EventsBus.
 *
 * @constructor
 */
constructor () {
    this.Events = {};
  }

  /**
   * Get list of callbacks under an event.
   * 
   * @param {string} eventName Event name to get its callbacks list.
   * 
   * @returns {array | undefined} Callbacks of that eventName.
   */
  get (eventName) {
    return this.Events[eventName];
  }

  /**
   * Add events callbacks to eventName.
   * 
   * @param {string} eventName Event name to add events to.
   * @param {Function} eventCallback Callback function to run.
   */
  add (eventName, eventCallback) {
    if (this.Events[eventName]) {
      this.Events[eventName].push(eventCallback);
    } else {
      this.Events[eventName] = [eventCallback];
    }
  }

  /**
   * Run all events registerd to an eventName.
   * 
   * @param {string} eventName Event name to run.
   * @param  {...any} parameters parameters to send when emitting the events.
   */
  run (eventName, ...parameters) {
    if (this.Events[eventName]) {
      for (const event of this.Events[eventName]) {
        event(...parameters);
      }
    }
  }

  /**
   * Remove callback function from event.
   * 
   * @param {string} eventName Event name.
   * @param {Function} callbackToRemove Function to remove.
   */
  remove (eventName, callbackToRemove) {
    const eventsList = this.Events[eventName];

    if (!eventsList) return;

    eventsList.forEach((event, index) => {
      if (event === callbackToRemove) {
        eventsList.splice(index, 1);
      }
    });
  }
}