'use-strict';

import Dropdown from './dropdown';
import DropdownEventBus from './event-bus';

const _EVENT_BUS = new DropdownEventBus();

const _SELECTOR = 'vjs-dropdown';

// ES6 Symbols to hide private Class functions from public scope
const _externalClick = Symbol('externalClick');
const _externalClickHandler = Symbol('externalClickHandler');

export default class VJSDropdown {
    constructor() {
        this.elements = null;
        this.store = [];
        this.initialized = false;

        this[_externalClickHandler] = (evt) => this[_externalClick](evt);
    }

    /* START: Public */

    init() {
        // Select all _SELECTOR elements
        this.elements = document.querySelectorAll(`[${_SELECTOR}]`);
        // If this hasn't been initialized...
        if(!this.initialized) {
            // Loop through plugin elements and create and initialize a dropdown instance
            Array.prototype.forEach.call(this.elements, el => {
                const target = document.getElementById(el.getAttribute(_SELECTOR));
                if(target && target.nodeType) {
                    const dropdown = new Dropdown({ el, target });
                    dropdown.init();
                    this.store.push(dropdown);
                }
            });
            // Add event listener to window to close all dropdowns on click outside of dropdown
            window.addEventListener('click', this[_externalClickHandler]);
            this.initialized = true;
        }
    }

    destroy() {
        this.store.forEach(dropdown => dropdown.destroy());
        this.store = [];
        window.removeEventListener('click', this[_externalClickHandler]);
        _EVENT_BUS.emit('vjs-dropdown:open', { id: '' });
        this.initialized = false;
    }

    /* END: Public */

    /* START: Private */

    // Check if window click is a dropdown item
    [_externalClick](evt) {
        const src = evt.srcElement;
        let isDropdown = false;
        let i = 0;
        do {
            if(this.elements[i]) {
                const target = document.getElementById(this.elements[i].getAttribute(_SELECTOR));
                if(target) {
                    if(this.elements[i] === src || target === src) {
                        isDropdown = true;
                    }
                }
            }
            i++;
        } while (!isDropdown && i < this.elements.length);
        if(!isDropdown) {
            _EVENT_BUS.emit('vjs-dropdown:open', { id: '' });
        }
    }

    /* END: Private */
}
