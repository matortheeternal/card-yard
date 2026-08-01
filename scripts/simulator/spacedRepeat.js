function choose(a) {
    const index = Math.floor(Math.random() * a.length);
    return a[index];
}

function getSwapIndex(i, baseLength, seenIndices) {
    const minIndex = i - Math.floor(baseLength / 4);
    const maxIndex = i + Math.ceil(baseLength / 2);
    const range = Array.from(
        { length: maxIndex - minIndex },
        (_, n) => n + minIndex
    );
    const allowedIndexes = range.filter(n => !seenIndices.has(n));
    return choose(allowedIndexes);
}

function swap(a, index1, index2) {
    const v = a[index1];
    a[index1] = a[index2];
    a[index2] = v;
}

export default function spacedRepeat(baseSequence, numRepeats) {
    const results = Array(numRepeats).fill(baseSequence).flat();
    const seenIndices = new Set();
    const baseLength = baseSequence.length;
    for (let i = baseLength; i < results.length; i++) {
        if (seenIndices.has(i)) continue;
        const swapIndex = getSwapIndex(i, baseLength, seenIndices);
        seenIndices.add(swapIndex);
        swap(results, i, swapIndex);
    }
    return results;
}
