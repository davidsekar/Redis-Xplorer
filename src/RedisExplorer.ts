import * as vscode from "vscode";
import { isNil, isUndefined } from "lodash";
import { writeFile, readFile, unlink } from "fs";

import { Entry, XplorerProfiles } from "./model";
import { RedisProvider } from "./RedisProvider";
import { ConfigHelper } from "./ConfigHelper";
import { Command } from "./enum";

const tempOutputFile = ".vscode/redis-xplorer.redis";
const commandOk = "OK";

export class RedisXplorer {
  redisXplorer: vscode.TreeView<Entry>;
  treeDataProvider: RedisProvider;
  lastAccessedNode!: Entry;
  configHelper: ConfigHelper;

  constructor() {
    // Clean-up temp file
    unlink(`${vscode.workspace.rootPath}/${tempOutputFile}`, err => { if (err) { console.log(err); return; } });
    this.configHelper = new ConfigHelper();
    this.treeDataProvider = new RedisProvider();
    this.redisXplorer = vscode.window.createTreeView("redisXplorer", { treeDataProvider: this.treeDataProvider });
    this.setupVsCommands();
  }

  /**
   * Setup all VsCode related commands
   */
  private setupVsCommands() {
    vscode.commands.registerCommand(Command.ReadNodeData, (resource: Entry) => {
      this.lastAccessedNode = resource;
      // When refresh, it will execute getTreeItem in provider.
      return this.openResource(resource);
    });

    vscode.commands.registerCommand(Command.AddRedisConnection, async () => {
      await this.setupConnectionProfile();
    });

    vscode.commands.registerCommand(Command.EditRedisConnection, async (node: Entry) => {
      await this.setupConnectionProfile(node);
    });

    vscode.workspace.onDidChangeConfiguration(() => { this.reconnectRedis(); });

    vscode.commands.registerCommand(Command.AddRedisKey, async (node: Entry) => {
      const key = await vscode.window.showInputBox({
        prompt: "Provide a new key "
      });

      if (key !== "") {
        this.lastAccessedNode = node;
        this.lastAccessedNode.key = key || 'No keyname specified';

        writeFile(
          `${vscode.workspace.rootPath}/${tempOutputFile}`,
          "",
          err => {
            if (err) {
              console.log(err);
              return;
            }
            vscode.workspace.openTextDocument(`${vscode.workspace.rootPath}/${tempOutputFile}`)
              .then(doc => {
                vscode.window.showTextDocument(doc);
              });
          }
        );
      }
    });

    vscode.commands.registerCommand(Command.DeleteRedisKey, (node: Entry) => {
      if (node) {
        this.treeDataProvider.deleteRedis(node.key, node.serverName);
        this.treeDataProvider.refresh(node.serverName);
      }
    },
      this // To use parameter in callback function, you must pass 'this'
    );

    vscode.commands.registerCommand(Command.DeleteRedisConnection, async (node: Entry) => {
      const canDelete = await vscode.window.showWarningMessage("Do you really want to delete \"" + node.serverName + "\" profile ?",
        { modal: true, }, commandOk);

      if (canDelete === commandOk && node) {
        let success = await this.configHelper.deleteXplorerConfig(node.serverName);
        if (success) {
          this.treeDataProvider.refresh(node.serverName);
        }
      }
    },
      this // To use parameter in callback function, you must pass 'this'
    );

    vscode.commands.registerCommand(Command.DeleteAllKeys, async (node: Entry) => {
      //   this.treeDataProvider.refresh();
      const result = await vscode.window.showWarningMessage(
        "Do you REALLY want to delete all items ?",
        { modal: true },
        "Delete All"
      );
      if (result === "Delete All") {
        this.treeDataProvider.flushAll(node.serverName);
        this.treeDataProvider.refresh(node.serverName);
      }
    });

    vscode.commands.registerCommand(Command.RefreshServer, async (node: Entry) => {
      this.treeDataProvider.refresh(node.serverName);
    });

    vscode.commands.registerCommand(Command.FilterServerByPattern, async (node: Entry) => {
      let filterText = await vscode.window.showInputBox({
        prompt: "Provide a pattern to filter redis keys e.g., 'abc*' , '*'",
        value: node.filter
      });
      if (!filterText) {
        return;
      }

      filterText = filterText || '*';

      await this.configHelper.updatefilterText(node.serverName, filterText);
      this.treeDataProvider.refresh(node.serverName);
    });

    vscode.workspace.onDidSaveTextDocument(event => {
      const extension = event.fileName.split(".");
      if (extension[extension.length - 1] !== "redis") { return; }
      if (!this.lastAccessedNode.key) { return; }

      readFile(event.fileName, 'utf8', (err, data) => {
        if (err) {
          console.debug(err.message);
          return;
        }
        this.treeDataProvider.setRedisValue(this.lastAccessedNode.key, data, this.lastAccessedNode.serverName);
        this.treeDataProvider.refresh(this.lastAccessedNode.serverName);
      });
    });

  }

