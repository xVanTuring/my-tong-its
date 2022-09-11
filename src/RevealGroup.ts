import { Card } from "./Card";

export enum RevealType {
    /** 同花顺 */
    StraightFlush,
    /** 对子 */
    Pair
}
export interface RevealGroup {
    type: RevealType;
    cards: Card[];
}