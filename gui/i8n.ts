import { Language } from "../json-calls-protocol/spec.ts";
const language: Language = "de";
export const translation = {
    "unknown": { de: "Unbenannt", en: "Unknown" },
    "buildIn.if.false": { de: "Sonst", en: "Else" },
    "hint.secounds": { de: "Sekunden", en: "Secounds" },
    "hint.secound": { de: "Sekunde", en: "Secound" },
    "buildIn.if.end": { de: `'Ende von "Wenn"'`, en: "End of 'When'" },
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