"use strict";
import * as vscode from "vscode";
import { RedisVsExplorer } from "./RedisExplorer";

export function activate(context: vscode.ExtensionContext) {
  new RedisVsExplorer(context);
}
