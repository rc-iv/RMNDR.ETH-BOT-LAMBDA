const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

exports.handler = async (event) => {
  const db = new AWS.DynamoDB.DocumentClient();
  const { eventId, guildId, userId } = JSON.parse(event.body);

  const headers = {
    "Access-Control-Allow-Origin": "https://www.rmndrbot.com",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const getParams = {
    TableName: "DiscordEvents",
    Key: {
      pk: eventId,
      sk: guildId,
    },
  };

  try {
    const eventData = await db.get(getParams).promise();
    if (!eventData.Item) {
      return {
        headers: headers,
        statusCode: 404,
        body: JSON.stringify({ error: "Event not found" }),
      };
    }

    if (eventData.Item.subscribedUsers.includes(userId)) {
      return {
        headers: headers,
        statusCode: 200,
        body: JSON.stringify({ message: "User already subscribed" }),
      };
    }

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
    };

    await db.update(updateParams).promise();
    return {
      headers: headers,
      statusCode: 200,
      body: JSON.stringify({ message: "Subscribed successfully" }),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      headers: headers,
      statusCode: 500,
      body: JSON.stringify({ error: "Could not subscribe to event" }),
    };
  }
};
