# Doxalang - VS Code Extension for Doxa

Language support for the [Doxa programming language](https://github.com/mirror-shades/doxa) in Visual Studio Code, backed by the compiler's Language Server Protocol implementation. This works in any IDE with generic vsix support for LSPs, including Cursor.

## Features

- **Autocomplete**: standard-library modules, functions, methods, and enum variants; `@`-prefixed compiler builtins; in-scope user functions, types, and variables. Callables insert an argument snippet (`std.http.get($1, $2)`).
- **Signature help**: parameter info and active-argument highlighting for `@` builtins, standard-library functions, user functions, and methods on values whose type is known.
- **Hover**: signatures and doc comments for builtins, standard-library symbols, user functions, methods, and struct fields.
- **Type inlay hints**: inferred declaration types shown as ghost text, e.g. `const x is 1 + 2` renders `:: int`.
- **Outline / document symbols** via the LSP.
- **Real-time diagnostics**: compiler errors and warnings as you type.
- **Syntax highlighting**: Doxa language constructs. Note that `//` is the integer-division operator; comments are `#` and `/* */`.
- **Bracket matching and auto-closing**, comment toggling, and brace-aware auto-indent.

## Requirements

- A Doxa language-server binary (`doxa --lsp`). The extension resolves it in this order:
  1. `doxa.serverPath` setting,
  2. `DOXA_BIN` environment variable,
  3. `<workspace>/doxa/bin/doxa[.exe]` (the `zig build` default),
  4. `<workspace>/zig-out/bin/doxa[.exe]` and `<workspace>/bin/doxa[.exe]`,
  5. `doxa` on `PATH`,
  6. `zig build run -- --lsp` inside the workspace (builds on activation).

## Settings

- `doxa.serverPath` - explicit path to the Doxa binary (absolute or workspace-relative).
- `doxa.trace.server` - `off` | `messages` | `verbose`; written to the **Doxa LSP Trace** output channel.

## Commands

- **Doxa: Restart Language Server** - restart the server (and pick up a freshly built binary) without reloading the window. Also available by clicking the status-bar item.

## Installation

### From Source

1. Install extension dependencies and compile:
   ```bash
   npm install
   npm run compile
   npm install -g @vscode/vsce
   vsce package
   ```

2. Install the extension:
   - Open your IDE
   - Open the extensions explorer (ctrl+b)
   - Drag the `.vsix` file in
