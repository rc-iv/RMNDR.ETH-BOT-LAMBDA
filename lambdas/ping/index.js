const axios = require("axios");
const { checkForUpcomingEvents, deleteEvent } = require("./db");
const { createEventEmbed, createActionRowSubscribeEdit } = require("./embed");
const { Client, GatewayIntentBits } = require("discord.js");

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
bot
  .login(process.env.BOT_TOKEN)
  .then(() => console.log("Logged in!"))
  .catch((err) => console.error("Failed to log in:", err));

exports.handler = async () => {
  const url =
    "https://hnrkhewcy8.execute-api.us-east-1.amazonaws.com/default/rmndrBotMain";
  const upcomingEvents = await checkForUpcomingEvents();
  console.log(`upcomingEvents: ${JSON.stringify(upcomingEvents)}`);
  let postData;
  if (upcomingEvents.length > 0) {
    for (const event of upcomingEvents) {
      const guild = bot.guilds.cache.get(event.sk);
      const channelId = event.channelId;
      const eventEmbed = createEventEmbed(event);
      const actionRow = createActionRowSubscribeEdit(event.pk);
      const subscribedUsers = event.subscribedUsers;
      let channel;
      try {
        channel = await bot.channels.fetch(channelId);
        const userPingList = subscribedUsers.map((userId) => `<@${userId}>`);
        console.log(`userPingList: ${userPingList}`);
        await channel.send({
          content: userPingList.join(" "),
          embeds: [eventEmbed],
          components: [actionRow],
        });
        await deleteEvent(event.pk, event.sk);
      } catch (err) {
        console.error(`Failed to fetch channel with ID ${channelId}:`, err);
        continue; // Skip to the next iteration of the loop
      }
    }
  }
  postData = {
    type: 1,
    data: {
      content: "Ping",
    },
  };

  const response = await axios.post(url, postData);
  console.log(response);
};
