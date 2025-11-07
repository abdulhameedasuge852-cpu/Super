// Auto-install missing dependencies (safe)

const { execSync } = require("child_process");

try {

  require.resolve("ws");

} catch (e) {

  console.log("Installing missing package: ws...");

  execSync("npm install ws", { stdio: "inherit" });

}

console.log("Server Started");

const WebSocket = require("ws");

const PORT = process.env.PORT || process.env.SERVER_PORT || 8082;

const ser = new WebSocket.Server({ host: "0.0.0.0", port: PORT });

var players = [];

var id = "";

var gone;

class User {

  constructor(name, color, id) {

    this.name = name;

    this.color = color;

    this.id = id;

  }

}

ser.on("connection", ws => {

  id = ws;

  ws.on("message", message => {

    let retr = JSON.parse(message);

    if (retr.type == "bio") {

      console.log(retr.name + " Joined The Game!");

      players.push(new User(retr.name, retr.color, id));

      ser.clients.forEach(client => {

        if (client.readyState == WebSocket.OPEN) {

          for (let i = 0; i < players.length; i++) {

            client.send(

              JSON.stringify({

                name: players[i].name,

                color: players[i].color,

                type: "bio"

              })

            );

          }

        }

      });

    }

    if (retr.type == "upd") {

      ser.clients.forEach(client => {

        if (client.readyState == WebSocket.OPEN) {

          client.send(

            JSON.stringify({ name: retr.name, x: retr.x, y: retr.y, type: "upd" })

          );

        }

      });

    }

    if (retr.type == "chat") {

      ser.clients.forEach(client => {

        if (client.readyState == WebSocket.OPEN) {

          client.send(

            JSON.stringify({ name: retr.name, msg: retr.msg, type: "chat" })

          );

        }

      });

    }

  });

  ws.on("close", () => {

    for (let i = 0; i < players.length; i++) {

      if (!ser.clients.has(players[i].id)) {

        gone = players[i].name;

        ser.clients.forEach(client => {

          if (client.readyState == WebSocket.OPEN) {

            client.send(JSON.stringify({ name: gone, type: "deleteU" }));

          }

        });

        players = players.filter(p => p !== players[i]);

      }

    }

  });

});

console.log(`✅ WebSocket server running on port ${PORT}`);