# Doxalang - VS Code Extension for Doxa

Language support for the [Doxa programming language](https://github.com/mirror-shades/doxa) in Visual Studio Code, featuring syntax highlighting and Language Server Protocol (LSP). This works in any ide with generic vsix support for LSPs, including Cursor.

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


1. Install extension dependencies and compile:
   ```bash
   npm install
   npm run compile
   npm install -g @vscode/vsce
   vsce package
   ```

1. Install the extension:
   - Open your ide
   - Open the extensions explorer (ctrl+b)
   - Drag the .vsix file in


