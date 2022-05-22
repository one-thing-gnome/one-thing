const {St, GObject, Clutter, Gio} = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const EntryMenu = Me.imports.entryMenu;

class _Calculator extends PanelMenu.Button {
  _init () {
    super._init(0, 'Calculator', false);

    this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.one-thing');

    // panel expression entry field
    this._initEntry();

    // popup; will have secondary expression entry field and help content
    this._initPopup();

    // panel icon
    // (do after settings bindings have been made)
    this._initIcon();

    // container (box) for entry and icon elements
    this._initContainer();

    // events
    this._initEvents();
  }

  _initEntry () { // panel expression entry field
    this._exprEntry = new St.Label({
      text: this._settings.get_string('thing-value'),
      track_hover: true,
      can_focus: true,
      y_align: Clutter.ActorAlign.CENTER,
      style_class: 'one-thing-expr-entry'
    });

    EntryMenu.addContextMenu(this._exprEntry);

    this._settings.bind(
      'allow-entry-on-panel',
      this._exprEntry,
      'visible',
      Gio.SettingsBindFlags.DEFAULT
    );
  }

_initPopup () { // popup will have secondary expression entry field and help content
    this._exprEntry2 = new St.Entry({
      hint_text: 'Write One Thing',
      track_hover: true,
      can_focus: true,
      style_class: this._exprEntry2StyleClass(),
    });

    EntryMenu.addContextMenu(this._exprEntry2);

    const menuItem = new PopupMenu.PopupBaseMenuItem({
      reactive: false,
    });
    menuItem.add_actor(this._exprEntry2);
    this.menu.addMenuItem(menuItem);

    // TODO: Add help if needed
    // this._addSubmenuHelp('General Help', this._generalHelpText)
  }

  _addSubmenuHelp(title, helpTextFn) {
    const label = new St.Label({
      text: helpTextFn(),
      style_class: 'one-thing-help-text'
    });

    const subMenuBaseItem = new PopupMenu.PopupBaseMenuItem({
      reactive: false
    });
    
    subMenuBaseItem.add_actor(label);
    const subMenuItem = new PopupMenu.PopupSubMenuMenuItem(title, true);
    subMenuItem.menu.addMenuItem(subMenuBaseItem);
    this.menu.addMenuItem(subMenuItem);

    this._settings.bind(
      'show-help-on-popup',
      subMenuItem,
      'visible',
      Gio.SettingsBindFlags.DEFAULT
    );
  }

  _initIcon () { // panel icon
    this._settings.connect('changed', this._settingsChanged.bind(this));
  }

  _initContainer () { // container for entry and icon elements
    const calcBox = new St.BoxLayout();
    calcBox.add(this._exprEntry);
    this.add_actor(calcBox);
  }

  _initEvents () { // events:
    this.connect('button-press-event', function () {
      if (this.menu.isOpen) {
        this._exprEntry2.grab_key_focus();
      }
    }.bind(this));

    this._exprEntry2.clutter_text.connect('button-release-event', this._onButtonReleaseEntry.bind(this));
    this._exprEntry2.clutter_text.connect('activate', this._onActivateEntry.bind(this));
  }

  _onButtonReleaseEntry (actor, event) {
    if (actor.get_cursor_position() !== -1 && actor.get_selection().length === 0) {
      actor.set_selection(0, actor.get_text().length); // doesn't work to do this on button-press-event or key_focus_in; don't know why
    }
  }

  _onActivateEntry (actor, event) {
    let result;
    try {
      const expr = actor.get_text();
      result = expr.toString();
    } catch (e) {
        result = 'Unexpected error';
    }
    this._exprEntry.set_text(result);
    this.menu.close();
  }

  _exprEntry2StyleClass () {
    return this._settings.get_boolean('show-help-on-popup')
      ? 'one-thing-expr-entry2-with-help' : 'one-thing-expr-entry2-no-help';
  }

  _settingsChanged () {
    this._exprEntry2.style_class = this._exprEntry2StyleClass();
  }

  _generalHelpText () {
    return '\
An example of an expression is 2+4*8, which means\n\
multiply 4 by 8 and add 2 to the result.\n\
\n\
Supported operators:\n\
    + for addition\n\
    - for subtraction and negation\n\
    * for multiplication\n\
    / for division\n\
    ^ or ** for exponentiation (right-associative)\n\
\n\
Use parentheses to override operator precedence; e.g.,\n\
(2+4)*8 means add 2 to 4 and multiply the result by 8.\n\
\n\
Numbers can have a 0b, 0o or 0x prefix, or can be\n\
specified in scientific E notation; e.g., 0b11011001,\n\
0o331, 0xd9 and 2.17e+2 all specify the number 217.';
  }
}

const Calculator = GObject.registerClass(_Calculator);
