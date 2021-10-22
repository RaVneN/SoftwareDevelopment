//PRE: All input must be valid -> No errorchecking on input

var memorycell = 0.0;
var keyHistory = [];
var numerals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "%"];
var symbols = ["+", "-", "X", "/"];
var operators = [];
var operands = [];
var tokens = [];


function clicked(element, obj) {
    keyHistory.push(element);
    // l2h(element.className + " : " + element.innerHTML);
    switch (keyType(element)) {
        case "number":
            //Basically do nothing, we'll read the value on operator-press.
            keyNumber(element);
            break;
        case "operator":
            //Basically do nothing here as well.
            keyOperator(element);
            break;
        case "modifier":
            //Modifiers are: "%", "+-", and "." - Should trigger an action on "="
            keyModifier(element);
            break;
        case "memory":
            keyMemory(element);
            //Memory are: "MS", "MR", "MC", "M+", and "M-".
            //"MS" stores calculated value of the displayu into the memorycell.
            //"MR" inserts value from memory into display.
            //"MC" clears content of memory - replaces it with a "0".
            //"M+" adds sum from display and inserts new value into memory. Sum of display must be calculated.
            //"M-" subtracts the sum from display and inserts new value into the memorycell. Sum of display must be calculated.
            break;
        case "function":
            //Causes calculations to be performed - generally.
            //"C" clears display - resets to "0"
            //"←" causes the last symbol to be deletes in the display. Unless it is the only symbol, then the display shrould be cleared -> "C".
            //"=" causes the expression to be evaluated and result to be displayed in the display. 
            //    History should update with the previous content of the display.
            keyFunction(element);
            break;
        default:
            l2h("Unknown button pressed: " + element.innerHTML, "Warning");
            break;
    }
}

function keyNumber(element) {
    if (display.isEditable()) { display.append(element.innerHTML); } else { display.clear(); display.append(element.innerHTML); }
}

function keyOperator(element) {
    if (lastIsOperator()) { replaceLastWith(element.innerHTML) } else { display.setEditable(); addToDisplay(element.innerHTML) }
}

function keyModifier(element) {
    switch (element.innerHTML) {
        case "±":
            //last cluster of numerical symbols should be negated.
            //if no operators, then display should be negated.
            break;
        case "%":
            //Last symbol in display must be a numerical.
            let last = getLastSymbolOfDisplay();
            let parsed = parseInt(last);

            if (display.isEditable()) {
            if (isNaN(parsed)) { blink(element, "Red"); } else { display.append("%"); }
            l2h("last: " + last, "Log");
            l2h("parsed: " + parsed, "Log");
            }
            break;
        case ".":
            if (display.isEditable()) {
                if (getLastSymbolOfDisplay() != "." && display.isEditable())
                addToDisplay(".");
            }
            break;
    }
}

function keyMemory(element) {
    let display = document.getElementById("display");
    switch (element.innerHTML) {
        case "MS":
            //calculate sum of display, insert sum into memorycell
            if (calculate(element)) memorycell = parseFloat(display.innerHTML);
            else blink(element, "Red");
            break;
        case "M-":
            //calculate sum of display, subtract sum from memorycell, store new sum in memorycell.
            if (calculate(element)) {
                memorycell = memorycell - parseFloat(display.innerHTML);
            }
            break;
        case "M+":
            //calculate sum of display, add sum from memorycell, store new sum in memorycell.
            if (calculate(element)) {
                memorycell = memorycell + parseFloat(display.innerHTML);
            }
            break;
        case "MR":
            let last = getLastSymbolOfDisplay();
            if (last == "+" || last == "-" || last == "*" || last == "/") {
                addToDisplay(memorycell);
            } else {
                blink(element, "Red");
            }
            break;
        case "MC":
            clearMemory();
            blink(element, "Green");
            break;
        default:
            break;
    }
}

function keyFunction(element) {
    //let display = document.getElementById("display");
    switch (element.innerHTML) {
        case "C":
            l2h(display.innerHTML(), "UI");
            display.clear();
            clearMemory();
            break;
        case "←":
            if (display.isEditable()){
            display.deleteLast();
            } else { display.clear(); }
            //Delete last symbol in display.
            //If only one symbol, replace with "0".
            break;
        case "=":
            if (calculate(element)) display.setReadOnly();
            break;
        default:
            break;
    }
}



//ServiceMethods

function getLastSymbolOfDisplay() {
    let display = document.getElementById("display");
    return display.innerHTML[display.innerHTML.length - 1];
}

function addToDisplay(stringElement) {
    let display = document.getElementById("display");
    if (display.innerHTML == "0" && stringElement != "." && !symbols.includes(stringElement)) {
        display.innerHTML = stringElement;
    } else {
        display.innerHTML += stringElement;
    }
}

function keyType(element) {
    let keytype = element.className;
    keytype = keytype.split(" ")[1];
    return keytype;
}

document.addEventListener('DOMContentLoaded',
    function() {
        clearAll();
    });
//document.addEventListener('keypress', function (event){l2h(event.key + " : " + event.code, "Log");} )


function clearAll() {
    clearDisplay();
    clearHistory();
    clearMemory();
}

