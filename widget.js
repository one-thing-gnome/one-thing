import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import {_addContextMenu} from './entryMenu.js';

const BindFlags = Gio.SettingsBindFlags.DEFAULT

var Widget = new GObject.registerClass(
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
                BindFlags
            );
        }

        _initPopup() {
            this.inputText = new St.Entry({
                hint_text: 'Write One Thing',
                text: this._settings.get_string('thing-value'),
                track_hover: true,
                can_focus: true,
                style_class: 'one-thing-input',
            });

            this._settings.bind(
                'thing-value',
                this.inputText,
                'text',
                BindFlags
            );

            _addContextMenu(this.inputText);

            const menuItem = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
            });
            menuItem.add_actor(this.inputText);
            this.menu.addMenuItem(menuItem);

            this._addSubmenuSettings();
        }

        _addSubmenuSettings() {
            let separatorItem = new PopupMenu.PopupSeparatorMenuItem();
            this.menu.addMenuItem(separatorItem);

            let settingsItem = new PopupMenu.PopupMenuItem('Settings');
            settingsItem.connect('activate', () => {
                this._e.openPreferences();
            });
            this.menu.addMenuItem(settingsItem);

            this._settings.bind('show-settings-button-on-popup', settingsItem, 'visible', BindFlags);
        }

        _initContainer() {
            // container for entry and icon elements
            const calcBox = new St.BoxLayout();

            const path = this._dir
                .get_child('assets')
                .get_child('one-thing-gnome.svg')
                .get_path();

            this.icon = new St.Icon({
                icon_name: 'one-thing-gnome',
                icon_size: 24,
                gicon: Gio.icon_new_for_string(path),
            });

            calcBox.add(this.icon);
            calcBox.add(this.panelText);

            const textValue = this.panelText.get_text();
            this._showIconIfTextEmpty(textValue);

            this.add_actor(calcBox);
        }

        _initEvents() {
            this.connect(
                'button-press-event',
                () => {
                    if (this.menu.isOpen)
                        this.inputText.grab_key_focus();
                }
            );

            this.inputText.clutter_text.connect(
                'activate',
                this._onActivateEntry.bind(this)
            );
        }

        _onActivateEntry(actor) {
            const textValue = actor.get_text();

            this._showIconIfTextEmpty(textValue);

            this.panelText.set_text(textValue);
            this.menu.close();
        }

        _showIconIfTextEmpty(text) {
            if (text === "")
                this.icon.show();
            else
                this.icon.hide();
        }
    }
);

export default Widget;
