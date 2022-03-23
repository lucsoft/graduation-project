export const toFirstUpperCase = (e: string) => e.split('').map((e, i) => i == 0 ? e.toUpperCase() : e).join('');
export function limit(counter: number): (value: unknown, index: number, array: unknown[]) => unknown {
    return (_, i) => i < counter;
}
export async function streamToArray<Type>(stream: ReadableStream<Type>): Promise<Type[]> {
    const list: Type[] = [];
    await stream.pipeTo(new WritableStream({
        write(data) {
            list.push(data);
        }
    }));
    return list;
}
