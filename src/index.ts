/**
 * A type of flight.
 */
const enum FlightType {
    None = "none",
    ClosedFAITri = "closedFAITri",
    ClosedFlatTri = "closedFlatTri",
    FAITri = "faiTri",
    FlatTri = "flatTri",
    FreeDist = "freeDist",
    OpenDist = "openDist",
    StraightDist = "straightDist",
};

/**
 * A coordinate.
 */
type Coord = any;

/**
 * Return the distance between two coords.
 */
type DistFunc = (coord1: Coord, coord2: Coord) => number;

/**
 * Return scoreComponents's score.
 */
function getScore(config: {
    dist: number,
    multiplier: number,
}): number {
    return config.dist * config.multiplier;
}

/**
 * An interim score. Contains a flight type, a distance, a multiplier, and
 * indexes into an array of coords.
 */
interface InterimScore {
     /** Flight type. */
    flightType: FlightType,

    /** Distance. */
    dist: number,

     /** Multipler. */
    multiplier: number,

    /** Coord indexes. */
    coordIndexes: ReadonlyArray<number>,
}

/**
 * Round a score.
 */
type RoundScoreFunc = (score: number) => number;

/**
 * A scored flight. Note that the score is not necessariliy equal to the product
 * of the distance and the multiplier due to rounding.
 */
interface FinalScore {
    /** Flight type. */
    flightType: FlightType,

    /** Distance. */
    dist: number,

     /** Multipler. */
    multiplier: number,

    /** Rounded score. */
    score: number,

    /** Coords. */
    coords: ReadonlyArray<Coord>,
}

/**
 * A symmetric distance matrix storing distances between coords. As the matrix
 * is strictly triangular, only the upper triangular matrix excluding the
 * diagonal is stored.
 */
class DistMatrix {
    readonly n: number;
    readonly dists: ReadonlyArray<number>;

    /**
     * Construct a new DistMatrix.
     *
     * @param config.coords Coords array.
     * @param config.distFunc Distance function.
     */
    constructor(config: {
        coords: ReadonlyArray<Coord>,
        distFunc: DistFunc,
    }) {
        const { coords, distFunc } = config;
        this.n = coords.length;
        const dists: number[] = new Array(this.n * (this.n - 1) / 2);
        let k = 0;
        for (let j = 1; j < this.n; ++j) {
            for (let i = 0; i < j; ++i) {
                dists[k++] = distFunc(coords[i], coords[j]);
            }
        }
        this.dists = dists;
    }

    /**
     * Return the distance between coord at index i and the coord at index j. i
     * must be less than or equal to j.
     *
     * @param i Index of first coord.
     * @param j Index of second coord.
     */
    dist(i: number, j: number): number {
        if (i === j) {
            return 0;
        }
        return this.dists[i + j * (j - 1) / 2];
    }
}

/**
 * Return an array of coords that contains at least n elements by repeating the
 * last element as many times as necessary. If coords already contains at least
 * n elements then it is returned directly. If coords contains fewer than n
 * elements then a new array is returned, leaving the original coords array
 * unchanged.
 *
 * @param coords Coords array.
 * @param n Minimum length of the returned array.
 */
function padCoords(
    coords: ReadonlyArray<Coord>,
    n: number,
): ReadonlyArray<Coord> {
    if (coords.length >= n) {
        return coords;
    }
    const paddedCoords: Coord[] = [];
    for (const coord of coords) {
        paddedCoords.push(coord);
    }
    const lastCoord = coords[coords.length-1];
    for (let i = coords.length; i < n; ++i) {
        paddedCoords.push(lastCoord);
    }
    return paddedCoords;
}

/**
 * Return an interim score for the highest-scoring distance between any two
 * coords. It uses a brute force algorithm with a running time of O(N^2) when N
 * is the number of coords, and so should only be used with a few coords.
 *
 * @param config.distMatrix Distance matrix.
 */
function scoreStraightDist(config: {
    distMatrix: DistMatrix,
}): InterimScore {
    const n = config.distMatrix.n;
    const dist = config.distMatrix.dist.bind(config.distMatrix);
    let bestDist = -Infinity;
    let bestCoordIndexes: ReadonlyArray<number> = [];
    for (let a = 0; a < n-1; ++a) {
        for (let b = a+1; b < n; ++b) {
            const totalDist = dist(a, b);
            if (totalDist > bestDist) {
                bestDist = totalDist;
                bestCoordIndexes = [a, b];
            }
        }
    }
    return {
        flightType: FlightType.StraightDist,
        dist: bestDist,
        multiplier: 1.2,
        coordIndexes: bestCoordIndexes,
    };
}

/**
 * Return an interim score for the highest-scoring distance via three
 * turnpoints. It uses a brute force algorithm with a running time of O(N^5)
 * when N is the number of coords, and so should only be used with a few coords.
 *
 * @param config.flightType The type of returned flight.
 * @param config.distMatrix Distance matrix.
 */
