const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const ExtensionUtils = imports.misc.extensionUtils;

function init() {}

function buildPrefsWidget() {
  const settings = ExtensionUtils.getSettings(
    "org.gnome.shell.extensions.one-thing"
  );

  let widget = new Gtk.ListBox({
    selection_mode: Gtk.SelectionMode.NONE,
    halign: Gtk.Align.CENTER,
    valign: Gtk.Align.START,
    hexpand: true,
    margin_start: 60,
    margin_end: 60,
    margin_top: 60,
    margin_bottom: 60,
  });

  if (typeof widget.append === "function") {
    // presumably, Gtx 4.0+
    widget.show_separators = true;
  } else {
    // this is happening in ubuntu 21.04
    // Gtx.Listbox.append, Gtx.Listbox.show_separators, and also Gtk.Box.append
    // are missing--they're not available in Gtk pre-4.0. Can't figure out how
    // to add items to ListBox without the append functions (tried using
    // Box.pack_end ListBox.insert unsucessfully), so substituting simple
    // Gtk.Grid instead. (we don't simply just use Grid exclusively because
    // ListBox is visually more appropriate)
    widget = new Gtk.Grid({
      margin_start: 18,
      margin_end: 18,
      margin_top: 30,
      margin_bottom: 18,
      column_spacing: 0,
      row_spacing: 20,
      visible: true,
    });
  }

  addLocationWidget(widget, 1, settings);
  addIndexWidget(widget, 2, settings);
  addShowSettingSwitchWidget(widget, 3, settings);

  return widget;
}

function addShowSettingSwitchWidget(parentWidget, rowNum, settings) {
  const leftWidget = new Gtk.Label({
    label:
      'Show "Settings" in popup window? *You can always access it in Extension Manager',
    halign: Gtk.Align.START,
    margin_end: 30,
    hexpand: true,
    visible: true,
  });

  const rightWidget = new Gtk.Switch({
    active: settings.get_boolean("show-settings-button-on-popup"),
    halign: Gtk.Align.END,
    visible: true,
  });

  settings.bind(
    "show-settings-button-on-popup",
    rightWidget,
    "active",
    Gio.SettingsBindFlags.DEFAULT
  );

  addWidgetsAsRow(parentWidget, leftWidget, rightWidget, rowNum);
}

function addIndexWidget(parentWidget, rowNum, settings) {
  const leftWidget = new Gtk.Label({
    label: "Index in status bar:",
    halign: Gtk.Align.START,
    margin_end: 30,
    hexpand: true,
    visible: true,
  });

  let rightWidget = new Gtk.SpinButton({
    adjustment: new Gtk.Adjustment({ lower: 0, upper: 12, step_increment: 1 }),
    visible: true,
    halign: Gtk.Align.END,
  });

  settings.bind(
    "index-in-status-bar",
    rightWidget,
    "value",
    Gio.SettingsBindFlags.DEFAULT
  );

  addWidgetsAsRow(parentWidget, leftWidget, rightWidget, rowNum);
}

function addLocationWidget(parentWidget, rowNum, settings) {
  const leftWidget = new Gtk.Label({
    label: "Location in status bar:",
    halign: Gtk.Align.START,
    margin_end: 30,
    hexpand: true,
    visible: true,
  });

  let options = [{ name: "Left" }, { name: "Center" }, { name: "Right" }];

  let listStore = new Gtk.ListStore();

  listStore.set_column_types([GObject.TYPE_STRING]);
  for (let i = 0; i < options.length; i++) {
    let option = options[i];
    const iter = listStore.append();
    listStore.set(iter, [0], [option.name]);
  }

  let rightWidget = new Gtk.ComboBox({
    model: listStore,
    visible: true,
    halign: Gtk.Align.END,
  });

  let rendererText = new Gtk.CellRendererText();
  rightWidget.pack_start(rendererText, false);
  rightWidget.add_attribute(rendererText, "text", 0);

  settings.bind(
    "location-in-status-bar",
    rightWidget,
    "active",
    Gio.SettingsBindFlags.DEFAULT
  );

  addWidgetsAsRow(parentWidget, leftWidget, rightWidget, rowNum);
}

function addWidgetsAsRow(parentWidget, leftWidget, rightWidget, rowNum) {
  if (parentWidget instanceof Gtk.ListBox) {
    const hbox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 10,
      margin_start: 10,
      margin_end: 10,
      margin_top: 16,
      margin_bottom: 16,
    });

    const row = new Gtk.ListBoxRow({
      child: hbox,
    });

    // In case of error appending items https://github.com/raujonas/executor/blob/641ef4f64e35388995873c0e2c6cf8d7148879d3/prefs.js#L51
    hbox.append(leftWidget);
    hbox.append(rightWidget);
    parentWidget.append(row);
  } else {
    parentWidget.attach(leftWidget, 0, rowNum, 1, 1);
    parentWidget.attach(rightWidget, 1, rowNum, 1, 1);
  }
}
