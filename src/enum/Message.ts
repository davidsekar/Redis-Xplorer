export enum Message {
    TitleRedisXplorer = 'Redis Xplorer',

    PromptNewRedisKey = 'Provide a new key ',
    PromptRedisKeyFilterPattern = 'Provide a pattern to filter redis keys e.g., \'abc*\' , \'*\' ',
    PromptDisplayName = 'Display Name ',
    PromptHostserver = 'Host server ',
    PromptPortNumber = 'Port Number ',
    PromptPassword = 'Password ',

    WarnProfileDeletion = 'Do you really want to delete the selected profile - ',
    WarnDeleteAll = 'Do you REALLY want to delete all items ? ',

    InfoDisplayName = 'Please provide a display name ',
    InfoHostServer = 'Please provide Redis host server name ',
    InfoPortNumber = 'Please provide port number ',
    InfoInvalidPortNumber = 'Please provide a valid number ',
    InfoRedisPassword = 'Please provide Redis password ',
    InfoNoData = 'No Data',

    PlaceholderDisplayName = 'enter a nick name',
    PlaceholderHostserver = 'server.redis.cache.windows.net',
    PlaceholderPortNumber = 'e.g., SSL: 6380; Non-SSL:6379; Or any custom port number',
    PlaceholderPassword = 'URL-Safe Hashed password',

    ProgressInitiate = 'Initiate',
    ProgressConnectionInfo = 'Connection info.',
    ProgressGetValueFor = 'Get value for ',
    ProgressWriteToFile = 'Write to file',
    ProgressDone = 'Done'
}
