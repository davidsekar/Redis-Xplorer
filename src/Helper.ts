import * as path from "path";

export class Helper {
    private _root: any;
    constructor() {
        let ROOT = path.resolve(__dirname, '..');
        this._root = path.join.bind(path, ROOT);
    }

    get Path() {
        return this._root;
    }
}
