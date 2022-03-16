import { Step } from "./spec.ts";
export function registerMetaCategory(category: Map<string, { de: string, en: string }>) {
    category.set("script", { de: "Skripte", en: "Scripts" });
}
export function registerMetaData(buildIn: Map<string, Step>) {
    buildIn.set("variable", {
        actions: "native",
        color: "gray",
        category: "script",
        displayText: "Zu Variable hinzufügen",
        icon: "format_quote"
    })
    buildIn.set("sleep", {
        actions: "native",
        color: "gray",
        category: "script",
        displayText: "Warten",
        icon: "hourglass_bottom"
    })
    buildIn.set("if", {
        actions: "native",
        color: "gray",
        category: "script",
        displayText: "Wenn",
        icon: "fork_right"
    })
}