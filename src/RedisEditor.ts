import * as vscode from "vscode";
import { Helper } from "./Helper";
import { readFile } from "fs";

export class RedisEditor {
    public panel: vscode.WebviewPanel;
    private fontFamily: string;
    private helper = new Helper();

    constructor(private context: vscode.ExtensionContext) {
        const ws = vscode.workspace.getConfiguration(undefined, null);
        this.fontFamily = ws.editor.fontFamily;

        this.panel = vscode.window.createWebviewPanel("redis-editor", "Redis Editor", vscode.ViewColumn.Beside, {
            // Enable javascript in the webview
            enableScripts: true,
            // And restric the webview to only loading content from our extension's `media` directory.
            // localResourceRoots: [
            //     vscode.Uri.file(this.helper.Path("ngsrc")),
            // ],
            retainContextWhenHidden: true,
        });

        this.panel.iconPath = vscode.Uri.file(this.helper.Path("images", "redis.png"));

        this.panel.onDidDispose(() => {

        }, null, context.subscriptions);

        let angularOutPath = this.helper.Path("ngsrc", "dist", "redis_editor");

        readFile(angularOutPath + "\\index.html", { encoding: "utf8" }, (error, data) => {
            if (error) { console.error(error); }
            this.panel.webview.html = this.processHtml(angularOutPath, data);
        });
    }

    private processHtml(basePath: string, str: string) {
        str = str.replace(/src="/ig, "src=\"vscode-resource:" + basePath + "\\");
        str = str.replace(/"stylesheet" href="/ig, "href=\"vscode-resource:" + basePath + "\\");
        return str;
    }

    /*private generateHtml(basePath: string) {
        
        return `<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="utf-8">
                        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource:; script-src vscode-resource:; style-src vscode-resource:;"/>
                        <title>Redis Editor</title>
                        <base href="${basePath}"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <link rel="stylesheet" href="vscode-resource:${basePath}\\styles.css")}">
                       
                    </head>
                    <body>
                        <app-root></app-root>
                        <script src="vscode-resource:${basePath}\\polyfills-es5.js" nomodule defer></script>
                        <script src="vscode-resource:${basePath}\\polyfills-es2015.js" type="module"></script>
                        <script src="vscode-resource:${basePath}\\runtime-es2015.js" type="module"></script>
                        <script src="vscode-resource:${basePath}\\main-es2015.js" type="module"></script>
                        <script src="vscode-resource:${basePath}\\runtime-es5.js" nomodule defer></script>
                        <script src="vscode-resource:${basePath}\\main-es5.js" nomodule defer></script>
                    </body>
                </html>`;
               
    }
    */
}
