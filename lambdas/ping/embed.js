const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
  } = require("discord.js");
const moment = require("moment");

function createEventEmbed(event) {
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

module.exports = {
  createEventEmbed,
  createActionRowSubscribeEdit,
};
