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
var DistanceMatrix = /** @class */ (function () {
    function DistanceMatrix(coords, distanceFunc) {
        this.n = coords.length;
        var distances = new Array(this.n * (this.n - 1) / 2);
        var k = 0;
        for (var j = 1; j < this.n; ++j) {
            for (var i = 0; i < j; ++i) {
                distances[k++] = distanceFunc(coords[i], coords[j]);
            }
        }
        this.distances = distances;
    }
    DistanceMatrix.prototype.distanceBetween = function (i, j) {
        return this.distances[i + j * (j - 1) / 2];
    };
    return DistanceMatrix;
}());
// padCoords ensures that coords contains at least n elements by repeating the
// last element as many times as necessary.
function padCoords(coords, n) {
    if (coords.length >= n) {
        return coords;
    }
    var paddedCoords = [];
    for (var _i = 0, coords_1 = coords; _i < coords_1.length; _i++) {
        var coord = coords_1[_i];
        paddedCoords.push(coord);
    }
    var lastCoord = coords[coords.length - 1];
    for (var i = coords.length; i < n; ++i) {
        paddedCoords.push(lastCoord);
    }
    return paddedCoords;
}
// scoreStraightDistance returns an IntermediateScore for the highest-scoring
// distance between any two coords. It uses a brute force algorithm with a
// running time of O(N^2) when N is the number of coords.
function scoreStraightDistance(config) {
    var n = config.distanceMatrix.n;
    var distanceBetween = config.distanceMatrix.distanceBetween;
    var bestDistance = -Infinity;
    var bestCoordIndexes = [];
    for (var a = 0; a < n - 1; ++a) {
        for (var b = a + 1; b < n; ++b) {
            var distance = distanceBetween(a, b);
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
    var n = config.distanceMatrix.n;
    var distanceBetween = config.distanceMatrix.distanceBetween;
    var bestDistance = -Infinity;
    var bestCoordIndexes = [];
    for (var a = 0; a < n - 4; ++a) {
        for (var b = a + 1; b < n - 3; ++b) {
            var distanceAB = distanceBetween(a, b);
            for (var c = b + 1; c < n - 2; ++c) {
                var distanceBC = distanceBetween(b, c);
                for (var d = c + 1; d < n - 1; ++d) {
                    var distanceCD = distanceBetween(c, d);
                    for (var e = d + 1; e < n; ++e) {
                        var distanceDE = distanceBetween(d, e);
                        var totalDistance = distanceAB + distanceBC + distanceCD + distanceDE;
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
    var n = config.distanceMatrix.n;
    var distanceBetween = config.distanceMatrix.distanceBetween;
    var triangleTypeFunc = config.triangleTypeFunc;
    var bestIntermediateScore = null;
    for (var a = 0; a < n - 3; ++a) {
        for (var b = a; b < n - 2; ++b) {
            var distanceAB = distanceBetween(a, b);
            for (var c = b + 1; c < n - 1; ++c) {
                var distanceBC = distanceBetween(b, c);
                for (var d = c + 1; d < n; ++d) {
                    var distanceCD = distanceBetween(c, d);
                    for (var e = d; e < n; ++e) {
                        var distanceDE = distanceBetween(d, e);
                        var totalDistance = distanceAB + distanceBC + distanceCD + distanceDE;
                        var shortestLegDistance = Math.min(distanceBC, distanceCD, distanceBetween(b, d));
                        var closingDistance = distanceBetween(a, e);
                        var triangleType = triangleTypeFunc(totalDistance, shortestLegDistance, closingDistance);
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
    var bestIntermediateScore = null;
    for (var _i = 0, _a = config.intermediateScores; _i < _a.length; _i++) {
        var intermediateScore = _a[_i];
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
        coords: bestIntermediateScore.coordIndexes.map(function (i) { return config.coords[i]; }),
    };
}
//# sourceMappingURL=index.js.map