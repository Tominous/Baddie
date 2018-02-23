var Discord = require("discord.js");
var client = new Discord.Client();
var fs = require("fs");

client.on("ready", () => {
    client.user.setGame("QUIRK")
    console.log("Baddie 2 is ready!");
});
