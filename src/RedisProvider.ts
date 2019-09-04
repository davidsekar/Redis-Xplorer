import * as vscode from "vscode";
import RedisHandler from "./RedisHandler";
import * as path from "path";
import { XplorerProfiles, XplorerConfig, Entry } from "./model";
import { isNil, find, unset } from "lodash";
import { ItemType, Command, Constants } from "./enum";

export class RedisProvider implements vscode.TreeDataProvider<Entry> {
  private redisHandler: { [key: string]: RedisHandler };
  private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
  private scanLimit: number;
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData
    .event;

  constructor() {
    this.redisHandler = {};
    this.scanLimit = Constants.RedisScanLimit;
  }

  public refresh(profileName: string) {
    console.log('Refresh profile : ' + profileName);
    this._onDidChangeTreeData.fire();
  }

  public async getServerNodeInfo(connKey: string): Promise<string> {
    return await this.getRedisHandler(connKey).getInfo();
  }

  public async getNodeValue(key: string, connKey: string): Promise<string> {
    return await this.getRedisHandler(connKey).getValue(key);
  }

  public disconnectRedis(connKey: string) {
    this.getRedisHandler(connKey).disconnect();
    unset(this.redisHandler, connKey);
  }

  async getTreeItem(element: Entry): Promise<vscode.TreeItem> {
    if (!this.redisHandler || element.key === '') {
      return Promise.reject();
    }

    let treeItem = new vscode.TreeItem(
      element.key,
      element.type === ItemType.Server
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    let result = new Entry();
    result.key = element.key;
    if (element.type === ItemType.Server) {
      result.value = '#server#';
      result.serverName = element.key;
    } else {
      result.value = element.key;
      result.serverName = element.serverName;
    }

    result.dataType = typeof result.value;
    result.iconType = element.iconType;

    let iconFile = element.type === ItemType.Server ? "folder.svg" : "key.svg";

    treeItem.iconPath = {
      light: path.join(__filename, "..", "..", "resources", "light", iconFile),
      dark: path.join(__filename, "..", "..", "resources", "dark", iconFile)
    };

    treeItem.command = {
      command: Command.ReadNodeData,
      title: "Read Data",
      arguments: [result]
    };

    if (element.type === ItemType.Server) {
      treeItem.contextValue = "redisServerNode";
    }
    else {
      treeItem.contextValue = "redisNode";
    }
    return treeItem;
  }

  async getChildren(element: Entry | undefined): Promise<Entry[]> {
    let children: Entry[] = [];
    if (!element) {
      const configuration = vscode.workspace.getConfiguration();
      let xconfig: XplorerConfig = configuration.redisXplorer.config;
      if (xconfig.profiles && xconfig.profiles.length > 0) {
        xconfig.profiles.forEach((curValue) => {
          let node = new Entry();
          node.key = curValue.name;
          node.type = ItemType.Server;
          node.iconType = ItemType.Server;
          node.serverName = curValue.name;
          node.value = 'redis://:' + curValue.accessKey + '@' + curValue.host;
          node.dataType = typeof node.value;
          node.filter = curValue.filter || '*';
          children.push(node);
        });
      }
      return children;
    } else if (element.type === ItemType.Server) {
      try {
        const result = await this.getRedisHandler(element.serverName).getKeysV2(element.filter, this.scanLimit);
        return result.map((value: string) => {
          let node = new Entry();
          node.key = value;
          node.type = ItemType.Item;
          node.iconType = ItemType.Item;
          node.serverName = element.serverName;
          node.value = '';
          node.dataType = typeof node.value;
          return node;
        });
      } catch (e) {
        return children;
      }
    }

    return children;
  }

  async setRedisValue(key: string, value: any, connKey: string): Promise<boolean> {
    return await this.getRedisHandler(connKey).setValue(key, value);
  }

  setRedisScanLimit(limit: number) {
    this.scanLimit = limit;
  }

  deleteRedis(key: string, connKey: string) {
    this.getRedisHandler(connKey).delete(key);
  }

  flushAll(connKey: string) {
    this.getRedisHandler(connKey).flushAll();
  }

  getRedisHandler(connKey: string): RedisHandler {
    if (isNil(this.redisHandler[connKey])) {
      this.redisHandler[connKey] = new RedisHandler();
      const configuration = vscode.workspace.getConfiguration();
      let xconfig: XplorerConfig = configuration.redisXplorer.config;
      if (xconfig) {

        if (xconfig.scanLimit) { this.scanLimit = xconfig.scanLimit; }

        if (xconfig.profiles.length > 0) {
          let connectProfile: XplorerProfiles | undefined = find(xconfig.profiles, (o) => {
            return o.name === connKey;
          });

          if (connectProfile) {
            console.log("Redis connect to : ", connectProfile.host);

            let portNumber = connectProfile.port || Constants.RedisDefaultPortNo;
            let url = '';

            if (portNumber === Constants.RedisSslPortNo) {
              url += "rediss://";
              this.redisHandler[connKey].setTlsOn();
            } else {
              url += "redis://";
            }

            if (connectProfile.accessKey !== '') {
              url += ':' + connectProfile.accessKey + "@";
            }

            url += connectProfile.host + ":" + portNumber;
            this.redisHandler[connKey].connect(url).then(() => { this.refresh(connKey); });
          }
        }
      }
    }
    return this.redisHandler[connKey];
  }
}
