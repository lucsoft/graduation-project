import { Component, createElement, Custom } from "https://raw.githubusercontent.com/lucsoft/WebGen/39f8439fb8e478dba5d351546f0156d331ebda3d/mod.ts";
import { CallStep } from "../json-calls-protocol/spec.ts";
export function makeDropable(shell: Component, response: (action: CallStep, deleteOld: boolean) => void): Component {
    const data = shell.draw();
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
                console.log(parsedObject);
                if (Object.getOwnPropertyNames(parsedObject).includes("id"))
                    response(parsedObject, JSON.parse(ev.dataTransfer?.getData("deleteOld") ?? "true"));
            }
        } catch (_) {
            data.classList.remove("active");
        }
    }
    return Custom(data);
}

export function Dropable(response: (action: CallStep, deleteOld: boolean) => void): Component {

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
                    response(parsedObject, JSON.parse(ev.dataTransfer?.getData("deleteOld") ?? "true"));
            }
        } catch (_) {
            data.classList.remove("active");
        }
    }
    return Custom(data).addClass("drop-area");
}

export function Movable(action: CallStep, com: Component, deleteOld = true): Component {
    const data = com.draw();
    data.draggable = true;
    data.ondragstart = (drag) => {
        drag.dataTransfer?.setData("deleteOld", deleteOld.toString());
        drag.dataTransfer?.setData("text", JSON.stringify(action));
    }
    return Custom(data);
}