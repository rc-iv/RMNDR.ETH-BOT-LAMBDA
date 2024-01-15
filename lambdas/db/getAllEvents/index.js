const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

exports.handler = async (event) => {
  const db = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  const guildId = body.guildId;

  const headers = {
    "Access-Control-Allow-Origin": "https://www.rmndrbot.com",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const params = {
    TableName: "DiscordEvents",
    FilterExpression: "sk = :guildId",
    ExpressionAttributeValues: {
      ":guildId": guildId,
    },
  };

  try {
    const data = await db.scan(params).promise();
    return {
      header: headers,
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      header: headers,
      statusCode: 500,
      body: JSON.stringify({ error: "Could not fetch events" }),
    };
  }
};