function clearDisplay() {
    document.getElementById('display').innerHTML = '0';
}

function clearHistory() {
    document.getElementById('historycontent').innerHTML = "";
}

function clearMemory() {
    memorycell = 0.0;
}

function l2h(strText, priority) {
    //Priority = Log, Warning, Error, UI
    let history = document.getElementById("historycontent");
    let span = document.createElement("span");
    switch (priority) {
        case "Log":
            span.className = "log";
            break;
        case "Warning":
            span.className = "warning";
            break;
        case "Error":
            span.className = "error";
            break;
        case "UI":
            span.className = "ui";
            break;
    }
    span.appendChild(document.createTextNode(strText));
    span.appendChild(document.createElement("br"));
    history.appendChild(span);

    //history.innerHTML += strText + "<br/>";
    history.scrollTop = history.scrollHeight;
}

function blink(element, stringColor) {
    element.style.transitionProperty = "all";
    element.style.transitionDuration = "1s";
    element.style.backgroundColor = stringColor;
    setTimeout(function() {; }, 1);
    //element.style.backgroundColor = "White";
    element.addEventListener('mouseout', function() { element.style.backgroundColor = "White"; });

}

function tokenize(strInput) {
    operators = [];
    operands = [];
    tokens = [];
    token_counter = 0;
    try {
        for (i = 0; i < strInput.length; i++) {
            if (symbols.includes(strInput[i])) {
                l2h("In operands: " + strInput[i], "Log");
                token_counter++;
                tokens.push(strInput[i]);
                token_counter++;
            } else {
                l2h("In operators: " + strInput[i], "Log");
                if (tokens.length == 0 || tokens.length <= token_counter) tokens.push(strInput[i]);
                else tokens[token_counter] += strInput[i];
            }
        }
    } catch { return false; }

    for (i = 0; i < tokens.length; i++) { l2h(tokens[i], "Log"); }
    return true;
}

function handlePercentage() {
    try {
        for (i = 0; i < tokens.length; i++) {
            if (tokens[i].includes("%")) {
                tokens[i] = tokens[i].slice(0, tokens[i].indexOf("%"));
                tokens[i] = "" + (parseFloat(tokens[i]) * 0.01);
            }
        }
    } catch { return false; }
    return true;
}

function calculateTokens() {
    // X / + - 
    try {
        while (tokens.length > 1) {
            while (tokens.includes("X")) {
                i = tokens.indexOf("X");
                tokens[i - 1] = "" + (parseFloat(tokens[i - 1]) * parseFloat(tokens[i + 1]));
                tokens.splice(i, 2);
            }
            while (tokens.includes("/")) {
                i = tokens.indexOf("/");
                tokens[i - 1] = "" + (parseFloat(tokens[i - 1]) / parseFloat(tokens[i + 1]));
                tokens.splice(i, 2);
            }
            while (tokens.includes("-")) {
                i = tokens.indexOf("-");
                tokens[i - 1] = "" + (parseFloat(tokens[i - 1]) - parseFloat(tokens[i + 1]));
                tokens.splice(i, 2);
            }
            while (tokens.includes("+")) {
                i = tokens.indexOf("+");
                tokens[i - 1] = "" + (parseFloat(tokens[i - 1]) + parseFloat(tokens[i + 1]));
                tokens.splice(i, 2);
            }
        }
    } catch { return false; }
    return true;
}

function lastIsOperator() {
    let display = document.getElementById("display");
    return (symbols.includes(display.innerHTML[display.innerHTML.length - 1]));
}

function replaceLastWith(symb) {
    let display = document.getElementById("display");
    let disp = display.innerHTML.slice(0, display.innerHTML.length - 1);
    display.innerHTML = disp + symb;
}

function calculate(element) {
    let display = document.getElementById("display");
    if (!lastIsOperator()) {
        l2h(display.innerHTML, "UI");
        if (tokenize(display.innerHTML)) {
            handlePercentage();
            if (calculateTokens()) display.innerHTML = tokens[0];

        } else { l2h("Something happened in Tokenizer","Error"); }
    } else { return false; }
    return true;
    //Copy content of display to History.
    //Calculate sum of display.
    //Replace content of display with calculated sum.
}


class Display {
    constructor() {
        this.element = document.getElementById("display");
        this.displayState = true;
    }

    displayReady() { if (this.element == null) this.element = document.getElementById("display"); }

    isEditable() { return this.displayState; }

    isReadOnly() { return !this.displayState; }

    setReadOnly() { this.displayState = false; }

    setEditable() {this.displayState = true; }

    append(stringElement) {
        this.displayReady();
        if (this.element.innerHTML == "0" && stringElement != "." && !symbols.includes(stringElement)) {
            this.element.innerHTML = stringElement;
        } else {
            this.element.innerHTML += stringElement;
        }
    }

    innerHTML() { return this.element.innerHTML; }

    deleteLast() {
        this.displayReady();
        if (this.element.innerHTML.length == 1) {
            clearDisplay();
        } else {
            this.element.innerHTML = this.element.innerHTML.slice(0, this.element.innerHTML.length - 1);
        }
    }

    clear() { this.element.innerHTML = "0"; this.setEditable(); }

}
var display = new Display();
