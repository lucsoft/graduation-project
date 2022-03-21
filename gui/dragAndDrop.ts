import { Component, createElement, Custom } from "../../WebGen/mod.ts";
import { CallStep } from "../json-calls-protocol/spec.ts";

export function Dropable(response: (action: CallStep) => void): Component {

    const data = createElement("div");
    data.ondragover = (ev) => {
        if (!ev.dataTransfer) return;
        ev.preventDefault();
        data.classList.add("active");
    }
    data.ondragleave = () => data.classList.remove("active");
    data.ondrop = (ev) => {
        ev.preventDefault();
        try {
            const data = ev.dataTransfer?.getData("text");
            if (data) {
                const parsedObject = JSON.parse(data);
                if (Object.getOwnPropertyNames(parsedObject).includes("id"))
                    response(parsedObject);
            }
        } catch (_) {
            data.classList.remove("active");
        }
    }
    return Custom(data).addClass("drop-area");
}

export function Movable(action: CallStep, com: Component): Component {
    const data = com.draw();
    data.draggable = true;
    data.ondragstart = (drag) => {
        drag.dataTransfer?.setData("text", JSON.stringify(action));
    }
    return Custom(data);
}