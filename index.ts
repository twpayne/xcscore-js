// A FlightType is a type of flight.
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

// A Coord is a coordinate.
type Coord = any;

// A DistFunc returns the distance between two Coords.
type DistFunc = (coord1: Coord, coord2: Coord) => number;

// A ScoreComponents contains a distance and a multiplier.
interface ScoreComponents {
    dist: number,
    multiplier: number,
}

// getScore is a convenience function that returns scoreComponents's score.
function getScore(scoreComponents: ScoreComponents): number {
    return scoreComponents.dist * scoreComponents.multiplier;
}

// An InterimScore is an interim score.
interface InterimScore extends ScoreComponents {
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

// A DistMatrix is a symmetric matrix storing dists between Coords.
class DistMatrix {
    readonly n: number;
    readonly dists: ReadonlyArray<number>;

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

    dist(i: number, j: number): number {
        if (i === j) {
            return 0;
        }
        return this.dists[i + j * (j - 1) / 2];
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
        paddedCoords.push(coord);
    }
    const lastCoord = coords[coords.length-1];
    for (let i = coords.length; i < n; ++i) {
        paddedCoords.push(lastCoord);
    }
    return paddedCoords;
}

// scoreStraightDist returns an InterimScore for the highest-scoring distance
// between any two coords. It uses a brute force algorithm with a running time
// of O(N^2) when N is the number of coords.
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

// scoreDistViaThreeTurnpoints returns an InterimScore for the highest-scoring
// distance via three turnpoints. It uses a brute force algorithm with a running
// time of O(N^5) when N is the number of coords.
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

type TriType = {
    flightType: FlightType,
    multiplier: number,
} | null;

type TriTypeFuncConfig = {
    isFAI: boolean,
    totalDistFlown: number,
    closingDist: number
}

type TriTypeFunc = (config: TriTypeFuncConfig) => TriType;

// scoreTris returns an InterimScore for the highest-scoring triangle flight
// according to triTypeFunc. It uses a brute force algorithm with a running time
// of O(N^5) when N is the number of coords.
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
                        const closingDist = dist(a, e);
                        const triType = triTypeFunc({
                            isFAI,
                            totalDistFlown,
                            closingDist,
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

// bestScore returns the best score from interimScores, applying roundScoreFunc
// and looking up coord indexes in coords.
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

// roundCrossCountryCupScore rounds score according to the SHV's Cross Country
// Cup rules.
const roundCrossCountryCupScore: RoundScoreFunc = (score: number): number => {
    return Math.round(10000*score)/10000;
}

// scoreCrossCountryCup scores coords using distFunc and the SHV's Cross Country
// Cup 2020 rules. See: https://www.xcontest.org/switzerland/en/rules/.
// https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/ReglementSportif_D_CCC_2020.pdf
// https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/Sportreglement_D_CCC_2020.pdf
export function scoreCrossCountryCup(config: {
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
            score: roundCrossCountryCupScore(dist * 1.2),
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
            triTypeFunc(triConfig: TriTypeFuncConfig): TriType {
                const { isFAI, totalDistFlown, closingDist } = triConfig;
                const isTri = closingDist <= 0.2 * totalDistFlown;
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
            },
        }),
    ];

    return bestScore({
        interimScores,
        coords: paddedCoords,
        roundScoreFunc: roundCrossCountryCupScore,
    });
}

// roundXContestScore rounds score according to the 2020 World XContest rules.
const roundXContestScore: RoundScoreFunc = (score: number): number => {
    return Math.round(100*score)/100
}

// scoreWorldXContest scores coords using distFunc and the 2020 World XContest
// rules. See: https://www.xcontest.org/world/en/rules/.
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
            score: roundXContestScore(dist),
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
            triTypeFunc(triConfig: TriTypeFuncConfig): TriType {
                const { isFAI, totalDistFlown, closingDist } = triConfig;
                const isTri = closingDist <= 0.2 * totalDistFlown;
                if (!isTri) {
                    return null;
                }
                const isClosed = closingDist <= 0.05 * totalDistFlown;
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
            },
        }),
    ];

    return bestScore({
        interimScores,
        coords: paddedCoords,
        roundScoreFunc: roundXContestScore,
    })
}
