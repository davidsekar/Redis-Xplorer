# Redis Xplorer

Redis Xplorer is a visual studio code extension that allows you to

- Create/Delete multiple redis connection profile
- See redis server inforamtion
- Read and Edit redis cache items
- Filter cache items list using text pattern e.g., `example*`. So that, you can view and work on keys that you need.
- Modify the cache values and save.

## Setup connection profile

1. Select `Redis Xplorer : Add new redis server connection profile` from the command palette.

2. Provide a name for the connection profile.

3. Provide a host server name for the connection

4. Provide an access key for authentication.

5. On completion, this new redis connection will be added to the Redis Xplorer dock window.

![Setup connection profile](images/create-new-connection-profile.gif)

## Action available on connection profile

1. Add a new redis item under selected profile

2. Edit the connection profile

3. Delete the selected profile

4. Filter redis keys using pattern

5. Flush / delete all redis keys under a profile

6. Refresh or reload all keys

![Profile actions](images/profile-actions.jpg)

## Action available on redis item

1. On selecting a redis item, the value is loaded in the text pane. The contents can be edited and saved using `save (ctrl + s)` command

2. Individual redis item can be deleted by clicking on the trash icon that appears while hovering on item.

![Redis item actions](images/delete-redis-item.jpg)

## Found a bug or have a suggestion

In case, you have a suggestion or feature request. Kindly raise it as an issue under following [GitHub project](https://github.com/davidsekar/Redis-Xplorer)
