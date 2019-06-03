import * as vscode from "vscode";
import { RedisXplorer } from "./RedisExplorer";

export function activate(context: vscode.ExtensionContext) {
  new RedisXplorer(context);
}
