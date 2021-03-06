export enum Command {
    // Common
    ReadNodeData = "redisXplorer.readData",
    ConfigureScanLimit = "config.commands.redisServer.scanLimit",

    // Server Node
    AddRedisConnection = "config.commands.redisServer",
    EditRedisConnection = "config.commands.redisServer.edit",
    DeleteRedisConnection = "config.commands.redisServer.delServerItem",
    RefreshServer = "config.commands.redisServer.refreshServerItem",
    FilterServerByPattern = "config.commands.redisServer.filterServerItem",

    // Individual Node/Redis KVPair
    DeleteAllKeys = "config.commands.redisServer.delAllItems",
    AddRedisKey = "config.commands.redisServer.addItem",
    DeleteRedisKey = "config.commands.redisServer.delItem",

    // Button Commands
    CommandOk = 'OK',
    CommandDeleteAll = 'Delete All'
}
