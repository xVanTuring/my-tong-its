import { calcOptimalMeldGroup } from "./graph/MeldGraph";

// 梅花| 黑桃 | 红心| 方块
export enum CardColor {
    spade = 's',
    heart = 'h',
    club = 'c',
    diamond = 'd'
}
const CardColorArray = [CardColor.club, CardColor.spade, CardColor.heart, CardColor.diamond] as const;
const ColorToShape: Record<CardColor, string> = {
    [CardColor.spade]: '♠',
    [CardColor.heart]: '♥',
    [CardColor.club]: '♣',
    [CardColor.diamond]: '♦',
};
const ColorToWeight: Record<CardColor, number> = {
    [CardColor.spade]: 3,
    [CardColor.heart]: 2,
    [CardColor.club]: 1,
    [CardColor.diamond]: 0,
};
export interface Card {
    value: number;
    color: CardColor;
}
export function makeCard(value: number, color: CardColor): Card {
    return {
        value, color
    };
}
export type Meld = Card[];
export function makeDeckofCard(): Array<Card> {
    const arr: Array<Card> = [];
    for (let i = 1; i < 14; i++) {
        CardColorArray.forEach((v) => {
            arr.push({ value: i, color: v });
        });
    }
    return arr;
}

export function displayCard(card: Card): [value: string, color: string] {
    const displayDict: Record<string, string> = {
        1: 'A',
        10: 'Ⅹ',
        11: 'J',
        12: 'Q',
        13: 'K'
    };
    const valueDisplayChar = displayDict[card.value] || String(card.value);
    const colorDisplayChar = ColorToShape[card.color];
    return [valueDisplayChar, colorDisplayChar];
}
export function numMapToLocation(num: number): string {
    const chars = ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'
        , '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯'];
    return chars[num] || String(num);
}

export function displayCards(card: Card[]): string[] {
    const line1: string[] = [];
    const line2: string[] = [];
    const lineInd: string[] = [];

    card.forEach((c, idx) => {
        const [value, color] = displayCard(c);
        line1.push(value);
        line2.push(color);
        lineInd.push(numMapToLocation(idx + 1));
    });
    function makeLine(line: string[]) {
        return `|${line.join('|')}|`;
    }
    return [makeLine(line1), makeLine(line2), makeLine(lineInd)];
}

export function displayCardByGroup(cards: Card[]): string[] {
    const line1: string[] = [];
    const line2: string[] = [];
    const lineInd: string[] = [];
    const pairs = getPairs(cards);
    const sfList = getStraightFlush(cards);

    const meldList = calcOptimalMeldGroup(pairs, sfList);
    const meldCards = new Set(meldList.flat());

    const leftCards = cards.filter((card) => !meldCards.has(card));
    const displayOneCard = (card: Card): void => {
        const [value, color] = displayCard(card);
        line1.push(value);
        line2.push(color);
        const idx = cards.indexOf(card);
        lineInd.push(numMapToLocation(idx + 1));
    };
    meldList.forEach((meld) => {
        meld.forEach(displayOneCard);
        line1.push("  ");
        line2.push("  ");
        lineInd.push("  ");
    });
    leftCards.forEach(displayOneCard);
    function makeLine(line: string[]) {
        return `|${line.join('|')}|`;
    }
    return [makeLine(line1), makeLine(line2), makeLine(lineInd)];
}

export function isPairs(cards: Card[]): boolean {
    return cards.every((c) => c.value === cards[0].value);
}
export function isStraightFlush(cards: Card[]): boolean {
    const flush = cards.every((card) => card.color === cards[0].color);
    if (!flush) {
        return false;
    }
    const sorted = [...cards].sort((a, b) => a.value - b.value);
    let last = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].value - last.value !== 1)
            return false;
        last = sorted[i];
    }
    return true;
}

export function sortCards(cards: Card[]) {
    return cards.sort((a, b) => {
        if (a.value !== b.value) {
            return a.value - b.value;
        }
        return ColorToWeight[a.color] - ColorToWeight[b.color];
    });
}
export function getCardPoint(card: Card) {
    return Math.min(card.value, 10);
}
export function getMeldPoint(meld: Meld) {
    return meld.reduce((pre, cur) => {
        return pre + getCardPoint(cur);
    }, 0);
}
export function getMeldListPoint(meld: Meld[]) {
    return meld.reduce((pre, cur) => {
        return pre + getMeldPoint(cur);
    }, 0);
}
export function getStraightFlushOneColor(_cards: Card[], minLength = 3): Meld[] {
    const cards = [..._cards].sort((a, b) => a.value - b.value);
    let lastCard: Card | null = null;
    let straightGroups: Card[][] = [];
    while (cards.length > 0) {
        const card = cards.shift();
        if (card == null) {
            break;
        }
        if (lastCard == null) {
            straightGroups.push([card]);
            lastCard = card;
            continue;
        }
        if (card.value - lastCard.value === 1) {
            straightGroups.at(-1)?.push(card);
            lastCard = card;
        } else {
            straightGroups.push([card]);
            lastCard = card;
        }
    }
    const qualified = straightGroups.filter(group => group.length >= minLength);
    return qualified;
}
;
export function getStraightFlush(cards: Card[], minLength = 3): Meld[] {
    return CardColorArray.map((color) => {
        return getStraightFlushOneColor(cards.filter((c) => c.color === color), minLength);
    }).flat();
}

export function getPairs(_cards: Card[], minLength = 3) {
    const cards = [..._cards].sort();
    const dict = new Map<number, Card[]>();
    cards.forEach(card => {
        let group = dict.get(card.value);
        if (group == null) {
            group = [];
            dict.set(card.value, group);
        }
        group.push(card);
    });
    const pairList: Card[][] = [];
    for (let [k, v] of dict.entries()) {
        if (v.length >= minLength) {
            pairList.push(v);
        }
    }
    return pairList;
}

export function getSecretMeld(_cards: Card[]) {
    throw Error("Not Implemented");
}
