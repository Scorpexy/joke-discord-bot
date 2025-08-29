require('dotenv').config();

const {REST, Routes, SlashCommandBuilder} = require('discord.js');

const commands = [   // suite of all commands user can use
    new SlashCommandBuilder()
        .setName('joke')
        .setDescription('recieve a random joke'),

    new SlashCommandBuilder()
        .setName('addjoke')
        .setDescription("add a new joke")
        .addStringOption(opt =>
            opt.setName('text')
                .setDescription('joke txt')
                .setRequired(true)
        ),
    
    new SlashCommandBuilder()
        .setName('jokedump')
        .setDescription('say all currently stored jokes'),    
]

.map(cmd => cmd.toJSON());

const rest = new REST({ version : '10'}).setToken(process.env.DISCORD_TOKEN);      // REST client made with my super-secret token oooooohhhh

(async() => {
    try{
        console.log('Registering (guild) commands . . .');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.DISCORD_APP_ID,
                process.env.DISCORD_GUILD_ID
            ),
            {body: commands}
        );

        console.log('Done');
    } catch(err){
      console.error('Failed to register commands:', err);
      process.exit(1);
    }
})();