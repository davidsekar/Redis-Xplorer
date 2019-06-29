export class XplorerProfiles {
    public name: string;
    public host: string;
    public accessKey: string;
    public filter: string;
    public port: string;

    constructor(profileName: string, hostName: string, port: string, password: string) {
        this.name = profileName;
        this.host = hostName;
        this.accessKey = password;
        this.filter = '*';
        this.port = port;
    }
}
