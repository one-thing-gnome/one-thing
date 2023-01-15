const { St, GObject, Clutter, Gio } = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const EntryMenu = Me.imports.entryMenu;

class _Widget extends PanelMenu.Button {
  constructor() {
    super(0, "AppWidget", false);

    this._initialize();
  }

  _init() {
    super._init(0, "AppWidget", false);

    this._initialize();
  }

  _initialize() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    this._settings = ExtensionUtils.getSettings(
      "org.gnome.shell.extensions.one-thing"
    );

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

  _initEntry() {
    // panel expression entry field
    this.textInput = new St.Label({
      text: this._settings.get_string("thing-value"),
      track_hover: true,
      can_focus: true,
      y_align: Clutter.ActorAlign.CENTER,
      style_class: "one-thing-expr-entry",
    });

    EntryMenu.addContextMenu(this.textInput);

    this._settings.bind(
      "thing-value",
      this.textInput,
      "text",
      Gio.SettingsBindFlags.DEFAULT
    );
  }

  _initPopup() {
    // popup will have secondary expression entry field and help content
    this._exprEntry2 = new St.Entry({
      hint_text: "Write One Thing",
      text: this._settings.get_string("thing-value"),
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

    // this._addSubmenuHelp("General Help", this._generalHelpText);
    this._addSubmenuSettings();
  }

  _addSubmenuSettings() {
    const settingsItem = new PopupMenu.PopupMenuItem("Settings");
    settingsItem.connect("activate", () => {
      ExtensionUtils.openPrefs();
    });

    const separatorItem = new PopupMenu.PopupSeparatorMenuItem();

    this.menu.addMenuItem(separatorItem);
    this.menu.addMenuItem(settingsItem);

    this._settings.bind(
      "show-settings-button-on-popup",
      settingsItem,
      "visible",
      Gio.SettingsBindFlags.DEFAULT
    );

    this._settings.bind(
      "show-settings-button-on-popup",
      separatorItem,
      "visible",
      Gio.SettingsBindFlags.DEFAULT
    );
  }

  _initIcon() {
    // panel icon
    this._settings.connect("changed", this._settingsChanged.bind(this));
  }

  _initContainer() {
    // container for entry and icon elements
    const calcBox = new St.BoxLayout();
    calcBox.add(this.textInput);
    this.add_actor(calcBox);
  }

  _initEvents() {
    // events:
    this.connect(
      "button-press-event",
      function () {
        if (this.menu.isOpen) {
          this._exprEntry2.grab_key_focus();
        }
      }.bind(this)
    );

    this._exprEntry2.clutter_text.connect(
      "button-release-event",
      this._onButtonReleaseEntry.bind(this)
    );
    this._exprEntry2.clutter_text.connect(
      "activate",
      this._onActivateEntry.bind(this)
    );
  }

  _onButtonReleaseEntry(actor) {
    if (
      actor.get_cursor_position() !== -1 &&
      actor.get_selection().length === 0
    ) {
      actor.set_selection(0, actor.get_text().length); // doesn't work to do this on button-press-event or key_focus_in; don't know why
    }
  }

  _onActivateEntry(actor) {
    let result;
    try {
      const expr = actor.get_text();
      result = expr.toString();
    } catch (e) {
      result = "Unexpected error";
    }
    this.textInput.set_text(result);
    this.menu.close();
  }

  _exprEntry2StyleClass() {
    return this._settings.get_boolean("show-settings-button-on-popup")
      ? "one-thing-expr-entry2-with-help"
      : "one-thing-expr-entry2-no-help";
  }

  _settingsChanged() {
    this._exprEntry2.style_class = this._exprEntry2StyleClass();
  }
}

var Widget = GObject.registerClass(_Widget);
