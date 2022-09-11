import { createWriteStream, existsSync, readFileSync } from "fs";
import prompts from "prompts";
import { parseAction } from "./ActionParse";
import { makeAction } from "./Actions";
import { sortCards } from "./Card";
import { displayGame } from "./DisplayGame";
import { Game, getMe, startOneGame } from "./Game";
import { makeHolder } from "./Holder";
const replay: string[] = [
];
function loadReplay() {
    if (existsSync("./replay.txt")) {
        readFileSync("./replay.txt").toString().split("\n")
            .forEach((line) => {
                replay.push(line.trim());
            });
    }
}

const log = createWriteStream("log_steps.txt", { flags: 'a' });
function displayGameInConsoleInCurrentTurn(game: Game) {
    const me = getMe(game);
    sortCards(me.cards);
    console.clear();
    console.log(displayGame(game, me.id));
}
function start() {
    loadReplay();
    log.write("\n");
    log.write("\n");
    log.write(`Start: ${new Date()}: \n`);
    const dealer = makeHolder();
    const player1 = makeHolder();
    const player2 = makeHolder();
    const game = startOneGame([dealer, player1, player2]);
    UILoop(game);
}

async function UILoop(game: Game) {
    displayGameInConsoleInCurrentTurn(game);
    const action_str = replay.shift();
    let action;
    if (action_str == null) {
        action = await askForAction(game);
    } else {
        log.write(action_str + "\n");
        action = parseAction(action_str, game);
    }
    if (action == null) {
        UILoop(game);
        return;
    }
    makeAction(game, action);
    if (game.turnInfo.winner !== null) {
        console.clear();
        const winner = game.holders.find(holder => holder.id === game.turnInfo.winner);
        console.log(`And winner is: ${winner?.name}`);
        return;
    }
    UILoop(game);
}
start();

async function askForAction(game: Game) {
    const response = await prompts({
        type: "text",
        name: "action",
        message: game.turnInfo.fighting ? "Challenge(ch) or Fold(fd)" : "Take your action",
    });
    log.write(response.action + "\n");
    if (response.action === "quit") {
        log.close();
        process.exit(0);
    }
    return parseAction(response.action, game);
}

process.on('uncaughtException', (err) => {
    console.log("Uncaught Exception:");
    console.log(err);
    log.close();
    process.exit(1);
});