const AWS = require("aws-sdk");
const moment = require("moment");
AWS.config.update({
  region: "us-east-1",
});

async function checkForUpcomingEvents() {
  console.log("Checking for upcoming events");
  const db = new AWS.DynamoDB.DocumentClient();
  const now = moment().utc();
  const upcomingLimit = moment().utc().add(15, "minutes");

  const upcomingEvents = await getAllEventsInTimeRange(now, upcomingLimit, db);

  return upcomingEvents;
}

async function getAllEventsInTimeRange(startTime, endTime, db) {
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

async function deleteEvent(eventId, guildId) {
  const db = new AWS.DynamoDB.DocumentClient();

  console.log(`Deleting event with ID ${eventId} and guild ID ${guildId}`);
  const params = {
    TableName: "DiscordEvents",
    Key: {
      pk: eventId,
      sk: guildId,
    },
  };

  try {
    await db.delete(params).promise();
  } catch (err) {
    console.error(
      "Unable to delete item. Error JSON:",
      JSON.stringify(err, null, 2)
    );
  }
}

module.exports = {
  checkForUpcomingEvents,
  deleteEvent
};
