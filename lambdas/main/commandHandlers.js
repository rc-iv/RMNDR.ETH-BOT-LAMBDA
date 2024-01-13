const {
  createEventEmbed,
  createActionRowSubscribeEdit,
  createEventListEmbed,
  createActionRowForEvent,
  createHelpEmbed,
} = require("./embed");
const {
  getEvent,
  getEventsInTimeRangeGuild,
  addEventToDb,
  updateEvent,
  addSubscriberToEvent,
} = require("./db");
const { validateDateTime, convertToUTC } = require("./utils");
const uuid = require("uuid");
const moment = require("moment-timezone");

async function handleAddCommand(event) {
  const options = event.data.options;
  let eventName,
    eventType,
    eventDate,
    eventTime,
    eventTimeZone,
    chain,
    eventContractAddress,
    explorerUrl,
    description;
  options.forEach((option) => {
    switch (option.name) {
      case "name":
        eventName = option.value;
        break;
      case "type":
        eventType = option.value;
        break;
      case "date":
        eventDate = option.value;
        break;
      case "time":
        eventTime = option.value;
        break;
      case "timezone":
        eventTimeZone = option.value;
        break;
      case "chain":
        chain = option.value;
        break;
      case "contract":
        eventContractAddress = option.value;
        break;
      case "explorer":
        explorerUrl = option.value;
        break;
      case "description":
        description = option.value;
        break;
    }
  });

  // check if date is 2 digits, month is 2 digits, year is 4 digits
  const day = eventDate.split("-")[1];
  const month = eventDate.split("-")[0];
  const year = eventDate.split("-")[2];
  if (year.length === 2) {
    eventDate = `${month}-${day}-20${year}`;
  }
  if (!validateDateTime(eventDate, eventTime)) {
    return {
      type: 4,
      data: { content: "Invalid date or time format.", flags: 64 },
      ephemeral: true,
    };
  }

  const guildId = event.guild.id;
  const channelId = event.channel.id;
  const channelName = event.channel.name;

  const userId = event.member.user.id;
  const userName = event.member.user.username;

  const utcDateTime = convertToUTC(eventDate, eventTime, eventTimeZone);

  const eventId = uuid.v4();
  const eventObj = {
    pk: eventId,
    sk: guildId,
    userId: userId,
    userName: userName,
    channelId: channelId,
    eventName: eventName,
    description: description,
    eventType: eventType,
    eventDate: eventDate,
    eventTime: eventTime,
    eventTimeZone: eventTimeZone,
    eventDateTime: utcDateTime,
    chain: chain,
    eventContractAddress: eventContractAddress,
    explorerUrl: explorerUrl,
    subscribedUsers: [],
    channelName: channelName,
  };

  try {
    const eventEmbed = createEventEmbed(eventObj);
    const actionRow = createActionRowSubscribeEdit(eventId);

    await addEventToDb(eventObj);

    return {
      type: 4,
      data: {
        content: "Event added successfully!",
        embeds: [eventEmbed],
        components: [actionRow],
      },
      ephemeral: true,
    };
  } catch (err) {
    console.error("Error adding event:", err);
    return {
      type: 4,
      data: { content: "Error adding event.", flags: 64 },
      ephemeral: true,
    };
  }
}

