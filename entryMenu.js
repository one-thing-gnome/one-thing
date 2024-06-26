// this is a customized version of the GNOME shell source file shellEntry.js:
// copy copies all if there is no selection; this is useful behavior for the
// calculator but also works around odd behavior in St.Entry where it clears the
// selection on button-press-event, thus indicating nothing to copy. (normal
// behavior is to clear the selection on button down event.) also, password
// stuff and CapsLockWarning were removed

import Clutter from 'gi://Clutter';
import St from 'gi://St';
import Shell from 'gi://Shell';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Params from 'resource:///org/gnome/shell/misc/params.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {BoxPointer} from 'resource:///org/gnome/shell/ui/boxpointer.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class EntryMenu extends PopupMenu.PopupMenu {
    constructor(entry) {
        super(entry, 0, St.Side.TOP);

        this._entry = entry;
        this._clipboard = St.Clipboard.get_default();
        this._extension = Extension.lookupByURL(import.meta.url);

        // Populate menu
        let item;
        item = new PopupMenu.PopupMenuItem(_('Copy'));
        item.connect('activate', this._onCopyActivated.bind(this));
        this.addMenuItem(item);
        this._copyItem = item;

        item = new PopupMenu.PopupMenuItem(_('Paste'));
        item.connect('activate', this._onPasteActivated.bind(this));
        this.addMenuItem(item);
        this._pasteItem = item;

        item = new PopupMenu.PopupMenuItem(_('Preferences'));
        item.connect('activate', () => {
            this._extension.openPreferences();
            entry.menu.close();
        });
        this.addMenuItem(item);

        if (typeof Main.uiGroup.add_child === 'function') {
            Main.uiGroup.add_child(this.actor);
        } else {
            Main.uiGroup.add_actor(this.actor);
        }

        this.actor.hide();
    }

    open(animate) {
        this._updatePasteItem();
        this._updateCopyItem();

        super.open(animate);
        this._entry.add_style_pseudo_class('focus');

        let direction = St.DirectionType.TAB_FORWARD;
        if (!this.actor.navigate_focus(null, direction, false))
            this.actor.grab_key_focus();
    }

    _updateCopyItem() {
        this._copyItem.setSensitive(
            this._entry.clutter_text.get_text().length !== 0
        );
    }

    _updatePasteItem() {
        this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (clipboard, text) => {
            this._pasteItem.setSensitive(text && text !== '');
        });
    }

    _onCopyActivated() {
        let selection = this._entry.clutter_text.get_selection();
        if (selection.length === 0)
            selection = this._entry.clutter_text.get_text();
        this._clipboard.set_text(St.ClipboardType.CLIPBOARD, selection);
    }

    _onPasteActivated() {
        this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (clipboard, text) => {
            if (!text)
                return;
            this._entry.clutter_text.delete_selection();
            let pos = this._entry.clutter_text.get_cursor_position();
            this._entry.clutter_text.insert_text(text, pos);
        });
    }
}

/**
 *
 * @param {object} entry St.Entry
 * @param {int} stageX co-ordinates
 */
function _setMenuAlignment(entry, stageX) {
    let [success, entryX] = entry.transform_stage_point(stageX, 0);
    if (success)
        entry.menu.setSourceAlignment(entryX / entry.width);
}

/**
 *
 * @param {object} actor actor
 * @param {object} event event
 * @param {object} entry St.Entry
 */
function _onButtonPressEvent(actor, event, entry) {
    if (entry.menu.isOpen) {
        entry.menu.close(BoxPointer.PopupAnimation.FULL);
        return Clutter.EVENT_STOP;
    } else if (event.get_button() === 3) {
        let [stageX] = event.get_coords();
        _setMenuAlignment(entry, stageX);
        entry.menu.open(BoxPointer.PopupAnimation.FULL);
        return Clutter.EVENT_STOP;
    }
    return Clutter.EVENT_PROPAGATE;
}

/**
 *
 * @param {object} actor actor
 * @param {object} entry St.Entry
 */
function _onPopup(actor, entry) {
    let cursorPosition = entry.clutter_text.get_cursor_position();
    let [success, textX, textY_, lineHeight_] =
        entry.clutter_text.position_to_coords(cursorPosition);
    if (success)
        entry.menu.setSourceAlignment(textX / entry.width);
    entry.menu.open(BoxPointer.PopupAnimation.FULL);
}

/**
 *
 * @param {object} entry entry
 * @param {object} params params
 */
export function _addContextMenu(entry, params) {
    if (entry.menu)
        return;
    params = Params.parse(params, {actionMode: Shell.ActionMode.POPUP});

    entry.menu = new EntryMenu(entry);
    entry._menuManager = new PopupMenu.PopupMenuManager(entry, {
        actionMode: params.actionMode,
    });
    entry._menuManager.addMenu(entry.menu);

    // Add an event handler to both the entry and its clutter_text; the former
    // so padding is included in the clickable area, the latter because the
    // event processing of ClutterText prevents event-bubbling.
    entry.clutter_text.connect('button-press-event', (actor, event) => {
        _onButtonPressEvent(actor, event, entry);
    });
    entry.connect('button-press-event', (actor, event) => {
        _onButtonPressEvent(actor, event, entry);
    });

    entry.connect('popup-menu', actor => _onPopup(actor, entry));

    entry.connect('destroy', () => {
        entry.menu.destroy();
        entry.menu = null;
        entry._menuManager = null;
    });
}
