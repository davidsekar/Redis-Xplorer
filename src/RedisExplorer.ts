import * as vscode from "vscode";
import { isNil, isUndefined, toNumber, isNumber, trim } from "lodash";
import { writeFile, readFile, unlink } from "fs";

import { Entry, XplorerProfiles } from "./model";
import { RedisProvider } from "./RedisProvider";
import { ConfigHelper } from "./ConfigHelper";
import { Command, Constants, Message } from "./enum";

const tempOutputFile = ".vscode/redis-xplorer.redis";

export class RedisXplorer {
  redisXplorer: vscode.TreeView<Entry>;
  treeDataProvider: RedisProvider;
  lastAccessedNode!: Entry;
  configHelper: ConfigHelper;

  constructor(context: vscode.ExtensionContext) {
    console.debug(context.storagePath);

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

    vscode.commands.registerCommand(Command.ConfigureScanLimit, async () => {
      let currentScanLimit = await this.configHelper.getRedisScanLimit();
      const scanLimit = await vscode.window.showInputBox({
        prompt: Message.PromptRedisScanLimit,
        value: currentScanLimit + '',
        placeHolder: Message.PlaceholderRedisScanLimit
      });

      if (isNil(scanLimit)) {
        return;
      }

      if (scanLimit === '') {
        vscode.window.showInformationMessage(Message.InfoInvalidScanLimit);
        return;
      }

      let scanLimitNo = toNumber(scanLimit);
      if (!isNumber(scanLimitNo) || scanLimitNo < 1) {
        vscode.window.showInformationMessage(Message.InfoInvalidScanLimit);
        return;
      }

      await this.configHelper.saveRedisScanLimit(scanLimitNo);
      this.treeDataProvider.setRedisScanLimit(scanLimitNo);
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
        prompt: Message.PromptNewRedisKey
      });

      if (isNil(key) || key === '') {
        return;
      }

      this.lastAccessedNode = node;
      this.lastAccessedNode.key = key || 'No keyname specified';

      writeFile(`${vscode.workspace.rootPath}/${tempOutputFile}`,
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
        });
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
      const canDelete = await vscode.window.showWarningMessage(Message.WarnProfileDeletion + node.serverName + " ?",
        { modal: true, }, Command.CommandOk);

      if (canDelete === Command.CommandOk && node) {
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
        Message.WarnDeleteAll,
        { modal: true },
        Command.CommandDeleteAll
      );
      if (result === Command.CommandDeleteAll) {
        this.treeDataProvider.flushAll(node.serverName);
        this.treeDataProvider.refresh(node.serverName);
      }
    });

    vscode.commands.registerCommand(Command.RefreshServer, async (node: Entry) => {
      this.treeDataProvider.refresh(node.serverName);
    });

    vscode.commands.registerCommand(Command.FilterServerByPattern, async (node: Entry) => {
      let filterText = await vscode.window.showInputBox({
        prompt: Message.PromptRedisKeyFilterPattern,
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
      prompt: Message.PromptDisplayName,
      placeHolder: Message.PlaceholderDisplayName,
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

    if (trim(profileName) === '') {
      vscode.window.showInformationMessage(Message.InfoDisplayName);
      return;
    }

    inputOptions.prompt = Message.PromptHostserver;
    inputOptions.placeHolder = Message.PlaceholderHostserver;
    if (isEdit) {
      inputOptions.value = xconfigProfile!.host;
      inputOptions.valueSelection = undefined;
    }

    let hostName = await vscode.window.showInputBox(inputOptions);
    if (isNil(hostName) || trim(hostName) === "") {
      vscode.window.showInformationMessage(Message.InfoHostServer);
      return;
    }

    inputOptions.prompt = Message.PromptPortNumber;
    inputOptions.value = Constants.RedisDefaultPortNo;
    inputOptions.placeHolder = Message.PlaceholderPortNumber;
    if (isEdit) {
      if (xconfigProfile!.port) {
        inputOptions.value = xconfigProfile!.port.toString();
      }

      inputOptions.valueSelection = undefined;
    }

    let portNumber = await vscode.window.showInputBox(inputOptions);
    if (isNil(portNumber) || trim(portNumber) === "") {
      vscode.window.showInformationMessage(Message.InfoPortNumber);
      return;
    } else {
      let port = toNumber(portNumber);
      if (!isNumber(port)) {
        vscode.window.showInformationMessage(Message.InfoInvalidPortNumber);
        return;
      }
    }

    inputOptions.value = undefined;
    inputOptions.prompt = Message.PromptPassword;
    inputOptions.placeHolder = Message.PlaceholderPassword;
    if (isEdit) {
      inputOptions.value = xconfigProfile!.accessKey;
      inputOptions.valueSelection = undefined;
    }

    let password = await vscode.window.showInputBox(inputOptions);
    if (isNil(password)) {
      vscode.window.showInformationMessage(Message.InfoProfileNotSaved);
      return;
    }

    password = trim(password);

    this.configHelper.addOrUpdateConfig(profileName, hostName, portNumber, password, oldProfileName).then(() => this.treeDataProvider.refresh(profileName!));
  }

  private async openResource(resource: Entry) {
    let vsCodeProgressOptions: vscode.ProgressOptions = {
      location: vscode.ProgressLocation.Notification,
      cancellable: false,
      title: Message.TitleRedisXplorer
    };

    vscode.window.withProgress(vsCodeProgressOptions, (progress) => {
      progress.report({ message: Message.ProgressInitiate, increment: 0 });
      return new Promise(resolve => {
        if (!resource) {
          this.writeToEditorCallback(Message.InfoNoData, progress, resolve);
        }
        else if (resource.value === '#server#') {
          progress.report({ message: Message.ProgressConnectionInfo, increment: 30 });
          this.treeDataProvider.getServerNodeInfo(resource.serverName).then(result => this.writeToEditorCallback(result, progress, resolve));
        }
        else {
          progress.report({ message: Message.ProgressGetValueFor + '`' + resource.value + '`', increment: 30 });
          this.treeDataProvider.getNodeValue(resource.key, resource.serverName).then(result => this.writeToEditorCallback(result, progress, resolve));
        }
      });
    });
  }

  private writeToEditorCallback(result: string, progress: vscode.Progress<object>, resolve: any) {
    progress.report({ message: Message.ProgressWriteToFile, increment: 80 });
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
    progress.report({ message: Message.ProgressDone, increment: 100 });
    setTimeout(() => {
      resolve();
    }, 1000);
  }
}