async function handleEditCommand(event) {
  const options = event.data.options;

  const eventId = options[0].value;
  const guildId = event.guild.id;
  const userId = event.member.user.id;

  const data = await getEvent(eventId, guildId);
  if (data.Item) {
    // Check if the user is the owner of the event
    if (data.Item.userId !== userId) {
      return {
        type: 4,
        data: {
          content: "You are not the owner of this event.",
          flags: 64,
        },
        ephemeral: true,
      };
    }

    // Get the fields provided by the user for updating
    const updatedFields = {};
    const validFields = [
      "name",
      "description",
      "type",
      "date",
      "time",
      "chain",
      "contractaddress",
      "explorerurl",
      "timezone",
    ];

    const fieldMapping = {
      name: "eventName",
      description: "description",
      type: "eventType",
      date: "eventDate",
      time: "eventTime",
      chain: "chain",
      contractaddress: "eventContractAddress",
      explorerurl: "explorerUrl",
      timezone: "eventTimeZone",
    };

    options.forEach((option) => {
      if (validFields.includes(option.name)) {
        updatedFields[fieldMapping[option.name]] = option.value;
      }
    });

    console.log(`updatedFields: ${JSON.stringify(updatedFields)}`);
    // Check if there are fields to update
    if (Object.keys(updatedFields).length > 0) {
      const updatedEvent = {
        eventName: updatedFields.eventName || data.Item.eventName,
        description: updatedFields.description || data.Item.description,
        eventType: updatedFields.eventType || data.Item.eventType,
        eventDate: updatedFields.eventDate || data.Item.eventDate,
        eventTime: updatedFields.eventTime || data.Item.eventTime,
        eventDateTime: updatedFields.eventDateTime || data.Item.eventDateTime,
        chain: updatedFields.chain || data.Item.chain,
        eventContractAddress:
          updatedFields.eventContractAddress || data.Item.eventContractAddress,
        explorerUrl: updatedFields.explorerUrl || data.Item.explorerUrl,
        userName: data.Item.userName,
        eventTimeZone: updatedFields.eventTimeZone || data.Item.eventTimeZone,
      };

      // Check if date and or time are updated
      if (updatedFields.eventDate || updatedFields.eventTime) {
        console.log("Updating the date or time in edit handler line 204");
        if (!validateDateTime(updatedEvent.eventDate, updatedEvent.eventTime)) {
          return {
            type: 4,
            data: { content: "Invalid date or time format.", flags: 64 },
            ephemeral: true,
          };
        }
        // Validate and convert to UTC
        const utcDateTime = convertToUTC(
          updatedEvent.eventDate,
          updatedEvent.eventTime,
          updatedEvent.eventTimeZone
        );

        console.log(`utcDateTime: ${utcDateTime}`);
        updatedFields.eventDateTime = utcDateTime;
        updatedEvent.eventDateTime = utcDateTime;
      }

      try {
        const updatedEventEmbed = createEventEmbed(updatedEvent);
        const actionRow = createActionRowSubscribeEdit(eventId);

        await updateEvent(eventId, guildId, updatedFields);

        return {
          type: 4,
          data: {
            content: "Event updated successfully!",
            embeds: [updatedEventEmbed],
            components: [actionRow],
          },
          ephemeral: true,
        };
      } catch (err) {
        console.error("Error editing event or creating embed:", err);
        return {
          type: 4,
          data: { content: "Error editing event.", flags: 64 },
          ephemeral: true,
        };
      }
    } else {
      return {
        type: 4,
        data: {
          content: "No fields provided to update.",
          flags: 64,
        },
        ephemeral: true,
      };
    }
  } else {
    return {
      type: 4,
      data: {
        content: "Event not found.",
        flags: 64,
      },
      ephemeral: true,
    };
  }
}

async function handleListCommand(event) {
  const options = event.data.options || [];
  const listAll = options.length > 0 && options[0].value === true;
  const now = moment().utc();
  const endRange = listAll
    ? moment().utc().add(100, "years")
    : moment().utc().add(24, "hours");

  const guildId = event.guild.id;
  try {
    const events = await getEventsInTimeRangeGuild(guildId, now, endRange);
    if (events.length === 0) {
      return {
        type: 4,
        data: { content: "No events found.", flags: 64 },
        ephemeral: true,
      };
    }

    const eventListEmbed = createEventListEmbed(events);
    const actionRows = events.map((event) =>
      createActionRowForEvent(event.pk, event.eventName)
    );

    return {
      type: 4,
      data: {
        content: "Here are the events I found:",
        flags: 64,
        embeds: [eventListEmbed],
        components: actionRows,
      },

      ephemeral: true,
    };
  } catch (err) {
    console.error("Error listing events:", err);
    return {
      type: 4,
      data: { content: "Error listing events.", flags: 64 },
      ephemeral: true,
    };
  }
}

function handleHelpCommand() {
  return {
    type: 4,
    data: {
      flags: 64,
      embeds: [createHelpEmbed()],
    },
    ephemeral: true,
  };
}

async function handleSubscribeButton(event, eventToSubscribeToId) {
  const userId = event.member.user.id;
  try {
    await addSubscriberToEvent(eventToSubscribeToId, event.guild.id, userId);
    return {
      type: 4,
      data: { content: "Subscribed to event.", flags: 64 },
      ephemeral: true,
    };
  } catch (err) {
    console.error("Error subscribing to event:", err);
    return {
      type: 4,
      data: { content: "Error subscribing to event.", flags: 64 },
      ephemeral: true,
    };
  }
}

function handleEditButton(eventIdToEdit) {
  return {
    type: 4,
    data: {
      content: `Use /edit with eventId: ${eventIdToEdit} to edit this event`,
      flags: 64,
    },
    ephemeral: true,
  };
}

async function handleEventDetails(event, eventId, isEphemeral) {
  const eventData = await getEvent(eventId, event.guild.id);
  if (eventData.Item) {
    try {
      const eventEmbed = createEventEmbed(eventData.Item);
      const data = {
        content: "Event found:",
        embeds: [eventEmbed],
        components: [createActionRowSubscribeEdit(eventId)],
      };
      if (isEphemeral) {
        data.flags = 64;
      }
      return {
        type: 4,
        data: data,
        ephemeral: isEphemeral,
      };
    } catch (err) {
      console.error("Error creating embed:", err);
      return {
        type: 4,
        data: { content: "Error creating embed.", flags: 64 },
        ephemeral: isEphemeral,
      };
    }
  } else {
    const data = {
      content: "Event not found.",
    };
    if (isEphemeral) {
      data.flags = 64;
    }
    return {
      type: 4,
      data: data,
      ephemeral: isEphemeral,
    };
  }
}

module.exports = {
  handleListCommand,
  handleHelpCommand,
  handleAddCommand,
  handleEditCommand,
  handleSubscribeButton,
  handleEditButton,
  handleEventDetails,
};
