import { Card, CardColor, getMeldListPoint, getPairs, getStraightFlush, makeCard, Meld } from "../src/Card";
import { getCollidedMelds } from "../src/graph/CollideMeld";
import { calcOptimalMeldGroup } from "../src/graph/MeldGraph";

describe("Graph", () => {
    it("Collided Melds simple scenario: two group collided", () => {
        let partA = [[1, 2, 3]];
        let partB = [[2, 2, 2]];
        const result = getCollidedMelds(partA, partB);
        expect(result).toStrictEqual([
            [[1, 2, 3], [2, 2, 2]] // couple of collapsed
        ]);
        expect(result.length).toBe(1);
    });
    it("Collided Melds simple scenario: three group collided", () => {
        let partA = [[1, 2, 3]];
        let partB = [[2, 2, 2], [3, 3, 3]];
        const result = getCollidedMelds(partA, partB);
        expect(result).toStrictEqual([
            [[1, 2, 3], [2, 2, 2]],// couple of collapsed
            [[1, 2, 3], [3, 3, 3]] // couple of collapsed
        ]);
        expect(result.length).toBe(2);
    });

    it("Card Collided simple scenario", () => {
        let partA: Card[][] = [[
            {
                color: CardColor.club,
                value: 7
            },
            {
                color: CardColor.heart,
                value: 7
            },
            {
                color: CardColor.diamond,
                value: 7
            }
        ], [
            {
                color: CardColor.club,
                value: 8
            },
            {
                color: CardColor.heart,
                value: 8
            },
            {
                color: CardColor.diamond,
                value: 8
            }
        ]];
        let partB = [[
            {
                color: CardColor.club,
                value: 7
            },
            {
                color: CardColor.club,
                value: 8
            },
            {
                color: CardColor.club,
                value: 9
            }
        ], [
            {
                color: CardColor.heart,
                value: 7
            },
            {
                color: CardColor.heart,
                value: 8
            },
            {
                color: CardColor.heart,
                value: 9
            }
        ]];
        const result = getCollidedMelds(partA, partB, (a, b) => {
            return a.color === b.color && a.value === b.value;
        });

        expect(result.length).toBe(4);
    });
    it("Card Collided complex scenario", () => {
        let partA: Card[][] = [
            [
                {
                    color: CardColor.club,
                    value: 7
                },
                {
                    color: CardColor.heart,
                    value: 7
                },
                {
                    color: CardColor.diamond,
                    value: 7
                }
            ], [
                {
                    color: CardColor.club,
                    value: 8
                },
                {
                    color: CardColor.heart,
                    value: 8
                },
                {
                    color: CardColor.diamond,
                    value: 8
                }
            ], [
                {
                    color: CardColor.club,
                    value: 9
                },
                {
                    color: CardColor.heart,
                    value: 9
                },
                {
                    color: CardColor.diamond,
                    value: 9
                }
            ], [
                {
                    color: CardColor.club,
                    value: 2
                },
                {
                    color: CardColor.heart,
                    value: 2
                },
                {
                    color: CardColor.diamond,
                    value: 2
                }
            ]];
        let partB = [[
            {
                color: CardColor.club,
                value: 7
            },
            {
                color: CardColor.club,
                value: 8
            },
            {
                color: CardColor.club,
                value: 9
            }
        ], [
            {
                color: CardColor.heart,
                value: 7
            },
            {
                color: CardColor.heart,
                value: 8
            },
            {
                color: CardColor.heart,
                value: 9
            }
        ], [
            {
                color: CardColor.diamond,
                value: 7
            },
            {
                color: CardColor.diamond,
                value: 8
            },
            {
                color: CardColor.diamond,
                value: 9
            }
        ]];
        const result = getCollidedMelds(partA, partB, (a, b) => {
            return a.color === b.color && a.value === b.value;
        });

        expect(result.length).toBe(9);
    });

});
describe("Card Graph", () => {
    it("Test1- three pairs collided with 3 straightFlush but with same value each", () => {
        let partA: Card[][] = [
            [
                {
                    color: CardColor.club,
                    value: 7
                },
                {
                    color: CardColor.heart,
                    value: 7
                },
                {
                    color: CardColor.diamond,
                    value: 7
                }
            ], [
                {
                    color: CardColor.club,
                    value: 8
                },
                {
                    color: CardColor.heart,
                    value: 8
                },
                {
                    color: CardColor.diamond,
                    value: 8
                }
            ], [
                {
                    color: CardColor.club,
                    value: 9
                },
                {
                    color: CardColor.heart,
                    value: 9
                },
                {
                    color: CardColor.diamond,
                    value: 9
                }
            ]];
        let partB: Card[][] = [[
            {
                color: CardColor.club,
                value: 7
            },
            {
                color: CardColor.club,
                value: 8
            },
            {
                color: CardColor.club,
                value: 9
            }
        ], [
            {
                color: CardColor.heart,
                value: 7
            },
            {
                color: CardColor.heart,
                value: 8
            },
            {
                color: CardColor.heart,
                value: 9
            }
        ], [
            {
                color: CardColor.diamond,
                value: 7
            },
            {
                color: CardColor.diamond,
                value: 8
            },
            {
                color: CardColor.diamond,
                value: 9
            }
        ]];
        const bestChoice = calcOptimalMeldGroup(partA, partB);
        expect(getMeldListPoint(bestChoice)).toBe((7 + 8 + 9) * 3);
    });
    it("Test2 Zero Collided", () => {
        let partA: Card[][] = [];
        let partB: Card[][] = [[
            {
                color: CardColor.club,
                value: 7
            },
            {
                color: CardColor.club,
                value: 8
            },
            {
                color: CardColor.club,
                value: 9
            }
        ], [
            {
                color: CardColor.heart,
                value: 7
            },
            {
                color: CardColor.heart,
                value: 8
            },
            {
                color: CardColor.heart,
                value: 9
            }
        ]];
        const bestChoice = calcOptimalMeldGroup(partA, partB);
        expect(getMeldListPoint(bestChoice)).toBe((7 + 8 + 9) * 2);
    });
    it("Test3 1 collided with 2", () => {
        let partA: Meld[] = [
            [
                {
                    color: CardColor.club,
                    value: 7
                },
                {
                    color: CardColor.heart,
                    value: 7
                },
                {
                    color: CardColor.diamond,
                    value: 7
                }
            ]];
        let partB: Meld[] = [[
            {
                color: CardColor.club,
                value: 7
            },
            {
                color: CardColor.club,
                value: 8
            },
            {
                color: CardColor.club,
                value: 9
            }
        ], [
            {
                color: CardColor.heart,
                value: 7
            },
            {
                color: CardColor.heart,
                value: 8
            },
            {
                color: CardColor.heart,
                value: 9
            }
        ]];
        const bestChoice = calcOptimalMeldGroup(partA, partB);
        const points = getMeldListPoint(bestChoice);
        expect(points).toBe((7 + 8 + 9) * 2);
    });
    it("Test3 no collision", () => {
        let partA: Meld[] = [
            [
                {
                    color: CardColor.club,
                    value: 11
                },
                {
                    color: CardColor.heart,
                    value: 11
                },
                {
                    color: CardColor.diamond,
                    value: 11
                }
            ]];
        let partB: Meld[] = [[
            {
                color: CardColor.club,
                value: 7
            },
            {
                color: CardColor.club,
                value: 8
            },
            {
                color: CardColor.club,
                value: 9
            }
        ], [
            {
                color: CardColor.heart,
                value: 7
            },
            {
                color: CardColor.heart,
                value: 8
            },
            {
                color: CardColor.heart,
                value: 9
            }
        ]];
        const bestChoice = calcOptimalMeldGroup(partA, partB);
        const points = getMeldListPoint(bestChoice);
        expect(points).toBe((7 + 8 + 9) * 2 + 10 * 3);
    });


});

