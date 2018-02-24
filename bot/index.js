var Discord = require("discord.js");
var client = new Discord.Client();
var fs = require("fs");
var config = require("./config.json")

client.on("ready", () => {
    client.user.setGame(config.games[Math.floor(Math.random() * config.games.length)]);
    console.log("Baddie 2 is ready!");
});

client.on("message", message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;
    let command = message.content.split(" ")[0];
    command = command.slice(config.prefix.length);
    let args = message.content.split(" ").slice(1);

    //user section
    var cache = [];
    if (command == "add") {
        if (args[0] == "Streamer" || args[0] == "Mobile" || args[0] == "Steam") {
            var role = message.guild.roles.find("name", args[0]);
            message.guild.member(message.author).addRole(role);
            message.delete();
            message.reply("Role added: ``"+args[0]+"``");
            if (args[0] == "Steam") {
                var steam = require("../json/steam_users.json");
                steam.users.push({
                    name: message.author.username+"#"+message.author.discriminator,
                    joined_on: `${message.createdAt.getMonth()+1}/${message.createdAt.getDate()}/${message.createdAt.getFullYear()}`
                })
                fs.writeFile("../json/steam_users.json", JSON.stringify(steam, function(key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return;
                        }
                        // Store value in our collection
                        cache.push(value);
                    }
                    return value;
                }), (err) => {
                    if (err) console.error(err);
                })
            } else if (args[0] == "Mobile") {
                var mobile = require("../json/mobile_users.json");
                mobile.users.push({
                    name: message.author.username+"#"+message.author.discriminator,
                    joined_on: `${message.createdAt.getMonth()+1}/${message.createdAt.getDate()}/${message.createdAt.getFullYear()}`
                })
                fs.writeFile("../json/mobile_users.json", JSON.stringify(mobile, function(key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return;
                        }
                        // Store value in our collection
                        cache.push(value);
                    }
                    return value;
                }), (err) => {
                    if (err) console.error(err);
                })
            }
        } else {
            message.reply("Invalid role. Use either ``Mobile``, ``Steam``, or ``Streamer``")
        }
    }
    if (command == "remove") {
        if (args[0] == "Streamer" || args[0] == "Mobile" || args[0] == "Steam") {
            var role = message.guild.roles.find("name", args[0]);
            message.guild.member(message.author).removeRole(role);
            message.delete();
            message.reply("Role removed: ``"+args[0]+"``");
        } else {
            message.reply("Invalid role. Use either ``Mobile``, ``Steam``, or ``Streamer``")
        }
    }

    //moderator section
    if (!message.guild.member(message.author).hasPermission("KICK_MEMBERS")) return message.reply("You do not have the minimum permissions required: ``KICK_MEMBERS``");
    if (command == "kick") {
        let timestamp = message.createdAt;
        if (!message.guild.member(message.author).hasPermission(0x00000002)) {
            return message.reply("You must have the permission ``KICK_MEMBERS`` to perform that action.")
        }
        if (message.mentions.users.size === 0) {
            return message.reply("Please mention a user to kick.");
        }
        if (!message.guild.member(client.user).hasPermission(0x00000002)) {
            return message.reply("I don't have the permisson ``KICK_MEMBERS``.")
        }
        let kickable = message.guild.member(message.mentions.users.first());
        if (!kickable) {
            return message.reply("Invalid user.");
        }
        let mess1 = message.content.replace("q!kick", "");
        let reason = mess1.replace(args[0], "");
        let kick = new Discord.RichEmbed()
        .setTitle(message.mentions.users.first().username+"#"+message.mentions.users.first().discriminator)
        .setDescription(`Kicked on ${new Date(timestamp)}`)
        .addField("Responsible Mod", message.author.username+"#"+message.author.discriminator, true)
        .addField("Reason", reason, true)
        .setThumbnail(message.mentions.users.first().avatarURL)
        .setColor("ORANGE")
        message.mentions.users.first().send({ embed: kick });
        var channel = message.guild.channels.find("name", "mod-logs").id;
        console.log(channel);
        client.channels.find("id", channel).send({ embed: kick });
        kickable.kick();
        message.reply("Success.");
        var obj = {
            name: kickable.user.username+"#"+kickable.user.discriminator,
            reason: reason,
            kicked_by: message.author.username+"#"+message.author.discriminator,
            kicked_on: `${message.createdAt.getMonth()+1}/${message.createdAt.getDate()}/${message.createdAt.getFullYear()}`
        }
        var kicks = require("../json/kicks.json");
        kicks.kicks.push(obj)
        fs.writeFile("../json/kicks.json", JSON.stringify(kicks, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        }), (err) => {
            if (err) console.error(err);
        })
    }
    if (command == "ban") {
        let timestamp = message.createdAt;
        if (!message.guild.member(message.author).hasPermission(0x00000004)) {
            return message.reply("You must have the permission ``BAN_MEMBERS`` to perform that action.")
        }
        if (message.mentions.users.size === 0) {
            return message.reply("Please mention a user to ban.");
        }
        if (!message.guild.member(client.user).hasPermission(0x00000004)) {
            return message.reply("I don't have the permisson ``BAN_MEMBERS``.")
        }
        let bannable = message.guild.member(message.mentions.users.first());
        if (!bannable) {
            return message.reply("Invalid user.");
        }
        let mess1 = message.content.replace("q!ban", "");
        let reason = mess1.replace(args[0], "");
        let ban = new Discord.RichEmbed()
        .setTitle(message.mentions.users.first().username+"#"+message.mentions.users.first().discriminator)
        .setDescription(`Banned on ${new Date(timestamp)}`)
        .addField("Responsible Mod", message.author.username+"#"+message.author.discriminator, true)
        .addField("Reason", reason, true)
        .setThumbnail(message.mentions.users.first().avatarURL)
        .setColor("DARK_RED")
        message.mentions.users.first().send({ embed: ban });
        var channel = message.guild.channels.find("name", "mod-logs").id;
        console.log(channel);
        client.channels.find("id", channel).send({ embed: ban });
        bannable.ban();
        message.reply("Success.");
        var obj = {
            name: bannable.user.username+"#"+bannable.user.discriminator,
            reason: reason,
            banned_by: message.author.username+"#"+message.author.discriminator,
            banned_on: `${message.createdAt.getMonth()+1}/${message.createdAt.getDate()}/${message.createdAt.getFullYear()}`
        }
        var bans = require("../json/bans.json");
        bans.bans.push(obj)
        fs.writeFile("../json/bans.json", JSON.stringify(bans, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        }), (err) => {
            if (err) console.error(err);
        })
    }
    if (command == "warn") {
        let timestamp = message.createdAt;
        if (!message.guild.member(message.author).hasPermission(0x00000002)) {
            message.reply("No permission.");
            return;
        }
        if (message.mentions.users.size === 0) {
            message.reply("Please mention a user to warn.");
            return;
        }
        if (!message.guild.member(client.user).hasPermission(0x00000002)) {
            message.reply("I don't have the permissons.");
            return;
        }
        let kickable = message.guild.member(message.mentions.users.first());
        if (!kickable) {
            message.reply("Invalid user.");
            return;
        }
        let mess1 = message.content.replace("%warn", "");
        let reason = mess1.replace(args[0], "");
        let warn = new Discord.RichEmbed()
        .setTitle(message.mentions.users.first().username+"#"+message.mentions.users.first().discriminator)
        .setDescription(`Warned on ${new Date(timestamp)}`)
        .addField("Responsible Mod", message.author.username+"#"+message.author.discriminator, true)
        .addField("Reason", reason, true)
        .setThumbnail(message.mentions.users.first().avatarURL)
        .setColor("GOLD")
        message.mentions.users.first().send({ embed: warn });
        var channel = message.guild.channels.find("name", "mod-logs").id;
        console.log(channel);
        client.channels.find("id", channel).send({ embed: warn });
        message.reply("Success.");
        var obj = {
            name: bannable.user.username+"#"+bannable.user.discriminator,
            reason: reason,
            warned_by: message.author.username+"#"+message.author.discriminator,
            warned: `${message.createdAt.getMonth()+1}/${message.createdAt.getDate()}/${message.createdAt.getFullYear()}`
        }
        var warns = require("../json/warns.json");
        warns.warns.push(obj)
        fs.writeFile("../json/bans.json", JSON.stringify(bans, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        }), (err) => {
            if (err) console.error(err);
        })
    }
});

client.login(config.token);
