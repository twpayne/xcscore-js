// See: https://www.xcontest.org/world/en/rules/

// roundXContestScore rounds score according to the 2020 World XContest rules.
const roundXContestScore: RoundScoreFunc = (score: number): number => {
    return Math.round(100*score)/100
}

// scoreWorldXContest scores coords using distanceFunc and the 2020 World
// XContest rules.
export function scoreWorldXContest(config: {
    coords: ReadonlyArray<Coord>,
    distanceFunc: DistanceFunc,
}): FinalScore | null {
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
            flightType: FlightType.OpenDistance,
            distance,
            multiplier: 1,
            score: roundXContestScore(distance),
            coords: [coords[0], coords[1]],
        }
    }

    const paddedCoords = padCoords(coords, 5);
    const distanceMatrix = new DistanceMatrix(paddedCoords, distanceFunc);
    const intermediateScores = [
        scoreDistanceViaThreeTurnpoints({
            flightType: FlightType.OpenDistance,
            distanceMatrix,
        }),
        scoreTriangles({
            distanceMatrix,
            triangleTypeFunc(totalDistance: number, shortestLegDistance: number, closingLegDistance: number): TriangleType {
                const isFAITriangle = shortestLegDistance >= 0.28 * totalDistance;
                if (closingLegDistance < 0.05 * totalDistance) {
                    if (isFAITriangle) {
                        return {
                            flightType: FlightType.ClosedFAITriangle,
                            multiplier: 1.6,
                        };
                    } else {
                        return {
                            flightType: FlightType.ClosedFlatTriangle,
                            multiplier: 1.4,
                        };
                    }
                } else if (closingLegDistance < 0.2 * totalDistance) {
                    if (isFAITriangle) {
                        return {
                            flightType: FlightType.FAITriangle,
                            multiplier: 1.4,
                        };
                    } else {
                        return {
                            flightType: FlightType.FlatTriangle,
                            multiplier: 1.2,
                        };
                    }
                } else {
                    return null;
                }
            },
        }),
    ];

    return bestScore({
        coords: paddedCoords,
        intermediateScores,
        roundScoreFunc: roundXContestScore,
    })
}