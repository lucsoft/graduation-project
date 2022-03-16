
export function limit(counter: number): (value: unknown, index: number, array: unknown[]) => unknown {
    return (_, i) => i < counter;
}