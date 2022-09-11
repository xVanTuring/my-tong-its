import { Card, sortCards } from "./Card";
import { Game, getMe } from "./Game";
import { RevealGroup, RevealType } from "./RevealGroup";

export enum Action {
    PickFromCentralStack = "PickFromCentralStack",
    PickFromDiposedStackAndReveal = "PickFromDiposedStackAndReveal",
    RevealGroup = "RevealGroup",
    // 丢到已有的组
    Sapaw = "Sapaw",
    Dump = "Dump"
    // FOGHT
    // FOLD,
    // CHALLENGE
}

export const StartAction = [Action.PickFromCentralStack, Action.PickFromCentralStack,];
export const EndAction = [Action.Dump];

export type PickActionData = {};
export type DumpActionData = { card?: Card; };
export type PickFromDiposedStackAndRevealData = {
    /** 手中持有的牌,不包括弃牌上的牌 */
    matchedCard: Card[];
    revealType: RevealType;
};
export type RevealGroupData = {
    group: RevealGroup;
};
export type SapawData = {
    groupIdx: number;
    cards: Card[];
    holder: string;
};
export type ActionWithData = { action: Action.PickFromCentralStack, data: PickActionData; } |
    PickDiposedAndRevealActionData |
{ action: Action.Sapaw, data: SapawData; } |
{ action: Action.RevealGroup, data: RevealGroupData; } |
{ action: Action.Dump, data: DumpActionData; };
export function getAvaliableActions(game: Game, as: string): ActionWithData[] {
    const me = game.holders.find(h => h.id === as);
    if (me == null) {
        throw new Error("No such user");
    }
    if (game.holders[game.turnInfo.turn % game.holders.length].id !== as) {
        throw new Error("Current user is not allowed to take action");
    }
    if (!game.turnInfo.picked) {
        // FIGHT
        const list: ActionWithData[] = [
            {
                action: Action.PickFromCentralStack,
                data: {
                }
            }
        ];
        calcDisposedPickAction(me.cards, game.diposedStack.at(-1)!);
        return list;
    }
    const list: ActionWithData[] = [{
        action: Action.Dump,
        // 列出全部可能
        data: {}
    }];
    return list;

}

export function getPairsWith(cards: Card[], target: Card): PickDiposedAndRevealActionData | null {
    const pairCards = cards.filter((c) => c.value === target.value);
    if (pairCards.length >= 2) {
        // 3 或4个同数值
        return {
            action: Action.PickFromDiposedStackAndReveal,
            data: {
                revealType: RevealType.Pair,
                matchedCard: pairCards
            }
        };
    }
    return null;
}
export function getStraightFlushWith(cards: Card[], target: Card): PickDiposedAndRevealActionData | null {
    // 3个以上同花色
    const sameColorCards = cards.filter((card) => card.color === target.color);
    // check size first
    const straightFlushList: Card[] = [];
    const edgeList = [target];
    while (edgeList.length > 0) {
        const compare = edgeList.pop();
        if (compare == null) {
            break;
        }

        const nears = sameColorCards.filter((card) => {
            return Math.abs(card.value - target.value) === 1 && !straightFlushList.includes(card);
        });
        nears.forEach((card) => {
            edgeList.push(card);
            straightFlushList.push(card);
        });

    }
    if (straightFlushList.length >= 2) {
        // 不加上弃牌超过2张
        return {
            action: Action.PickFromDiposedStackAndReveal,
            data: {
                matchedCard: straightFlushList,
                revealType: RevealType.StraightFlush
            }
        };
    }
    return null;
}
type PickDiposedAndRevealActionData = { action: Action.PickFromDiposedStackAndReveal, data: PickFromDiposedStackAndRevealData; };
export function calcDisposedPickAction(cards: Card[], disposedCard: Card): { action: Action.PickFromDiposedStackAndReveal, data: PickFromDiposedStackAndRevealData; } | null {
    // TODO: 列出全部
    const avaliableChoose: Array<PickDiposedAndRevealActionData> = [];
    let pairChoose = getPairsWith(cards, disposedCard);
    if (pairChoose != null) {
        avaliableChoose.push(pairChoose);
    }
    let straightFlushChoose = getStraightFlushWith(cards, disposedCard);
    if (straightFlushChoose != null) {
        avaliableChoose.push(straightFlushChoose);
    }
    if (avaliableChoose.length === 1)
        return avaliableChoose[0];
    if (avaliableChoose.length === 2) {
        const option1Value = avaliableChoose[0].data.matchedCard
            .reduce((pre, cur) => pre + cur.value, 0);
        const option2Value = avaliableChoose[1].data.matchedCard
            .reduce((pre, cur) => pre + cur.value, 0);
        // TODO: 列出全部
        if (option1Value > option2Value) {
            return avaliableChoose[0];
        }
        return avaliableChoose[1];
    }
    return null;
}
export function makeAction(game: Game, actionWithData: ActionWithData, as: string) {
    function nextTurn(game: Game) {
        game.turnInfo.turn++;
        game.turnInfo.picked = false;
    }

    // check user 
    const me = game.holders.find(holder => holder.id == as);
    if (me == null) {
        throw new Error("Can't find holder");
    }
    // check valid
    if (actionWithData.action === Action.PickFromCentralStack ||
        actionWithData.action === Action.PickFromDiposedStackAndReveal) {
        if (game.turnInfo.picked) {
            // invalid action
            return;
        }
    }

    if (!game.turnInfo.picked) {
        if (actionWithData.action !== Action.PickFromCentralStack &&
            actionWithData.action !== Action.PickFromDiposedStackAndReveal) {
            // invalid action
            return;
        }
    }
    if (actionWithData.action === Action.PickFromCentralStack) {
        const topCard = game.centralStack.pop();
        if (topCard == null) {
            throw new Error("Shouldn't happen, if there is no card left, should start fight");
        }
        me.cards.push(topCard);
        game.turnInfo.picked = true;
        return;
    }
    if (actionWithData.action === Action.PickFromDiposedStackAndReveal) {
        const disposedCard = game.diposedStack.pop();
        if (disposedCard == null) {
            throw new Error("Shouldn't happen, Disposed card should not be null");
        }
        const inHands = actionWithData.data.matchedCard;
        inHands.forEach((card) => {
            me.cards.splice(me.cards.indexOf(card), 1);
        });
        me.reveals.push({
            type: actionWithData.data.revealType,
            cards: [...inHands, disposedCard].sort((a, b) => a.value - b.value)
        });
        game.turnInfo.picked = true;
        return;
    }
    if (actionWithData.action === Action.RevealGroup) {
        actionWithData.data.group.cards.forEach((card) => {
            me.cards.splice(me.cards.indexOf(card), 1);
        });
        me.reveals.push(actionWithData.data.group);
        return;
    }
    if (actionWithData.action === Action.Dump) {
        if (actionWithData.data.card) {
            me.cards.splice(me.cards.indexOf(actionWithData.data.card), 1);
            game.diposedStack.push(actionWithData.data.card);
        }
        nextTurn(game);
        return;
    }
    if (actionWithData.action === Action.Sapaw) {
        const holder = game.holders.find(holder => holder.id === actionWithData.data.holder);
        if (holder == null) {
            return;
        }
        const me = getMe(game);
        // make holder unfight-able
        const revealGroup = holder.reveals[actionWithData.data.groupIdx];
        const cards = actionWithData.data.cards;
        cards.forEach((card) => {
            me.cards.splice(me.cards.indexOf(card), 1);
            revealGroup.cards.push(card);
        });
        sortCards(revealGroup.cards);
    }
}
