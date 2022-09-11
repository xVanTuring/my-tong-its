import { Action, ActionWithData } from "./Actions";
import { isPairs, isStraightFlush } from "./Card";
import { Game, getLeft, getMe, getRight } from "./Game";
import { Holder } from "./Holder";
import { RevealType } from "./RevealGroup";

export function parseAction(actionEncoded: string, game: Game) {
    const actionDescription = actionEncoded.split(' ').filter(c => c !== '');
    const shortName = actionDescription[0];
    const action = getActionByShortName(shortName);
    if (action == null) {
        return null;
    }
    switch (action) {
        case Action.PickFromCentralStack:
            return parsePickFromCentralStack(actionDescription, game);
        case Action.PickFromDiposedStackAndReveal:
            return parsePickFromDiposedStackAndReveal(actionDescription, game);
        case Action.RevealGroup:
            return parseRevealGroup(actionDescription, game);
        case Action.Sapaw:
            return parseSapaw(actionDescription, game);
        case Action.Dump:
            return parseDump(actionDescription, game);
        case Action.Fight:
            return parseFight(actionDescription, game);
        case Action.Fold:
            return parseFold(actionDescription, game);
        case Action.Challenge:
            return parseChallenge(actionDescription, game);
        default:
            throw new Error(`Unknown action ${action}`);
    }

}
function getActionByShortName(name: string): Action | undefined {
    const actionShortNameDict: Record<string, Action> = {
        "pc": Action.PickFromCentralStack,
        "pd": Action.PickFromDiposedStackAndReveal,
        "rv": Action.RevealGroup,
        "du": Action.Dump,
        "sa": Action.Sapaw,
        "ft": Action.Fight,
        "fd": Action.Fold,
        "ch": Action.Challenge,
    };
    return actionShortNameDict[name];
}

/** pc  */
function parsePickFromCentralStack(actionDescription: string[], game: Game): ActionWithData | null {
    return {
        action: Action.PickFromCentralStack,
        data: {}
    };
}
/** dp 1 2 3 4 */
function parsePickFromDiposedStackAndReveal(actionDescription: string[], game: Game): ActionWithData | null {
    const groupIdx = actionDescription.slice(1).map((n) => Number(n) - 1);
    const me = getMe(game);
    const valid = groupIdx.every((n => {
        return Number.isInteger(n) && n < me.cards.length && n >= 0;
    }));
    if (!valid) {
        return null;
    }

    const disposedCard = game.diposedStack.at(-1);
    if (disposedCard == null) {
        return null;
    }
    const selectionCards = groupIdx.map((idx) => me.cards[idx]);
    const cards = [...selectionCards, disposedCard];
    if (isPairs(cards)) {
        return {
            action: Action.PickFromDiposedStackAndReveal,
            data: {
                matchedCard: selectionCards,
                revealType: RevealType.Pair
            }
        };
    }
    if (isStraightFlush(cards)) {
        return {
            action: Action.PickFromDiposedStackAndReveal,
            data: {
                matchedCard: selectionCards,
                revealType: RevealType.StraightFlush
            }
        };
    }
    return null;
    // return calcDisposedPickAction(me.cards, disposedCard);
}
/** rv 7 8 9 10 */
function parseRevealGroup(actionDescription: string[], game: Game): ActionWithData | null {
    const groupIdx = actionDescription.slice(1).map((n) => Number(n) - 1);
    const valid = groupIdx.every((n => Number.isInteger(n)));
    if (valid == null) {
        return null;
    }
    const me = getMe(game);
    const cards = groupIdx.map((idx) => me.cards[idx]);
    if (isPairs(cards)) {
        return {
            action: Action.RevealGroup,
            data: {
                group: {
                    cards: cards,
                    type: RevealType.Pair
                }
            }
        };
    }
    if (isStraightFlush(cards)) {
        return {
            action: Action.RevealGroup,
            data: {
                group: {
                    cards: cards,
                    type: RevealType.StraightFlush
                }
            }
        };
    }
    return null;
}
/** du idx */
function parseDump(actionDescription: string[], game: Game): ActionWithData | null {
    const idx = Number(actionDescription[1]) - 1;
    if (!Number.isInteger(idx) || idx < 0)
        return null;
    const me = getMe(game);
    const card = me.cards.at(idx);
    if (card == null) {
        return null;
    }
    return {
        action: Action.Dump,
        data: {
            card: card
        }
    };
}
/** sa  l|r|m          1          1 2 
 *       left right me  groupid   card in hand
 * sa r 1 9
*/
function parseSapaw(actionDescription: string[], game: Game): ActionWithData | null {
    if (actionDescription.length < 4)
        return null;
    const targetHolderSide = actionDescription[1];
    const revealGroupIdx = Number(actionDescription[2]) - 1;
    if (!Number.isInteger(revealGroupIdx) || revealGroupIdx < 0)
        return null;

    const me = getMe(game);
    const idxs = actionDescription.slice(3).map((c) => Number(c) - 1);
    if (!idxs.every(Number.isInteger)) {
        return null;
    }
    const selfCards = idxs.map((i) => me.cards[i]);
    let targetHolder: Holder;
    if (targetHolderSide === 'l') {
        targetHolder = getLeft(game);
    } else if (targetHolderSide === 'r') {
        targetHolder = getRight(game);
    } else if (targetHolderSide === 'm') {
        targetHolder = me;
    } else {
        return null;
    }

    const targetGroup = targetHolder.reveals[revealGroupIdx];
    if (targetGroup == null) {
        return null;
    }
    const matchPairs = targetGroup.type === RevealType.Pair && isPairs([...targetGroup.cards, ...selfCards]);
    const matchSF = targetGroup.type === RevealType.StraightFlush && isStraightFlush([...targetGroup.cards, ...selfCards]);
    if (!(matchPairs || matchSF)) {
        return null;
    }
    return {
        action: Action.Sapaw,
        data: {
            holder: targetHolder.id,
            groupIdx: revealGroupIdx,
            cards: selfCards
        }
    };
}

function parseFight(actionDescription: string[], game: Game): ActionWithData | null {
    if (game.turnInfo.fighting || game.turnInfo.dropped || game.turnInfo.picked) {
        return null;
    }
    const me = getMe(game);
    if (me.reveals.length === 0) {
        return null;
    }

    if (game.turnInfo.turn < game.holders.length) {
        return null;
    }

    return {
        action: Action.Fight,
        data: {}
    };
}
function parseFold(actionDescription: string[], game: Game): ActionWithData | null {
    if (!game.turnInfo.fighting) {
        return null;
    }
    return {
        action: Action.Fold,
        data: {}
    };
}
function parseChallenge(actionDescription: string[], game: Game): ActionWithData | null {
    if (!game.turnInfo.fighting) {
        return null;
    }
    return {
        action: Action.Challenge,
        data: {}
    };
}