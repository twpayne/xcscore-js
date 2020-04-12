// A FlightType is a type of flight.
enum FlightType {
    None = "none",
    ClosedFAITriangle = "closedFAITriangle",
    ClosedFlatTriangle = "closedFlatTriangle",
    FAITriangle = "faiTriangle",
    FlatTriangle = "flatTriangle",
    FreeDistance = "freeDistance",
    OpenDistance = "openDistance",
    StraightDistance = "straightDistance",
};

// A Coord is a coordinate.
type Coord = any;

// A DistanceFunc returns the distance between two Coords.
type DistanceFunc = (coord1: Coord, coord2: Coord) => number;

// A ScoreComponents contains a distance and a multiplier.
interface ScoreComponents {
    distance: number,
    multiplier: number,
}

// score is a convenience function that returns scoreComponents's score.
function score(scoreComponents: ScoreComponents): number {
    return scoreComponents.distance * scoreComponents.multiplier;
}

// An IntermediateScore is an intermediate score.
interface IntermediateScore extends ScoreComponents {
    flightType: FlightType,
    coordIndexes: ReadonlyArray<number>,
}

// A RoundScoreFunc rounds a score.
type RoundScoreFunc = (score: number) => number;

// A FinalScore is a scored flight.
interface FinalScore extends ScoreComponents {
    flightType: FlightType,
    score: number,
    coords: ReadonlyArray<Coord>,
}

// A DistanceMatrix is a symmetric matrix storing distances between Coords.
class DistanceMatrix {
    readonly n: number;
    private readonly distances: ReadonlyArray<number>;

    constructor(coords: ReadonlyArray<Coord>, distanceFunc: DistanceFunc) {
        this.n = coords.length;
        const distances: number[] = new Array(this.n * (this.n - 1) / 2);
        let k = 0;
        for (let j = 1; j < this.n; ++j) {
            for (let i = 0; i < j; ++i) {
                distances[k++] = distanceFunc(coords[i], coords[j])
            }
        }
        this.distances = distances;
    }

    distanceBetween(i: number, j: number): number {
        return this.distances[i + j * (j - 1) / 2];
    }
}

// padCoords ensures that coords contains at least n elements by repeating the
// last element as many times as necessary.
function padCoords(
    coords: ReadonlyArray<Coord>,
    n: number,
): ReadonlyArray<Coord> {
    if (coords.length >= n) {
        return coords;
    }
    const paddedCoords: Coord[] = [];
    for (const coord of coords) {
        paddedCoords.push(coord)
    }
    const lastCoord = coords[coords.length-1];
    for (let i = coords.length; i < n; ++i) {
        paddedCoords.push(lastCoord)
    }
    return paddedCoords;
}

// scoreStraightDistance returns an IntermediateScore for the highest-scoring
// distance between any two coords. It uses a brute force algorithm with a
// running time of O(N^2) when N is the number of coords.
function scoreStraightDistance(config: {
    distanceMatrix: DistanceMatrix,
}): IntermediateScore {
    const n = config.distanceMatrix.n;
    const distanceBetween = config.distanceMatrix.distanceBetween;
    let bestDistance = -Infinity;
    let bestCoordIndexes: ReadonlyArray<number> = [];
    for (let a = 0; a < n-1; ++a) {
        for (let b = a+1; b < n; ++b) {
            const distance = distanceBetween(a, b);
            if (distance > bestDistance) {
                bestDistance = distance;
                bestCoordIndexes = [a, b];
            }
        }
    }
    return {
        flightType: FlightType.StraightDistance,
        distance: bestDistance,
        multiplier: 1.2,
        coordIndexes: bestCoordIndexes,
    }
}