  private reconnectRedis() {
    // this.treeDataProvider.disconnectRedis();
    // this.treeDataProvider.connectRedis();
    // this.lastResource = undefined;
  }

  private async setupConnectionProfile(node?: Entry) {
    let isEdit = !isNil(node);
    let xconfigProfile: XplorerProfiles | undefined;
    let oldProfileName = '';
    if (isEdit) {
      console.log('Edit flow started');
      xconfigProfile = await this.configHelper.getProfileByName(node!.serverName);
      if (!xconfigProfile) {
        return;
      }
    }

    let inputOptions: vscode.InputBoxOptions = {
      ignoreFocusOut: true,
      prompt: "Display Name",
      placeHolder: "enter a nick name",
    };
    if (isEdit) {
      oldProfileName = xconfigProfile!.name;
      inputOptions.value = xconfigProfile!.name;
      inputOptions.valueSelection = undefined;
    }

    let profileName = await vscode.window.showInputBox(inputOptions);
    if (isUndefined(profileName)) {
      return;
    }
    
    if (profileName === '') {
      vscode.window.showInformationMessage("Please provide a display name");
      return;
    }

    inputOptions.prompt = "Host server";
    inputOptions.placeHolder = "server.redis.cache.windows.net";
    if (isEdit) {
      inputOptions.value = xconfigProfile!.host;
      inputOptions.valueSelection = undefined;
    }

    let hostName = await vscode.window.showInputBox(inputOptions);
    if (isNil(hostName) || hostName === "") {
      vscode.window.showInformationMessage("Please provide Redis host server name");
      return;
    }

    inputOptions.prompt = "Password";
    inputOptions.placeHolder = "URL-Safe / Hashed password";
    if (isEdit) {
      inputOptions.value = xconfigProfile!.accessKey;
      inputOptions.valueSelection = undefined;
    }

    const password = await vscode.window.showInputBox(inputOptions);
    if (isNil(password) || password === "") {
      vscode.window.showInformationMessage("Please provide Redis password");
      return;
    }

    this.configHelper.addOrUpdateConfig(profileName, hostName, password, oldProfileName).then(() => this.treeDataProvider.refresh(profileName!));
  }

  private async openResource(resource: Entry) {
    let vsCodeProgressOptions: vscode.ProgressOptions = {
      location: vscode.ProgressLocation.Notification,
      cancellable: false,
      title: 'Redis Xplorer'
    };

    vscode.window.withProgress(vsCodeProgressOptions, (progress) => {
      progress.report({ message: 'Initiate', increment: 0 });
      return new Promise(resolve => {
        if (!resource) {
          this.writeToEditorCallback('No Data', progress, resolve);
        }
        else if (resource.value === '#server#') {
          progress.report({ message: 'Connection info.', increment: 30 });
          this.treeDataProvider.getServerNodeInfo(resource.serverName).then(result => this.writeToEditorCallback(result, progress, resolve));
        }
        else {
          progress.report({ message: 'Get value for `' + resource.value + '`', increment: 30 });
          this.treeDataProvider.getNodeValue(resource.key, resource.serverName).then(result => this.writeToEditorCallback(result, progress, resolve));
        }
      });
    });
  }

  private writeToEditorCallback(result: string, progress: vscode.Progress<object>, resolve: any) {
    progress.report({ message: 'Write to file', increment: 80 });
    writeFile(
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
