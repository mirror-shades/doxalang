# Doxalang - VS Code Extension for Doxa

Full language support for the [Doxa programming language](https://github.com/mirror-shades/doxa) in Visual Studio Code, featuring syntax highlighting and Language Server Protocol (LSP) integration for real-time diagnostics.

## Features

- **Syntax Highlighting**: Comprehensive highlighting for all Doxa language constructs
- **Real-time Diagnostics**: LSP-powered error checking and warnings as you type
- **Language Support**: Full recognition of `.doxa` files with proper language features
- **Bracket Matching**: Automatic bracket highlighting and auto-closing
- **Comment Support**: Line (`//`) and block (`/* */`) comment highlighting

## Requirements

- [Doxa compiler](https://github.com/mirror-shades/doxa) built and available
- The extension expects the Doxa binary to be located at `../doxa/zig-out/bin/doxa.exe` relative to the extension directory

## Installation

### From Source

1. Clone this repository alongside your Doxa compiler:
   ```
   C:\dev\zig\
   ├── doxa\        # Your Doxa compiler
   └── doxalang\    # This extension
   ```

2. Build the Doxa compiler:
   ```bash
   cd doxa
   zig build
   ```

3. Install extension dependencies and compile:
   ```bash
   cd ../doxalang
   npm install
   npm run compile
   ```

4. Install the extension in VS Code:
   - Open VS Code
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Extensions: Install from VSIX"
   - Select the generated `.vsix` file

### Testing

- Press `F5` to open a new VS Code window with the extension loaded
- Create a new `.doxa` file
- Verify syntax highlighting and LSP diagnostics work

## Known Issues

- LSP server path is currently hardcoded relative to extension location
- May need to adjust path if Doxa binary is installed elsewhere

## Contributing

1. Make changes to `src/extension.ts`
2. Run `npm run compile` to build
3. Test with `F5` in VS Code
4. Submit a pull request

## Release Notes

### 0.0.1

- Initial release with syntax highlighting and LSP integration
- Support for real-time diagnostics
- Comprehensive TextMate grammar for Doxa syntax
