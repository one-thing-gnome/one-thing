# One-Thing Gnome Extension

> Put a single task or goal in your menu bar.

One-Thing is a productivity tool that helps you stay focused on one task at a time.

### Install

You can install this extension from the gnome extension store: https://extensions.gnome.org/extension/5072/one-thing/

### Set the one-thing via command line

```
dconf write /org/gnome/shell/extensions/one-thing/thing-value "'My todo'"
```

### Screenshots

- **Task View**:

  <img src="./.github/screenshots/one-thing_2.png" alt="drawing" width="600"/>

- **Edit Task**: Easly edit your task.

  <img src="./.github/screenshots/one-thing_1.png" alt="drawing" width="600"/>

- **Preferences Window**: You can control the position of the task in the top bar

  <img src="./.github/screenshots/one-thing_3.png" alt="drawing" width="600"/>


### Development

**Manual installation (great for development)**

- Place this folder in **~/.local/share/gnome-shell/extensions**
- Rename the folder to **one-thing<span>@</span>github.com** so the gnome
  shell will find it
- **Debug extension:**
  * X11: Reload gnome shell by pressing **Alt-F2** and then submit the
    **r** command
  * Wayland: To avoid restarting your computer, you can create nested session with:
    ```
    dbus-run-session -- gnome-shell --nested --wayland
    ```

### Create Zip file to publish

Run:

```
npm run pack
```

it will create `one-thing@github.com.zip` to upload to the gnome extension store.
