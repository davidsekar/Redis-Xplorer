import * as vscode from "vscode";
import RedisHandler from "./RedisHandler";
import * as path from "path";
import { XplorerProfiles, XplorerConfig } from "./model";

enum ItemType {
  Server = 0,
  Item = 1,
  ItemSelected = 2
}

interface Entry {
  key: string;
  type: ItemType;
}

export class RedisProvider implements vscode.TreeDataProvider<Entry> {
  private redisHandler: RedisHandler;
  private _onDidChangeTreeData: vscode.EventEmitter<
    any
  > = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData
    .event;

  constructor() {
    this.redisHandler = new RedisHandler();
    this.connectRedis();
  }

  public refresh() {
    this._onDidChangeTreeData.fire();
  }

  public async getServerNodeInfo(): Promise<string> {
    return await this.redisHandler.getInfo();
  }

  public async getNodeValue(key: string): Promise<string> {
    return await this.redisHandler.getValue(key);
  }

  async connectRedis() {
    const configuration = vscode.workspace.getConfiguration();
    let xconfig : XplorerConfig = configuration.redisXplorer.config;
    if (xconfig && xconfig.profiles.length > 0) {
      let connectProfile: XplorerProfiles = xconfig.profiles[0];
      console.log("Redis connect to : ", connectProfile.host);
      let url = "redis://:" + connectProfile.accessKey + "@" + connectProfile.host;
      this.redisHandler
        .connect(url)
        .then(() => {
          this.refresh();
        });
    }
  }

  disconnectRedis() {
    this.redisHandler.disconnect();
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

    let result;
    if (element.type === ItemType.Server) {
      // result = await this.redisHandler.getInfo();
      result = '#server#';
    } else {
      // result = await this.redisHandler.getValue(element.key);
      result = element.key;
    }

    treeItem.iconPath = {
      light: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "light",
        element.type === ItemType.Server
          ? "baseline_device_hub_black_18dp.png"
          : "baseline_web_asset_black_18dp.png"
      ),
      dark: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "dark",
        element.type === ItemType.Server
          ? "baseline_device_hub_white_18dp.png"
          : "baseline_web_asset_white_18dp.png"
      )
    };

    treeItem.command = {
      command: "redisXplorer.readData",
      title: "Read Data",
      arguments: [
        {
          key: element.key,
          value: result,
          type: typeof result,
          iconType: element.type
        }
      ]
    };

    if (element.type !== ItemType.Server) {
      treeItem.contextValue = "redisNode";
    }
    return treeItem;
  }

  async getChildren(element: Entry | undefined): Promise<Entry[]> {
    if (!element) {
      const configuration = vscode.workspace.getConfiguration();
      let xconfig: XplorerConfig = configuration.redisXplorer.config;
      return [{ key: xconfig.profiles[0].name, type: ItemType.Server }];
    } else if (element.type === ItemType.Server) {
      try {
        const result = await this.redisHandler.getKeys();
        return result.map((value: string) => {
          return { key: value, type: ItemType.Item };
        });
      } catch (e) {
        return [];
      }
    }

    return [];
  }

  setRedisValue(key: string, value: string) {
    this.redisHandler.setValue(key, value);
  }

  setRedisObject(key: string, value: any) {
    this.redisHandler.setObject(key, value);
  }

  deleteRedis(key: string) {
    this.redisHandler.delete(key);
  }

  flushAll() {
    this.redisHandler.flushAll();
  }
}
