import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension, InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Config from 'resource:///org/gnome/shell/misc/config.js';

const [major] = Config.PACKAGE_VERSION.split('.');
const GNOME_MAJOR_VERSION = Number.parseInt(major);

import Widget from './widget.js';

let widget;

var thingValueChanged = null;
var hotKey = null;
var indexChanged = null;
var locationChanged = null;
var LOCATION_BY_INDEX = {
    0: 'left',
    1: 'center',
    2: 'right',
};

export default class OneThingGnome extends Extension {
    enable() {
        this._injectionManager = new InjectionManager();
        this._settings = this.getSettings();
        this._dir = this.dir;

        // grab key focus after 100ms delay
        this._injectionManager.overrideMethod(PanelMenu.Button.prototype, '_onOpenStateChanged',
            () => {
                return () => {
                    if (widget.menu.isOpen) {
                        this._timeoutId = setTimeout(() => {
                            widget._oneThing();
                        }, 100);
                    }
                };
            });
        //

        [thingValueChanged, hotKey, indexChanged, locationChanged] = [
            'thing-value',
            'hot-key',
            'index-in-status-bar',
            'location-in-status-bar',
        ].map(key => {
            if (key === 'thing-value') {
                return this._settings.connect(`changed::${key}`, () => {
                    widget._showIconIfTextEmpty(this._settings.get_string('thing-value'));
                });
            } else if (key === 'hot-key') {
                return this._settings.connect(`changed::${key}`, () => {
                    this._addKeybinding();
                });
            }
            return this._settings.connect(`changed::${key}`, () => {
                this._insertChildToPanel();
            });
        });

        this._insertChildToPanel();

        this._addKeybinding();
    }

    _addKeybinding() {
        const shallTurnOnHotKey = this._settings.get_boolean('hot-key');
        if (!shallTurnOnHotKey) {
            Main.wm.removeKeybinding('activate-onething');
            return;
        }

        Main.wm.addKeybinding(
            'activate-onething',
            this._settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => widget.menu.open()
        );
    }

    _checkIfRightBoxIsSelected() {
        let isRightBoxChosen = this._settings.get_int('location-in-status-bar') === 2;
        if (isRightBoxChosen) {
            const childAddedName = GNOME_MAJOR_VERSION >= 46 ? 'child-added' : 'actor-added';
            this._actorAddedSignal = Main.panel._rightBox.connect(childAddedName
                , () => {
                this._insertChildToPanel();
            });
        }
    }

    _insertChildToPanel() {
        const index = this._settings.get_int('index-in-status-bar');
        const locationIndex = this._settings.get_int('location-in-status-bar');

        const location = LOCATION_BY_INDEX[locationIndex];

        this._destroyWidgetFromPanel();

        widget = new Widget(this._settings, this._dir);
        Main.panel.addToStatusArea('one-thing', widget, index, location);

        this._checkIfRightBoxIsSelected();
    }

    _destroyWidgetFromPanel() {
        try {
            if (this._actorAddedSignal)
                Main.panel._rightBox.disconnect(this._actorAddedSignal);

            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
                this._timeoutId = null;
            }

            if (widget) {
                widget.destroy();
                widget = null;
            }

            if (Main.panel.statusArea['one-thing'])
                Main.panel.statusArea['one-thing'].destroy();
        } catch (e) { }
    }

    disable() {
        this._injectionManager.clear();
        this._injectionManager = null;

        this._destroyWidgetFromPanel();

        // Disconnect
        this._settings.disconnect(thingValueChanged);
        this._settings.disconnect(hotKey);
        this._settings.disconnect(indexChanged);
        this._settings.disconnect(locationChanged);

        this._settings = null;

        Main.wm.removeKeybinding('activate-onething');
    }
}
