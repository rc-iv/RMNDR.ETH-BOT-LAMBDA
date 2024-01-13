const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});

async function addEventToDb(event) {
  const db = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: "DiscordEvents",
    Item: event,
  };
  console.log("Adding event:", event);
  
  try {
    await db.put(params).promise();
    console.log("Event added successfully");
  } catch (err) {
    console.error("Unable to add event. Error:", err);
    throw new Error("Unable to add event to DynamoDB");
  }
}

async function updateEvent(eventId, guildId, updatedFields) {
  const db = new AWS.DynamoDB.DocumentClient();
  let updateExpression = "set";
  let expressionAttributeValues = {};
  Object.entries(updatedFields).forEach(([key, value], index) => {
    updateExpression += ` ${key} = :val${index},`;
    expressionAttributeValues[`:val${index}`] = value;
  });
  updateExpression = updateExpression.slice(0, -1); // Remove the last comma

  const updateParams = {
    TableName: "DiscordEvents",
    Key: {
      pk: eventId,
      sk: guildId,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  try {
    // Perform the update operation
    await db.update(updateParams).promise();
    console.log("Event updated successfully");
  } catch (err) {
    console.error("Unable to update event. Error:", err);
    throw new Error("Unable to update event to DynamoDB");
  }
}

async function getEvent(eventId, guildId) {
  const db = new AWS.DynamoDB.DocumentClient();
  const getParams = {
    TableName: "DiscordEvents",
    Key: {
      pk: eventId,
      sk: guildId,
    },
  };

  try {
    data = await db.get(getParams).promise();
    return data;
  } catch (err) {
    console.error(
      "Unable to read item. Error JSON:",
      JSON.stringify(err, null, 2)
    );
    return null;
  }
}

async function getEventsInTimeRangeGuild(guildId, startTime, endTime) {
  const db = new AWS.DynamoDB.DocumentClient();
  console.log("Scanning for events in time range for guild:", guildId);
  // Convert start and end times to ISO string format
  const startIsoString = startTime.toISOString();
  const endIsoString = endTime.toISOString();

  const params = {
    TableName: "DiscordEvents",
    FilterExpression: "sk = :guildId AND eventDateTime BETWEEN :start AND :end",
    ExpressionAttributeValues: {
      ":guildId": guildId,
      ":start": startIsoString,
      ":end": endIsoString,
    },
  };

  try {
    const data = await db.scan(params).promise();
    const events = data.Items;
    console.log("Events found:", events);

    // sort events by eventDateTime
    events.sort((a, b) => {
      return a.eventDateTime > b.eventDateTime
        ? 1
        : b.eventDateTime > a.eventDateTime
        ? -1
        : 0;
    });

    return events;
  } catch (err) {
    console.error(
      "Unable to scan table. Error JSON:",
      JSON.stringify(err, null, 2)
    );
    return null;
  }
}

async function getAllEventsInTimeRange(startTime, endTime) {
  const db = new AWS.DynamoDB.DocumentClient();
  console.log("Scanning for events in time range");
  // Convert start and end times to ISO string format
  const startIsoString = startTime.toISOString();
  const endIsoString = endTime.toISOString();

  const params = {
    TableName: "DiscordEvents",
    FilterExpression: "eventDateTime BETWEEN :start AND :end",
    ExpressionAttributeValues: {
      ":start": startIsoString,
      ":end": endIsoString,
    },
  };

  try {
    const data = await db.scan(params).promise();
    const events = data.Items;
    console.log("Events found:", events);
    return events;
  } catch (err) {
    console.error(
      "Unable to scan table. Error JSON:",
      JSON.stringify(err, null, 2)
    );
    return null;
  }
}

async function addSubscriberToEvent(eventId, guildId, userId) {
  const db = new AWS.DynamoDB.DocumentClient();
  try {
    // Get the current event data
    const eventData = await getEvent(eventId, guildId, db);
    if (eventData.Item) {
      // Check if the user is already subscribed
      if (eventData.Item.subscribedUsers.includes(userId)) {
        console.log("User already subscribed to the event");
        return;
      }

      // Update the event to add the new subscriber
      const updateParams = {
        TableName: "DiscordEvents",
        Key: {
          pk: eventId,
          sk: guildId,
        },
        UpdateExpression:
          "SET subscribedUsers = list_append(if_not_exists(subscribedUsers, :empty_list), :subscriber)",
        ExpressionAttributeValues: {
          ":subscriber": [userId],
          ":empty_list": [],
        },
        ReturnValues: "UPDATED_NEW",
      };

      await db.update(updateParams).promise();
    } else {
      console.log("Event not found for subscription");
    }
  } catch (err) {
    console.error(
      "Unable to update event with subscriber. Error JSON:",
      JSON.stringify(err, null, 2)
    );
    throw err;
  }
}

module.exports = {
  getEvent,
  getEventsInTimeRangeGuild,
  getAllEventsInTimeRange,
  addEventToDb,
  updateEvent,
  addSubscriberToEvent,
};
