import * as vscode from 'vscode';
import { Helper } from './Helper';
import { readFile } from 'fs';
import { PostMessage } from './model/post-message';
import { ActionDetail } from './model';
import { ActionType } from './enum';

export class RedisEditor {
    public panel!: vscode.WebviewPanel;
    private fontFamily: string;
    private helper = new Helper();
    private panelDisposed = true;

    constructor(private context: vscode.ExtensionContext) {
        const ws = vscode.workspace.getConfiguration(undefined, null);
        this.fontFamily = ws.editor.fontFamily;
        this.createRedisEditor();
    }

    public async createRedisEditor() {
        return new Promise(async resolve => {
            if (!this.panelDisposed) {
                if (!this.panel.visible) {
                    this.panel.reveal();
                }
                resolve();
            } else {
                this.panel = vscode.window.createWebviewPanel('redis-editor', 'Redis Editor', vscode.ViewColumn.Active, {
                    // Enable javascript in the webview
                    enableScripts: true,
                    // And restric the webview to only loading content from our extension's `media` directory.
                    // localResourceRoots: [
                    //     vscode.Uri.file(this.helper.Path('ngsrc')),
                    // ],
                    retainContextWhenHidden: true
                });

                this.panelDisposed = false;

                this.panel.iconPath = vscode.Uri.file(this.helper.Path('images', 'redis.png'));

                // Handle messages from the webview
                this.panel.webview.onDidReceiveMessage(
                    this.receiveMessage,
                    undefined,
                    this.context.subscriptions
                );

                this.panel.onDidDispose(() => {
                    console.warn('Webview disposed!');
                    this.panelDisposed = true;
                }, null, this.context.subscriptions);

                let angularOutPath = this.helper.Path('ngsrc', 'dist', 'rediseditor');

                readFile(angularOutPath + '\\index.html', { encoding: 'utf8' }, (error, data) => {
                    if (error) { console.error(error); }
                    this.panel.webview.html = this.processHtml(angularOutPath, data);
                });

                this.panel.onDidChangeViewState((e) => {
                    if (resolve) {
                        resolve();
                    }
                }, undefined, this.context.subscriptions);
            }
        });
    }

    /**
     * This method constructs and sends data to the client app
     * @param action action type
     * @param data message to send to angular/client app
     */
    public async postMessage(action: ActionType, data: ActionDetail) {
        await this.createRedisEditor();
        let message: PostMessage = {
            action: action,
            data: data
        };
        this.panel.webview.postMessage(message);
    }

    /**
     * This method receives and handle post message data from the client app
     * @param message receive message from angular/client app
     */
    private receiveMessage(message: any) {
        switch (message.name) {
            case 'alert':
                vscode.window.showInformationMessage(message.data);
                return;
        }
    }

    /**
     * This method modifies the path of resources found in the default Angular constructed index.html
     * @param basePath filesystem path of the angular resource files
     * @param str input HTML string
     */
    private processHtml(basePath: string, str: string) {
        str = str.replace(/src="/ig, 'src="vscode-resource:' + basePath + '\\');
        str = str.replace(/"stylesheet" href="/ig, 'href="vscode-resource:' + basePath + '\\');
        return str;
    }
}
