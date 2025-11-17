import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';
import * as path from 'path';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    // Path to your doxa binary - adjust this path as needed
    // This assumes the doxa project is in the same parent directory as the extension
    const serverPath = path.join(context.extensionPath, '..', 'doxa', 'zig-out', 'bin', 'doxa.exe');

    const serverOptions: ServerOptions = {
        command: serverPath,
        args: ['--lsp'],
        options: {
            cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'doxa' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.doxa')
        }
    };

    client = new LanguageClient(
        'doxaLanguageServer',
        'Doxa Language Server',
        serverOptions,
        clientOptions
    );

    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    return client?.stop();
}
