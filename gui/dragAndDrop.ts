import { Component, Custom } from "../../WebGen/mod.ts";
import { CallStep } from "../json-calls-protocol/spec.ts";


export function Movable(action: CallStep, com: Component): Component {
    const data = com.draw();
    data.draggable = true;
    data.ondragstart = (drag) => {
        drag.dataTransfer?.setData("text", JSON.stringify(action));
    }
    return Custom(data);
}