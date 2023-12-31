class KeySpin {
    constructor(key, action) {
        this.key = key;
        this.action = action;
    }

    start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.action();
        this.interval = setInterval(() => {
            clearInterval(this.interval);
            this.action();
            this.interval = setInterval(() => this.action(), 40);
        }, 500);
    }

    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = undefined;
    }
}

class GameKeyboard {
    static stopSpins() {
        for (const spin of GameKeyboard.spins) {
            spin.stop();
        }
    }

    static bind(key, callback, type) {
        Mousetrap.bind(key, callback, type);
    }

    static bindRepeatable(key, callback) {
        this._bindSpin(key, new KeySpin(key, callback));
    }

    static bindHotkey(key, callback, type) {
        Mousetrap.bind(key, () => executeHotkey(callback), type);
    }

    static bindRepeatableHotkey(key, callback) {
        this._bindSpin(key, new KeySpin(key, () => executeHotkey(callback)));
    }

    static _bindSpin(key, spin) {
        if (GameKeyboard.spins.find(s => s.key === key)) {
            throw `Duplicate spin binding for ${key}`;
        }
        GameKeyboard.spins.push(spin);
        Mousetrap.bind(key, () => spin.start(), "keydown");
        Mousetrap.bind(key, () => spin.stop(), "keyup");
    }

    static disable() {
        this.stopSpins();
        Mousetrap.reset();
    }
}

GameKeyboard.spins = [];

function executeHotkey(action) {
    if (!options.hotkeys || controlDown || document.activeElement.type === "text" || document.activeElement.type === "textarea") {
        return;
    }
    action();
}

// handle clicking on/off tab
window.onfocus = function() {
    setShiftKey(false);
    setControlKey(false);
};

window.onblur = function() {
    GameKeyboard.stopSpins();
};

// handle shift/control keys
let shiftDown = false;
function setShiftKey(isDown) {
    shiftDown = isDown;
}

let controlDown = false;
function setControlKey(isDown) {
    controlDown = isDown;
}

// prevent spacebar scrolling
window.addEventListener("keydown", e => {
    if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
    }
});

// bind hotkeys

GameKeyboard.bindHotkey("space", () => pauseGame());
GameKeyboard.bindHotkey("r", () => restart());
GameKeyboard.bindHotkey("b", () => toggleOffline());

for (let i = 1; i < 6; i++) {
    // eslint-disable-next-line no-loop-func
    GameKeyboard.bindHotkey(`${i}`, () => selectLoadout(i));
    // eslint-disable-next-line no-loop-func
    GameKeyboard.bindHotkey(`shift+${i}`, () => loadLoadout(i));
}

GameKeyboard.bindHotkey("shift+s", () => saveList());
GameKeyboard.bindHotkey("shift+l", () => loadList());
GameKeyboard.bindHotkey("shift+c", () => clearList());

GameKeyboard.bindRepeatableHotkey("=", () => adjustActionListSize(100));
GameKeyboard.bindRepeatableHotkey("-", () => adjustActionListSize(-100));
// devs need hotkeys too okay
if (window.location.href.includes("http://localhost:8080/")) GameKeyboard.bindHotkey("c", () => cheat());

GameKeyboard.bind("shift", () => setShiftKey(true), "keydown");
GameKeyboard.bind("shift", () => setShiftKey(false), "keyup");
GameKeyboard.bind(["ctrl", "command"], () => setControlKey(true), "keydown");
GameKeyboard.bind(["ctrl", "command"], () => setControlKey(false), "keyup");


function undo() {
    const before = copyArray(actions.next);
    actions.next = copyArray(actions.nextLast);
    actions.nextLast = copyArray(before);
    view.updateNextActions();
    view.updateLockedHidden();
}

GameKeyboard.bindHotkey("right", () => view.showTown(townShowing, arrow.right));
GameKeyboard.bindHotkey("d", () => view.showTown(townShowing, arrow.right));
GameKeyboard.bindHotkey("left", () => view.showTown(townShowing, arrow.left));
GameKeyboard.bindHotkey("a", () => view.showTown(townShowing, arrow.left));

GameKeyboard.bindHotkey("shift+right", () => view.showActions(true));
GameKeyboard.bindHotkey("shift+d", () => view.showActions(true));
GameKeyboard.bindHotkey("shift+left", () => view.showActions(false));
GameKeyboard.bindHotkey("shift+a", () => view.showActions(false));

GameKeyboard.bindHotkey("shift+z", () => undo());

GameKeyboard.bindHotkey("shift+space", () => checkSquirrelMode());


