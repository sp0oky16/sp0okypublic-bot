const Discord = require('discord.js');
const bot = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"]});
const fs = require('fs');
const db = require('quick.db');
const { brotliCompress } = require('zlib');

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

    if(err) console.log(err)

    let jsfile = files.filter(f => f.split(".").pop() === "js") 
    if(jsfile.length <= 0) {
         return console.log("[LOGS] Couldn't Find Commands!");
    }

    jsfile.forEach((f, i) => {
        let pull = require(`./commands/${f}`);
        bot.commands.set(pull.config.name, pull);  
        pull.config.aliases.forEach(alias => {
            bot.aliases.set(alias, pull.config.name)
        });
    });
});

bot.on("ready", async () => {
    console.log(`The Bot is in ${bot.guilds.cache.size} servers with ${bot.users.cache.size} users`);
});

bot.on("message", async message => {
    if(message.author.bot || message.channel.type === "dm") return;
    let prefix = '>'
    if (!message.content.toLowerCase().startsWith(prefix)) return;
        let messageArray = message.content.split(" ");
        let cmd = messageArray[0];
        let args = messageArray.slice(1);
        let commandfile = bot.commands.get(cmd.slice(prefix.length)) || bot.commands.get(bot.aliases.get(cmd.slice(prefix.length)))
        if(commandfile) commandfile.run(bot,message,args)
});

bot.on('guildMemberAdd', async (member) => {
    const has = db.has(`welcomechannel_${member.guild.id}`)
    if (has === true) {
        const embed = new Discord.MessageEmbed()
        .setTitle('Welcome')
        .setDescription(`Welcome ${member} to ${member.guild.name} Don't Forget to <#757842342534316042> And Read <#757983786683072602> To Verify`)
        .setAuthor(member.user.username, member.user.displayAvatarURL())
        .setColor('53380')
        .setImage('https://gamespot1.cbsistatic.com/uploads/original/1587/15875866/3738333-among.jpg')
      
        const chid = db.get(`welcomechannel_${member.guild.id}`)
       const ch = member.guild.channels.cache.find(c => c.id === chid)
       ch.send(embed)
    } else return;
});

bot.login(process.env.TOKEN)
