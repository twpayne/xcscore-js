"use strict";
// A FlightType is a type of flight.
var FlightType;
(function (FlightType) {
    FlightType["None"] = "none";
    FlightType["ClosedFAITriangle"] = "closedFAITriangle";
    FlightType["ClosedFlatTriangle"] = "closedFlatTriangle";
    FlightType["FAITriangle"] = "faiTriangle";
    FlightType["FlatTriangle"] = "flatTriangle";
    FlightType["FreeDistance"] = "freeDistance";
    FlightType["OpenDistance"] = "openDistance";
    FlightType["StraightDistance"] = "straightDistance";
})(FlightType || (FlightType = {}));
;
// score is a convenience function that returns scoreComponents's score.
function score(scoreComponents) {
    return scoreComponents.distance * scoreComponents.multiplier;
}
// A DistanceMatrix is a symmetric matrix storing distances between Coords.
class DistanceMatrix {
    constructor(coords, distanceFunc) {
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
        return this.distances[i + j * (j - 1) / 2];
    }
}
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
    const distanceBetween = config.distanceMatrix.distanceBetween;
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
        flightType: FlightType.StraightDistance,
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
    const distanceBetween = config.distanceMatrix.distanceBetween;
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
    const distanceBetween = config.distanceMatrix.distanceBetween;
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
                        const totalDistance = distanceAB + distanceBC + distanceCD + distanceDE;
                        const shortestLegDistance = Math.min(distanceBC, distanceCD, distanceBetween(b, d));
                        const closingDistance = distanceBetween(a, e);
                        const triangleType = triangleTypeFunc(totalDistance, shortestLegDistance, closingDistance);
                        if (!triangleType) {
                            continue;
                        }
                        if (bestIntermediateScore && totalDistance * triangleType.multiplier <= score(bestIntermediateScore)) {
                            continue;
                        }
                        bestIntermediateScore = {
                            flightType: triangleType.flightType,
                            distance: totalDistance,
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
        if (!bestIntermediateScore || score(intermediateScore) > score(bestIntermediateScore)) {
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
        score: config.roundScoreFunc(score(bestIntermediateScore)),
        coords: bestIntermediateScore.coordIndexes.map(i => config.coords[i]),
    };
}
//# sourceMappingURL=index.js.map