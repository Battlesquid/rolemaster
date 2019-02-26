const Discord = require('discord.js');
const bot = new Discord.Client();
const events = {
  MESSAGE_REACTION_ADD: 'messageReactionAdd',
  MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};
const prefix = ']';


const cmds = {
  addrole(args) {
    const guild = args[0].guild;
    const roles = guild.roles;
    const emojis = guild.emojis;

    args[0].send('What emoji do you want users to react to?');
    const emojicollector = new Discord.MessageCollector(args[0], m => (/[^\u0000-\u00ff]/.test(m) || m.content.match(/<(:(\w+):(\d+))>/)) && !m.author.bot);
    let emoji, ch, role;
    emojicollector.on('collect', (item, col) => {
      console.log("FOUND ITEM" + item);
      col.stop();
      emoji = item.toString();
      args[0].send('What channel do you want this message to show up in?');
      const channelcollector = new Discord.MessageCollector(args[0], m => m.content.match(/(<#(\d+)>)/gi) && !m.author.bot);
      channelcollector.on('collect', (item, col) => {
        console.log("FOUND ITEM: " + item);
        col.stop();
        ch = item.toString();
              console.log(ch);
        args[0].send('What role would you like this message to grant?');
        const rolecollector = new Discord.MessageCollector(args[0], m => args[0].guild.roles.find(r => r.name === m.content) && !m.author.bot);
        rolecollector.on('collect', (item, col) => {
          console.log('FOUND ITEM: ' + item);
          col.stop();
          role = item;
          
          const cha = ch.match(/(<#(\d+)>)/)[2];
          console.log(cha);
          const chan = args[0].guild.channels.find(c => c.id === cha);
          chan.send(`~ React to ${emoji} to get the \`${role}\` role!`)
            .then(msg => {
            console.log(emoji);
            msg.react(/[^\u0000-\u00ff]/.test(emoji) ? emoji.toString() : emoji.match(/<(:(\w+):(\d+))>/)[3]);
          });
        });
      });
    });
  },
  invite(args) {
    args[0].send(`You can invite me via this link: ${"https://discordapp.com/api/oauth2/authorize?client_id=549398959970320385&permissions=1074089024&scope=bot"}`);
  }
}

bot.on('ready', () => {
	bot.user.setStatus('online')
	bot.user.setPresence({
		game: {
			name: bot.guilds.array().length + ' servers | UNDER MAINTENANCE', 
      type: "WATCHING"
		}
	});
});

bot.on('raw', async event => {
  if (!events.hasOwnProperty(event.t)) return;
  const {
    d: data
  } = event;
  const user = bot.users.get(data.user_id);
  const channel = bot.channels.get(data.channel_id) || await user.createDM();
  if (channel.messages.has(data.message_id)) return;
  const message = await channel.fetchMessage(data.message_id);
  const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
  const reaction = message.reactions.get(emojiKey);
  bot.emit(events[event.t], reaction, user);
});

bot.on('messageReactionAdd', (reaction, user) => {
  const msg = reaction.message;
  const roles = msg.guild.roles;
  // console.log(msg.content);
  if (msg.content.startsWith('~') && !user.bot) {
    const u = reaction.message.guild.members.find(m => m.user.username === user.username);
    const rolename = msg.content.match(/`((\w\s*?)+)`/)[1];
    console.log(rolename);
    const role = roles.find(r => r.name === rolename);
    u.addRole(role);
  }
});
bot.on('messageReactionRemove', (reaction, user) => {
  const msg = reaction.message;
  console.log(msg);
  const role = msg.content.match(/`((\w\s*?)+)`/)[1];
  const members = msg.guild.members;
  const u = members.find(m => m.user.username === user.username);
  if(u) {
   if(u.roles.find(r => r.name === role)) {
     u.removeRole(u.roles.find(r => r.name === role));
   }
  }
});

bot.on('message', msg => {
  if (msg.content.startsWith(']')) {
    const args = msg.content.slice(prefix.length).trim().split(/ +/g);
    args.push(msg.channel);
    const command = args.shift().toLowerCase();
    console.log(command);
    cmds[command](args);
  }
});

//https://discordapp.com/api/oauth2/authorize?client_id=549398959970320385&permissions=1074089024&scope=bot

bot.login(process.env.TOKEN);