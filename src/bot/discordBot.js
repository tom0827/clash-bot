/**
 * Discord Bot Client
 * Handles Discord bot initialization and command registration
 */

import { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CocBot } from './cocBot.js';

export class DiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    
    this.cocBot = new CocBot();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`✅ Discord bot is ready! Logged in as ${this.client.user.tag}`);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      try {
        await this.handleCommand(interaction);
      } catch (error) {
        console.error('Error handling command:', error);
        const errorMessage = 'There was an error executing this command!';
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      }
    });
  }

  async handleCommand(interaction) {
    const { commandName } = interaction;

    switch (commandName) {
      case 'clan-scores':
        await this.handleClanScoresCommand(interaction);
        break;
      case 'player-info':
        await this.handlePlayerInfoCommand(interaction);
        break;
      case 'help':
        await this.handleHelpCommand(interaction);
        break;
      default:
        await interaction.reply({ content: 'Unknown command!', ephemeral: true });
    }
  }

  async handleClanScoresCommand(interaction) {
    const clanTag = interaction.options.getString('clan-tag');
    
    await interaction.deferReply();
    
    try {
      const result = await this.cocBot.handleClanScoreCommand(clanTag);
      
      if (typeof result === 'string' && result.startsWith('Error')) {
        await interaction.editReply({ content: result });
        return;
      }

      const embed = this.createScoreEmbed(result);
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      await interaction.editReply({ content: `Error: ${error.message}` });
    }
  }

  async handlePlayerInfoCommand(interaction) {
    const playerTag = interaction.options.getString('player-tag');
    
    await interaction.deferReply();
    
    try {
      const result = await this.cocBot.handlePlayerInfoCommand(playerTag);
      
      if (typeof result === 'string' && result.startsWith('Error')) {
        await interaction.editReply({ content: result });
        return;
      }

      const embed = this.createPlayerEmbed(result);
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      await interaction.editReply({ content: `Error: ${error.message}` });
    }
  }

  async handleHelpCommand(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🏰 CoC Bot Commands')
      .setDescription('Clash of Clans clan participation scoring bot')
      .addFields(
        {
          name: '/clan-scores <clan-tag>',
          value: 'Get comprehensive scores for all clan members including donations, capital raids, and war league performance',
          inline: false
        },
        {
          name: '/player-info <player-tag>',
          value: 'Get detailed information about a specific player',
          inline: false
        },
        {
          name: '/help',
          value: 'Show this help message',
          inline: false
        }
      )
      .addFields(
        {
          name: '📊 Scoring System',
          value: 'Donations: 500+ (3pts), 2500+ (5pts), 5000+ (7pts), 7500+ (10pts), 10000+ (15pts)\nCapital Raids: 10k+ (1pt), 15k+ (2pts), 20k+ (3pts), 25k+ (5pts)\nWar League: Perfect stars (30pts), 2+ avg stars with high destruction (15-25pts)',
          inline: false
        }
      )
      .setFooter({ text: 'Use clan/player tags with # (e.g., #2LV0CCP9P)' });

    await interaction.reply({ embeds: [embed] });
  }

  createScoreEmbed(scoreData) {
    const embed = new EmbedBuilder()
      .setColor('#ffa500')
      .setTitle('🏆 Clan Scores')
      .setTimestamp();

    if (scoreData.donationScores?.length > 0) {
      const topDonations = scoreData.donationScores.slice(0, 5)
        .map((player, index) => `${index + 1}. **${player.name}**: ${player.donations.toLocaleString()} donations (${player.score} pts)`)
        .join('\n');
      
      embed.addFields({
        name: '💰 Top 5 Donation Scores',
        value: topDonations,
        inline: false
      });
    }

    if (scoreData.capitalRaidScores?.length > 0) {
      const topCapital = scoreData.capitalRaidScores.slice(0, 5)
        .map((player, index) => `${index + 1}. **${player.name}**: ${player.capitalResourcesLooted.toLocaleString()} gold (${player.score} pts)`)
        .join('\n');
      
      embed.addFields({
        name: '🏛️ Top 5 Capital Raid Scores',
        value: topCapital,
        inline: false
      });
    }

    if (scoreData.warLeagueScores?.length > 0) {
      const topWarLeague = scoreData.warLeagueScores.slice(0, 5)
        .map((player, index) => `${index + 1}. **${player.name}**: ${player.totalStars}⭐ (${player.score} pts)`)
        .join('\n');
      
      embed.addFields({
        name: '⚔️ Top 5 War League Scores',
        value: topWarLeague,
        inline: false
      });
    }

    return embed;
  }

  createPlayerEmbed(playerData) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`👤 ${playerData.name}`)
      .setDescription(`Player Tag: \`${playerData.tag}\``)
      .addFields(
        { name: '🎯 Level', value: playerData.expLevel.toString(), inline: true },
        { name: '🏆 Trophies', value: playerData.trophies.toLocaleString(), inline: true },
        { name: '🏰 Clan', value: playerData.clan?.name || 'None', inline: true },
        { name: '💝 Donations', value: playerData.donations.toLocaleString(), inline: true },
        { name: '📥 Received', value: playerData.donationsReceived.toLocaleString(), inline: true },
        { name: '📊 Ratio', value: playerData.donations > 0 ? (playerData.donationsReceived / playerData.donations).toFixed(2) : 'N/A', inline: true }
      )
      .setTimestamp();

    return embed;
  }

  getCommands() {
    return [
      new SlashCommandBuilder()
        .setName('clan-scores')
        .setDescription('Get comprehensive scores for all clan members')
        .addStringOption(option =>
          option.setName('clan-tag')
            .setDescription('Clan tag (e.g., #2LV0CCP9P)')
            .setRequired(true)
        ),
      
      new SlashCommandBuilder()
        .setName('player-info')
        .setDescription('Get detailed information about a player')
        .addStringOption(option =>
          option.setName('player-tag')
            .setDescription('Player tag (e.g., #98CYUGLP)')
            .setRequired(true)
        ),
        
      new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show help information and commands')
    ];
  }

  async start() {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      throw new Error('DISCORD_BOT_TOKEN is not set in the environment');
    }

    await this.client.login(token);
  }

  async stop() {
    await this.client.destroy();
  }
}