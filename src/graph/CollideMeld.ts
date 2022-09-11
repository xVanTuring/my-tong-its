export function getCollidedMelds<T>(partA: T[][], partB: T[][], compare?: (a: T, b: T) => boolean) {
    const collided: Array<[T[], T[]]> = [];
    for (let i = 0; i < partA.length; i++) {
        const groupA: T[] = partA[i];
        for (let j = 0; j < partB.length; j++) {
            const groupB: T[] = partB[j];
            if (isCollidedMeld(groupA, groupB, compare)) {
                collided.push([groupA, groupB]);
            }
        }
    }
    return collided;
}
export function isCollidedMeld<T>(groupA: T[], groupB: T[], compare?: (a: T, b: T) => boolean) {
    for (let i = 0; i < groupA.length; i++) {
        const comapring = groupA[i];
        if (compare == null) {
            if (groupB.includes(comapring)) {
                return true;
            }
        } else {
            for (let j = 0; j < groupB.length; j++) {
                if (compare(comapring, groupB[j])) {
                    return true;
                }
            }
        }
    }
    return false;
}
