import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const BindFlags = Gio.SettingsBindFlags.DEFAULT;

export default class OneThingGnomeExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();
        const page = new Adw.PreferencesPage();

        // Settings
        const SettingsGroup = new Adw.PreferencesGroup({
            title: 'Settings',
            description: 'You can always access it in Extensions',
        });

        const switchRow = new Adw.SwitchRow({
            title: 'Show "Settings" in popup window?',
        });
        SettingsGroup.add(switchRow);

        // Index
        const IndexGroup = new Adw.PreferencesGroup({
            title: 'Index',
        });

        const indexRow = new Adw.SpinRow({
            title: 'Index in status bar',
            adjustment: new Gtk.Adjustment({
                lower: -1,
                upper: 5,
                value: 0,
                'page-increment': 1,
                'step-increment': 1,
            }),
        });
        IndexGroup.add(indexRow);

        // Location
        const LocationGroup = new Adw.PreferencesGroup({
            title: 'Location',
        });

        const locationRow = new Adw.SpinRow({
            title: 'Location in status bar',
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 2,
                value: 2,
                'page-increment': 1,
                'step-increment': 1,
            }),
        });
        LocationGroup.add(locationRow);

        window._settings.bind('show-settings-button-on-popup', switchRow, 'active', BindFlags);
        window._settings.bind('index-in-status-bar', indexRow, 'value', BindFlags);
        window._settings.bind('location-in-status-bar', locationRow, 'value', BindFlags);

        page.add(SettingsGroup);
        page.add(IndexGroup);
        page.add(LocationGroup);
        window.add(page);
    }
}
