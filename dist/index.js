"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
// getScore is a convenience function that returns scoreComponents's score.
function getScore(scoreComponents) {
    return scoreComponents.distance * scoreComponents.multiplier;
}
// A DistanceMatrix is a symmetric matrix storing distances between Coords.
class DistanceMatrix {
    constructor(config) {
        const { coords, distanceFunc } = config;
        this.n = coords.length;
        const distances = new Array(this.n * (this.n - 1) / 2);
        let k = 0;
        for (let j = 1; j < this.n; ++j) {
            for (let i = 0; i < j; ++i) {
                distances[k++] = distanceFunc(coords[i], coords[j]);
            }
        }
        this.distances = distances;
    }
    distanceBetween(i, j) {
        if (i === j) {
            return 0;
        }
        return this.distances[i + j * (j - 1) / 2];
    }
}
exports.DistanceMatrix = DistanceMatrix;
// padCoords ensures that coords contains at least n elements by repeating the
// last element as many times as necessary.
function padCoords(coords, n) {
    if (coords.length >= n) {
        return coords;
    }
    const paddedCoords = [];
    for (const coord of coords) {
        paddedCoords.push(coord);
    }
    const lastCoord = coords[coords.length - 1];
    for (let i = coords.length; i < n; ++i) {
        paddedCoords.push(lastCoord);
    }
    return paddedCoords;
}
// scoreStraightDistance returns an IntermediateScore for the highest-scoring
// distance between any two coords. It uses a brute force algorithm with a
// running time of O(N^2) when N is the number of coords.
function scoreStraightDistance(config) {
    const n = config.distanceMatrix.n;
    const distanceBetween = config.distanceMatrix.distanceBetween.bind(config.distanceMatrix);
    let bestDistance = -Infinity;
    let bestCoordIndexes = [];
    for (let a = 0; a < n - 1; ++a) {
        for (let b = a + 1; b < n; ++b) {
            const distance = distanceBetween(a, b);
            if (distance > bestDistance) {
                bestDistance = distance;
                bestCoordIndexes = [a, b];
            }
        }
    }
    return {
        flightType: "straightDistance" /* StraightDistance */,
        distance: bestDistance,
        multiplier: 1.2,
        coordIndexes: bestCoordIndexes,
    };
}
// scoreDistanceViaThreeTurnpoints returns an IntermediateScore for the
// highest-scoring distance via three turnpoints. It uses a brute force
// algorithm with a running time of O(N^5) when N is the number of coords.
function scoreDistanceViaThreeTurnpoints(config) {
    const n = config.distanceMatrix.n;
    const distanceBetween = config.distanceMatrix.distanceBetween.bind(config.distanceMatrix);
    let bestDistance = -Infinity;
    let bestCoordIndexes = [];
    for (let a = 0; a < n - 4; ++a) {
        for (let b = a + 1; b < n - 3; ++b) {
            const distanceAB = distanceBetween(a, b);
            for (let c = b + 1; c < n - 2; ++c) {
                const distanceBC = distanceBetween(b, c);
                for (let d = c + 1; d < n - 1; ++d) {
                    const distanceCD = distanceBetween(c, d);
                    for (let e = d + 1; e < n; ++e) {
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
// scoreTriangles returns an IntermediateScore for the highest-scoring triangle
// flight according to triangleTypeFunc. It uses a brute force algorithm with a
// running time of O(N^5) when N is the number of coords.
function scoreTriangles(config) {
    const n = config.distanceMatrix.n;
    const distanceBetween = config.distanceMatrix.distanceBetween.bind(config.distanceMatrix);
    const triangleTypeFunc = config.triangleTypeFunc;
    let bestIntermediateScore = null;
    for (let a = 0; a < n - 3; ++a) {
        for (let b = a; b < n - 2; ++b) {
            const distanceAB = distanceBetween(a, b);
            for (let c = b + 1; c < n - 1; ++c) {
                const distanceBC = distanceBetween(b, c);
                for (let d = c + 1; d < n; ++d) {
                    const distanceCD = distanceBetween(c, d);
                    for (let e = d; e < n; ++e) {
                        const distanceDE = distanceBetween(d, e);
                        const distanceBD = distanceBetween(b, d);
                        const isFAI = Math.min(distanceBC, distanceCD, distanceBD) >= 0.28 * (distanceBC + distanceCD + distanceBD);
                        const totalDistanceFlown = distanceAB + distanceBC + distanceCD + distanceDE;
                        const closingDistance = distanceBetween(a, e);
                        const triangleType = triangleTypeFunc({
                            isFAI,
                            totalDistanceFlown,
                            closingDistance,
                        });
                        if (!triangleType) {
                            continue;
                        }
                        if (bestIntermediateScore && totalDistanceFlown * triangleType.multiplier <= getScore(bestIntermediateScore)) {
                            continue;
                        }
                        bestIntermediateScore = {
                            flightType: triangleType.flightType,
                            distance: totalDistanceFlown,
                            multiplier: triangleType.multiplier,
                            coordIndexes: [a, b, c, d, e],
                        };
                    }
                }
            }
        }
    }
    return bestIntermediateScore;
}
// bestScore returns the best score from intermediateScores, applying
// roundScoreFunc and looking up coord indexes in coords.
function bestScore(config) {
    let bestIntermediateScore = null;
    for (const intermediateScore of config.intermediateScores) {
        if (!intermediateScore) {
            continue;
        }
        if (!bestIntermediateScore || getScore(intermediateScore) > getScore(bestIntermediateScore)) {
            bestIntermediateScore = intermediateScore;
        }
    }
    if (!bestIntermediateScore) {
        return null;
    }
    return {
        flightType: bestIntermediateScore.flightType,
        distance: bestIntermediateScore.distance,
        multiplier: bestIntermediateScore.multiplier,
        score: config.roundScoreFunc(getScore(bestIntermediateScore)),
        coords: bestIntermediateScore.coordIndexes.map(i => config.coords[i]),
    };
}
// cartesianDistance returns the Cartesian distance between coord1 and coord2
// using the Pythagorean theorem.
exports.cartesianDistance = (coord1, coord2) => {
    const deltaX = coord1[0] - coord2[0];
    const deltaY = coord1[1] - coord2[1];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};
// roundCrossCountryCupScore rounds score according to the SHV's Cross Country
// Cup rules.
const roundCrossCountryCupScore = (score) => {
    return Math.round(10000 * score) / 10000;
};
// scoreCrossCountryCup scores coords using distanceFunc and the SHV's Cross
// Country Cup 2020 rules. See: https://www.xcontest.org/switzerland/en/rules/.
// https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/ReglementSportif_D_CCC_2020.pdf
// https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/Sportreglement_D_CCC_2020.pdf
function scoreCrossCountryCup(config) {
    const { coords, distanceKMFunc } = config;
    if (coords.length < 2) {
        return {
            flightType: "none" /* None */,
            distance: 0,
            multiplier: 0,
            score: 0,
            coords: [],
        };
    }
    if (coords.length === 2) {
        const distance = distanceKMFunc(coords[0], coords[1]);
        return {
            distance,
            flightType: "straightDistance" /* StraightDistance */,
            multiplier: 1.2,
            score: roundCrossCountryCupScore(distance * 1.2),
            coords: [coords[0], coords[1]],
        };
    }
    const paddedCoords = padCoords(coords, 5);
    const distanceMatrix = new DistanceMatrix({
        coords: paddedCoords,
        distanceFunc: distanceKMFunc,
    });
    const intermediateScores = [
        scoreStraightDistance({
            distanceMatrix,
        }),
        scoreDistanceViaThreeTurnpoints({
            distanceMatrix,
            flightType: "freeDistance" /* FreeDistance */,
        }),
        scoreTriangles({
            distanceMatrix,
            triangleTypeFunc(triangleConfig) {
                const { isFAI, totalDistanceFlown, closingDistance } = triangleConfig;
                const isTriangle = closingDistance <= 0.2 * totalDistanceFlown;
                if (!isTriangle) {
                    return null;
                }
                if (isFAI) {
                    return {
                        flightType: "faiTriangle" /* FAITriangle */,
                        multiplier: 1.3,
                    };
                }
                return {
                    flightType: "flatTriangle" /* FlatTriangle */,
                    multiplier: 1.2,
                };
            },
        }),
    ];
    return bestScore({
        intermediateScores,
        coords: paddedCoords,
        roundScoreFunc: roundCrossCountryCupScore,
    });
}
exports.scoreCrossCountryCup = scoreCrossCountryCup;
// roundXContestScore rounds score according to the 2020 World XContest rules.
const roundXContestScore = (score) => {
    return Math.round(100 * score) / 100;
};
// scoreWorldXContest scores coords using distanceFunc and the 2020 World
// XContest rules. See: https://www.xcontest.org/world/en/rules/.
function scoreWorldXContest(config) {
    const { coords, distanceKMFunc } = config;
    if (coords.length < 2) {
        return {
            flightType: "none" /* None */,
            distance: 0,
            multiplier: 0,
            score: 0,
            coords: [],
        };
    }
    if (coords.length === 2) {
        const distance = distanceKMFunc(coords[0], coords[1]);
        return {
            distance,
            flightType: "openDistance" /* OpenDistance */,
            multiplier: 1,
            score: roundXContestScore(distance),
            coords: [coords[0], coords[1]],
        };
    }
    const paddedCoords = padCoords(coords, 5);
    const distanceMatrix = new DistanceMatrix({
        coords: paddedCoords,
        distanceFunc: distanceKMFunc,
    });
    const intermediateScores = [
        scoreDistanceViaThreeTurnpoints({
            distanceMatrix,
            flightType: "openDistance" /* OpenDistance */,
        }),
        scoreTriangles({
            distanceMatrix,
            triangleTypeFunc(triangleConfig) {
                const { isFAI, totalDistanceFlown, closingDistance } = triangleConfig;
                const isTriangle = closingDistance <= 0.2 * totalDistanceFlown;
                if (!isTriangle) {
                    return null;
                }
                const isClosed = closingDistance <= 0.05 * totalDistanceFlown;
                if (isClosed && isFAI) {
                    return {
                        flightType: "closedFAITriangle" /* ClosedFAITriangle */,
                        multiplier: 1.6,
                    };
                }
                if (isClosed) {
                    return {
                        flightType: "closedFlatTriangle" /* ClosedFlatTriangle */,
                        multiplier: 1.4,
                    };
                }
                if (isFAI) {
                    return {
                        flightType: "faiTriangle" /* FAITriangle */,
                        multiplier: 1.4,
                    };
                }
                return {
                    flightType: "flatTriangle" /* FlatTriangle */,
                    multiplier: 1.2,
                };
            },
        }),
    ];
    return bestScore({
        intermediateScores,
        coords: paddedCoords,
        roundScoreFunc: roundXContestScore,
    });
}
exports.scoreWorldXContest = scoreWorldXContest;
//# sourceMappingURL=index.js.map