import { create as createRandom } from "random-seed";
import { Card, getCardPoint, getPairs, getStraightFlush, makeDeckofCard } from "./Card";
import { Holder } from "./Holder";
/** 一场对局 */
export interface Game {
    holders: Holder[];
    centralStack: Card[];
    diposedStack: Card[];
    turnInfo: {
        turn: number;
        picked: boolean;
        fighting: boolean;
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
            picked: true,
            fighting: false,
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
    const winner = calcPointWinner(game);
    return winner;
}

export function calcPointWinner(game: Game) {
    const holderPoint: { id: string; point: number; }[] = [];
    game.holders.forEach((holder) => {
        if (holder.reveals.length === 0) {
            const secretPairs = getPairs(holder.cards, 4);
            const secretSFList = getStraightFlush(holder.cards, 4);
            if (secretPairs.length === 0 && secretSFList.length === 0) {
                holderPoint.push({
                    id: holder.id,
                    point: Infinity
                });
            } else {
                const secretCards = new Set([...secretPairs.flat(), ...secretSFList.flat()]);
                const point = holder.cards.filter((card) => !secretCards.has(card)).reduce((acc, card) => { return acc + getCardPoint(card); }, 0);
                holderPoint.push({
                    id: holder.id,
                    point
                });
            }
            return;
        }
        const point = holder.cards.reduce((acc, card) => { return acc + getCardPoint(card); }, 0);
        holderPoint.push({
            id: holder.id,
            point: point
        });
    });

    const minScore = Math.min(...holderPoint.map((d) => d.point));
    let iter = 1;
    while (true) {
        const lastIndex = (game.turnInfo.turn - iter) % game.holders.length;
        if (holderPoint[lastIndex].point === minScore) {
            return holderPoint[lastIndex].id;
        }
        iter++;
    }

}
