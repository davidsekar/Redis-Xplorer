import { ItemType } from ".";

export class Entry {
    key!: string;
    type!: ItemType;
    serverName!: string;
    value!: any;
    iconType!: ItemType;
    dataType!: string;
}