"use strict";
// See: https://www.xcontest.org/world/en/rules/
Object.defineProperty(exports, "__esModule", { value: true });
// roundXContestScore rounds score according to the 2020 World XContest rules.
var roundXContestScore = function (score) {
    return Math.round(100 * score) / 100;
};
// scoreWorldXContest scores coords using distanceFunc and the 2020 World
// XContest rules.
function scoreWorldXContest(config) {
    var coords = config.coords;
    var distanceFunc = config.distanceFunc;
    if (coords.length < 2) {
        return {
            flightType: FlightType.None,
            distance: 0,
            multiplier: 0,
            score: 0,
            coords: [],
        };
    }
    if (coords.length === 2) {
        var distance = distanceFunc(coords[0], coords[1]);
        return {
            flightType: FlightType.OpenDistance,
            distance: distance,
            multiplier: 1,
            score: roundXContestScore(distance),
            coords: [coords[0], coords[1]],
        };
    }
    var paddedCoords = padCoords(coords, 5);
    var distanceMatrix = new DistanceMatrix(paddedCoords, distanceFunc);
    var intermediateScores = [
        scoreDistanceViaThreeTurnpoints({
            flightType: FlightType.OpenDistance,
            distanceMatrix: distanceMatrix,
        }),
        scoreTriangles({
            distanceMatrix: distanceMatrix,
            triangleTypeFunc: function (totalDistance, shortestLegDistance, closingLegDistance) {
                var isFAITriangle = shortestLegDistance >= 0.28 * totalDistance;
                if (closingLegDistance < 0.05 * totalDistance) {
                    if (isFAITriangle) {
                        return {
                            flightType: FlightType.ClosedFAITriangle,
                            multiplier: 1.6,
                        };
                    }
                    else {
                        return {
                            flightType: FlightType.ClosedFlatTriangle,
                            multiplier: 1.4,
                        };
                    }
                }
                else if (closingLegDistance < 0.2 * totalDistance) {
                    if (isFAITriangle) {
                        return {
                            flightType: FlightType.FAITriangle,
                            multiplier: 1.4,
                        };
                    }
                    else {
                        return {
                            flightType: FlightType.FlatTriangle,
                            multiplier: 1.2,
                        };
                    }
                }
                else {
                    return null;
                }
            },
        }),
    ];
    return bestScore({
        coords: paddedCoords,
        intermediateScores: intermediateScores,
        roundScoreFunc: roundXContestScore,
    });
}
exports.scoreWorldXContest = scoreWorldXContest;
//# sourceMappingURL=xcontest.js.map