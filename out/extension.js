"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const node_1 = require("vscode-languageclient/node");
let client;
const which = require('which');
const DOXA_BIN_NAME = process.platform === 'win32' ? 'doxa.exe' : 'doxa';
function resolveServerLaunch(workspaceRoot, outputChannel) {
    const workspaceBinary = workspaceRoot ? path.join(workspaceRoot, 'zig-out', 'bin', DOXA_BIN_NAME) : undefined;
    if (workspaceBinary && fs.existsSync(workspaceBinary)) {
        outputChannel.appendLine(`Using workspace Doxa binary at: ${workspaceBinary}`);
        return { command: workspaceBinary, args: ['--lsp'] };
    }
    const pathBinary = which.sync('doxa', { nothrow: true });
    if (pathBinary) {
        outputChannel.appendLine(`Using Doxa binary from PATH at: ${pathBinary}`);
        return { command: pathBinary, args: ['--lsp'] };
    }
    if (!workspaceRoot) {
        outputChannel.appendLine('Cannot locate a workspace or PATH Doxa binary, and no workspace is open to run `zig build run`.');
        return undefined;
    }
    const zigCommand = which.sync('zig', { nothrow: true });
    if (!zigCommand) {
        outputChannel.appendLine('Could not find `zig` in PATH to fall back to `zig build run -- --lsp`.');
        return undefined;
    }
    outputChannel.appendLine(`Falling back to "${zigCommand} build run -- --lsp" inside workspace: ${workspaceRoot}`);
    return { command: zigCommand, args: ['build', 'run', '--', '--lsp'] };
}
function activate(context) {
    const outputChannel = vscode.window.createOutputChannel('Doxa Language Server');
    const traceChannel = vscode.window.createOutputChannel('Doxa LSP Trace');
    outputChannel.appendLine('Doxa VS Code extension activating...');
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const serverLaunch = resolveServerLaunch(workspaceRoot, outputChannel);
    if (!serverLaunch) {
        vscode.window.showErrorMessage('Could not resolve a Doxa executable. Build the project or add Doxa/zig to PATH.');
        return;
    }
    const serverOptions = {
        command: serverLaunch.command,
        args: serverLaunch.args,
        options: {
            cwd: workspaceRoot
        }
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'doxa' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.doxa')
        },
        traceOutputChannel: traceChannel,
        outputChannel: outputChannel,
        revealOutputChannelOn: 4 // RevealOnError
    };
    client = new node_1.LanguageClient('doxaLanguageServer', 'Doxa Language Server', serverOptions, clientOptions);
    outputChannel.appendLine('Starting Doxa Language Client (calling start)...');
    // Start the client (returns a Promise in this version of vscode-languageclient)
    client.start().then(() => {
        console.log('Doxa Language Client started successfully');
        outputChannel.appendLine('Doxa Language Client started successfully');
    }).catch((err) => {
        console.error('Doxa Language Client failed to start:', err);
        outputChannel.appendLine(`Doxa Language Client failed to start: ${err}`);
    });
    // Listen for state changes
    client.onDidChangeState((event) => {
        console.log('Doxa Language Client state changed:', event.oldState, '->', event.newState);
        outputChannel.appendLine(`Doxa Language Client state changed: ${event.oldState} -> ${event.newState}`);
    });
}
function deactivate() {
    return client?.stop();
}
//# sourceMappingURL=extension.js.map