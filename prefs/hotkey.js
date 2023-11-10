// credit https://github.com/oae/gnome-shell-pano/blob/master/src/prefs/general/shortcutRow.ts

import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import GObject from 'gi://GObject';

const isValidAccel = (mask, keyval) => {
    return Gtk.accelerator_valid(keyval, mask) || (keyval === Gdk.KEY_Tab && mask !== 0);
};

const isValidBinding = (mask, keycode, keyval) => {
    return !(mask === 0 ||
        (mask === Gdk.ModifierType.SHIFT_MASK &&
            keycode !== 0 &&
            ((keyval >= Gdk.KEY_a && keyval <= Gdk.KEY_z) ||
                (keyval >= Gdk.KEY_A && keyval <= Gdk.KEY_Z) ||
                (keyval >= Gdk.KEY_0 && keyval <= Gdk.KEY_9) ||
                (keyval >= Gdk.KEY_kana_fullstop && keyval <= Gdk.KEY_semivoicedsound) ||
                (keyval >= Gdk.KEY_Arabic_comma && keyval <= Gdk.KEY_Arabic_sukun) ||
                (keyval >= Gdk.KEY_Serbian_dje && keyval <= Gdk.KEY_Cyrillic_HARDSIGN) ||
                (keyval >= Gdk.KEY_Greek_ALPHAaccent && keyval <= Gdk.KEY_Greek_omega) ||
                (keyval >= Gdk.KEY_hebrew_doublelowline && keyval <= Gdk.KEY_hebrew_taf) ||
                (keyval >= Gdk.KEY_Thai_kokai && keyval <= Gdk.KEY_Thai_lekkao) ||
                (keyval >= Gdk.KEY_Hangul_Kiyeog && keyval <= Gdk.KEY_Hangul_J_YeorinHieuh) ||
                (keyval === Gdk.KEY_space && mask === 0) ||
                keyvalIsForbidden(keyval))));
};

const keyvalIsForbidden = keyval => {
    return [
        Gdk.KEY_Home,
        Gdk.KEY_Left,
        Gdk.KEY_Up,
        Gdk.KEY_Right,
        Gdk.KEY_Down,
        Gdk.KEY_Page_Up,
        Gdk.KEY_Page_Down,
        Gdk.KEY_End,
        Gdk.KEY_Tab,
        Gdk.KEY_KP_Enter,
        Gdk.KEY_Return,
        Gdk.KEY_Mode_switch,
    ].includes(keyval);
};

const getAcceleratorName = (keyval, keycode, mask, key) => {
    const globalShortcut = Gtk.accelerator_name_with_keycode(null, keyval, keycode, mask);
    if (globalShortcut === null) {
        console.error(`Couldn't get keycode for the value '${key}'`);
        return null;
    }
    return globalShortcut;
};

const ShortcutRow = new GObject.registerClass(
    class ShortcutRow extends Adw.ActionRow {
        constructor(settings, gettext) {
            const _ = gettext;

            super({
                title: _('Global Shortcut'),
            });

            this._settings = settings;

            const shortcutLabel = new Gtk.ShortcutLabel({
                disabled_text: _('Select a shortcut'),
                accelerator: this._settings.get_strv('activate-onething')[0],
                valign: Gtk.Align.CENTER,
                halign: Gtk.Align.CENTER,
            });
            this._settings.connect('changed::activate-onething', () => {
                shortcutLabel.set_accelerator(this._settings.get_strv('activate-onething')[0]);
            });
            this.connect('activated', () => {
                const ctl = new Gtk.EventControllerKey();
                const content = new Adw.StatusPage({
                    title: _('New shortcut'),
                    icon_name: 'preferences-desktop-keyboard-shortcuts-symbolic',
                });
                const editor = new Adw.Window({
                    modal: true,
                    transient_for: this.get_root(),
                    hide_on_close: true,
                    width_request: 320,
                    height_request: 240,
                    resizable: false,
                    content,
                });
                editor.add_controller(ctl);
                ctl.connect('key-pressed', (_widget, keyval, keycode, state) => {
                    let mask = state & Gtk.accelerator_get_default_mod_mask();
                    mask &= ~Gdk.ModifierType.LOCK_MASK;
                    if (!mask && keyval === Gdk.KEY_Escape) {
                        editor.close();
                        return Gdk.EVENT_STOP;
                    }
                    if (!isValidBinding(mask, keycode, keyval) || !isValidAccel(mask, keyval))
                        return Gdk.EVENT_STOP;

                    const globalShortcut = getAcceleratorName(keyval, keycode, mask, 'activate-onething');
                    if (globalShortcut === null)
                        return Gdk.EVENT_STOP;

                    this._settings.set_strv('activate-onething', [globalShortcut]);
                    editor.destroy();
                    return Gdk.EVENT_STOP;
                });
                editor.present();
            });
            this.add_suffix(shortcutLabel);
            this.set_activatable_widget(shortcutLabel);
        }
    }
);

export default ShortcutRow;
