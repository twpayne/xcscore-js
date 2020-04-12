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
            distance: distance,
            flightType: FlightType.OpenDistance,
            multiplier: 1,
            score: roundXContestScore(distance),
            coords: [coords[0], coords[1]],
        };
    }
    var paddedCoords = padCoords(coords, 5);
    var distanceMatrix = new DistanceMatrix(paddedCoords, distanceFunc);
    var intermediateScores = [
        scoreDistanceViaThreeTurnpoints({
            distanceMatrix: distanceMatrix,
            flightType: FlightType.OpenDistance,
        }),
        scoreTriangles({
            distanceMatrix: distanceMatrix,
            triangleTypeFunc: function (totalDistance, shortestLegDistance, closingLegDistance) {
                var isTriangle = closingLegDistance <= 0.2 * totalDistance;
                if (!isTriangle) {
                    return null;
                }
                var isClosed = closingLegDistance <= 0.05 * totalDistance;
                var isFAI = shortestLegDistance >= 0.28 * totalDistance;
                if (isClosed && isFAI) {
                    return {
                        flightType: FlightType.ClosedFAITriangle,
                        multiplier: 1.6,
                    };
                }
                if (isClosed) {
                    return {
                        flightType: FlightType.ClosedFlatTriangle,
                        multiplier: 1.4,
                    };
                }
                if (isFAI) {
                    return {
                        flightType: FlightType.FAITriangle,
                        multiplier: 1.4,
                    };
                }
                return {
                    flightType: FlightType.FlatTriangle,
                    multiplier: 1.2,
                };
            },
        }),
    ];
    return bestScore({
        intermediateScores: intermediateScores,
        coords: paddedCoords,
        roundScoreFunc: roundXContestScore,
    });
}
exports.scoreWorldXContest = scoreWorldXContest;
//# sourceMappingURL=xcontest.js.map