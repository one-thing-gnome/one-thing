import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import Widget from './widget.js';

let widget;

var indexChanged = null;
var locationChanged = null;
var LOCATION_BY_INDEX = {
    0: 'left',
    1: 'center',
    2: 'right',
};

export default class OneThingGnome extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._dir = this.dir;

        [indexChanged, locationChanged] = [
            'index-in-status-bar',
            'location-in-status-bar',
        ].map(key => {
            return this._settings.connect(`changed::${key}`, () => {
                this._insertChildToPanel();
            });
        });

        Main.extensionManager.connect('extension-loaded', () => {
            this._insertChildToPanel();
        });

        this._insertChildToPanel();
    }

    _insertChildToPanel() {
        const index = this._settings.get_int('index-in-status-bar');
        const locationIndex = this._settings.get_int('location-in-status-bar');

        const location = LOCATION_BY_INDEX[locationIndex];

        this._destroyWidgetFromPanel();

        widget = new Widget(this._settings, this._dir);
        Main.panel.addToStatusArea('one-thing', widget, index, location);
    }

    _destroyWidgetFromPanel() {
        try {
            if (widget) {
                widget.destroy();
                widget = null;
            }

            if (Main.panel.statusArea['one-thing'])
                Main.panel.statusArea['one-thing'].destroy();
        } catch (e) { }
    }

    disable() {
        this._destroyWidgetFromPanel();

        // Disconnect
        this._settings.disconnect(indexChanged);
        this._settings.disconnect(locationChanged);

        this._settings = null;
    }
}
