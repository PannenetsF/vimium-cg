# Vimum CG (Changed for tab groups)

A fork of [Vimium C](https://github.com/gdh1995/vimium-c) that adds keyboard-driven tab group management.

## How to use

### New commands (active by default)

| Key | Command | Description |
|-----|---------|-------------|
| `C` | `Vomnibar.activateTabGroup` | Open Vomnibar in tab group mode |
| `]g` | `nextTabGroup` | Jump to the next tab group |
| `[g` | `previousTabGroup` | Jump to the previous tab group |
| `Alt+G` | `toggleTabGroupCollapsed` | Collapse or expand the current tab group |
| `Alt+U` | `ungroupTabs` | Remove tabs from their group |
| `yr` | `renameTab` | Rename the current tab |

### Vomnibar tab group picker

Press `C` to open the Vomnibar in tab group mode:

- Type to search across open tabs
- `Alt+letter` or `Space` to mark / unmark tabs
- `Enter` to group marked tabs into a new group (prompts for a name)
- `Alt+Enter` to move marked tabs into an existing group

### Command options

- `nextTabGroup` / `previousTabGroup`: pass `count` to jump multiple groups; use `collapseOthers` to collapse all other groups
- `ungroupTabs`: pass `count` to ungroup N tabs; pass `all: true` to ungroup every tab in the current group
- `toggleTabGroupCollapsed`: pass `collapsed: true` / `false` to force a state instead of toggling

Tab groups are only supported on Chrome. On Firefox and Edge, these commands show a HUD notice.

## Build

```bash
npm install
npx gulp local
```

Then load the project directory as an unpacked extension in `chrome://extensions`.

## Original project

This is a fork of [Vimium C](https://github.com/gdh1995/vimium-c) by gdh1995, licensed under Apache-2.0.
All original Vimium C features and key bindings are unchanged — see the upstream repo for documentation.

## Logo

The logo in `icons/logo.svg` is a modified version of the [Vim logo](https://www.vim.org/logos.php),
licensed under the [Vim License](LICENSE-VIM).
