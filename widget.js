import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import {_addContextMenu} from './entryMenu.js';

const Widget = new GObject.registerClass(
    class Widget extends PanelMenu.Button {
        _init(settings, dir) {
            super._init(0, 'AppWidget', false);
            this._initialize(settings, dir);
        }

        _initialize(s, dir) {
            if (this.initialized)
                return;

            this.initialized = true;
            this._settings = s;
            this._dir = dir;
            this._e = Extension.lookupByURL(import.meta.url);

            this._initEntry();
            this._initPopup();
            this._initContainer();
            this._initEvents();
        }

        _initEntry() {
            this.panelText = new St.Label({
                text: this._settings.get_string('thing-value'),
                track_hover: true,
                can_focus: true,
                y_align: Clutter.ActorAlign.CENTER,
                style_class: 'one-thing-panel-text',
            });

            _addContextMenu(this.panelText);

            this._settings.bind(
                'thing-value',
                this.panelText,
                'text',
                Gio.SettingsBindFlags.DEFAULT
            );
        }

        _openPreferences() {
            this._e.openPreferences();
            this.menu.close();
        }

        _initPopup() {
            this.inputText = new St.Entry({
                hint_text: 'Write One Thing',
                text: this._settings.get_string('thing-value'),
                track_hover: true,
                can_focus: true,
                style_class: 'one-thing-input',
                secondary_icon: new St.Icon({
                    icon_name: 'preferences-system-symbolic',
                    icon_size: 16,
                }),
            });

            this.inputText.connect('secondary-icon-clicked', () => {
                this._openPreferences();
            });

            this._settings.bind(
                'show-settings-button-on-popup',
                this.inputText.secondary_icon,
                'visible',
                Gio.SettingsBindFlags.DEFAULT
            );

            _addContextMenu(this.inputText);

            const menuItem = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
            });

            if (typeof menuItem.add_child === 'function') {
                menuItem.add_child(this.inputText);
            } else {
                menuItem.add_actor(this.inputText);
            }

            this.menu.addMenuItem(menuItem);
        }

        _initContainer() {
            const oneThingContainer = new St.BoxLayout();

            const path = this._dir
                .get_child('assets')
                .get_child('one-thing-gnome.svg')
                .get_path();

            this.icon = new St.Icon({
                icon_name: 'one-thing-gnome',
                icon_size: 24,
                gicon: Gio.icon_new_for_string(path),
            });

            if (typeof oneThingContainer.add_child === 'function') {
                oneThingContainer.add_child(this.icon);
                oneThingContainer.add_child(this.panelText);
            } else {
                oneThingContainer.add(this.icon);
                oneThingContainer.add(this.panelText);
            }


            const textValue = this.panelText.get_text();
            this._showIconIfTextEmpty(textValue);

            if (typeof this.add_child === 'function') {
                this.add_child(oneThingContainer);
            } else {
                this.add_actor(oneThingContainer);
            }
        }

        _initEvents() {
            this.connect(
                'button-press-event',
                () => this._oneThing()
            );

            this.inputText.clutter_text.connect(
                'activate',
                this._onActivateEntry.bind(this)
            );
        }

        _oneThing() {
            let text = this._settings.get_string('thing-value');
            if (this.menu.isOpen) {
                this.inputText.grab_key_focus();
                this.inputText.set_text(text);
                if (text)
                    this.inputText.clutter_text.set_selection(-1, 0);
            }
        }

        _onActivateEntry(actor) {
            const textValue = actor.get_text();
            this._showIconIfTextEmpty(textValue);
            this.panelText.set_text(textValue);
            this._settings.set_string('thing-value', textValue);
            this.menu.close();
        }

        _showIconIfTextEmpty(text) {
            if (text === '')
                this.icon.show();
            else
                this.icon.hide();
        }
    }
);

export default Widget;
