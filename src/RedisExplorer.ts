import * as vscode from "vscode";
import { RedisProvider } from "./RedisProvider";
import fs = require("fs");
import { XplorerConfig, XplorerProfiles } from "./model";
import { isNil } from "lodash";


const tempOutputFile = ".vscode/redis-xplorer.redis";

enum ItemType {
  Server = 0,
  Item = 1,
  ItemSelected = 2
}

interface Entry {
  key: string;
  type: ItemType;
}

export class RedisXplorer {
  redisXplorer: vscode.TreeView<Entry>;
  treeDataProvider: RedisProvider;
  lastResource: any;

  constructor() {
    if (!isNil(vscode.workspace.rootPath)) {
      // Create if default folder is missing
      let vsCodeFolder = `${vscode.workspace.rootPath}/.vscode`;
      if (!fs.existsSync(vsCodeFolder)) { fs.mkdirSync(vsCodeFolder); }

      // Delete old temporary file
      fs.unlink(`${vscode.workspace.rootPath}/${tempOutputFile}`, err => { if (err) { console.log(err); return; } });
    }

    this.treeDataProvider = new RedisProvider();
    this.lastResource = undefined;
    this.redisXplorer = vscode.window.createTreeView("redisXplorer", { treeDataProvider: this.treeDataProvider });

    this.registerVsCommands();
  }

  private registerVsCommands() {
    vscode.commands.registerCommand("redisXplorer.readData", resource => {
      this.lastResource = resource;
      // When refresh, it will execute getTreeItem in provider.
      return this.openResource(resource);
    });

    vscode.commands.registerCommand("config.commands.redisServer", async () => {
      let inputOptions: vscode.InputBoxOptions = {
        ignoreFocusOut: true,
        prompt: "Display Name",
        placeHolder: "enter a nick name"
      };
      let profileName = await vscode.window.showInputBox(inputOptions);
      if (isNil(profileName) || profileName === '') {
        vscode.window.showInformationMessage("Please provide a display name");
        return;
      }

      inputOptions.prompt = "Host server";
      inputOptions.placeHolder = "server.redis.cache.windows.net";

      let hostName = await vscode.window.showInputBox(inputOptions);
      if (isNil(hostName) || hostName === "") {
        vscode.window.showInformationMessage("Please provide Redis host server name");
        return;
      }

      inputOptions.prompt = "Password";
      inputOptions.placeHolder = "url-safe / hashed password";

      const password = await vscode.window.showInputBox(inputOptions);
      if (isNil(password) || password === "") {
        vscode.window.showInformationMessage("Please provide Redis password");
        return;
      }

      let xconfig = new XplorerConfig();
      xconfig.profiles = [];

      let profile = new XplorerProfiles(profileName, hostName, password);
      xconfig.profiles.push(profile);

      await vscode.workspace
        .getConfiguration()
        .update(
          "redisXplorer.config",
          xconfig,
          vscode.ConfigurationTarget.Workspace
        );

      this.reconnectRedis();
    });

    vscode.workspace.onDidChangeConfiguration(() => {
      this.reconnectRedis();
    });

    vscode.commands.registerCommand(
      "config.commands.redisServer.addItem",
      async () => {
        const key = await vscode.window.showInputBox({
          prompt: "Provide a new key "
        });

        if (key !== "") {
          this.lastResource = { key };
          fs.writeFile(
            `${vscode.workspace.rootPath}/${tempOutputFile}`,
            "",
            err => {
              if (err) {
                console.log(err);
                return;
              }
              vscode.workspace
                .openTextDocument(
                  `${vscode.workspace.rootPath}/${tempOutputFile}`
                )
                .then(doc => {
                  vscode.window.showTextDocument(doc);
                });
            }
          );
        }
      }
    );

    vscode.commands.registerCommand(
      "config.commands.redisServer.delItem",
      (node: Entry) => {
        if (node) {
          this.treeDataProvider.deleteRedis(node.key);
          this.treeDataProvider.refresh();
        }
      },
      this // To use parameter in callback function, you must pass 'this'
    );

    vscode.commands.registerCommand(
      "config.commands.redisServer.delAllItems",
      async () => {
        //   this.treeDataProvider.refresh();
        const result = await vscode.window.showWarningMessage(
          "Do you REALLY want to delete all items???",
          { modal: true },
          "Delete All"
        );
        if (result === "Delete All") {
          this.treeDataProvider.flushAll();
          this.treeDataProvider.refresh();
        }
      }
    );

    vscode.workspace.onDidSaveTextDocument(event => {
      const extension = event.fileName.split(".");
      if (extension[extension.length - 1] !== "redis") return;
      if (!this.lastResource.key) return;

      fs.readFile(event.fileName, 'utf8', (err, data) => {
        if (err) {
          console.debug(err.message);
          return;
        }
        this.treeDataProvider.setRedisValue(this.lastResource.key, data);
        this.treeDataProvider.refresh();
      });
    });
  }

  private reconnectRedis() {
    this.treeDataProvider.disconnectRedis();
    this.treeDataProvider.connectRedis();
    this.lastResource = undefined;
  }

  private async openResource(resource: any) {
    let vsCodeProgressOptions: vscode.ProgressOptions = {
      location: vscode.ProgressLocation.Notification,
      cancellable: false,
      title: 'Redis Xplorer'
    };

    vscode.window.withProgress(vsCodeProgressOptions, (progress) => {
      progress.report({ message: 'Initiate', increment: 0 });
      return new Promise(resolve => {
        if (!resource)
          this.writeToEditorCallback('No Data', progress, resolve);
        else if (resource.value == '#server#') {
          progress.report({ message: 'Connection info.', increment: 30 });
          this.treeDataProvider.getServerNodeInfo().then(result => this.writeToEditorCallback(result, progress, resolve));
        }
        else {
          progress.report({ message: 'Get value for `' + resource.value + '`', increment: 30 });
          this.treeDataProvider.getNodeValue(resource.key).then(result => this.writeToEditorCallback(result, progress, resolve));
        }
      });
    });
  }

  private writeToEditorCallback(result: string, progress: vscode.Progress<object>, resolve: any) {
    progress.report({ message: 'Write to file', increment: 80 });
    fs.writeFile(
      `${vscode.workspace.rootPath}/${tempOutputFile}`,
      result,
      err => {
        if (err) {
          console.log(err);
          return;
        }
        vscode.workspace
          .openTextDocument(`${vscode.workspace.rootPath}/${tempOutputFile}`)
          .then(doc => {
            vscode.window.showTextDocument(doc);
          });
      }
    );
    progress.report({ message: 'Done', increment: 100 });
    setTimeout(() => {
      resolve();
    }, 1000);
  }
}
