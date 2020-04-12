"use strict";
// See: https://www.xcontest.org/world/en/rules/
Object.defineProperty(exports, "__esModule", { value: true });
// roundXContestScore rounds score according to the 2020 World XContest rules.
const roundXContestScore = (score) => {
    return Math.round(100 * score) / 100;
};
// scoreWorldXContest scores coords using distanceFunc and the 2020 World
// XContest rules.
function scoreWorldXContest(config) {
    const coords = config.coords;
    const distanceFunc = config.distanceFunc;
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
        const distance = distanceFunc(coords[0], coords[1]);
        return {
            distance,
            flightType: FlightType.OpenDistance,
            multiplier: 1,
            score: roundXContestScore(distance),
            coords: [coords[0], coords[1]],
        };
    }
    const paddedCoords = padCoords(coords, 5);
    const distanceMatrix = new DistanceMatrix(paddedCoords, distanceFunc);
    const intermediateScores = [
        scoreDistanceViaThreeTurnpoints({
            distanceMatrix,
            flightType: FlightType.OpenDistance,
        }),
        scoreTriangles({
            distanceMatrix,
            triangleTypeFunc(totalDistance, shortestLegDistance, closingLegDistance) {
                const isTriangle = closingLegDistance <= 0.2 * totalDistance;
                if (!isTriangle) {
                    return null;
                }
                const isClosed = closingLegDistance <= 0.05 * totalDistance;
                const isFAI = shortestLegDistance >= 0.28 * totalDistance;
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
        intermediateScores,
        coords: paddedCoords,
        roundScoreFunc: roundXContestScore,
    });
}
exports.scoreWorldXContest = scoreWorldXContest;
//# sourceMappingURL=xcontest.js.map