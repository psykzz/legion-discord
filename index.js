var Discord = require("discord.js"),
    CronJob = require('cron').CronJob,
    time = require('time'),
    TIMEZONE = "Europe/France";

var client = new Discord.Client(),
    invasionFrequencyHours = 4,
    _cronFrequency = "0 */4 * * *";


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
    var current_time = new Date(),
        current_time.setTimezone(TIMEZONE),
        hour = current_time.getHours(),
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
        return client.reply(message, "Legion Timer bot - Created by PsyKzz\n" +
            "Commands:\n" + 
            "!invasion - How long until the next invasion\n" + 
            "!help - This help text");
    }

    if(message.content.indexOf("!invasion") === 0) {
        var time_until = timeUntilInvasion();
        var hour_left = time_until[0];
        var minute_left = time_until[1];

        var text_hour = ((hour_left != 1) ? "hours" : "hour");
        var text_minute = ((minute_left != 1) ? "minutes" : "minute");

        return  client.reply(message, `next Invasion starts in ${hour_left} ${text_hour} ${minute_left} ${text_minute}`);
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