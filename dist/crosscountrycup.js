"use strict";
// See:
//
// https://www.xcontest.org/switzerland/en/rules/
// https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/ReglementSportif_D_CCC_2020.pdf
// https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/Sportreglement_D_CCC_2020.pdf
Object.defineProperty(exports, "__esModule", { value: true });
// roundCrossCountryCupScore rounds score according to the SHV's Cross Country
// Cup rules.
var roundCrossCountryCupScore = function (score) {
    return Math.round(10000 * score) / 10000;
};
// scoreCrossCountryCup scores coords using distanceFunc and the SHV's Cross
// Country Cup 2020 rules.
function scoreCrossCountryCup(config) {
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
            flightType: FlightType.FreeDistance,
            multiplier: 1.2,
            score: roundCrossCountryCupScore(distance * 1.2),
            coords: [coords[0], coords[1]],
        };
    }
    var paddedCoords = padCoords(coords, 5);
    var distanceMatrix = new DistanceMatrix(paddedCoords, distanceFunc);
    var intermediateScores = [
        scoreStraightDistance({
            distanceMatrix: distanceMatrix,
        }),
        scoreDistanceViaThreeTurnpoints({
            distanceMatrix: distanceMatrix,
            flightType: FlightType.FreeDistance,
        }),
        scoreTriangles({
            distanceMatrix: distanceMatrix,
            triangleTypeFunc: function (totalDistance, shortestLegDistance, closingLegDistance) {
                var isTriangle = closingLegDistance <= 0.2 * totalDistance;
                if (!isTriangle) {
                    return null;
                }
                var isFAI = shortestLegDistance >= 0.28 * totalDistance;
                if (isFAI) {
                    return {
                        flightType: FlightType.FAITriangle,
                        multiplier: 1.3,
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
        roundScoreFunc: roundCrossCountryCupScore,
    });
}
exports.scoreCrossCountryCup = scoreCrossCountryCup;
//# sourceMappingURL=crosscountrycup.js.map