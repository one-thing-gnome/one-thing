import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences, gettext} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import ShortcutRow from './prefs/hotkey.js';

const BindFlags = Gio.SettingsBindFlags.DEFAULT;

export default class OneThingGnomeExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();
        window._gettext = gettext;

        const page = new Adw.PreferencesPage();

        const customTextGroup = new Adw.PreferencesGroup();

        const entryRow = new Adw.EntryRow({
            title: 'Enter your one thing here',
            'enable-emoji-completion': true,
            'activates-default': true,
        });
        entryRow.set_text(window._settings.get_string('thing-value'));
        entryRow.connect('entry-activated', entry => {
            window._settings.set_string('thing-value', entry.get_text());
        });
        customTextGroup.add(entryRow);

        const SettingsGroup = new Adw.PreferencesGroup({
            title: 'Preferences',
        });

        const switchRow = new Adw.SwitchRow({
            title: 'Show Preferences Button Next to Entry',
            subtitle: 'You can always access it in Extensions',
        });
        SettingsGroup.add(switchRow);

        const HotKeyGroup = new Adw.PreferencesGroup({
            title: 'Hot Key',
        });

        const hotKeyRow = new Adw.SwitchRow({
            title: 'Allow HotKey (Super+W by default)',
        });
        HotKeyGroup.add(hotKeyRow);
        HotKeyGroup.add(new ShortcutRow(window._settings, window._gettext));

        const LocationGroup = new Adw.PreferencesGroup({
            title: 'Location',
        });

        const indexRow = new Adw.SpinRow({
            title: 'Index in Panel',
            adjustment: new Gtk.Adjustment({
                lower: -1,
                upper: 5,
                value: 0,
                'page-increment': 1,
                'step-increment': 1,
            }),
        });
        LocationGroup.add(indexRow);

        const buttonBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            valign: Gtk.Align.CENTER,
        });
        buttonBox.add_css_class('linked');

        const leftButton = new Gtk.ToggleButton({
            label: 'Left',
        });
        const centerButton = new Gtk.ToggleButton({
            label: 'Center',
            group: leftButton,
        });
        const rightButton = new Gtk.ToggleButton({
            label: 'Right',
            group: leftButton,
        });
        buttonBox.append(leftButton);
        buttonBox.append(centerButton);
        buttonBox.append(rightButton);

        const locationRow = new Adw.ActionRow({
            title: 'Location in Panel',
        });
        locationRow.add_suffix(buttonBox);
        LocationGroup.add(locationRow);

        window._settings.bind('show-settings-button-on-popup', switchRow, 'active', BindFlags);
        window._settings.bind('hot-key', hotKeyRow, 'active', BindFlags);
        window._settings.bind('index-in-status-bar', indexRow, 'value', BindFlags);

        switch (window._settings.get_int('location-in-status-bar')) {
        case 0:
            leftButton.set_active(true);
            break;
        case 1:
            centerButton.set_active(true);
            break;
        case 2:
            rightButton.set_active(true);
            break;
        }

        const locationChanged = () => {
            if (leftButton.get_active() === true)
                window._settings.set_int('location-in-status-bar', 0);
            else if (centerButton.get_active() === true)
                window._settings.set_int('location-in-status-bar', 1);
            else if (rightButton.get_active() === true)
                window._settings.set_int('location-in-status-bar', 2);
        };

        leftButton.connect('notify::active', locationChanged);
        centerButton.connect('notify::active', locationChanged);
        rightButton.connect('notify::active', locationChanged);

        page.add(customTextGroup);
        page.add(SettingsGroup);
        page.add(HotKeyGroup);
        page.add(LocationGroup);
        window.add(page);
    }
}
