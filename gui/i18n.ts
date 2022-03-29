import { Language } from "../json-calls-protocol/spec.ts";
const language: Language = "de";
export const translation = {
    "unknown": choose({ de: "Unbenannt", en: "Unknown" })!,
    "buildIn.if.false": choose({ de: "Sonst", en: "Else" })!,
    "condition": choose({ de: "Bedingung", en: "Condition" })!,
    "hint.values": choose({ de: "", en: "" })!,
    "hint.secounds": choose({ de: " Sekunden", en: " Secounds" })!,
    "hint.secound": choose({ de: " Sekunde", en: " Secound" })!,
    "hint.counts": choose({ de: "-mal", en: " times" })!,
    "hint.count": choose({ de: "-mal", en: " time" })!,
    "hint.power.true": choose({ de: "An", en: "On" })!,
    "hint.power.false": choose({ de: "Aus", en: "Off" })!
}
export function choose<Type>(data?: Record<Language, Type>): Type | undefined {
    return data?.[ language ];
}
export function chooseTranslation(data?: Record<Language, string> | string): string {
    return typeof data === "string" ? data : data?.[ language ] ?? chooseTranslation(translation.unknown);
}
export const translate = (key: string) => {
    return translation[ key as keyof typeof translation ] || key
}
export const defaultOrTranslation = (data?: string | Record<Language, string>): string => {
    if (typeof data == "string") return data;
    return chooseTranslation(data);
}