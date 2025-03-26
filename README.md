# One-Thing GNOME Extension

> Put a single task or goal in your menu bar.

One-Thing is a productivity tool that helps you stay focused on one task at a time.

## Installation

You can install this extension from the GNOME Shell extensions store at <https://extensions.gnome.org/extension/5072/one-thing/>

## Scripting

For scripting it is useful to set the one-thing *(displayed task)* non-interactively.
This can be done via `dconf`.

```sh
$ dconf write /org/gnome/shell/extensions/one-thing/thing-value "'My todo'"
```

## Screenshots

- **Task View**:

  <img src="./.github/screenshots/one-thing_2.png" alt="drawing" width="600"/>

- **Edit Task**: Easily edit your task

  <img src="./.github/screenshots/one-thing_1.png" alt="drawing" width="600"/>

- **Preferences Window**: You can control the position of the task in the top-bar

  <img src="./.github/screenshots/one-thing_3.png" alt="drawing" width="600"/>

## Development

### Manual Installation

There are two common patterns when developing a GNOME extension. Both are not harmful to
the other installed extensions, so do what works for you!

#### Option 1: *great for rapid development*

1. Clone this repository to `~/.local/share/gnome-shell/extensions`, so GNOME
   Shell can find it:
   ```sh
   $ git clone git@github.com:one-thing-gnome/one-thing.git "${HOME}/.local/share/gnome-shell/extensions/one-thing@github.com"
   ```
2. Build the GSettings schema cache with:
   ```sh
   $ make schemas
   ```

### Option 2: *great for manual installation*

1. Optionally fork and clone this repository as usual
2. Install the extension
   1. For your user, overriding already installed versions
      ```sh
      $ make install
      ```
   2. For your user with an explicit development version co-installed
      ```sh
      $ PACKAGE=one-thing-devel@github.com.zip make install
      ```
   3. As system extension (not recommended)
      ```sh
      $ PREFIX=/usr/local make install
      ```
3. Once you're done, delete the local artefacts
      ```sh
      $ make clean
      ```

### Debugging the Extension

Debugging the extension differs when you're running under X11 or Wayland. You can switch
your session type by clicking on the cog in the login screen. When the environment
variable `WAYLAND_DISPLAY` is set, you're on Wayland.

#### GNOME Shell under X11

Restart GNOME Shell by pressing **Alt-F2** and then submit the **r** command. Your apps
will stay open and the shell will restart.

#### GNOME Shell under Wayland

Currently, Wayland can not be reloaded. To avoid logging out and closing all your apps,
you can create nested GNOME session by running the following.

```sh
$ dbus-run-session -- gnome-shell --nested --wayland
```

### Publishing the Extension

Running `make` will create an extension bundle named `one-thing@github.com.zip` in the
root of this folder. You can upload this to the GNOME extension store.
