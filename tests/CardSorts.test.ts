import { Card, CardColor, displayCards, getPairs, getStraightFlush, getStraightFlushOneColor, makeDeckofCard, sortCards } from "../src/Card";

describe("Card sort", () => {
    it("Value check", () => {
        const cards: Card[] = [
            {
                color: CardColor.club,
                value: 3
            },
            {
                color: CardColor.club,
                value: 1
            },
            {
                color: CardColor.club,
                value: 2
            },
            {
                color: CardColor.spade,
                value: 2
            }
        ];
        sortCards(cards);
        let lastOne = cards[0];
        for (let i = 1; i < cards.length; i++) {
            expect(cards[i].value).toBeGreaterThanOrEqual(lastOne.value);
            lastOne = cards[i];
        }
    });
    it("Color check", () => {
        const cards: Card[] = [
            {
                color: CardColor.club,
                value: 3
            },
            {
                color: CardColor.heart,
                value: 3
            },
            {
                color: CardColor.diamond,
                value: 3
            },
            {
                color: CardColor.spade,
                value: 3
            }
        ];
        sortCards(cards);
        expect(cards.map((c) => c.color)).toStrictEqual([
            CardColor.diamond, CardColor.club, CardColor.heart, CardColor.spade
        ]);
    });
    it("Deck Cards check", () => {
        const cards: Card[] = makeDeckofCard();
        sortCards(cards);
        for (let i = 0; i < cards.length; i += 4) {
            expect(cards.slice(i, i + 4).map((c) => c.color)).toStrictEqual([
                CardColor.diamond, CardColor.club, CardColor.heart, CardColor.spade
            ]);
            const values = cards.slice(i, i + 4).map((c) => c.value);
            expect(values).toStrictEqual([values[0], values[0], values[0], values[0]]);
        }
        console.log(displayCards(cards).join("\n"));
    });
});

describe("StraightFlush", () => {
    it("Straight Detection 1 Straight With minLength 3", () => {
        let cards: Card[] = [
            {
                color: CardColor.diamond,
                value: 3
            },
            {
                color: CardColor.diamond,
                value: 4
            },
            {
                color: CardColor.diamond,
                value: 6
            },
            {
                color: CardColor.diamond,
                value: 7
            },
            {
                color: CardColor.diamond,
                value: 8
            },
        ];
        const result = getStraightFlushOneColor(cards);
        expect(result.length).toBe(1);
    });
    it("Straight Detection 1 Straight With minLength 4", () => {
        let cards: Card[] = [
            {
                color: CardColor.diamond,
                value: 3
            },
            {
                color: CardColor.diamond,
                value: 4
            },
            {
                color: CardColor.diamond,
                value: 6
            },
            {
                color: CardColor.diamond,
                value: 7
            },
            {
                color: CardColor.diamond,
                value: 8
            },
        ];
        const result = getStraightFlushOneColor(cards, 4);
        expect(result.length).toBe(0);
    });
    it("StraightFlush miss one card", () => {
        let cards: Card[] = [
            {
                color: CardColor.diamond,
                value: 3
            },
            {
                color: CardColor.diamond,
                value: 4
            },
            {
                color: CardColor.diamond,
                value: 6
            },
            {
                color: CardColor.diamond,
                value: 7
            },
            {
                color: CardColor.spade,
                value: 8
            },
        ];
        const result = getStraightFlush(cards);
        expect(result.length).toBe(0);
    });
    it("StraightFlush multiple ", () => {
        let cards: Card[] = [
            {
                color: CardColor.spade,
                value: 3
            },
            {
                color: CardColor.spade,
                value: 4
            },
            {
                color: CardColor.spade,
                value: 5
            },
            {
                color: CardColor.diamond,
                value: 4
            },
            {
                color: CardColor.diamond,
                value: 6
            },
            {
                color: CardColor.diamond,
                value: 7
            },
            {
                color: CardColor.diamond,
                value: 8
            },
        ];
        const result = getStraightFlush(cards);
        expect(result.length).toBe(2);
    });
});
describe("Pairs", () => {

    it("Pair Detection 3 cards", () => {
        let cards: Card[] = [
            {
                color: CardColor.diamond,
                value: 3
            },
            {
                color: CardColor.heart,
                value: 3
            },
            {
                color: CardColor.spade,
                value: 3
            },

        ];
        const result = getPairs(cards);
        expect(result.length).toBe(1);
    });
    it("Pair Detection 4 cards", () => {
        let cards: Card[] = [
            {
                color: CardColor.diamond,
                value: 3
            },
            {
                color: CardColor.heart,
                value: 3
            },
            {
                color: CardColor.spade,
                value: 3
            },
            {
                color: CardColor.spade,
                value: 3
            },
            {
                color: CardColor.heart,
                value: 4
            },

        ];
        const result = getPairs(cards);
        expect(result.length).toBe(1);
    });
    it("Pair Detection 4 cards no pairs", () => {
        let cards: Card[] = [
            {
                color: CardColor.diamond,
                value: 3
            },
            {
                color: CardColor.heart,
                value: 3
            },
            {
                color: CardColor.spade,
                value: 2
            },
            {
                color: CardColor.spade,
                value: 2
            },

        ];
        const result = getPairs(cards);
        expect(result.length).toBe(0);
    });
});

describe("StraightFlush and Pairs", () => {
    let cards: Card[] = [
        {
            color: CardColor.club,
            value: 7
        },
        {
            color: CardColor.diamond,
            value: 7
        },
        {
            color: CardColor.heart,
            value: 7
        },
        {
            color: CardColor.heart,
            value: 6
        },
        {
            color: CardColor.heart,
            value: 8
        },
    ];
    it("Double Detection", () => {
        const pairs = getPairs(cards);
        expect(pairs.length).toBe(1);
        const sfs = getStraightFlush(cards);
        expect(sfs.length).toBe(1);
        const meldIdMap = new Map<Card[], number>();
        let i = 0;
        pairs.forEach(pair => {
            meldIdMap.set(pair, i);
            i++;
        });
        sfs.forEach(sf => {
            meldIdMap.set(sf, i);
            i++;
        });
        //  7 7 7  
        //  8 8 8 
        //  9 9 9 
    });
});