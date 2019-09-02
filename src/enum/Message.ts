export enum Message {
    TitleRedisXplorer = 'Redis Xplorer',

    PromptNewRedisKey = 'Provide a new key ',
    PromptRedisKeyFilterPattern = 'Provide a pattern to filter redis keys e.g., \'abc*\' , \'*\' ',
    PromptDisplayName = 'Display Name ',
    PromptHostserver = 'Host server ',
    PromptPortNumber = 'Port Number ',
    PromptPassword = 'Password ',
    PromptRedisScanLimit = 'Number of items to scan/stream on each request',

    WarnProfileDeletion = 'Do you really want to delete the selected profile - ',
    WarnDeleteAll = 'Do you REALLY want to delete all items ? ',

    InfoDisplayName = 'Please provide a display name ',
    InfoHostServer = 'Please provide Redis host server name ',
    InfoPortNumber = 'Please provide port number ',
    InfoInvalidPortNumber = 'Please provide a valid port number ',
    InfoInvalidScanLimit = 'Please provide a valid number',
    InfoRedisPassword = 'Connect to Redis server without password',
    InfoNoData = 'No Data',
    InfoProfileNotSaved = 'Profile not saved',

    PlaceholderDisplayName = 'enter a nick name',
    PlaceholderHostserver = 'server.redis.cache.windows.net',
    PlaceholderPortNumber = 'e.g., SSL: 6380; Non-SSL:6379; Or any custom port number',
    PlaceholderPassword = 'No Password (Leave it empty)',
    PlaceholderRedisScanLimit = 'Specifying a large number causes performance issue in production (Default: 200)',

    ProgressInitiate = 'Initiate',
    ProgressConnectionInfo = 'Connection info.',
    ProgressGetValueFor = 'Get value for ',
    ProgressWriteToFile = 'Write to file',
    ProgressDone = 'Done'
}
