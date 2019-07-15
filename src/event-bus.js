'use-strict';

export default class DropdownEventBus {
    constructor() {
        this.bus = window;
    }

    on(evt, callback) {
        this.bus.addEventListener(evt, callback);
    }

    off(evt, callback) {
        this.bus.removeEventListener(evt, callback);
    }

    emit(evt, detail = {}) {
        /* eslint-disable-next-line */
        this.bus.dispatchEvent(new CustomEvent(evt, { detail }));
    }
}
