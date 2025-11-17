"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const node_1 = require("vscode-languageclient/node");
const path = require("path");
let client;
function activate(context) {
    // Path to your doxa binary - adjust this path as needed
    // This assumes the doxa project is in the same parent directory as the extension
    const serverPath = path.join(context.extensionPath, '..', 'doxa', 'zig-out', 'bin', 'doxa.exe');
    const serverOptions = {
        command: serverPath,
        args: ['--lsp'],
        options: {
            cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
        }
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'doxa' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.doxa')
        }
    };
    client = new node_1.LanguageClient('doxaLanguageServer', 'Doxa Language Server', serverOptions, clientOptions);
    client.start();
}
function deactivate() {
    return client?.stop();
}
//# sourceMappingURL=extension.js.map