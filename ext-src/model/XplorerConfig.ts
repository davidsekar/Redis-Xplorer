import { XplorerProfiles } from "../model";
import { Constants } from "../enum";

export class XplorerConfig {
    public profiles: XplorerProfiles[];
    public scanLimit: number;
    constructor() {
        this.profiles = [];
        this.scanLimit = Constants.RedisScanLimit;
    }
}
