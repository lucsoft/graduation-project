import { Language } from "../json-calls-protocol/spec.ts";
const language: Language = "de";
export const translation = {
    "unknown": { de: "Unbenannt", en: "Unknown" },
    "buildIn.if.false": { de: "Sonst", en: "Else" },
    "condition": { de: "Bedingung", en: "Condition" },
    "hint.values": { de: "", en: "" },
    "hint.secounds": { de: " Sekunden", en: " Secounds" },
    "hint.secound": { de: " Sekunde", en: " Secound" },
    "hint.counts": { de: "-mal", en: " times" },
    "hint.count": { de: "-mal", en: " time" },
    "hint.power.true": { de: "An", en: "On" },
    "hint.power.false": { de: "Aus", en: "Off" }
}
export function choose<Type>(data?: Record<Language, Type>): Type | undefined {
    return data?.[ language ];
}
export function chooseTranslation(data?: Record<Language, string> | string): string {
    return typeof data === "string" ? data : data?.[ language ] ?? chooseTranslation(translation.unknown);
}
export const translate = (key: string) => {
    return translation[ key as keyof typeof translation ] || { de: `{${key}}`, en: `{${key}}` }
}
export const defaultOrTranslation = (data?: string | Record<Language, string>): string => {
    if (typeof data == "string") return data;
    return chooseTranslation(data);
}