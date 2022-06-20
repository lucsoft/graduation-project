import { Checkbox, Color, Dialog, DropDown, Horizontal, Input, PlainText, Spacer, Vertical } from "https://raw.githubusercontent.com/lucsoft/WebGen/39f8439fb8e478dba5d351546f0156d331ebda3d/mod.ts";

export function openDialog<Options extends string>(data: Options[], $default: string[] = []) {
    return new Promise<Record<Options, string | undefined>>((done) => {
        type State = {
            type: number;
            options: string[];
            data: string[];
        };

        const dialog = Dialog<State>(({ use, update, state }) => {
            use(Vertical(
                // PlainText("TODO: Diesen Dialog inline machen").setFont(0.6, 500),
                DropDown({
                    text: (state.type !== undefined ? state.options?.[ state.type ] : undefined) ?? "Art auswählen",
                    color: Color.Colored,
                    dropdown: state.options?.map((x, i) => [ x, () => update({ type: i }) ])
                })
                    .addClass("space-between"), // TODO: Remove this CSS hack when DropDown becomes stable again and you can use setJustify
                (() => {
                    if (state.options && state.type !== undefined && state.data)
                        if (state.options[ state.type ] == "number")
                            return Input({
                                placeholder: "Zahl",
                                value: state.data[ state.type ],
                                changeOn: (value) => state.data![ state.type! ] = value
                            })
                        else if (state.options[ state.type ] == "boolean")
                            return Horizontal(
                                PlainText("Boolean").setFont(0.8, 500),
                                Spacer(),
                                Checkbox(state.data[ state.type ] === "true")
                                    .onClick((_, value) => state.data![ state.type! ] = (!(value)).toString())
                            )
                                .setAlign("center")
                        else if (state.options[ state.type ] == "response")
                            return Input({
                                placeholder: "Antwort",
                                value: state.data[ state.type ],
                                changeOn: (value) => state.data![ state.type! ] = value
                            })
                        else if (state.options[ state.type ] == "variable")
                            return Input({
                                placeholder: "Variable",
                                value: state.data[ state.type ],
                                changeOn: (value) => state.data![ state.type! ] = value
                            })
                    return null;
                })()
            ).setGap("0.5rem").setMargin("0 -0.5rem"))

        })
            .allowUserClose()
            .onClose(() => {
                const list = dialog.viewOptions<State>().state.data ?? [];
                done(Object.fromEntries(data.map((x, i) => [ x, list[ i ] ])) as Record<Options, string>);
            })
            .addButton("Ändern", () => {
                const list = dialog.viewOptions<State>().state.data ?? [];
                done(Object.fromEntries(data.map((x, i) => [ x, list[ i ] ])) as Record<Options, string>);
                return "close";
            }).open()
        dialog.viewOptions<State>().update({ type: 0, options: data, data: $default });

    })
}