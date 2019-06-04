import * as vscode from "vscode";
import { RedisXplorer } from "./RedisExplorer";

export function activate(context: vscode.ExtensionContext) {
  console.debug(context.storagePath);
  new RedisXplorer();
}
