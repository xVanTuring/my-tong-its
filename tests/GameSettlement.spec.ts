import { CardColor, makeCard } from "../src/Card";
import { calcPointWinner, FightChoice, Game, startAutoFinalFight } from "../src/Game";
import { makeHolder } from "../src/Holder";
import { RevealType } from "../src/RevealGroup";

describe("Game Settlement", () => {
    it("Point Winner: one player with no reveals", () => {
        const dealer = makeHolder();
        const player1 = makeHolder();
        const player2 = makeHolder();
        const game: Game = {
            holders: [dealer, player1, player2],
            centralStack: [],
            diposedStack: [],
            turnInfo: {
                fighting: false,
                picked: false,
                turn: 10,
                fightChoice: [FightChoice.Unchosen, FightChoice.Unchosen, FightChoice.Unchosen],
                winner: null,
                dropped: false,
            }
        };
        dealer.cards = [
            makeCard(10, CardColor.club),
            makeCard(8, CardColor.diamond),
            makeCard(1, CardColor.club)
        ];
        dealer.reveals = [
            {
                cards: [makeCard(1, CardColor.club),
                makeCard(2, CardColor.club),
                makeCard(3, CardColor.club),],
                type: RevealType.StraightFlush
            }
        ];
        player1.cards = [
            makeCard(2, CardColor.diamond),
            makeCard(4, CardColor.spade),
            makeCard(1, CardColor.heart)
        ];
        player1.reveals = [
            {
                cards: [
                    makeCard(1, CardColor.spade),
                    makeCard(2, CardColor.spade),
                    makeCard(3, CardColor.spade),],
                type: RevealType.StraightFlush
            }
        ];

        player2.cards = [
            makeCard(10, CardColor.spade),
            makeCard(11, CardColor.heart),
            makeCard(12, CardColor.club),
        ];
        startAutoFinalFight(game);
        expect(game.turnInfo.fightChoice[2]).toBe(FightChoice.Burnt);
        expect(game.turnInfo.winner).toBe(player1.id);

    });
    it("Point Winner: one player with no reveals but a secret also large point", () => {
        const dealer = makeHolder();
        const player1 = makeHolder();
        const player2 = makeHolder();
        const game: Game = {
            holders: [dealer, player1, player2],
            centralStack: [],
            diposedStack: [],
            turnInfo: {
                fighting: false,
                picked: false,
                turn: 10,
                fightChoice: [FightChoice.Unchosen, FightChoice.Unchosen, FightChoice.Unchosen],
                winner: null,
                dropped: false
            }
        };
        dealer.cards = [
            makeCard(10, CardColor.club),
            makeCard(8, CardColor.diamond),
            makeCard(1, CardColor.club)
        ];
        dealer.reveals = [
            {
                cards: [makeCard(1, CardColor.club),
                makeCard(2, CardColor.club),
                makeCard(3, CardColor.club),],
                type: RevealType.StraightFlush
            }
        ];
        player1.cards = [
            makeCard(2, CardColor.diamond),
            makeCard(4, CardColor.spade),
            makeCard(1, CardColor.heart)
        ];
        player1.reveals = [
            {
                cards: [
                    makeCard(1, CardColor.spade),
                    makeCard(2, CardColor.spade),
                    makeCard(3, CardColor.spade),],
                type: RevealType.StraightFlush
            }
        ];

        player2.cards = [
            makeCard(9, CardColor.club),
            makeCard(10, CardColor.spade),
            makeCard(11, CardColor.spade),
            makeCard(12, CardColor.spade),
            makeCard(13, CardColor.spade),
        ];

        startAutoFinalFight(game);
        expect(game.turnInfo.fightChoice[2]).toBe(FightChoice.Unchosen);
        expect(game.turnInfo.winner).toBe(player1.id);
    });
    it("Point Winner: one player with secret meld but with small point", () => {
        const dealer = makeHolder();
        const player1 = makeHolder();
        const player2 = makeHolder();
        const game: Game = {
            holders: [dealer, player1, player2],
            centralStack: [],
            diposedStack: [],
            turnInfo: {
                fighting: false,
                picked: false,
                turn: 10,
                fightChoice: [FightChoice.Unchosen, FightChoice.Unchosen, FightChoice.Unchosen],
                winner: null,
                dropped: false
            }
        };
        dealer.cards = [
            makeCard(10, CardColor.club),
            makeCard(8, CardColor.diamond),
            makeCard(1, CardColor.club)
        ];
        dealer.reveals = [
            {
                cards: [makeCard(1, CardColor.club),
                makeCard(2, CardColor.club),
                makeCard(3, CardColor.club),],
                type: RevealType.StraightFlush
            }
        ];
        player1.cards = [
            makeCard(2, CardColor.diamond),
            makeCard(4, CardColor.spade),
            makeCard(1, CardColor.heart)
        ];
        player1.reveals = [
            {
                cards: [
                    makeCard(1, CardColor.spade),
                    makeCard(2, CardColor.spade),
                    makeCard(3, CardColor.spade),],
                type: RevealType.StraightFlush
            }
        ];

        player2.cards = [
            makeCard(1, CardColor.heart),
            makeCard(10, CardColor.spade),
            makeCard(11, CardColor.spade),
            makeCard(12, CardColor.spade),
            makeCard(13, CardColor.spade),
        ];
        startAutoFinalFight(game);
        expect(game.turnInfo.fightChoice[2]).toBe(FightChoice.Unchosen);

        expect(game.turnInfo.winner).toBe(player2.id);
    });
});