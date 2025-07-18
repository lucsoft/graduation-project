// Chrome doesn't support Stream#getIterable.
// This micro-ponyfill can be removed in the future
export async function* streamAsyncIterable(stream: ReadableStream) {
    const reader = stream.getReader();
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) return;
            yield value;
        }
    } finally {
        reader.releaseLock();
    }
}