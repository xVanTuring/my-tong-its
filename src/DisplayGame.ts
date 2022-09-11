import { Card, displayCard, displayCards } from "./Card";
import { RevealGroup } from "./RevealGroup";
import { Game } from "./Game";

/**
 * x                                          x
 * |----|                                |----|
 * | 01 |                                | 06 |
 * |----|                                |----|
 */
export function makeCardRow(valueLeft: number, valueRight: number, centralCount: number, disposeCard: Card | null, lineWidth: number): string[] {
    const cap = "|----|";
    const lines: string[] = [];
    const space: string = Array(lineWidth - cap.length * 2).fill(" ").join("");
    lines.push(`${cap}${space}${cap}`);
    const cardStack = `|${String(centralCount).padStart(2, '0')}||${disposeCard == null ? "--" : displayCard(disposeCard).join('')}|`;
    const subspace: string = Array((lineWidth - cap.length * 2 - cardStack.length) / 2).fill(" ").join("");
    lines.push(`| ${valueLeft.toString().padStart(2, '0')} |${subspace}${cardStack}${subspace}| ${valueRight.toString().padStart(2, '0')} |`);
    lines.push(`${cap}${space}${cap}`);
    return lines;
}
// * 1: 4 4 4                          3 3 3 3 :1
// * 2: 1 2 3                         7 8 9 10 :2 
export function makeRevealRow(leftReveals: RevealGroup[], rightReveals: RevealGroup[], lineWidth: number) {
    const lines: string[] = [];
    const reveal: [string, string][] = [];
    for (let i = 0; i < Math.max(leftReveals.length, rightReveals.length); i++) {
        let line: [string, string] = ["", ""];
        if (i < leftReveals.length) {
            line[0] = `${i + 1}: ${leftReveals[i].cards.map((c) => displayCard(c)[0]).join(' ')}`;
        }
        if (i < rightReveals.length) {
            line[1] = `${rightReveals[i].cards.map((c) => displayCard(c)[0]).join(' ')} :${i + 1}`;
        }
        reveal.push(line);
    }
    reveal.forEach((line) => {
        const space: string = Array(lineWidth - line[0].length - line[1].length).fill(" ").join("");
        lines.push(`${line[0]}${space}${line[1]}`);
    });
    return lines;
}
export function makeRevealOneColumn(reveals: RevealGroup[]) {
    const lines: string[] = [];
    for (let i = 0; i < reveals.length; i++) {
        lines.push(`${i + 1}: ${reveals[i].cards.map((c) => displayCard(c)[0]).join(' ')}`);
    }
    return lines;
}
/**
 *
 * ============================================
 * x                                          x
 * |----|                                |----|
 * | 01 |       |01||04♦|                | 06 |
 * |----|                                |----|
 * 1: 4 4 4                          3 3 3 3 :1
 * 2: 1 2 3                         7 8 9 10 :2
 *
 *
 * x
 * 1: Q J K
 *          |A|2|3|4| | | | | | |
 *          |♠|♣|♥|♦| | | | | | |
 * ============================================
 */
export function displayGame(game: Game, as: string): string {
    const LINE_WIDTH = 40;
    const lines: string[] = [];
    lines.push(Array(LINE_WIDTH).fill("=").join(""));
    lines.push("");

    const indexOfMe = game.holders.findIndex((h) => h.id === as);
    const me = game.holders[indexOfMe];
    const rightUser = game.holders[(indexOfMe + 1) % game.holders.length];
    const leftUser = game.holders[(indexOfMe + 2) % game.holders.length];

    // let firstTurnIndicator = "";
    const turn = game.holders[game.turnInfo.turn % game.holders.length].id;
    const leftPart = `${turn === leftUser.id ? "x " : ""}${leftUser.name}`;
    const rightPart = `${rightUser.name}${turn === rightUser.id ? " x" : ""}`;
    lines.push(mergeTwoSide(leftPart, rightPart, LINE_WIDTH));

    makeCardRow(leftUser.cards.length, rightUser.cards.length, game.centralStack.length, game.diposedStack.at(-1) ?? null, LINE_WIDTH).forEach((line) => {
        lines.push(line);
    });
    makeRevealRow(leftUser.reveals, rightUser.reveals, LINE_WIDTH).forEach(line => {
        lines.push(line);
    });
    lines.push("");
    lines.push("");


    lines.push(`${turn === me.id ? "x " : ""}${me.name}`);
    makeRevealOneColumn(me.reveals).forEach((line) => {
        lines.push(line);
    });
    displayCards(me.cards).forEach(line => {
        const space = (LINE_WIDTH - line.length) / 2;
        lines.push(line.padStart(space + line.length, " "));
    });
    lines.push("");
    lines.push(Array(LINE_WIDTH).fill("=").join(""));
    return lines.join("\n");
}


function mergeTwoSide(leftPart: string, rightPart: string, lineWidth: number): string {
    return `${leftPart}${Array(lineWidth - leftPart.length - rightPart.length).fill(" ").join("")}${rightPart}`;
}