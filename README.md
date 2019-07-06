# Redis Xplorer

Redis Xplorer is a Visual Studio Code extension that allows you to

- Create/Edit/Delete multiple redis connection profiles

- View Redis server connection information

- Read, edit and save redis values

- Filter & focus on required cache items using text pattern e.g., `example*`.

## Setup a new connection profile

1. Select `Redis Xplorer : Add new redis server connection profile` from the command palette.

2. Provide a name for the connection profile.

3. Provide a host server name for the connection

4. Next, default port number (`:6379`) is shown. You can modify that to 6380 for SSL support.

5. Provide an access key for authentication.

6. On completion, this new redis connection will be added to the Redis Xplorer dock window.

![Setup connection profile](images/create-new-connection-profile.gif)

## Action available on Connection Profile

1. Add a new redis item under selected profile

2. Edit the connection profile

3. Delete the selected profile

4. Filter redis keys using pattern

5. Flush / delete all redis keys under a profile

6. Refresh or reload all keys

![Profile actions](images/profile-actions.jpg)

## Action available on Redis item

1. On selecting a redis item, the value is loaded in the text pane. The contents can be edited and saved using `save (ctrl + s)` command

2. Individual redis item can be deleted by clicking on the trash icon that appears while hovering on item.

![Redis item actions](images/delete-redis-item.jpg)

## Configuration

This extension saves all your configured profiles under currently opened folder/workspace.

i.e., using `.vscode/settings.json`.

### Schema

~~~~xml
{
    ...,
    "redisXplorer.config": {
        "profiles": [
            {
                "name": "My Redis",
                "host": "server.redis.cache.windows.net",
                "accessKey": "ABCDEFGHIJKLMNOPQRSTUVWXYZAAABAC=",
                "filter": "*",
                "port": "6379"
            }
        ]
    }
}
~~~~

## Support

Do you have

- Any suggestion or
- Found a crazy Bug or
- Need a new feature

Kindly raise it as an issue [over here](https://github.com/davidsekar/Redis-Xplorer/issues).

Last but not least, I'll try to address all your support queries and issues as early as possible. If you wish to thank me or support this extension!

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.me/DavidChelliah)

Thanks for using this extension.
