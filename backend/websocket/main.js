const WebSocket = require("ws");
const axios = require("axios");
const PING_TIME = 10000;
const connectedClients = [];
const rooms = {};
const coinflipgames = {};

const createRoom = async (room_id, ownerclient) => {
  console.log(`Creating room: ${room_id}`);
  if (rooms.hasOwnProperty(room_id)) {
  } else {
    const token = ownerclient.token;
    try {
      const response = await axios.post("http://10.100.102.2:81/get_userid", {
        cookie: token,
      });
      console.log(response.data.user_id);
      rooms[room_id] = {
        ownerId: response.data.user_id,
      };
      console.log(`Room ${room_id} created`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  }
};

const joinRoom = (room_id) => {
  console.log(`Joining room: ${room_id}`);
  if (!rooms.hasOwnProperty(room_id)) {
    console.log(`Room ${room_id} does not exist`);
  }
};

const authenticateClient = (client, auth_key) => {
  return true;
};

const handleAuthenticatedWebSocketMessage = (websocket, message, client) => {
  if (message.startsWith("69/create")) {
    const room_id = Math.floor(Math.random() * 90000) + 10000;
    createRoom(room_id, client);
    return;
  }

  if (message.startsWith("69/join")) {
    const room_id = message.split("/")[1];
    joinRoom(room_id);
    return;
  }
};

const handleWebSocketMessage = (websocket, message) => {
  const client = getClientByWebSocket(websocket);
  if (!client) {
    websocket.terminate();
    return;
  }

  message = message.toString();
  console.log(message);
  if (message === "5") {
    clearTimeout(client.pingTimeout);
    client.pinged = true;
    return;
  }
  if (message.startsWith("69/auth") && !client.authenticated) {
    const auth_key = message.split('"')[1];
    console.log(`Authenticating client: ${auth_key}`);
    if (authenticateClient(client, auth_key)) {
      console.log(`Client ${auth_key} authenticated successfully`);
      client.authenticated = true;
      client.token = auth_key;
    }
  } else if (client.authenticated) {
    handleAuthenticatedWebSocketMessage(websocket, message, client);
  } else {
    websocket.terminate();
  }
};

const getClientByWebSocket = (websocket) => {
  return connectedClients.find((client) => client.websocket === websocket);
};

const handleWebSocketConnection = (websocket) => {
  const client = {
    websocket,
    authenticated: false,
    pinged: false,
    pingTimeout: null,
  };
  connectedClients.push(client);
  websocket.send(`69/loadoldgames ${coinflipgames}`);

  const sendPing = () => {
    const pingMessage = "3";

    const pingInterval = setInterval(() => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(pingMessage);
      }
    }, PING_TIME);

    client.pingTimeout = setTimeout(() => {
      clearInterval(pingInterval);
      if (!client.pinged) {
        websocket.terminate();
      } else {
        client.pinged = false;
        sendPing();
      }
    }, PING_TIME * 3);
  };

  sendPing();

  websocket.on("message", (message) => {
    handleWebSocketMessage(websocket, message);
  });

  websocket.on("close", () => {
    connectedClients.splice(connectedClients.indexOf(client), 1);
    clearTimeout(client.pingTimeout);
  });
};

const wss = new WebSocket.Server({ port: 4324 });

wss.on("connection", handleWebSocketConnection);
