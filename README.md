# Vimium CG (Changed for tab groups)

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

## Git hooks (pre-commit)

This repo ships a [pre-commit](https://pre-commit.com) config that runs, on each
commit against staged files:

- **hygiene** — validates JSON (manifest / `_locales` / `i18n`), blocks internal
  committer identities, and rejects oversized blobs (no extra dependencies)
- **eslint** — lints staged `.ts` files (skipped if eslint isn't installed)
- **tsc** — `tsc --noEmit` type check (skipped if `node_modules` isn't installed)

Install the hooks:

```bash
pipx install pre-commit        # or: pip install --user pre-commit
scripts/hooks/install.sh       # installs into .git/hooks/pre-commit
```

`scripts/hooks/install.sh` works even when a global `core.hooksPath` is set (it
installs without changing your global git config, so a parent hooks manager that
chain-calls `.git/hooks/pre-commit` keeps working alongside it). Run everything
once with `pre-commit run --all-files`; bypass in an emergency with
`git commit --no-verify`.


## Original project

This is a fork of [Vimium C](https://github.com/gdh1995/vimium-c) by gdh1995, licensed under Apache-2.0.
All original Vimium C features and key bindings are unchanged — see the upstream repo for documentation.

## Logo

The logo in `icons/logo.svg` is a modified version of the [Vim logo](https://www.vim.org/logos.php),
licensed under the [Vim License](LICENSE-VIM).
