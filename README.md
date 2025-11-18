# Doxalang - VS Code Extension for Doxa

Language support for the [Doxa programming language](https://github.com/mirror-shades/doxa) in Visual Studio Code, featuring syntax highlighting and Language Server Protocol (LSP).

## Features

- **Syntax Highlighting**: Comprehensive highlighting for all Doxa language constructs
- **Real-time Diagnostics**: LSP-powered error checking and warnings as you type
- **Language Support**: Full recognition of `.doxa` files with proper language features
- **Bracket Matching**: Automatic bracket highlighting and auto-closing
- **Comment Support**: Line (`//`) and block (`/* */`) comment highlighting

## Requirements

- [Doxa compiler](https://github.com/mirror-shades/doxa) built and available
- The extension expects the Doxa binary to be located at `doxa` in system path

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


## Release Notes

### 0.0.1

- Initial release with syntax highlighting and LSP integration
- Support for real-time diagnostics
- Comprehensive TextMate grammar for Doxa syntax
