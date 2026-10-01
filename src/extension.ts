import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {
    LanguageClient,
    LanguageClientOptions,
    RevealOutputChannelOn,
    ServerOptions,
    State,
    Trace
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;
let statusItem: vscode.StatusBarItem | undefined;
const which = require('which');
const DOXA_BIN_NAME = process.platform === 'win32' ? 'doxa.exe' : 'doxa';

type ServerLaunch = {
    command: string;
    args: string[];
};

function traceFromSetting(value: string | undefined): Trace {
    switch (value) {
        case 'messages': return Trace.Messages;
        case 'verbose': return Trace.Verbose;
        default: return Trace.Off;
    }
}

/// Where `zig build` puts the CLI: `doxa/bin` by default (see AGENTS.md),
/// `zig-out/bin` for a standard Zig install prefix, and a plain `bin` for
/// hand-built trees.
function workspaceBinaryCandidates(workspaceRoot: string): string[] {
    return [
        path.join(workspaceRoot, 'doxa', 'bin', DOXA_BIN_NAME),
        path.join(workspaceRoot, 'zig-out', 'bin', DOXA_BIN_NAME),
        path.join(workspaceRoot, 'bin', DOXA_BIN_NAME),
    ];
}

function resolveConfigured(configured: string, workspaceRoot: string | undefined): string {
    if (path.isAbsolute(configured) || !workspaceRoot) {
        return configured;
    }
    return path.join(workspaceRoot, configured);
}

function resolveServerLaunch(workspaceRoots: string[], outputChannel: vscode.OutputChannel): ServerLaunch | undefined {
    const primaryRoot = workspaceRoots[0];

    const configured = vscode.workspace.getConfiguration('doxa').get<string>('serverPath');
    if (configured && configured.trim().length > 0) {
        const resolved = resolveConfigured(configured.trim(), primaryRoot);
        if (fs.existsSync(resolved)) {
            outputChannel.appendLine(`Using configured Doxa binary at: ${resolved}`);
            return { command: resolved, args: ['--lsp'] };
        }
        outputChannel.appendLine(`doxa.serverPath does not exist: ${resolved}`);
    }

    const envBinary = process.env.DOXA_BIN;
    if (envBinary && envBinary.trim().length > 0) {
        const resolved = resolveConfigured(envBinary.trim(), primaryRoot);
        if (fs.existsSync(resolved)) {
            outputChannel.appendLine(`Using DOXA_BIN from the environment at: ${resolved}`);
            return { command: resolved, args: ['--lsp'] };
        }
        outputChannel.appendLine(`DOXA_BIN does not exist: ${resolved}`);
    }

    for (const root of workspaceRoots) {
        for (const candidate of workspaceBinaryCandidates(root)) {
            if (fs.existsSync(candidate)) {
                outputChannel.appendLine(`Using workspace Doxa binary at: ${candidate}`);
                return { command: candidate, args: ['--lsp'] };
            }
        }
    }

    const pathBinary = which.sync('doxa', { nothrow: true }) as string | null;
    if (pathBinary) {
        outputChannel.appendLine(`Using Doxa binary from PATH at: ${pathBinary}`);
        return { command: pathBinary, args: ['--lsp'] };
    }

    if (workspaceRoots.length === 0) {
        outputChannel.appendLine('No Doxa binary found: no workspace is open and `doxa` is not on PATH.');
        return undefined;
    }

    const zigCommand = which.sync('zig', { nothrow: true }) as string | null;
    if (!zigCommand) {
        outputChannel.appendLine('No Doxa binary found and `zig` is not on PATH; set `doxa.serverPath` or build the project.');
        return undefined;
    }

    outputChannel.appendLine(`Falling back to "${zigCommand} build run -- --lsp" inside workspace: ${primaryRoot}`);
    return { command: zigCommand, args: ['build', 'run', '--', '--lsp'] };
}

function setStatus(state: 'starting' | 'running' | 'stopped'): void {
    if (!statusItem) {
        return;
    }
    switch (state) {
        case 'starting':
            statusItem.text = '$(sync~spin) Doxa';
            statusItem.tooltip = 'Doxa language server starting; click to restart';
            break;
        case 'running':
            statusItem.text = '$(check) Doxa';
            statusItem.tooltip = 'Doxa language server running; click to restart';
            break;
        case 'stopped':
            statusItem.text = '$(circle-slash) Doxa';
            statusItem.tooltip = 'Doxa language server stopped; click to restart';
            break;
    }
    statusItem.show();
}

async function startClient(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel,
    traceChannel: vscode.OutputChannel,
): Promise<void> {
    const workspaceRoots = (vscode.workspace.workspaceFolders ?? []).map((folder) => folder.uri.fsPath);
    const serverLaunch = resolveServerLaunch(workspaceRoots, outputChannel);
    if (!serverLaunch) {
        setStatus('stopped');
        void vscode.window.showErrorMessage(
            'Could not resolve a Doxa executable. Set `doxa.serverPath`, build the project, or add doxa/zig to PATH.'
        );
        return;
    }

    const serverOptions: ServerOptions = {
        command: serverLaunch.command,
        args: serverLaunch.args,
        options: {
            cwd: workspaceRoots[0]
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'doxa' },
            { scheme: 'untitled', language: 'doxa' }
        ],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.doxa')
        },
        traceOutputChannel: traceChannel,
        outputChannel: outputChannel,
        revealOutputChannelOn: RevealOutputChannelOn.Error
    };

    client = new LanguageClient(
        'doxaLanguageServer',
        'Doxa Language Server',
        serverOptions,
        clientOptions
    );

    context.subscriptions.push(client);
    client.onDidChangeState((event) => {
        outputChannel.appendLine(`Doxa client state: ${event.oldState} -> ${event.newState}`);
        setStatus(event.newState === State.Running ? 'running' : 'stopped');
    });

    const applyTrace = () => {
        const setting = vscode.workspace.getConfiguration('doxa').get<string>('trace.server');
        void client?.setTrace(traceFromSetting(setting));
    };
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('doxa.trace.server')) {
                applyTrace();
            }
        })
    );

    setStatus('starting');
    try {
        await client.start();
        applyTrace();
        setStatus('running');
        outputChannel.appendLine('Doxa Language Client started successfully');
    } catch (err) {
        setStatus('stopped');
        outputChannel.appendLine(`Doxa Language Client failed to start: ${err}`);
        void vscode.window.showErrorMessage(`Doxa language server failed to start: ${err}`);
    }
}

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('Doxa Language Server');
    const traceChannel = vscode.window.createOutputChannel('Doxa LSP Trace');
    statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    statusItem.name = 'Doxa Language Server';
    statusItem.command = 'doxa.restartServer';
    context.subscriptions.push(outputChannel, traceChannel, statusItem);

    outputChannel.appendLine('Doxa VS Code extension activating...');

    const restart = async (): Promise<void> => {
        if (client) {
            await client.stop();
            client.dispose();
            client = undefined;
        }
        await startClient(context, outputChannel, traceChannel);
    };

    context.subscriptions.push(
        vscode.commands.registerCommand('doxa.restartServer', restart)
    );

    void startClient(context, outputChannel, traceChannel);
}

export function deactivate(): Thenable<void> | undefined {
    return client?.stop();
}
