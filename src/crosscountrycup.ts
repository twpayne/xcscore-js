// See:
//
// https://www.xcontest.org/switzerland/en/rules/
// https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/ReglementSportif_D_CCC_2020.pdf
// https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/Sportreglement_D_CCC_2020.pdf

// roundCrossCountryCupScore rounds score according to the SHV's Cross Country
// Cup rules.
const roundCrossCountryCupScore: RoundScoreFunc = (score: number): number => {
    return Math.round(10000*score)/10000;
}

// scoreCrossCountryCup scores coords using distanceFunc and the SHV's Cross
// Country Cup 2020 rules.
export function scoreCrossCountryCup(config: {
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
            flightType: FlightType.FreeDistance,
            distance,
            multiplier: 1.2,
            score: roundCrossCountryCupScore(distance * 1.2),
            coords: [coords[0], coords[1]],
        };
    }

    const paddedCoords = padCoords(coords, 5);
    const distanceMatrix = new DistanceMatrix(paddedCoords, distanceFunc);
    const intermediateScores = [
        scoreStraightDistance({
            distanceMatrix,
        }),
        scoreDistanceViaThreeTurnpoints({
            flightType: FlightType.FreeDistance,
            distanceMatrix,
        }),
        scoreTriangles({
            distanceMatrix,
            triangleTypeFunc(totalDistance: number, shortestLegDistance: number, closingLegDistance: number): TriangleType {
                if (closingLegDistance < 0.2 * totalDistance) {
                    if (shortestLegDistance >= 0.28 * totalDistance) {
                        return {
                            flightType: FlightType.FAITriangle,
                            multiplier: 1.3,
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
        roundScoreFunc: roundCrossCountryCupScore,
    });
}