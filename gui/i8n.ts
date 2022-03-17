export const translation = {
    "buildIn.if.false": "Sonst",
    "buildIn.if.end": 'Ende von "Wenn"',
}

export const translate = (key: string) => {
    return translation[ key as keyof typeof translation ] || `{${key}}`
}