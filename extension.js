import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import Widget from './widget.js';

let widget;

var thingValueChanged = null;
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

        [thingValueChanged, indexChanged, locationChanged] = [
            'thing-value',
            'index-in-status-bar',
            'location-in-status-bar',
        ].map(key => {
            if (key === 'thing-value') {
                return this._settings.connect(`changed::${key}`, () => {
                    widget._showIconIfTextEmpty(this._settings.get_string('thing-value'));
                });
            }
            return this._settings.connect(`changed::${key}`, () => {
                this._insertChildToPanel();
            });
        });

        let isRightBoxChosen = this._settings.get_int('location-in-status-bar') === 2;
        if (isRightBoxChosen) {
            this._actorAddedSignal = Main.panel._rightBox.connect('actor-added', () => {
                this._insertChildToPanel();
            });
        }

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
            if (this._actorAddedSignal)
                Main.panel._rightBox.disconnect(this._actorAddedSignal);

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
        this._settings.disconnect(thingValueChanged);
        this._settings.disconnect(indexChanged);
        this._settings.disconnect(locationChanged);



        this._settings = null;
    }
}
