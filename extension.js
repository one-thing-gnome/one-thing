const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const St = imports.gi.St;

const Me = ExtensionUtils.getCurrentExtension();
const Calculator = Me.imports.calculator.Calculator;

let gschema;
let calculator;
let layout;

var settings;

var lastIndex = null;
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

  gschema = Gio.SettingsSchemaSource.new_from_directory(
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

  calculator = new Calculator();

  this.indexChanged = this.settings.connect(
    "changed::index-in-status-bar",
    () => {
      log("One-Thing: Index Changed");
      this.insertChildToPanel();
    }
  );

  this.locationChanged = this.settings.connect(
    "changed::location-in-status-bar",
    () => {
      log("One-Thing: Location Changed");
      this.insertChildToPanel();
    }
  );

  layout = new St.BoxLayout({
    style_class: "panel-button",
    reactive: true,
  });
  layout.add_child(calculator.get_parent());

  Main.extensionManager.connect("extension-loaded", () => {
    this.insertChildToPanel();
  });

  this.insertChildToPanel();
  // log("methods " + JSON.stringify(Object.keys(extension-loaded)));
}

function insertChildToPanel() {
  const index = this.settings.get_int("index-in-status-bar");
  const locationIndex = this.settings.get_int("location-in-status-bar");

  const location = LOCATION_BY_INDEX[locationIndex];

  log(
    "One-Thing: Settings changed: " +
      JSON.stringify({
        index: index,
        location: LOCATION_BY_INDEX[locationIndex],
      })
  );

  log(layout.get_parent());

  if (layout.get_parent()) {
    layout.get_parent().remove_child(layout);
  }

  Main.panel["_" + location + "Box"].insert_child_at_index(layout, index);
}

function disable() {
  if (calculator) {
    calculator.destroy();
    calculator = null;
  }

  // Disconnect
  this.settings.disconnect(this.indexChanged);
  this.settings.disconnect(this.locationChanged);

  settings = null;

  log("One-Thing stopped");
}
