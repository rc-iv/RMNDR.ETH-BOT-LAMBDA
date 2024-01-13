const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
  } = require("discord.js");
  
  const moment = require("moment");
  
  function createEventEmbed(event) {
    console.log(`eventDateTime in create embed: ${event.eventDateTime}`);
    const eventTimestamp = moment.utc(event.eventDateTime).unix();
  
    const eventEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(event.eventName)
      .addFields(
        { name: "Type", value: event.eventType },
        { name: "Description", value: event.description },
        { name: "Date & Time", value: `<t:${eventTimestamp}:F>` },
        { name: "Chain", value: event.chain }
      );
  
    if (event.eventContractAddress) {
      eventEmbed.addFields({
        name: "Contract Address",
        value: event.eventContractAddress,
      });
    }
  
    if (event.explorerUrl) {
      eventEmbed.addFields({
        name: "Contract Explorer",
        value: event.explorerUrl,
      });
    }
    if (event.userName) {
      eventEmbed.addFields({ name: "Added by:", value: event.userName });
    }
    return eventEmbed;
  }
  
  function createEventListEmbed(events) {
    const eventListEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Upcoming Events");
  
    events.forEach((event, index) => {
      const utcTime = event.eventDateTime;
      const eventTimestamp = moment.utc(utcTime).unix();
      eventListEmbed.addFields({
        name: `${index + 1}. ${event.eventName} - ${event.eventType} - ${
          event.chain
        }`,
        value: `Date & Time: <t:${eventTimestamp}:F>`,
      });
    });
  
    return eventListEmbed;
  }
  
  function createHelpEmbed() {
    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Bot Help")
      .setDescription("Here's how you can use this bot:")
      .addFields(
        { name: "/add", value: "Add a new event." },
        {
          name: "/edit",
          value:
            "Edit an existing event. Requires event ID. This is found by clicking `Edit` on an existing event",
        },
        {
          name: "/list",
          value:
            "List of upcoming events in next 24 hours. Optional 'all' field to list all upcoming events.",
        },
        {
          name: "Subscribe Button",
          value:
            "Subscribe to an event's notifications. Will be notified 15 minutes prior to event time.",
        },
        {
          name: "Edit Button",
          value: "Provides you with the event id to edit the event using /edit",
        },
        {
          name: "Broadcast Button",
          value:
            "Sends the event details to the channel the button was clicked in. Visible to everyone in channel",
        },
        { name: "/help", value: "Displays the help menu" }
      );
  
    return helpEmbed;
  }
  
  function createActionRowSubscribeEdit(eventId) {
    const subscribeButton = new ButtonBuilder()
      .setCustomId(`subscribe-${eventId}`)
      .setLabel("Subscribe")
      .setStyle(ButtonStyle.Success);
  
    const editButton = new ButtonBuilder()
      .setCustomId(`edit-${eventId}`)
      .setLabel("Edit")
      .setStyle(ButtonStyle.Primary);
  
    const broadCastButton = new ButtonBuilder()
      .setCustomId(`broadcast-${eventId}`)
      .setLabel("Broadcast")
      .setStyle(ButtonStyle.Primary);
  
    const actionRow = new ActionRowBuilder().addComponents(
      subscribeButton,
      editButton,
      broadCastButton
    );
  
    return actionRow;
  }
  
  function createActionRowForEvent(eventId, name) {
    const detailsButton = new ButtonBuilder()
      .setCustomId(`details-${eventId}`)
      .setLabel(name)
      .setStyle(ButtonStyle.Primary);
  
    const actionRow = new ActionRowBuilder().addComponents(detailsButton);
    return actionRow;
  }
  
  // export the functions
  module.exports = {
    createEventEmbed,
    createActionRowSubscribeEdit,
    createEventListEmbed,
    createActionRowForEvent,
    createHelpEmbed,
  };
  