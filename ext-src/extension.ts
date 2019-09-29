import * as vscode from 'vscode';
import { RedisXplorer } from './RedisExplorer';

export function activate(context: vscode.ExtensionContext) {
  // tslint:disable-next-line:no-unused-expression
  new RedisXplorer(context);
}

// this method is called when your extension is deactivated
export function deactivate() { }
