const { GatewayIntentBits, Client, ActivityType, EmbedBuilder } = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
    ]
});
const config = require("./config.json");

const ping = require('ping');
const fs = require('fs');

client.on("ready", () => {

    console.log("Ping bot ready (Dev by flav-code#2200)");

    client.user.setActivity("by flav-code#2200", { type: ActivityType.Watching });

    setInterval(() => {
        fs.readFile('config.json', 'utf8', async function (err, data) {

            const obj = JSON.parse(data);

            const services = obj.ips;
            if (services.lenght === 0) return console.log("No ip in config");

            const guild = client.guilds.cache.get(obj.guild_id) || await client.guilds.fetch(obj.guild_id);


            if (!guild) return console.log("Invalide guild id");

            const channel = guild.channels?.cache.get(obj.guild_channel_id) || await client.channels.fetch(obj.guild_channel_id);

            if (!channel) return console.log("Invalide channel id");


            let msg = null;

            try {
                if (obj.bot_message_id.length)
                    msg = await channel.messages.fetch(obj.bot_message_id);
            } catch (error) {
                msg = null;
            }

            if (!msg) return console.log("Invalide message id");

            const embed = new EmbedBuilder()
            let desc = "";

            for (const service of services) {

                const res = await ping.promise.probe(service.ip, {
                    timeout: 10
                });
                desc += res.alive ? `${service.name} :white_check_mark: \`${Math.round(res.avg)}ms\`\n` : `${service.name} :x:\n`;

            }

            embed
                .setTitle("Status des services")
                .setDescription(desc.length === 0 ? "no ip " : desc);

            msg.edit({ content: null, embeds: [embed] });


        })

    }, 10000)

})

client.on("messageCreate", (message) => {
    if (message.content.startsWith(`${config.prefix}embed`)) {

        fs.readFile('config.json', 'utf8', function (err, data) {

            const obj = JSON.parse(data);

            message.channel.send("this message will be edited automaticaly !").then(m => {

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
