import * as path from 'path';
import { workspace, WorkspaceFolder, window } from 'vscode';

export class Helper {
    private _root: any;
    constructor() {
        let ROOT = path.resolve(__dirname, '..');
        this._root = path.join.bind(path, ROOT);
    }

    get Path() {
        return this._root;
    }

    get WorkspacePath() {
        let folders = workspace.workspaceFolders;
        let folder: WorkspaceFolder | undefined = undefined;
        if (!folders) {
            return '';
        }

        folder = folders[0];
        return folder.uri.fsPath;
    }
}
