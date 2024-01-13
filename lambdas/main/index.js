const nacl = require("tweetnacl");
const {
  handleAddCommand,
  handleListCommand,
  handleHelpCommand,
  handleEditCommand,
  handleSubscribeButton,
  handleEditButton,
  handleEventDetails,
} = require("./commandHandlers");

exports.handler = async (event) => {
  const PUBLIC_KEY = process.env.PUBLIC_KEY;
  const strBody = event.body;
  const eventData = JSON.parse(strBody);

  if (eventData.type == 1) {
    const signature = event.headers["x-signature-ed25519"] || false;
    const timestamp = event.headers["x-signature-timestamp"] || false;
    if (signature && timestamp) {
      const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + strBody),
        Buffer.from(signature, "hex"),
        Buffer.from(PUBLIC_KEY, "hex")
      );

      if (!isVerified) {
        return {
          statusCode: 401,
          body: JSON.stringify("invalid request signature"),
        };
      }
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ type: 1 }),
      };
    }
  } 

  console.log(`Event data: ${JSON.stringify(eventData)}`);

  let response;

  if (eventData.data.component_type === 2) {
    const buttonType = eventData.data.custom_id.split("-")[0];
    const buttonId = eventData.data.custom_id.split(`${buttonType}-`)[1];
    switch (buttonType) {
      case "subscribe":
        console.log("Subscribe button pressed");
        response = await handleSubscribeButton(eventData, buttonId);
        break;
      case "edit":
        console.log("Edit button pressed");
        response = await handleEditButton(buttonId);
        break;
      case "broadcast":
        console.log("Broadcast button pressed");
        response = await handleEventDetails(eventData, buttonId, false);
        break;
      case "details":
        console.log("Details button pressed");
        response = await handleEventDetails(eventData, buttonId, true);
        break;
    }
  } else {
    switch (eventData.data.name) {
      case "list":
        console.log("List command received");
        response = await handleListCommand(eventData);
        break;
      case "add":
        console.log("Add command received");
        response = await handleAddCommand(eventData);
        console.log(`Response: ${JSON.stringify(response)}`);
        break;
      case "edit":
        console.log("Edit command received");
        response = await handleEditCommand(eventData);
        break;
      case "help":
        console.log("Help command received");
        response = handleHelpCommand();
        break;
      default:
        console.log("Unknown command received");
        response = {
          type: 4,
          data: { content: "Unknown command received.", flags: 64 },
          ephemeral: true,
        };
        break;
    }
  }
  return JSON.stringify(response);
};
