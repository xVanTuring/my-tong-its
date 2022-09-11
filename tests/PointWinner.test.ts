import { CardColor } from "../src/Card";
import { displayGame } from "../src/DisplayGame";
import { calcPointWinner, Game } from "../src/Game";
import { makeHolder } from "../src/Holder";
import { RevealType } from "../src/RevealGroup";

describe("Point Winner test", () => {
    function makeBaseGame() {
        const dealer = makeHolder();
        const player1 = makeHolder();
        const player2 = makeHolder();
        const game: Game = {
            centralStack: [],
            holders: [dealer, player1, player2],
            diposedStack: [],
            turnInfo: {
                fighting: true,
                picked: false,
                turn: 30
            }
        };
        {
            dealer.cards.push({
                color: CardColor.club,
                value: 5
            });
            dealer.cards.push({
                color: CardColor.club,
                value: 6
            });
            dealer.reveals.push({
                cards: [
                    { color: CardColor.diamond, 'value': 11 },
                    { color: CardColor.spade, 'value': 11 },
                    { color: CardColor.heart, 'value': 11 },
                ],
                type: RevealType.Pair
            });
        }
        {
            player1.cards.push({
                color: CardColor.club,
                value: 10
            });
            player1.cards.push({
                color: CardColor.club,
                value: 10
            });
            player1.reveals.push({
                cards: [
                    { color: CardColor.diamond, 'value': 12 },
                    { color: CardColor.spade, 'value': 12 },
                    { color: CardColor.heart, 'value': 12 },
                ],
                type: RevealType.Pair
            });
        }
        {
            player2.cards.push({
                color: CardColor.club,
                value: 1
            });
            player2.cards.push({
                color: CardColor.club,
                value: 1
            });
            player2.reveals.push({
                cards: [
                    { color: CardColor.diamond, 'value': 13 },
                    { color: CardColor.spade, 'value': 13 },
                    { color: CardColor.heart, 'value': 13 },
                ],
                type: RevealType.Pair
            });
        }
        return {
            game, dealer, player1, player2
        };
    }
    it("test var1", () => {
        const { game, dealer, player1, player2 } = makeBaseGame();
        console.log(displayGame(game, dealer.id));
        const winner = calcPointWinner(game);
        expect(winner).toBe(player2.id);
    });
    it("test [player1 has same poitn as player2]", () => {
        const { game, dealer, player1, player2 } = makeBaseGame();
        player1.cards = [...player2.cards];
        console.log(displayGame(game, dealer.id));
        const winner = calcPointWinner(game);
        expect(winner).toBe(player2.id);
    });
    it("test [player1 has same poitn as player2] with less one turn", () => {
        const { game, dealer, player1, player2 } = makeBaseGame();
        player1.cards = [...player2.cards];
        game.turnInfo.turn -= 1;
        console.log(displayGame(game, dealer.id));
        const winner = calcPointWinner(game);
        expect(winner).toBe(player1.id);
    });
    it("test [player1 has same poitn as player2] with less two turn", () => {
        const { game, dealer, player1, player2 } = makeBaseGame();
        player1.cards = [...player2.cards];
        game.turnInfo.turn -= 2;
        console.log(displayGame(game, dealer.id));
        const winner = calcPointWinner(game);
        expect(winner).toBe(player2.id);
    });
});