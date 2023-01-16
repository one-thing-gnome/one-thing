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
  settings = ExtensionUtils.getSettings("org.gnome.shell.extensions.one-thing");

  [indexChanged, locationChanged] = [
    "index-in-status-bar",
    "location-in-status-bar",
  ].map((key) => {
    return settings.connect("changed::" + key, () => {
      insertChildToPanel();
    });
  });

  // Workaround to possionate the widget after all extensions are loaded
  Main.extensionManager.connect("extension-loaded", () => {
    insertChildToPanel();
  });

  insertChildToPanel();
}

function insertChildToPanel() {
  const index = settings.get_int("index-in-status-bar");
  const locationIndex = settings.get_int("location-in-status-bar");

  const location = LOCATION_BY_INDEX[locationIndex];

  destroyWidgetFromPanel();

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
  } catch (e) {}
}

function disable() {
  destroyWidgetFromPanel();

  // Disconnect
  settings.disconnect(indexChanged);
  settings.disconnect(locationChanged);

  settings = null;
}
