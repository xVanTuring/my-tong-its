import { Card, displayCard, Meld, sortCards } from "../Card";
import { Game } from "../Game";
import { calcOptimalMeld } from "../graph/MeldGraph";
import { Holder } from "../Holder";

function setLeftUserName(name: string) {
    (document.querySelector("#leftUser > div:nth-child(1)") as HTMLDivElement).innerText = name;
}
function setRightUserName(name: string) {
    (document.querySelector("#rightUser > div:nth-child(1)") as HTMLDivElement).innerText = name;
}

function setLeftCardCount(count: number) {
    (document.querySelector("#leftUser > div:nth-child(2)") as HTMLDivElement).innerText = `${count}`;
}
function setRightCardCount(count: number) {
    (document.querySelector("#rightUser > div:nth-child(2)") as HTMLDivElement).innerText = `${count}`;
}
function setLeftMeldsList(meldList: Meld[]) {
    const nodes = buildMeld(meldList);
    const meldAre = (document.querySelector("#leftUser > div:nth-child(3)") as HTMLDivElement);
    meldAre.innerHTML = '';
    nodes.forEach((node, idx) => {
        meldAre.appendChild(node);
        bindMeldClick(node, idx, "l");
    });
}
function bindMeldClick(node: HTMLDivElement, idx: number, side: "r" | "l" | 'm') {
    node.addEventListener("click", () => {
        if (!myTurn || !picked) {
            return;
        }
        if (selectionCard.size === 0 || me == null) {
            return;
        }
        const cardInHands = Array.from(selectionCard).map((card) => me!.cards.indexOf(card) + 1);
        sendMsg({
            action: `sa ${side} ${idx + 1} ${cardInHands.join(" ")}`
        });
    });
}

function setRightMeldsList(meldList: Meld[]) {
    const nodes = buildMeld(meldList);
    const meldAre = document.querySelector("#rightUser > div:nth-child(3)") as HTMLDivElement;
    meldAre.innerHTML = '';
    nodes.forEach((node, idx) => {
        meldAre.appendChild(node);
        bindMeldClick(node, idx, "r");
    });
}
function buildMeld(meldList: Meld[]) {
    return meldList.map(meldData => {
        const meldNode = document.createElement("div");
        meldNode.classList.add("meld");

        meldData.forEach(card => {
            const [value, color] = displayCard(card);
            const smallCardNode = document.createElement("div");
            smallCardNode.classList.add("card");
            smallCardNode.innerText = `${color}\n${value}`;
            meldNode.appendChild(smallCardNode);
        });
        return meldNode;
    });

}
function setCenterInfo(count: number, card: Card | undefined | null) {
    (document.querySelector("#center-board #central-stack") as HTMLDivElement).innerHTML = `${count}`;
    if (card == null) {
        (document.querySelector("#center-board #diposed-stack") as HTMLDivElement).innerText = `?\n?`;
    } else {
        const [value, color] = displayCard(card);
        (document.querySelector("#center-board #diposed-stack") as HTMLDivElement).innerText = `${color}\n${value}`;
    }
}
const selectionCard = new Set<Card>();
function displayCardByGroup(cards: Card[]) {
    const meldList = calcOptimalMeld(cards);
    const meldCards = new Set(meldList.flat());

    const leftCards = sortCards(cards.filter((card) => !meldCards.has(card)));
    const container = document.querySelector("#card-area") as HTMLDivElement;
    container.innerHTML = "";
    const addCard = (container: HTMLElement, cardInfo: Card) => {
        const [value, color] = displayCard(cardInfo);
        const cardNode = document.createElement("div");
        cardNode.classList.add("card");
        if (selectionCard.has(cardInfo)) {
            cardNode.classList.add("selected");
        }
        cardNode.innerText = `${color}\n${value}`;
        container.appendChild(cardNode);

        cardNode.addEventListener("click", () => {
            if (selectionCard.has(cardInfo)) {
                selectionCard.delete(cardInfo);
                cardNode.classList.remove("selected");
            } else {
                selectionCard.add(cardInfo);
                cardNode.classList.add("selected");
            }
            refreshActionButton();
            refreshPickArea(myTurn, picked);
        });
    };

    meldList.forEach(meld => {
        const meldContainer = document.createElement("div");
        meldContainer.classList.add("card-group");
        meld.forEach((card) => {
            addCard(meldContainer, card);
        });
        container.appendChild(meldContainer);
    });
    leftCards.forEach((card) => {
        addCard(container, card);
    });

}
function setSelfCard(cards: Card[]) {
    displayCardByGroup(cards);
    refreshActionButton();
    refreshPickArea(myTurn, picked);
}
function setSelfName(name: string) {
    (document.querySelector("#self-info .name") as HTMLDivElement).innerText = `${name}`;
}
function setSelfMeld(meldList: Meld[]) {
    const container = document.querySelector("#self-meld") as HTMLDivElement;
    const nodes = buildMeld(meldList);
    container.innerHTML = '';
    nodes.forEach((node, idx) => {
        container.appendChild(node);
        bindMeldClick(node, idx, "m");
    });
}

