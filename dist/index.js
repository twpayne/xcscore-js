"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
/**
 * Return the score from a distance and a multiplier.
 */
function getScore(config) {
    return config.dist * config.multiplier;
}
/**
 * A symmetric distance matrix storing distances between coords. As the matrix
 * is strictly triangular, only the upper triangular matrix excluding the
 * diagonal is stored.
 */
class DistMatrix {
    /**
     * Construct a new DistMatrix.
     *
     * @param config.coords Coords array.
     * @param config.distFunc Distance function.
     */
    constructor(config) {
        const { coords, distFunc } = config;
        this.n = coords.length;
        const dists = new Array(this.n * (this.n - 1) / 2);
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
    dist(i, j) {
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
function padCoords(coords, n) {
    // If coords is already long enough, return it immediately.
    if (coords.length >= n) {
        return coords;
    }
    // Otherwise, create a new array of coords with the elements of coords...
    const paddedCoords = [];
    for (const coord of coords) {
        paddedCoords.push(coord);
    }
    // ...pad it with the last coord until it is long enough...
    const lastCoord = coords[coords.length - 1];
    for (let i = coords.length; i < n; ++i) {
        paddedCoords.push(lastCoord);
    }
    // ...and return it.
    return paddedCoords;
}
/**
 * Return an interim score for the highest-scoring distance between any two
 * coords. It uses a brute force algorithm with a running time of O(N^2) when N
 * is the number of coords, and so should only be used with a few tens of
 * coords.
 *
 * @param config.distMatrix Distance matrix.
 */
function scoreStraightDist(config) {
    const n = config.distMatrix.n;
    const dist = config.distMatrix.dist.bind(config.distMatrix);
    let bestDist = -Infinity;
    let bestCoordIndexes = [];
    for (let a = 0; a < n - 1; ++a) {
        for (let b = a + 1; b < n; ++b) {
            const totalDist = dist(a, b);
            if (totalDist > bestDist) {
                bestDist = totalDist;
                bestCoordIndexes = [a, b];
            }
        }
    }
    return {
        flightType: "straightDist" /* StraightDist */,
        dist: bestDist,
        multiplier: 1.2,
        coordIndexes: bestCoordIndexes,
    };
}
/**
 * Return an interim score for the highest-scoring distance via three
 * turnpoints. It uses a brute force algorithm with a running time of O(N^5)
 * when N is the number of coords, and so should only be used with a few tens of
 * coords.
 *
 * @param config.flightType The type of returned flight.
 * @param config.distMatrix Distance matrix.
 */
function scoreDistViaThreeTurnpoints(config) {
    // Distance via three turnpoints requires five turnpoints: a start, three
    // turnpoints, and a finish, which must be visited in order. Iterate over
    // all possible combinations to find the highest scoring flight.
    const n = config.distMatrix.n;
    const dist = config.distMatrix.dist.bind(config.distMatrix);
    let bestDist = -Infinity;
    let bestCoordIndexes = [];
    for (let a = 0; a < n - 4; ++a) { // Start.
        for (let b = a + 1; b < n - 3; ++b) { // First turnpoint.
            const distAB = dist(a, b);
            for (let c = b + 1; c < n - 2; ++c) { // Second turnpoint.
                const distBC = dist(b, c);
                for (let d = c + 1; d < n - 1; ++d) { // Third turnpoint.
                    const distCD = dist(c, d);
                    for (let e = d + 1; e < n; ++e) { // Finish.
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
 * Return an interim score for the highest-scoring triangle flight according to
 * triTypeFunc, or null if there are no triangles. This uses a brute force
 * algorithm with a running time of O(N^5) when N is the number of coords, and
 * so should only be used for a few tens of coords.
 *
 * @param config.distMatrix Distance matrix.
 * @param config.tryTypeFunc Function to determine whether a flight is a
 * triangle.
 */
function scoreTris(config) {
    // Triangles require five turnpoints: a start, three turnpoints, and a
    // finish. The start and the first turnpoint can be the same, as can the
    // last turnpoint and the finish. Iterate over all possible combinations to
    // find the highest scoring flight.
    const n = config.distMatrix.n;
    const dist = config.distMatrix.dist.bind(config.distMatrix);
    const triTypeFunc = config.triTypeFunc;
    let bestInterimScore = null;
    for (let a = 0; a < n - 3; ++a) { // Start.
        for (let b = a; b < n - 2; ++b) { // First turnpoint, including start.
            const distAB = dist(a, b);
            for (let c = b + 1; c < n - 1; ++c) { // Second turnpoint.
                const distBC = dist(b, c);
                for (let d = c + 1; d < n; ++d) { // Third turnpoint.
                    const distCD = dist(c, d);
                    for (let e = d; e < n; ++e) { // Finish, including third turnpoint.
                        const distDE = dist(d, e);
                        const distBD = dist(b, d);
                        // FAI triangles are defined by the shortest side being
                        // at least 28% of the total triangle distance. The
                        // total triangle distance is defined by the three
                        // corners of the triangle, and is not related to the
                        // start or finish points.
                        const isFAI = Math.min(distBC, distCD, distBD) >= 0.28 * (distBC + distCD + distBD);
                        // The total distance flown is the total distance flown
                        // by the pilot, i.e. the distance from the start to the
                        // first turnpoint, then to the second turnpoint, then
                        // to the third turnpoint, then to the finish, for a
                        // total of four legs.
                        const totalDistFlown = distAB + distBC + distCD + distDE;
                        // The gap distance is the distance between the start
                        // turnpoint and the finish turnpoint.
                        const gapDist = dist(a, e);
                        // Find out if this is a triangle.
                        const triType = triTypeFunc({
                            isFAI,
                            totalDistFlown,
                            gapDist,
                        });
                        // If this is not a triangle, try the next combination.
                        if (!triType) {
                            continue;
                        }
                        // If there is already a best triangle which is better
                        // than this one, try the next combination.
                        if (bestInterimScore && totalDistFlown * triType.multiplier <= getScore(bestInterimScore)) {
                            continue;
                        }
                        // Otherwise, save the new best triangle.
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
 * Return a final score from the best interimScore from interimScores by
 * applying roundScoreFunc and looking up coord indexes in coords.
 *
 * @param config.interimScores Interim scores.
 * @param config.roundScoreFunc Score rounding function.
 * @param config.coords Coords.
 */
function finalizeBestInterimScore(config) {
    // Iterate over interimScores to find the best score.
    let bestInterimScore = null;
    for (const interimScore of config.interimScores) {
        // Skip nulls.
        if (!interimScore) {
            continue;
        }
        // Replace the best score if there is no existing best score, or there
        // is a better score.
        if (!bestInterimScore || getScore(interimScore) > getScore(bestInterimScore)) {
            bestInterimScore = interimScore;
        }
    }
    // If there is no best score, return a "no score".
    if (!bestInterimScore) {
        return {
            flightType: "none" /* None */,
            dist: 0,
            multiplier: 0,
            score: 0,
            coords: [],
        };
    }
    // Convert the best interim score to a final score.
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
function crossCHCountryCupTriType(config) {
    const { isFAI, totalDistFlown, gapDist } = config;
    const isTri = gapDist <= 0.2 * totalDistFlown;
    if (!isTri) {
        return null;
    }
    if (isFAI) {
        return {
            flightType: "faiTri" /* FAITri */,
            multiplier: 1.3,
        };
    }
    return {
        flightType: "flatTri" /* FlatTri */,
        multiplier: 1.2,
    };
}
/**
 * Round score according to the SHV's Cross Country Cup rules.
 *
 * @param score Score.
 */
function roundCHCrossCountryCupScore(score) {
    return Math.round(10000 * score) / 10000;
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
function scoreCHCrossCountryCup(config) {
    const { coords, distKMFunc } = config;
    // If there are one or two coords, then there is no distance and no score.
    if (coords.length < 2) {
        return {
            flightType: "none" /* None */,
            dist: 0,
            multiplier: 0,
            score: 0,
            coords: [],
        };
    }
    // If there are only two coords, then there is only straight distance.
    if (coords.length === 2) {
        const dist = distKMFunc(coords[0], coords[1]);
        return {
            dist,
            flightType: "straightDist" /* StraightDist */,
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
            flightType: "freeDist" /* FreeDist */,
        }),
        scoreTris({
            distMatrix,
            triTypeFunc: crossCHCountryCupTriType,
        }),
    ];
    return finalizeBestInterimScore({
        interimScores,
        coords: paddedCoords,
        roundScoreFunc: roundCHCrossCountryCupScore,
    });
}
exports.scoreCHCrossCountryCup = scoreCHCrossCountryCup;
/**
 * Return whether a flight is an World XContest triangle.
 *
 * @param config Triangle type function config.
 */
function worldXContestTriType(config) {
    const { isFAI, totalDistFlown, gapDist } = config;
    const isTri = gapDist <= 0.2 * totalDistFlown;
    if (!isTri) {
        return null;
    }
    const isClosed = gapDist <= 0.05 * totalDistFlown;
    if (isClosed && isFAI) {
        return {
            flightType: "closedFAITri" /* ClosedFAITri */,
            multiplier: 1.6,
        };
    }
    if (isClosed) {
        return {
            flightType: "closedFlatTri" /* ClosedFlatTri */,
            multiplier: 1.4,
        };
    }
    if (isFAI) {
        return {
            flightType: "faiTri" /* FAITri */,
            multiplier: 1.4,
        };
    }
    return {
        flightType: "flatTri" /* FlatTri */,
        multiplier: 1.2,
    };
}
/**
 * Round score according to the 2020 World XContest rules.
 *
 * @param score Score.
 */
function roundWorldXContestScore(score) {
    return Math.round(100 * score) / 100;
}
/**
 * Score coords using the 2020 World XContest rules. See:
 * https://www.xcontest.org/world/en/rules/.
 *
 * @param config.coords Coords.
 * @param config.distKMFunc Function to return distance between two coords in
 * kilometers.
 */
function scoreWorldXContest(config) {
    const { coords, distKMFunc } = config;
    // If there are one or two coords, then there is no distance and no score.
    if (coords.length < 2) {
        return {
            flightType: "none" /* None */,
            dist: 0,
            multiplier: 0,
            score: 0,
            coords: [],
        };
    }
    // If there are only two coords, then there is only open distance.
    if (coords.length === 2) {
        const dist = distKMFunc(coords[0], coords[1]);
        return {
            dist,
            flightType: "openDist" /* OpenDist */,
            multiplier: 1,
            score: roundWorldXContestScore(dist),
            coords: [coords[0], coords[1]],
        };
    }
    const paddedCoords = padCoords(coords, 5);
    const distMatrix = new DistMatrix({
        coords: paddedCoords,
        distFunc: distKMFunc,
    });
    const interimScores = [
        scoreDistViaThreeTurnpoints({
            distMatrix,
            flightType: "openDist" /* OpenDist */,
        }),
        scoreTris({
            distMatrix,
            triTypeFunc: worldXContestTriType,
        }),
    ];
    return finalizeBestInterimScore({
        interimScores,
        coords: paddedCoords,
        roundScoreFunc: roundWorldXContestScore,
    });
}
exports.scoreWorldXContest = scoreWorldXContest;
//# sourceMappingURL=index.js.map