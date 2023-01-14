const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
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

  _makeToggleRow(
    settings,
    "allow-entry-on-panel",
    "Enable entry of expressions directly on the panel",
    0,
    widget
  );

  _makeToggleRow(
    settings,
    "show-settings-button-on-popup",
    'Show "Settings" on the popup',
    1,
    widget
  );

  return widget;
}

function _makeToggleRow(settings, settingId, settingLabel, rowNum, widget) {
  const label = new Gtk.Label({
    label: settingLabel,
    halign: Gtk.Align.START,
    margin_end: 30,
    hexpand: true,
    visible: true,
  });

  const toggle = new Gtk.Switch({
    active: settings.get_boolean(settingId),
    halign: Gtk.Align.END,
    visible: true,
  });

  settings.bind(settingId, toggle, "active", Gio.SettingsBindFlags.DEFAULT);

  if (widget instanceof Gtk.ListBox) {
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

    hbox.append(label);
    hbox.append(toggle);
    widget.append(row);
  } else {
    widget.attach(label, 0, rowNum, 1, 1);
    widget.attach(toggle, 1, rowNum, 1, 1);
  }
}