// scoreDistanceViaThreeTurnpoints returns an IntermediateScore for the
// highest-scoring distance via three turnpoints. It uses a brute force
// algorithm with a running time of O(N^5) when N is the number of coords.
function scoreDistanceViaThreeTurnpoints(config: {
    flightType: FlightType,
    distanceMatrix: DistanceMatrix,
}): IntermediateScore {
    const n = config.distanceMatrix.n;
    const distanceBetween = config.distanceMatrix.distanceBetween;
    let bestDistance = -Infinity;
    let bestCoordIndexes: ReadonlyArray<number> = [];
    for (let a = 0; a < n-4; ++a) {
        for (let b = a+1; b < n-3; ++b) {
            const distanceAB = distanceBetween(a, b);
            for (let c = b+1; c < n-2; ++c) {
                const distanceBC = distanceBetween(b, c);
                for (let d = c+1; d < n-1; ++d) {
                    const distanceCD = distanceBetween(c, d);
                    for (let e = d+1; e < n; ++e) {
                        const distanceDE = distanceBetween(d, e);
                        const totalDistance = distanceAB + distanceBC + distanceCD + distanceDE;
                        if (totalDistance > bestDistance) {
                            bestDistance = totalDistance;
                            bestCoordIndexes = [a, b, c, d, e];
                        }
                    }
                }
            }
        }
    }
    return {
        flightType: config.flightType,
        distance: bestDistance,
        multiplier: 1,
        coordIndexes: bestCoordIndexes,
    };
}

type TriangleType = {
    flightType: FlightType,
    multiplier: number,
} | null;

type TriangleTypeFunc = (totalDistance: number, shortestLegDistance: number, closingDistance: number) => TriangleType;

// scoreTriangles returns an IntermediateScore for the highest-scoring triangle
// flight according to triangleTypeFunc. It uses a brute force algorithm with a
// running time of O(N^5) when N is the number of coords.
function scoreTriangles(config: {
    distanceMatrix: DistanceMatrix,
    triangleTypeFunc: TriangleTypeFunc,
}): IntermediateScore | null {
    const n = config.distanceMatrix.n;
    const distanceBetween = config.distanceMatrix.distanceBetween;
    const triangleTypeFunc = config.triangleTypeFunc;
    let bestIntermediateScore: IntermediateScore | null = null;
    for (let a = 0; a < n-3; ++a) {
        for (let b = a; b < n-2; ++b) {
            const distanceAB = distanceBetween(a, b);
            for (let c = b+1; c < n-1; ++c) {
                const distanceBC = distanceBetween(b, c);
                for (let d = c+1; d < n; ++d) {
                    const distanceCD = distanceBetween(c, d);
                    for (let e = d; e < n; ++e) {
                        const distanceDE = distanceBetween(d, e);
                        const totalDistance = distanceAB + distanceBC + distanceCD + distanceDE;
                        const shortestLegDistance = Math.min(distanceBC, distanceCD, distanceBetween(b, d));
                        const closingDistance = distanceBetween(a, e);
                        const triangleType = triangleTypeFunc(totalDistance, shortestLegDistance, closingDistance);
                        if (!triangleType) {
                            continue;
                        }
                        if (!bestIntermediateScore ||
                            totalDistance * triangleType.multiplier > score(bestIntermediateScore)) {
                            bestIntermediateScore = {
                                flightType: triangleType.flightType,
                                distance: totalDistance,
                                multiplier: triangleType.multiplier,
                                coordIndexes: [a, b, c, d, e],
                            }
                        }
                    }
                }
            }
        }
    }
    return bestIntermediateScore;
}

// bestScore returns the best score from intermediateScores, applying
// roundScoreFunc and looking up coord indexes in coords.
function bestScore(config: {
    intermediateScores: ReadonlyArray<IntermediateScore | null>,
    roundScoreFunc: RoundScoreFunc,
    coords: ReadonlyArray<Coord>,
}): FinalScore | null {
    let bestIntermediateScore: IntermediateScore | null = null;
    for (const intermediateScore of config.intermediateScores) {
        if (!intermediateScore) {
            continue;
        }
        if (!bestIntermediateScore || score(intermediateScore) > score(bestIntermediateScore)) {
            bestIntermediateScore = intermediateScore;
        }
    }
    if (!bestIntermediateScore) {
        return null
    }
    return {
        flightType: bestIntermediateScore.flightType,
        distance: bestIntermediateScore.distance,
        multiplier: bestIntermediateScore.multiplier,
        score: config.roundScoreFunc(score(bestIntermediateScore)),
        coords: bestIntermediateScore.coordIndexes.map(i => config.coords[i]),
    }
}