
export class Graph {
    neighbors: Map<number, Set<number>>;
    constructor() {
        this.neighbors = new Map<number, Set<number>>();
    }
    addEdge(u: number, v: number) {
        if (this.neighbors.get(u) === undefined) {  // Add the edge u -> v.
            this.neighbors.set(u, new Set<number>());
        }
        this.neighbors.get(u)?.add(v);

        if (this.neighbors.get(v) === undefined) {  // Also add the edge v -> u in order
            this.neighbors.set(v, new Set<number>());               // to implement an undirected graph.
        }                                  // For a directed graph, delete
        this.neighbors.get(v)?.add(u);              // these four lines.
    }
    public showGraph() {
        const lines: string[] = [];
        for (const key of this.neighbors.keys()) {
            lines.push(`${key}-> ${Array.from(this.neighbors.get(key)!).join(" ")}`);
        }
        console.log(lines.join("\n"));
    }
}

function findCircleStartWith(graph: Graph, length: number, path: number[]) {
    const l = path.length;
    const last = path.at(-1)!;

    let arr: Array<number[]> = [];
    const lastNeighbers = graph.neighbors.get(last)!;
    if (l == length - 1) { // choose the final node in the circle
        for (const i of lastNeighbers) {
            if (length < 3) {
                if (i > path[0] && (!path.includes(i)) && (graph.neighbors.get(i)!.has(path[0]))) {
                    arr.push([...path, i]);
                }
            } else {
                if (i > path[1] && (!path.includes(i)) && (graph.neighbors.get(i)!.has(path[0]))) {
                    arr.push([...path, i]);
                }
            }
        }
    } else {
        for (const i of lastNeighbers) {
            if (i > path[0] && !path.includes(i)) {
                arr = arr.concat(findCircleStartWith(graph, length, [...path, i]));
            }
        }
    }
    return arr;
}
// https://www.zhihu.com/question/32196067
function findCirOfLength(graph: Graph, nodeCount: number, length: number) {
    let pathList: Array<number[]> = [];
    for (let i = 1; i < nodeCount - length + 2; i++) {
        pathList = pathList.concat(findCircleStartWith(graph, length, [i]));
    }
    return pathList;
}
export function findAllCircles(graph: Graph) {
    const nodeCount = graph.neighbors.size;
    let pathList: Array<number[]> = [];
    for (let i = 2; i < nodeCount + 1; i++) {
        pathList = pathList.concat(findCirOfLength(graph, nodeCount, i));
    }
    return pathList;
}