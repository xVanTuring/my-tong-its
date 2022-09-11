import { v4 as uuidv4 } from 'uuid';
import { Card } from "./Card";
import { RevealGroup } from "./RevealGroup";
/** 持牌人 */
export interface Holder {
    cards: Card[];
    reveals: RevealGroup[];
    id: string;
    name: string;
}
const nameList = [
    "Liam", "Olivia",
    "Noah", "Emma",
    "Oliver", "Charlotte",
    "Elijah", "Amelia",
    "James", "Ava",
    "William", "Sophia",
    "Benjamin", "Isabella",
    "Lucas", "Mia",
    "Henry", "Evelyn",
    "Theodore", "Harper",
];
export function makeHolder(): Holder {
    const id = uuidv4();
    return {
        cards: [],
        name: nameList[Math.floor(Math.random() * nameList.length)],
        reveals: [],
        id
    };
}