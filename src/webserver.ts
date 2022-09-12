import { existsSync, readFileSync } from "fs";
import { WebSocket, WebSocketServer } from 'ws';
import { parseAction } from "./ActionParse";
import { makeAction } from "./Actions";
import { getMe, startOneGame } from "./Game";
import { makeHolder } from "./Holder";

process.on('uncaughtException', (err) => {
    console.log("Uncaught Exception:");
    console.log(err);
    // log.close();
    process.exit(1);
});

const dealer = makeHolder();
const player1 = makeHolder();
const player2 = makeHolder();
let game = startOneGame([dealer, player1, player2]);


function loadReplay() {
    if (existsSync("./replay.txt")) {
        readFileSync("./replay.txt").toString().split("\n")
            .forEach((line) => {
                const action = parseAction(line.trim(), game);
                if (action != null) {
                    makeAction(game, action);
                }
            });
    }
}
// loadReplay();

const wss = new WebSocketServer({ port: 8080 });
const clientMap = new Map<WebSocket, string>();
wss.on('connection', function connection(ws) {
    const taken = new Set(Array.from(clientMap.values()));
    const leftHolder = game.holders.find((h) => !taken.has(h.id));
    if (leftHolder == null) {
        ws.send(JSON.stringify({ "msg": "No More Seat Here" }), () => {
            setTimeout(() => {
                ws.close();
            }, 1000);
        });
        return;
    }

    ws.on('message', function message(rawData) {
        try {
            const data: { id: string; action: string; } = JSON.parse(rawData.toString());
            console.log("data", data);
            const me = getMe(game);
            if (me.id === data.id) {
                const action = parseAction(data.action, game);
                console.log(action);
                if (action != null) {
                    makeAction(game, action);
                }
                notifyClient();
            }
            if (game.turnInfo.winner != null) {
                game = startOneGame([dealer, player1, player2]);
                notifyClient();
            }
        } catch (error) {
            console.log(error);
        }

    });
    ws.on('close', () => {
        console.log("Lost");
        clientMap.delete(ws);
    });
    clientMap.set(ws, leftHolder.id);
    ws.send(JSON.stringify({
        id: leftHolder.id,
        game: game
    }));

    function notifyClient() {
        for (const [client, id] of clientMap.entries()) {
            clientMap.keys();
            client.send(JSON.stringify({
                id: id,
                game: game
            }));
        }
    }
});