describe("Optimal Meld Group", () => {

    describe("testWithData", () => {
        const testWithData: Array<{ description: string; cards: Card[]; optimalMeld: Meld[]; }> = [
            {
                description: "no card, no melds",
                cards: [],
                optimalMeld: []
            }, {
                description: "one card, no melds",
                cards: [makeCard(7, CardColor.club)],
                optimalMeld: []
            },
            {
                description: "pair of 7",
                cards: [makeCard(7, CardColor.club), makeCard(7, CardColor.heart), makeCard(7, CardColor.diamond),],
                optimalMeld: [
                    [makeCard(7, CardColor.club), makeCard(7, CardColor.diamond), makeCard(7, CardColor.diamond),]
                ]
            },
            {
                description: "Collision of one pairs and one sf ",
                cards: [
                    makeCard(7, CardColor.club), makeCard(7, CardColor.heart), makeCard(7, CardColor.diamond),
                    makeCard(8, CardColor.diamond), makeCard(9, CardColor.diamond),
                ],
                optimalMeld: [
                    [makeCard(7, CardColor.diamond), makeCard(8, CardColor.diamond), makeCard(9, CardColor.diamond),]
                ]
            },
        ];
        it.each(testWithData)('$description', ({ cards, optimalMeld }) => {
            const sfList = getStraightFlush(cards);
            const pairs = getPairs(cards);
            const meldSelestion = calcOptimalMeldGroup(pairs, sfList);
            expect(optimalMeld.length).toBe(meldSelestion.length);
            expect(getMeldListPoint(meldSelestion)).toBe(getMeldListPoint(optimalMeld));

        });
    });
});