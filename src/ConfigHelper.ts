import * as vscode from "vscode";
import { XplorerConfig, XplorerProfiles } from "./model";
import { remove, isEmpty, isNil, each, find, cloneDeep } from "lodash";
import { Constants } from "./enum";

/**
 * Helper class to manage the vscode workspace configuration
 */
export class ConfigHelper {
    constructor() { }

    /**
     * Add or Update the XplorerProfile based on the profile name
     * @param profileName profile name to add or update
     * @param hostName hostname of the server to connect
     * @param password password to authenticate connection
     */
    public async addOrUpdateConfig(profileName: string, hostName: string, port: string, password: string, oldProfileName: string) {
        return new Promise(async resolve => {
            let xconfig: XplorerConfig = await this.getXConfig();
            let isUpdated = false;
            each(xconfig.profiles, (p) => {
                if (p.name === oldProfileName) {
                    p.name = profileName;
                    p.host = hostName;
                    p.accessKey = password;
                    p.port = port;
                    isUpdated = true;
                }
            });

            if (!isUpdated) {
                let profile = new XplorerProfiles(profileName, hostName, port, password);
                xconfig.profiles.push(profile);
            }
            await this.saveXplorerConfig(xconfig);
            resolve();
        });
    }

    /**
     * Deletes the profile object based on the provided servername 
     * @param serverName servername of the connection profile to delete
     */
    public async deleteXplorerConfig(serverName: string) {
        let xconfig: XplorerConfig = await this.getXConfig();
        let removedProfiles = remove(xconfig.profiles, (p) => { return p.name === serverName; });
        let deleted = false;
        if (removedProfiles.length > 0) {
            await this.saveXplorerConfig(xconfig).then(() => {
                console.log('Selected profile was removed successfully!');
            });
            deleted = true;
        } else {
            console.log('Nothing to delete!');
        }
        return deleted;
    }

    /**
     * Update the selected connection with the given filter text
     * @param serverName servername of the connection
     * @param filterText text pattern to use for filtering
     */
    public async updatefilterText(serverName: string, filterText: string) {
        let xconfig = await this.getXConfig();
        each(xconfig.profiles, (p) => {
            if (p.name === serverName) {
                p.filter = filterText;
            }
        });
        await this.saveXplorerConfig(xconfig).then(() => { console.log('filtered successfully!'); });
    }

    /**
     * Get the connection profile based on name
     * @param name name of the profile
     */
    public async getProfileByName(name: string) {
        let xconfig = await this.getXConfig();
        let profile = find(xconfig.profiles, (p) => {
            return p.name === name;
        });
        return profile;
    }

    /**
     * Save a new count of items to fetch from Redis server incrementally
     * @param limit Number of items to request in a scan (each request)
     */
    public async saveRedisScanLimit(limit: number) {
        let xconfig = await this.getXConfig();

        // Direct child object in Xplorer Config is readonly,
        // So do a deepcopy and then modify the value. 
        let clonedXConfig = cloneDeep(xconfig);
        clonedXConfig.scanLimit = limit;
        await this.saveXplorerConfig(clonedXConfig);
    }

    public async getRedisScanLimit() {
        let xconfig = await this.getXConfig();
        return xconfig.scanLimit || Constants.RedisScanLimit;
    }

    /**
     * Save configuration to Vscode settings file 
     * @param config configuration to persist
     */
    private async saveXplorerConfig(config: XplorerConfig) {
        await vscode.workspace.getConfiguration().update(
            "redisXplorer.config",
            config,
            vscode.ConfigurationTarget.Workspace
        ).then(() => {
            console.log('Configuration saved successfully!');
        }, (reason) => {
            console.log(reason);
        });
    }

    /**
     * Get the Xplorer configuration saved in the Vscode workspace settings
     */
    private async getXConfig() {
        const configuration = vscode.workspace.getConfiguration();
        let xconfig: XplorerConfig = configuration.redisXplorer.config;
        if (isNil(xconfig) || isEmpty(xconfig.profiles)) {
            xconfig = new XplorerConfig();
            xconfig.profiles = [];
        }
        return xconfig;
    }
}
