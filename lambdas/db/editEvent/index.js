const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

exports.handler = async (event) => {
  const db = new AWS.DynamoDB.DocumentClient();
  const headers = {
    "Access-Control-Allow-Origin": "https://www.rmndrbot.com",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  // Parse the request body
  const body = JSON.parse(event.body);
  const { eventId, guildId, updatedFields } = body;

  // Construct the update expression and attribute values
  let updateExpression = "set";
  let expressionAttributeValues = {};
  for (const [key, value] of Object.entries(updatedFields)) {
    updateExpression += ` ${key} = :${key},`;
    expressionAttributeValues[`:${key}`] = value;
  }
  updateExpression = updateExpression.slice(0, -1); // Remove the last comma

  // Prepare the update parameters
  const params = {
    TableName: "DiscordEvents",
    Key: {
      pk: eventId,
      sk: guildId,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  // Perform the update
  try {
    await db.update(params).promise();
    return {
      headers: headers,
      statusCode: 200,
      body: JSON.stringify({ message: "Event updated successfully" }),
    };
  } catch (err) {
    console.error("Error updating event:", err);
    return {
      headers: headers,
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update the event" }),
    };
  }
};
