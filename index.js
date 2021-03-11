const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");

const ping = require('ping');
const fs = require('fs');

client.on("ready", () => {

    console.log("Ping bot ready (Dev by flav#2200)");

    client.user.setActivity("by flav#2200", {type: "WATCHING"});

    setInterval(() => {
        fs.readFile('config.json', 'utf8', async function (err, data) {

            const obj = JSON.parse(data);

            const ips = obj.ips;
            if (ips.lenght === 0) return console.log("No ip in config");

            const guild = client.guilds.cache.get(obj.guild_id);


            if (guild === undefined) return console.log("Invalide guild id");

            const channel = guild.channels?.cache.get(obj.guild_channel_id);

            if (channel === undefined) return console.log("Invalide channel id");


            let msg = null;

            try {
                msg = await channel.messages.fetch(obj.bot_message_id);
            } catch (error) {
                msg = null;
            }

            if (msg === undefined) return console.log("Invalide message id");

            const embed = new Discord.MessageEmbed()
            let desc = "";

            for (const ip of ips) {

                const res = await ping.promise.probe(ip, {
                    timeout: 10
                });

                desc += res.alive ? `${ip} :white_check_mark: ${Math.round(res.avg)} ms\n` : `${ip} :x: ${Math.round(res.avg)} ms\n`;

            }

            embed.setTitle("Status des services")
            embed.setDescription(desc.length === 0 ? "no ip " : desc);

            msg.edit("", embed);

        })

    }, 10000)

})

client.on("message", async message => {
    if (message.content.startsWith(config.prefix + "embed")) {

        fs.readFile('config.json', 'utf8', function (err, data) {

            const obj = JSON.parse(data);

            message.channel.send("this message will be edited automaticaly !").then(async m => {

                obj.guild_id = m.guild.id;
                obj.guild_channel_id = m.channel.id;
                obj.bot_message_id = m.id;

                fs.writeFile('config.json', JSON.stringify(obj), function (err, res) {
                    if (err) console.log('error', err);
                });
            })
        })
    }
})

client.login(config.token);