import { Card, getMeldListPoint, getMeldPoint, getPairs, getStraightFlush, Meld } from "../Card";
import { getCollidedMelds } from "./CollideMeld";
import { findAllCircles, Graph } from "./Graph";

export function calcOptimalMeld(cards: Card[], minLength = 3) {
    const pairs = getPairs(cards, minLength);
    const sfList = getStraightFlush(cards, minLength);
    return calcOptimalMeldByGroup(pairs, sfList);
}
export function calcOptimalMeldByGroup(partA: Meld[], partB: Meld[]) {
    if (partA.length === 0) {
        return partB;
    }
    if (partB.length === 0) {
        return partA;
    }
    const {
        collisionIdArray: collisionArray,
        restMeld, partAColl, partBColl,
        meldMap,
        idToMeld
    } = buildCollisionInfo(partA, partB);
    if (partAColl.length === 0 && partBColl.length === 0) {
        return restMeld;
    }
    if (partAColl.length < 2 || partBColl.length < 2) {
        const partAPoints = getMeldListPoint(partAColl);
        const partBPoints = getMeldListPoint(partBColl);
        if (partAPoints > partBPoints) {
            return partAColl.concat(restMeld);
        } else {
            return partBColl.concat(restMeld);
        }
    }
    const graph = buildGraph(partAColl, partBColl, meldMap, collisionArray);
    const bestChoice = solveGraph(graph, idToMeld);
    const [meldIds,] = bestChoice;
    if (meldIds == null) {
        throw new Error(`Cannot find solution`);
        // console.error(`Cannot find solution`)
        // return restMeld;
    }
    const meldGroups = meldIds.map((id) => idToMeld.get(id)!);
    meldGroups.push(...restMeld);
    return meldGroups;
}

function buildCollisionInfo(partA: Meld[], partB: Meld[]) {
    const collisionIdArray: string[] = [];
    const partACollision = new Set<Meld>();
    const partBCollision = new Set<Meld>();
    const collisionInfo: Array<[Meld, Meld]> = getCollidedMelds(partA, partB, (a, b) => {
        return a.color === b.color && a.value === b.value;
    });
    for (let i = 0; i < collisionInfo.length; i++) {
        const group = collisionInfo[i];
        partACollision.add(group[0]);
        partBCollision.add(group[1]);
    }
    const partAColl = Array.from(partACollision);
    const partBColl = Array.from(partBCollision);

    const [meldMap, idToMeld] = buildMeldMap([...partAColl, ...partBColl]);

    for (let i = 0; i < collisionInfo.length; i++) {
        const group = collisionInfo[i];
        collisionIdArray.push(`${meldMap.get(group[0])}-${meldMap.get(group[1])}`);
    }
    const restMeld = [...partA, ...partB].filter((meld) => !partACollision.has(meld) && !partBCollision.has(meld));
    return {
        collisionIdArray, restMeld,
        partAColl, partBColl,
        meldMap,
        idToMeld
    };
}

function solveGraph(graph: Graph, idToMeld: Map<number, Meld>) {
    const allValidSolution = findAllCircles(graph);
    const bestChoice = allValidSolution.reduce((prev, solution) => {
        const meldPoints = solution.reduce((pre, currentMeldId) => {
            return pre + getMeldPoint(idToMeld.get(currentMeldId)!);
        }, 0);
        if (meldPoints < prev[1]) {
            return prev;
        }
        return [solution, meldPoints] as [number[] | null, number];
    }, [null, -Infinity] as [number[] | null, number]);
    return bestChoice;
}

function buildGraph(partA: Meld[], partB: Meld[], meldMap: Map<Meld, number>, collisionArray: string[]) {
    const graph = new Graph();
    buildSameMeldLink(partA, graph, meldMap);
    buildSameMeldLink(partB, graph, meldMap);
    for (let i = 0; i < partA.length; i++) {
        const meldA = partA[i];
        for (let j = 0; j < partB.length; j++) {
            const meldB = partB[j];
            if (collisionArray.includes(`${meldMap.get(meldA)}-${meldMap.get(meldB)}`)) {
                continue;
            }
            graph.addEdge(meldMap.get(meldA)!, meldMap.get(meldB)!);
        }
    }
    return graph;
}

function buildSameMeldLink(part: Meld[], graph: Graph, meldMap: Map<Meld, number>) {
    for (let i = 0; i < part.length; i++) {
        const ele0 = part[i];
        for (let j = i + 1; j < part.length; j++) {
            const ele1 = part[j];
            graph.addEdge(meldMap.get(ele0)!, meldMap.get(ele1)!);
        }
    }
}

function buildMeldMap(melds: Meld[]): [Map<Meld, number>, Map<number, Meld>] {
    const meldToId = new Map<Meld, number>();
    const idToMeld = new Map<number, Meld>();
    let i = 0;
    melds.forEach(meld => {
        meldToId.set(meld, i + 1);
        idToMeld.set(i + 1, meld);
        i++;
    });
    return [meldToId, idToMeld];
}