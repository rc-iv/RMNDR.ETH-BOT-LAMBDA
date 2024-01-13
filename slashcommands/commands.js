const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client,  } = require("discord.js");

require("dotenv").config();
const { BOT_TOKEN, CLIENT_ID } = process.env;

const rest = new REST({ version: "9" }).setToken(BOT_TOKEN);

const commands = [
  new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add a new event.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the event.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of event.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("The date of the event.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("The time of the event EST.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("timezone")
        .setDescription("The timezone of the event.")
        .addChoices(
          { name: "Eastern Time (EST)", value: "America/New_York" },
          { name: "Central Time (CST)", value: "America/Chicago" },
          { name: "Mountain Time (MST)", value: "America/Denver" },
          { name: "Pacific Time (PST)", value: "America/Los_Angeles" },
          { name: "Coordinated Universal Time (UTC)", value: "UTC" },
          { name: "Central European Time (CET)", value: "Europe/Paris" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("chain")
        .setDescription("The chain the event takes place on.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription(
          "Brief description of the event and any additional links."
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("contractaddress")
        .setDescription("The contract address of the event.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("explorerurl")
        .setDescription("The url of the contract explorer.")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("edit")
    .setDescription("Edit an existing event.")
    .addStringOption((option) =>
      option
        .setName("eventid")
        .setDescription("The UUID of the event to edit.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the event.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of event.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("The date of the event.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("The time of the event EST.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("timezone")
        .setDescription("The timezone of the event.")
        .addChoices(
          { name: "Eastern Time (EST)", value: "America/New_York" },
          { name: "Central Time (CST)", value: "America/Chicago" },
          { name: "Mountain Time (MST)", value: "America/Denver" },
          { name: "Pacific Time (PST)", value: "America/Los_Angeles" },
          { name: "Coordinated Universal Time (UTC)", value: "UTC" },
          { name: "Central European Time (CET)", value: "Europe/Paris" }
        )
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("chain")
        .setDescription("The chain the event takes place on.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("contractaddress")
        .setDescription("The contract address of the event.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("explorerurl")
        .setDescription("The contract address of the event.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription(
          "Brief description of the event and any additional links."
        )
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("list")
    .setDescription("List upcoming events.")
    .addBooleanOption((option) =>
      option
        .setName("all")
        .setDescription("Set to true to list all events.")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get information on how to use this bot."),
].map((command) => command.toJSON());

(async () => {
    try {
      console.log("Started refreshing application (/) commands.");
  
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  
      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