function scoreDistViaThreeTurnpoints(config: {
    flightType: FlightType,
    distMatrix: DistMatrix,
}): InterimScore {
    const n = config.distMatrix.n;
    const dist = config.distMatrix.dist.bind(config.distMatrix);
    let bestDist = -Infinity;
    let bestCoordIndexes: ReadonlyArray<number> = [];
    for (let a = 0; a < n-4; ++a) {
        for (let b = a+1; b < n-3; ++b) {
            const distAB = dist(a, b);
            for (let c = b+1; c < n-2; ++c) {
                const distBC = dist(b, c);
                for (let d = c+1; d < n-1; ++d) {
                    const distCD = dist(c, d);
                    for (let e = d+1; e < n; ++e) {
                        const distDE = dist(d, e);
                        const totalDist = distAB + distBC + distCD + distDE;
                        if (totalDist > bestDist) {
                            bestDist = totalDist;
                            bestCoordIndexes = [a, b, c, d, e];
                        }
                    }
                }
            }
        }
    }
    return {
        flightType: config.flightType,
        dist: bestDist,
        multiplier: 1,
        coordIndexes: bestCoordIndexes,
    };
}

/**
 * A type of triangle with a flight type and a multiplier, or null if a flight
 * is not a triangle.
 */
type TriType = {
    /** Flight type. */
    flightType: FlightType,

    /** Multiplier. */
    multiplier: number,
} | null;

/**
 * Contains all the data required to determine if a flight is a triangle.
 */
type TriTypeFuncConfig = {
    /** Whether the triangle is an FAI triangle. */
    isFAI: boolean,

    /** The total distance flown. */
    totalDistFlown: number,

    /* The gap between the start and the end of the flight. */
    gapDist: number
}

/**
 * Determine whether a flight is a triangle.
 */
type TriTypeFunc = (config: TriTypeFuncConfig) => TriType;

/**
 * Return an interim score for the highest-scoring triangle flight according to
 * triTypeFunc. It uses a brute force algorithm with a running time of O(N^5)
 * when N is the number of coords, and so should only be used for a few coords.
 *
 * @param config.distMatrix Distance matrix.
 * @param config.tryTypeFunc Function to determine whether a flight is a
 * triangle.
 */
function scoreTris(config: {
    distMatrix: DistMatrix,
    triTypeFunc: TriTypeFunc,
}): InterimScore | null {
    const n = config.distMatrix.n;
    const dist = config.distMatrix.dist.bind(config.distMatrix);
    const triTypeFunc = config.triTypeFunc;
    let bestInterimScore: InterimScore | null = null;
    for (let a = 0; a < n-3; ++a) {
        for (let b = a; b < n-2; ++b) {
            const distAB = dist(a, b);
            for (let c = b+1; c < n-1; ++c) {
                const distBC = dist(b, c);
                for (let d = c+1; d < n; ++d) {
                    const distCD = dist(c, d);
                    for (let e = d; e < n; ++e) {
                        const distDE = dist(d, e);
                        const distBD = dist(b, d);
                        const isFAI = Math.min(distBC, distCD, distBD) >= 0.28 * (distBC + distCD + distBD);
                        const totalDistFlown = distAB + distBC + distCD + distDE;
                        const gapDist = dist(a, e);
                        const triType = triTypeFunc({
                            isFAI,
                            totalDistFlown,
                            gapDist,
                        });
                        if (!triType) {
                            continue;
                        }
                        if (bestInterimScore && totalDistFlown * triType.multiplier <= getScore(bestInterimScore)) {
                            continue;
                        }
                        bestInterimScore = {
                            flightType: triType.flightType,
                            dist: totalDistFlown,
                            multiplier: triType.multiplier,
                            coordIndexes: [a, b, c, d, e],
                        };
                    }
                }
            }
        }
    }
    return bestInterimScore;
}

/**
 * Return the best score from interimScores and convert it to a Score by
 * applying roundScoreFunc and looking up coord indexes in coords.
 *
 * @param config.interimScores Interim scores.
 * @param config.roundScoreFunc Score rounding function.
 * @param config.coords Coords.
 */
function bestScore(config: {
    interimScores: ReadonlyArray<InterimScore | null>,
    roundScoreFunc: RoundScoreFunc,
    coords: ReadonlyArray<Coord>,
}): FinalScore | null {
    let bestInterimScore: InterimScore | null = null;
    for (const interimScore of config.interimScores) {
        if (!interimScore) {
            continue;
        }
        if (!bestInterimScore || getScore(interimScore) > getScore(bestInterimScore)) {
            bestInterimScore = interimScore;
        }
    }
    if (!bestInterimScore) {
        return null;
    }
    return {
        flightType: bestInterimScore.flightType,
        dist: bestInterimScore.dist,
        multiplier: bestInterimScore.multiplier,
        score: config.roundScoreFunc(getScore(bestInterimScore)),
        coords: bestInterimScore.coordIndexes.map(i => config.coords[i]),
    };
}

/**
 * Return whether a flight is a Swiss Cross Country Cup triangle.
 *
 * @param config Triangle type function config.
 */
