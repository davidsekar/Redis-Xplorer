import { Injectable } from '@angular/core';

let vscode;

function _window() {
  // return the global native browser window object
  return window;
}

function _getVscode(): Vscode {
  if (typeof vscode === 'undefined') {
    if (typeof acquireVsCodeApi === 'undefined') {
      vscode = {
        postMessage() { }
      };
    } else {
      vscode = acquireVsCodeApi();
    }
  }
  return vscode;
}

@Injectable()
export class GlobalService {
  get nativeWindow() {
    return _window();
  }

  get vscode() {
    return _getVscode();
  }
}
