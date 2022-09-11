import { CardColor, makeCard } from "../src/Card";
import { FightChoice, Game, getMe } from "../src/Game";
import { makeHolder } from "../src/Holder";
import { RevealType } from "../src/RevealGroup";
import { Action, makeAction } from "../src/Actions";

describe("FightAction", () => {

    it("Fight with other auto burnt", () => {
        const dealer = makeHolder();
        const player1 = makeHolder();
        const player2 = makeHolder();
        const game: Game = {
            centralStack: [],
            holders: [dealer, player1, player2],
            diposedStack: [],
            turnInfo: {
                fighting: false,
                picked: false,
                turn: 30,
                fightChoice: [FightChoice.Unchosen, FightChoice.Unchosen, FightChoice.Unchosen],
                winner: null,
                dropped: false
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
            player1.reveals = [];
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
            player2.reveals = [];
        }
        const me = getMe(game);
        expect(me.id).toBe(dealer.id);
        makeAction(game, {
            action: Action.Fight,
            data: {}
        });
        expect(game.turnInfo.fighting).toBe(true);
        expect(game.turnInfo.fightChoice).toStrictEqual([FightChoice.Fight, FightChoice.Burnt, FightChoice.Burnt,]);
        expect(game.turnInfo.winner).toBe(me.id);
    });
    it("Fight with other one  burnt one challenge", () => {
        const dealer = makeHolder();
        const player1 = makeHolder();
        const player2 = makeHolder();
        const game: Game = {
            centralStack: [],
            holders: [dealer, player1, player2],
            diposedStack: [],
            turnInfo: {
                fighting: false,
                picked: false,
                turn: 30,
                fightChoice: [FightChoice.Unchosen, FightChoice.Unchosen, FightChoice.Unchosen],
                winner: null,
                dropped: false
            }
        };
        {
            dealer.cards = [{
                color: CardColor.club,
                value: 5
            }, {
                color: CardColor.club,
                value: 6
            }];
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
            player1.cards = [{
                color: CardColor.club,
                value: 10
            }, {
                color: CardColor.club,
                value: 10
            }];
            player1.reveals = [];
        }
        {
            player2.cards = [
                {
                    color: CardColor.club,
                    value: 1
                }, {
                    color: CardColor.club,
                    value: 1
                }
            ];
            player2.reveals = [{
                cards: [
                    { color: CardColor.diamond, 'value': 11 },
                    { color: CardColor.spade, 'value': 11 },
                    { color: CardColor.heart, 'value': 11 },
                ],
                type: RevealType.Pair
            }];
        }
        const me = getMe(game);
        expect(me.id).toBe(dealer.id);
        makeAction(game, {
            action: Action.Fight,
            data: {}
        });
        expect(game.turnInfo.fighting).toBe(true);
        expect(game.turnInfo.fightChoice).toStrictEqual([FightChoice.Fight, FightChoice.Burnt, FightChoice.Unchosen]);
        const me2 = getMe(game);
        expect(me2.id).toBe(player2.id);
        makeAction(game, {
            action: Action.Challenge,
            data: {}
        });
        expect(game.turnInfo.fighting).toBe(true);
        expect(game.turnInfo.fightChoice).toStrictEqual([FightChoice.Fight, FightChoice.Burnt, FightChoice.Challenge,]);
        expect(game.turnInfo.winner).toBe(me2.id);
    });

    it("Fight with other one secret meld challenge ,one challenge", () => {
        const dealer = makeHolder();
        const player1 = makeHolder();
        const player2 = makeHolder();
        const game: Game = {
            centralStack: [],
            holders: [dealer, player1, player2],
            diposedStack: [],
            turnInfo: {
                fighting: false,
                picked: false,
                turn: 30,
                fightChoice: [FightChoice.Unchosen, FightChoice.Unchosen, FightChoice.Unchosen],
                winner: null,
                dropped: false
            }
        };
        {
            dealer.cards = [{
                color: CardColor.club,
                value: 5
            }, {
                color: CardColor.club,
                value: 6
            }];
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
            player1.cards = [{
                color: CardColor.club,
                value: 10
            }, {
                color: CardColor.spade,
                value: 10
            }, {
                color: CardColor.heart,
                value: 10
            }, {
                color: CardColor.spade,
                value: 10
            }, makeCard(1, CardColor.diamond)];
            player1.reveals = [];
        }
        {
            player2.cards = [
                {
                    color: CardColor.club,
                    value: 1
                }, {
                    color: CardColor.club,
                    value: 1
                }
            ];
            player2.reveals = [{
                cards: [
                    { color: CardColor.diamond, 'value': 11 },
                    { color: CardColor.spade, 'value': 11 },
                    { color: CardColor.heart, 'value': 11 },
                ],
                type: RevealType.Pair
            }];
        }
        const me = getMe(game);
        expect(me.id).toBe(dealer.id);
        makeAction(game, {
            action: Action.Fight,
            data: {}
        });
        expect(game.turnInfo.fighting).toBe(true);
        expect(game.turnInfo.fightChoice).toStrictEqual([FightChoice.Fight, FightChoice.Unchosen, FightChoice.Unchosen]);
        const me2 = getMe(game);
        expect(me2.id).toBe(player1.id);
        makeAction(game, {
            action: Action.Challenge,
            data: {}
        });
        expect(game.turnInfo.fighting).toBe(true);
        expect(game.turnInfo.fightChoice).toStrictEqual([FightChoice.Fight, FightChoice.Challenge, FightChoice.Unchosen,]);
        const me3 = getMe(game);
        expect(me3.id).toBe(player2.id);
        makeAction(game, {
            action: Action.Challenge,
            data: {}
        });
        expect(game.turnInfo.fightChoice).toStrictEqual([FightChoice.Fight, FightChoice.Challenge, FightChoice.Challenge,]);
        expect(game.holders.findIndex(h => h.id === player1.id)).toBe(1);

        expect(game.turnInfo.winner).toBe(player1.id);
    });
});