function crossCHCountryCupTriType(config: TriTypeFuncConfig): TriType {
    const { isFAI, totalDistFlown, gapDist } = config;
    const isTri = gapDist <= 0.2 * totalDistFlown;
    if (!isTri) {
        return null;
    }
    if (isFAI) {
        return {
            flightType: FlightType.FAITri,
            multiplier: 1.3,
        };
    }
    return {
        flightType: FlightType.FlatTri,
        multiplier: 1.2,
    };
}

/**
 * Round score according to the SHV's Cross Country Cup rules.
 *
 * @param score Score.
 */
function roundCHCrossCountryCupScore(score: number): number {
    return Math.round(10000*score)/10000;
}

/**
 * Score coords using the SHV's Cross Country Cup 2020 rules. See:
 * https://www.xcontest.org/switzerland/en/rules/.
 * https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/ReglementSportif_D_CCC_2020.pdf
 * https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/Sportreglement_D_CCC_2020.pdf
 *
 * @param config.coords Coords.
 * @param config.distKMFunc Function to return distance between two coords in
 * kilometers.
 */
export function scoreCHCrossCountryCup(config: {
    coords: ReadonlyArray<Coord>,
    distKMFunc: DistFunc,
}): FinalScore | null {
    const { coords, distKMFunc } = config;

    if (coords.length < 2) {
        return {
            flightType: FlightType.None,
            dist: 0,
            multiplier: 0,
            score: 0,
            coords: [],
        };
    }

    if (coords.length === 2) {
        const dist = distKMFunc(coords[0], coords[1]);
        return {
            dist,
            flightType: FlightType.StraightDist,
            multiplier: 1.2,
            score: roundCHCrossCountryCupScore(dist * 1.2),
            coords: [coords[0], coords[1]],
        };
    }

    const paddedCoords = padCoords(coords, 5);
    const distMatrix = new DistMatrix({
        coords: paddedCoords,
        distFunc: distKMFunc,
    });
    const interimScores = [
        scoreStraightDist({
            distMatrix,
        }),
        scoreDistViaThreeTurnpoints({
            distMatrix,
            flightType: FlightType.FreeDist,
        }),
        scoreTris({
            distMatrix,
            triTypeFunc: crossCHCountryCupTriType,
        }),
    ];

    return bestScore({
        interimScores,
        coords: paddedCoords,
        roundScoreFunc: roundCHCrossCountryCupScore,
    });
}

/**
 * Return whether a flight is an World XContest triangle.
 *
 * @param config Triangle type function config.
 */
function worldXContestTriType(config: TriTypeFuncConfig): TriType {
    const { isFAI, totalDistFlown, gapDist } = config;
    const isTri = gapDist <= 0.2 * totalDistFlown;
    if (!isTri) {
        return null;
    }
    const isClosed = gapDist <= 0.05 * totalDistFlown;
    if (isClosed && isFAI) {
        return {
            flightType: FlightType.ClosedFAITri,
            multiplier: 1.6,
        };
    }
    if (isClosed) {
        return {
            flightType: FlightType.ClosedFlatTri,
            multiplier: 1.4,
        };
    }
    if (isFAI) {
        return {
            flightType: FlightType.FAITri,
            multiplier: 1.4,
        };
    }
    return {
        flightType: FlightType.FlatTri,
        multiplier: 1.2,
    };
}

/**
 * Round score according to the 2020 World XContest rules.
 *
 * @param score Score.
 */
function roundWorldXContestScore(score: number): number {
    return Math.round(100*score)/100
}

/**
 * Score coords using the 2020 World XContest rules. See:
 * https://www.xcontest.org/world/en/rules/.
 *
 * @param config.coords Coords.
 * @param config.distKMFunc Function to return distance between two coords in
 * kilometers.
 */
export function scoreWorldXContest(config: {
    coords: ReadonlyArray<Coord>,
    distKMFunc: DistFunc,
}): FinalScore | null {
    const { coords, distKMFunc } = config;

    if (coords.length < 2) {
        return {
            flightType: FlightType.None,
            dist: 0,
            multiplier: 0,
            score: 0,
            coords: [],
        };
    }

    if (coords.length === 2) {
        const dist = distKMFunc(coords[0], coords[1]);
        return {
            dist,
            flightType: FlightType.OpenDist,
            multiplier: 1,
            score: roundWorldXContestScore(dist),
            coords: [coords[0], coords[1]],
        }
    }

    const paddedCoords = padCoords(coords, 5);
    const distMatrix = new DistMatrix({
        coords: paddedCoords,
        distFunc: distKMFunc,
    });
    const interimScores = [
        scoreDistViaThreeTurnpoints({
            distMatrix,
            flightType: FlightType.OpenDist,
        }),
        scoreTris({
            distMatrix,
            triTypeFunc: worldXContestTriType,
        }),
    ];

    return bestScore({
        interimScores,
        coords: paddedCoords,
        roundScoreFunc: roundWorldXContestScore,
    })
}
