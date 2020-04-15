export type CartesianCoord = [number, number];

export function cartesianDist(
    coord1: CartesianCoord,
    coord2: CartesianCoord,
): number {
    const deltaX = coord1[0]-coord2[0];
    const deltaY = coord1[1]-coord2[1];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}