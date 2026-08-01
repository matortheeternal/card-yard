export default function groupCardsByColor(cards) {
    const colorGroups = Object.groupBy(cards, card => card.colors);
    const groupsByLength = Array.from({ length: 6 }, () => ({}));
    for (const [colors, cards] of Object.entries(colorGroups))
        groupsByLength[colors.length][colors] = cards;
    return groupsByLength;
}