function refreshActionButton() {
    const dump = document.querySelector("#dump") as HTMLButtonElement;
    const drop = document.querySelector("#drop") as HTMLButtonElement;
    if (!myTurn) {
        dump.disabled = true;
        drop.disabled = true;
        return;
    }

    if (selectionCard.size === 0) {
        dump.disabled = true;
        drop.disabled = true;
    } else if (selectionCard.size === 1) {
        dump.disabled = false;
        drop.disabled = true;
    } else {
        dump.disabled = true;
        drop.disabled = false;
    }
}
function refreshPickArea(myTurn: boolean, picked: boolean) {
    const pickFromCentral = document.querySelector("#central-stack-outline") as HTMLButtonElement;
    const pickFromDiposed = document.querySelector("#diposed-stack-outline") as HTMLButtonElement;
    if (!myTurn || picked) {
        pickFromCentral.classList.remove("active");
        pickFromDiposed.classList.remove("active");
        return;
    }
    pickFromCentral.classList.add("active");
    pickFromDiposed.classList.add("active");
    if (selectionCard.size < 2) {
        pickFromDiposed.classList.remove("active");
    } else {
        pickFromDiposed.classList.add("active");
    }
}

function bindAction() {
    const pickFromCentral = document.querySelector("#central-stack-outline") as HTMLButtonElement;
    const pickFromDiposed = document.querySelector("#diposed-stack-outline") as HTMLButtonElement;
    const dump = document.querySelector("#dump") as HTMLButtonElement;
    const drop = document.querySelector("#drop") as HTMLButtonElement;

    pickFromCentral.addEventListener("click", () => {
        if (!myTurn || picked)
            return;
        sendMsg({
            action: "pc"
        });
    });
    pickFromDiposed.addEventListener("click", () => {
        if (!myTurn || picked)
            return;
        if (selectionCard.size > 1 && me != null) {
            const idx = Array.from(selectionCard).map((card) => {
                return me!.cards.indexOf(card) + 1;
            });
            sendMsg({
                action: `pd ${idx.join(" ")}`
            });
        }
    });
    dump.addEventListener("click", () => {
        if (!myTurn || !picked) {
            return;
        }
        if (selectionCard.size === 1 && me != null) {
            sendMsg({
                action: `du ${me.cards.indexOf(Array.from(selectionCard)[0]) + 1}`
            });
        }
    });
    drop.addEventListener("click", () => {
        if (!myTurn || !picked) {
            return;
        }
        if (selectionCard.size > 1 && me != null) {
            const idx = Array.from(selectionCard).map((card) => {
                return me!.cards.indexOf(card) + 1;
            });
            sendMsg({
                action: `rv ${idx.join(" ")}`
            });
        }
    });
}

let me: Holder | null = null;
let myId = "";
let myTurn = false;
let picked = false;
// let game: Game | null = null;

const sendMsg = (msg: { action: string; }) => {
    if (!myTurn) {
        return;
    }

    if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(JSON.stringify(Object.assign({ id: myId }, msg)));
    }
};


const webSocket = new WebSocket("ws://localhost:8080");
webSocket.onopen = () => {
    console.log("onOpen");
    bindAction();
};
webSocket.onmessage = (msg) => {
    try {
        const data: { id: string, game: Game; msg?: string; } = JSON.parse(msg.data);
        if (data.msg != null) {
            console.log(msg);
            alert(msg);
        }
        if (data.game.turnInfo.winner != null) {
            alert(`Winner is ${data.game.turnInfo.winner}`);
            return;
        }
        const currentTurn = data.game.holders[data.game.turnInfo.turn % data.game.holders.length].id;
        // game = data.game;
        selectionCard.clear();
        const meIdx = data.game.holders.findIndex((holder) => holder.id === data.id);
        me = data.game.holders[meIdx];
        myId = me.id;
        myTurn = currentTurn === me.id;
        picked = data.game.turnInfo.picked;
        const leftUser = data.game.holders[(meIdx + 2) % 3];
        setLeftUserName(leftUser.name + (currentTurn === leftUser.id ? "*" : ""));
        setLeftCardCount(leftUser.cards.length);
        setLeftMeldsList(leftUser.reveals.map((reveal) => reveal.cards));


        const rightUser = data.game.holders[(meIdx + 1) % 3];
        setRightUserName(rightUser.name + (currentTurn === rightUser.id ? "*" : ""));
        setRightCardCount(rightUser.cards.length);
        setRightMeldsList(rightUser.reveals.map((reveal) => reveal.cards));
        setCenterInfo(data.game.centralStack.length, data.game.diposedStack.at(-1));

        setSelfCard(me.cards);
        setSelfMeld(me.reveals.map((reveal) => reveal.cards));
        setSelfName(me.name + (currentTurn === me.id ? "*" : ""));
        document.title = me.name + (currentTurn === me.id ? "*" : "");
    } catch (error) {
        // 
    }
};
webSocket.onclose = () => {
    // alert("connection is closed");
};

