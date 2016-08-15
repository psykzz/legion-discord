'use strict';
var Discord = require("discord.js"),
    CronJob = require('cron').CronJob,
    time = require('time'),
    fs = require("fs"),
    moment = require('moment'),
    Sugar = require('sugar'),
    TIMEZONE = "Europe/London";

// default momenttimezone
moment.tz.setDefault(TIMEZONE);


var client = new Discord.Client(),
    invasionFrequencyHours = 4,
    _cronFrequency = "0 */4 * * *";


var raids = new Array()

function betterSplit(message, token) {
    token = token || " "
    var i = message.indexOf(token);
    return [message.slice(0, i), message.slice(i+token.length)];
}

function sendToAll(message) {
    client.servers.forEach(function(server) {
        client.servers.get("name", server).channels.some(function(channel) {
            if (channel.position !== 0 || channel.type !== 'text') {
                return false;
            }
            client.sendMessage(channel, message);
            return true;
        })
    })
}

function timeUntilInvasion() {
    var current_time = new time.Date();
        current_time.setTimezone(TIMEZONE);

    var hour = current_time.getHours(),
        minute = current_time.getMinutes(),
        hour_left = ((Math.floor(hour/invasionFrequencyHours)+1)*invasionFrequencyHours)-hour-(minute>0?1:0),
        minute_left = 60 - (minute);

    return [hour_left, minute_left];
}

client.on('message', function(message) {
    if (message.channel.isPrivate) {
            console.log(`(Private) ${message.author.name}: ${message.content}`);
    } else {
            console.log(`(${message.server.name} / ${message.channel.name}) ${message.author.name}: ${message.content}`);
    }
});

client.on("message", function(message) {
    if(message.content.indexOf("!help") === 0) {
        return client.reply(message, "Legion bot - Created by PsyKzz\n" +
            "Commands:\n" + 
            "!invasion - How long until the next invasion\n" + 
            "!raids - Show upcoming raids with >> `[id] <desc> on <date>`\n" + 
            "!raid <desc> on <date> - Create a new raid with <desc> on <date>\n" + 
            "!killraid <id> - Delete  raid by its <id> (use !raids for help)\n" + 
            "!help - This help text");
    }

    if(message.content.indexOf("!time") === 0) {
        message.reply(`it's ${moment().format("ddd Do "/*MMM*/+"@ HH:mm")}`)
    }

    // if(message.content.indexOf("!doit") === 0) {
    //     message.reply(`alright, shitting in @Alljump's bed`)
    // }

    if(message.content.indexOf("!raid ") === 0) {
        var msg = betterSplit(message.content)[1]

        var description = betterSplit(msg, " on ")[0]
        var timing = betterSplit(msg, " on ")[1]

        // Going back 10 times see if we can get a date
        var count = 0,
            eventDate,
            currentWord = '';
        timing.split(" ").reverse().every(function(word) {
            currentWord = `${word} ${currentWord}`.trim() 
            var _eventDate = moment(Sugar.Date.create(currentWord, {future: true})).utcOffset(-60)
            if (_eventDate) {
                eventDate = _eventDate;
            }
            if (eventDate && !_eventDate) {
                return false;
            }
            return (count++ < 10); // stop at larger count
        })

        message.reply(`Creating new raid: ${description} on ${moment(eventDate).utc().format("ddd Do "/*MMM*/+"@ HH:mm")}`);

        raids[Object.keys(raids).length] = {
            time: eventDate,
            desc: description
        }
    }

    if(message.content.indexOf("!raids") === 0) {
        // Cleanse the raids of old shit
        var now = moment();
        raids.forEach(function(raid, idx) {
            if (raid['time'] < now) {
                // Old raid
                console.log(`Pruning old raid: #${idx} ~ ${raid['desc']} on ${moment(raid['time']).utc().format("ddd Do "/*MMM*/+"@ HH:mm")}`)
                delete raids[idx]
                return;
            }
        })

        // Check for any raids left
        if (!Object.keys(raids).length) {
            return client.reply(message, "no upcoming raids");
        }

        // Alert each raid to channel
        var msg = "**Upcoming raids**\n"
        raids.forEach(function(raid, idx) {
            msg += ` - #${idx} ~ ${raid['desc']} on **${moment(raid['time']).utc().format("ddd Do "/*MMM*/+"@ HH:mm")}**\n`  
        })
        client.reply(message, msg);
    }

    if(message.content.indexOf("!killraid ") === 0) {
        if (!Object.keys(raids).length) {
            return client.reply(message, "no upcoming raids");
        }

        var raidId = betterSplit(message.content)[1]

        if (!raids.hasOwnProperty(raidId)) {
            return client.reply(message, "invalid raid");
        }

        delete raids[raidId]

        client.reply(message, "raid deleted");
    }

    if(message.content.indexOf("!invasion") === 0) {
        var time_until = timeUntilInvasion(),
        hour_left = time_until[0],
        minute_left = time_until[1];

        var text_hour = ((hour_left != 1) ? "hours" : "hour"),
        text_minute = ((minute_left != 1) ? "minutes" : "minute");

        return client.reply(message, `next Invasion starts in ${hour_left} ${text_hour} ${minute_left} ${text_minute}`);
    }
});

client.loginWithToken(process.env.DISCORD_TOKEN, function (error, token) {
    if (error) {
        return console.log('There was an error logging in: ' + error);
    } 

    // Success
    console.log('Successfully logged in');
    new CronJob(_cronFrequency, function() {
        sendToAll("@here Invasion up!");
    }, null, true, TIMEZONE)
});
