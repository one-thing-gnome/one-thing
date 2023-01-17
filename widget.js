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

    // container (box) for entry and icon elements
    this._initContainer();

    // events
    this._initEvents();
  }

  _initEntry() {
    this.panelText = new St.Label({
      text: this._settings.get_string("thing-value"),
      track_hover: true,
      can_focus: true,
      y_align: Clutter.ActorAlign.CENTER,
      style_class: "one-thing-panel-text",
    });

    EntryMenu.addContextMenu(this.panelText);

    this._settings.bind(
      "thing-value",
      this.panelText,
      "text",
      Gio.SettingsBindFlags.DEFAULT
    );
  }

  _initPopup() {
    this.inputText = new St.Entry({
      hint_text: "Write One Thing",
      text: this._settings.get_string("thing-value"),
      track_hover: true,
      can_focus: true,
      style_class: "one-thing-input",
    });

    EntryMenu.addContextMenu(this.inputText);

    const menuItem = new PopupMenu.PopupBaseMenuItem({
      reactive: false,
    });
    menuItem.add_actor(this.inputText);
    this.menu.addMenuItem(menuItem);

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

  _initContainer() {
    // container for entry and icon elements
    const calcBox = new St.BoxLayout();

    const path = Me.dir
      .get_child("assets")
      .get_child("one-thing-gnome.svg")
      .get_path();

    this.icon = new St.Icon({
      icon_name: "one-thing-gnome",
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
      "button-press-event",
      function () {
        if (this.menu.isOpen) {
          this.inputText.grab_key_focus();
        }
      }.bind(this)
    );

    this.inputText.clutter_text.connect(
      "activate",
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
    if (text === "") {
      this.icon.show();
    } else {
      this.icon.hide();
    }
  }
}

var Widget = GObject.registerClass(_Widget);
