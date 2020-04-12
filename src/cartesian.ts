// A CartesianCoord is Cartesian coordinate.
type CartesianCoord = [number, number];

// cartesianDistance returns the Cartesian distance between coord1 and coord2
// using the Pythagorean theorem.
let cartesianDistance: DistanceFunc = (
    coord1: CartesianCoord,
    coord2: CartesianCoord,
): number => {
    const deltaX = coord1[0]-coord2[0];
    const deltaY = coord1[1]-coord2[1];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}