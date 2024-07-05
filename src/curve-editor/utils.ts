

export type TupleVec2 = [x: number, y: number];
export type TupleVec3 = [x: number, y: number, z: number];

export const createBoundary = (index: number, positions: TupleVec2[]): [x0: number, y0: number, x1: number, y1: number] => {
    if (index === 0) {
        return [0, 0, 1, 0];
    }

    if (index === positions.length - 1) {
        return [0, 1, 1, 1];
    }
    const p0 = positions[index - 1];
    const p1 = positions[index + 1];

    // return [
    //     p0[0],
    //     p0[1],
    //     p1[0],
    //     p1[1],
    // ];

    // Only limit y.
    return [
        0,
        p0[1],
        1,
        p1[1],
    ];
}