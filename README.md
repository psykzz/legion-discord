# legion-discord

Will alert on the next legion invasion, automatically and on command

### To add this bot to your discord server, **[click here](https://discordapp.com/oauth2/authorize?client_id=214431597347209216&scope=bot&permissions=0)**

![](http://i.imgur.com/SI1gG4a.png)

> Discord bot configuration, bot token, and server management is required to complete the installation of this bot.

## Running
* `docker run -d --name legion-discord -e DISCORD_TOKEN=<TOKEN> psykzz/legion-discord`

## Updating & restarting
* `docker pull psykzz/legion-discord`
* `docker rm -f legion-discord`
* `docker run -d --name legion-discord -e DISCORD_TOKEN=<TOKEN> psykzz/legion-discord`

## Stopping
* `docker rm -f legion-discord`


