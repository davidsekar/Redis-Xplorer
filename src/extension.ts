import * as vscode from "vscode";
import { RedisXplorer } from "./RedisExplorer";
import { RedisEditor } from "./RedisEditor";

export function activate(context: vscode.ExtensionContext) {
  // tslint:disable: no-unused-expression
  new RedisXplorer(context);
  new RedisEditor(context);
  // tslint:enable:no-unused-expression
}

// this method is called when your extension is deactivated
export function deactivate() { }
