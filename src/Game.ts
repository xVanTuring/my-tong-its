import { create as createRandom } from "random-seed";
import { Card, getCardPoint, getMeldPoint, getPairs, getStraightFlush, hasSecretMeld, makeDeckofCard } from "./Card";
import { calcOptimalMeldGroup } from "./graph/MeldGraph";
import { Holder } from "./Holder";
import { log2File } from "./LogFile";
export enum FightChoice {
    Fight,
    Fold,
    Challenge,
    Burnt,
    Unchosen,
}
/** 一场对局 */
export interface Game {
    holders: Holder[];
    centralStack: Card[];
    diposedStack: Card[];
    turnInfo: {
        turn: number;
        picked: boolean;
        /** revealed */
        dropped: boolean;
        fighting: boolean;
        fightChoice: [FightChoice, FightChoice, FightChoice];
        winner: string | null;
    };
}
const rand = createRandom("11");
// https://github.com/ccforward/cc/issues/44
function shuffle<T>(arr: T[]) {
    let n = arr.length;
    let random: number;
    while (0 != n) {
        random = (rand.random() * n--) >>> 0; // 无符号右移位运算符向下取整
        [arr[n], arr[random]] = [arr[random], arr[n]]; // ES6的结构赋值实现变量互换
    }
    return arr;
}


export function startOneGame(holders: [dealer: Holder, player: Holder, player: Holder]) {
    const cards = shuffle(makeDeckofCard());
    for (let i = 0; i < 12; i++) {
        holders.forEach(holder => {
            const card = cards.pop();
            if (card == null) {
                throw new Error("Not Enogh Card!");
            }
            holder.cards.push(card);
        });
    }
    const card = cards.pop();
    if (card == null) {
        throw new Error("Not Enogh Card!");
    }
    holders[0].cards.push(card);
    const game: Game = {
        holders,
        centralStack: cards,
        diposedStack: [],
        turnInfo: {
            turn: 0,
            picked: true, // 开局第一个人只能pick
            dropped: false,
            fighting: false,
            fightChoice: [FightChoice.Unchosen, FightChoice.Unchosen, FightChoice.Unchosen],
            winner: null,
        }
    };
    return game;
}


export function getMe(game: Game) {
    return game.holders[game.turnInfo.turn % game.holders.length];
}
export function getLeft(game: Game) {
    return game.holders[(game.turnInfo.turn + 2) % game.holders.length];
}
export function getRight(game: Game) {
    return game.holders[(game.turnInfo.turn + 1) % game.holders.length];
}

export function startAutoFinalFight(game: Game) {
    if (game.centralStack.length > 0) {
        throw new Error("Still have central cards, can't start auto final fight");
    }
    game.holders.forEach((holder, idx) => {
        if (holder.reveals.length === 0 && !hasSecretMeld(holder.cards)) {
            game.turnInfo.fightChoice[idx] = FightChoice.Burnt;
        }
    });
    const winner = calcPointWinner(game);
    game.turnInfo.winner = winner;
}

export function calcPointWinner(game: Game) {
    const holderPoint: Array<{ id: string; point: number; uncounted: boolean; }> = game.holders.map((holder, idx) => {
        const info = {
            id: holder.id,
            point: Infinity,
            uncounted: false
        };
        info.point = calcPoint(holder);

        if (game.turnInfo.fightChoice[idx] === FightChoice.Fold || game.turnInfo.fightChoice[idx] === FightChoice.Burnt) {
            info.uncounted = true;
        }
        return info;
    });
    for (const info of holderPoint) {
        const { id, point } = info;
        const holder = game.holders.find(holder => holder.id === id);
        if (holder == null) {
            throw new Error(`No holder found for ${id}`);
        }
        log2File(`User: ${id} of Name ${holder.name} got points: ${point} with FightChoice ${game.turnInfo.fightChoice[game.holders.indexOf(holder)]}`);
    }

    const minScore = Math.min(...holderPoint.filter((p) => !p.uncounted)
        .map((d) => d.point));
    let iter = 1;
    while (iter < 5) {
        const lastIndex = (game.turnInfo.turn - iter) % game.holders.length;
        if (holderPoint[lastIndex].point === minScore) {
            return holderPoint[lastIndex].id;
        }
        iter++;
    }
    throw new Error("No winner is found");
}
export function calcPoint(holder: Holder) {
    if (holder.reveals.length === 0) {
        const secretPairs = getPairs(holder.cards, 4);
        const secretSFList = getStraightFlush(holder.cards, 4);
        if (secretPairs.length === 0 && secretSFList.length === 0) {
            return getMeldPoint(holder.cards);
        } else {
            const secretMeldGroup = new Set(calcOptimalMeldGroup(secretPairs, secretSFList).flat());
            const restCards = holder.cards.filter((card) => !secretMeldGroup.has(card));
            const restPairs = getPairs(restCards);
            const restSFList = getStraightFlush(restCards);
            const optimalRestGroup = new Set(calcOptimalMeldGroup(restPairs, restSFList).flat());
            return getMeldPoint(holder.cards.filter((card) => !secretMeldGroup.has(card) && !optimalRestGroup.has(card)));
        }
    } else {
        const pairs = getPairs(holder.cards);
        const sfList = getStraightFlush(holder.cards);
        const meldCards = new Set(calcOptimalMeldGroup(pairs, sfList).flat());
        const point = holder.cards.filter(card => !meldCards.has(card)).reduce((acc, card) => { return acc + getCardPoint(card); }, 0);
        return point;
    }
}

export function calcFightWinner(game: Game) {
    const winner = calcPointWinner(game);
    game.turnInfo.winner = winner;
}

