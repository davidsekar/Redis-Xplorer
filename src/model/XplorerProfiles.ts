export class XplorerProfiles {
    public name: string;
    public host: string;
    public accessKey: string;
    public filter: string;

    constructor(profileName: string, hostName: string, password: string) {
        this.name = profileName;
        this.host = hostName;
        this.accessKey = password;
        this.filter = '*';
    }
}
