'use-strict';

import uniqueid from 'uniqid';
import Popper from 'popper.js';
import DropdownEventBus from './event-bus';

const _EVENT_BUS = new DropdownEventBus();

const _POPPER_CONFIG = {
    placement: 'bottom',
    modifiers: {
        computeStyle: {
            gpuAcceleration: false
        },
        flip: {
            enabled: false
        },
        preventOverflow: {
            enabled: true,
            escapeWithReference: true
        }
    }
};

const _DROPDOWN_ROLE = 'listbox';
const _DROPDOWN_CHILD_ROLE = 'menuitem';
const _ITEM_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]';
const _DOWN_ARROW = 40;
const _UP_ARROW = 38;

// ES6 Symbols to hide private Class functions from public scope
const _openMenu = Symbol('openMenu');
const _closeMenu = Symbol('closeMenu');
const _toggleAriaExpanded = Symbol('toggleAriaExpanded');
const _checkRoles = Symbol('checkRoles');
const _focusInit = Symbol('focusInit');
const _focusCtrl = Symbol('focusCtrl');
const _focusCtrlHandler = Symbol('focusCtrlHandler');
const _nextFocusable = Symbol('nextFocusable');
const _closeOnEvent = Symbol('closeOnEvent');
const _closeOnEventHandler = Symbol('closeOnEventHandler');
const _createPopper = Symbol('createPopper');
const _removePopper = Symbol('removePopper');

export default class Dropdown {
    constructor({ el, target, toggleClass = 'show' }) {
        const _this = this;

        this.uniqueId = uniqueid();
        this.el = el;
        this.target = target;
        this.focusable = target.querySelectorAll(_ITEM_SELECTOR);
        this.toggleClass = toggleClass;

        this.popper = null;

        this.open = false;
        this.initialized = false;

        this.toggleHandler = () => this.toggle();

        this[_closeOnEventHandler] = (evt) => this[_closeOnEvent](evt);
        this[_focusCtrlHandler] = function(evt) {
            _this[_focusCtrl](evt, this);
        };
    }

    /* START: Public */

    init() {
        this.el.addEventListener('click', this.toggleHandler);
        this.el.setAttribute('aria-haspopup', true);
        this[_toggleAriaExpanded]();
        this[_checkRoles]();
        this.initialized = true;
    }

    // Toggle dropdown visibility
    toggle() {
        this.target.classList.toggle(this.toggleClass);
        this.open = !this.open;
        this[_toggleAriaExpanded]();
        if(this.open) this[_openMenu]();
        else this[_closeMenu]();
    }

    // Destroy VanillaJS dropdown instance
    destroy() {
        this.el.removeEventListener('click', this.toggleHandler);
    }

    /* END: Public */

    /* START: Private */

    // Open/Close controls
    [_openMenu]() {
        this[_focusInit]();
        this[_createPopper]();
        _EVENT_BUS.emit('vjs-dropdown:open', { id: this.uniqueId });
        _EVENT_BUS.on('vjs-dropdown:open', this[_closeOnEventHandler]);
    }

    [_closeMenu]() {
        this[_removePopper]();
        _EVENT_BUS.off('vjs-dropdown:open', this[_closeOnEventHandler]);
    }

    // Toggle Aria controls
    [_toggleAriaExpanded]() {
        this.el.setAttribute('aria-expanded', this.open);
    }

    // Check role attribute on dropdown & children for accessibilty
    [_checkRoles]() {
        const children = this.target.children;
        this.target.setAttribute('role', _DROPDOWN_ROLE);
        Array.prototype.filter.call(children, child => child.setAttribute('role', _DROPDOWN_CHILD_ROLE));
    }

    // Focus on first focusable item and initialize focus controls
    [_focusInit]() {
        this.focusable[0].focus();
        Array.prototype.forEach.call(this.focusable, item => {
            item.addEventListener('keydown', this[_focusCtrlHandler]);
        });
    }

    // Control focus in menu via arrow keys
    [_focusCtrl](evt, el) {
        if(evt.keyCode === _DOWN_ARROW || evt.keyCode === _UP_ARROW) {
            evt.preventDefault();
            const next = this[_nextFocusable](el, evt.keyCode);
            if(next) {
                next.focus();
            }
        }
    }

    // Select next focusable element
    [_nextFocusable](el, keyCode) {
        return keyCode === _DOWN_ARROW ? el.nextElementSibling : el.previousElementSibling;
    }

    // Close when another Vanilla JS dropdown is opened
    [_closeOnEvent](evt) {
        if(evt.detail.id !== this.uniqueId) {
            this.toggle();
        }
    }

    // Popper controls
    [_createPopper]() {
        if(typeof Popper === 'undefined') {
            /* eslint-disable-next-line */
            console.log('vjs-dropdown: Popper.js not found. Falling back to CSS positioning.');
        } else {
            this[_removePopper]();
            this.popper = new Popper(this.el, this.target, { _POPPER_CONFIG });
        }
    }

    [_removePopper]() {
        if(this.popper) this.popper.destroy();
        this.popper = null;
    }

    /* END: Private */
}
