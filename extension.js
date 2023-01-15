const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const St = imports.gi.St;
const Me = ExtensionUtils.getCurrentExtension();
const Widget = Me.imports.widget.Widget;

let widget;
let layout;

var settings;
var indexChanged = null;
var locationChanged = null;
var LOCATION_BY_INDEX = {
  0: "left",
  1: "center",
  2: "right",
};

function init() {}

function enable() {
  log("One-Thing enabled");

  const gschema = Gio.SettingsSchemaSource.new_from_directory(
    Me.dir.get_child("schemas").get_path(),
    Gio.SettingsSchemaSource.get_default(),
    false
  );

  settings = new Gio.Settings({
    settings_schema: gschema.lookup(
      "org.gnome.shell.extensions.one-thing",
      true
    ),
  });

  [indexChanged, locationChanged] = [
    "index-in-status-bar",
    "location-in-status-bar",
  ].map((key) => {
    return this.settings.connect("changed::" + key, () => {
      log("Settings changed: " + key);
      this.insertChildToPanel();
    });
  });

  // Workaround to possionate the widget after all extensions are loaded
  Main.extensionManager.connect("extension-loaded", () => {
    this.insertChildToPanel();
  });

  this.insertChildToPanel();
}

function insertChildToPanel() {
  const index = this.settings.get_int("index-in-status-bar");
  const locationIndex = this.settings.get_int("location-in-status-bar");

  const location = LOCATION_BY_INDEX[locationIndex];

  this.destroyWidgetFromPanel();

  widget = new Widget();
  Main.panel.addToStatusArea("one-thing", widget, index, location);
}

function destroyWidgetFromPanel() {
  try {
    if (widget) {
      widget.destroy();
      widget = null;
    }

    if (Main.panel.statusArea["one-thing"]) {
      Main.panel.statusArea["one-thing"].destroy();
    }
  } catch (e) {
    log("One-Thing: Error destroying widget from the panel " + e);
  }
}

function disable() {
  this.destroyWidgetFromPanel();

  log("SINGALS:");
  log(this.indexChanged);
  log(this.locationChanged);
  // Disconnect
  this.settings.disconnect(this.indexChanged);
  this.settings.disconnect(this.locationChanged);

  settings = null;

  log("One-Thing stopped");
}
