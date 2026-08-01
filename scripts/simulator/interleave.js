/**
 * Evenly interleaves two arrays while preserving the order of each.
 *
 * @template T
 * @param {readonly T[]} a
 * @param {readonly T[]} b
 * @returns {T[]}
 */
export function interleave(a, b) {
    if (a.length === 0) return b.slice();
    if (b.length === 0) return a.slice();

    const [longer, shorter] = a.length >= b.length
        ? [a, b]
        : [b, a];

    const result = [];
    let shorterIndex = 0;
    let accumulator = Math.floor(longer.length / 2);

    for (const item of longer) {
        result.push(item);
        accumulator += shorter.length;

        if (accumulator >= longer.length) {
            result.push(shorter[shorterIndex++]);
            accumulator -= longer.length;
        }
    }

    return result;
}

export function mergeByInterleave(arrays) {
    if (arrays.length <= 1) return arrays[0] || [];
    return arrays.reduce(interleave);
}
