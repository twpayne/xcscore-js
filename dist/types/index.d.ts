declare const enum FlightType {
    None = "none",
    ClosedFAITriangle = "closedFAITriangle",
    ClosedFlatTriangle = "closedFlatTriangle",
    FAITriangle = "faiTriangle",
    FlatTriangle = "flatTriangle",
    FreeDistance = "freeDistance",
    OpenDistance = "openDistance",
    StraightDistance = "straightDistance"
}
declare type Coord = any;
declare type DistanceFunc = (coord1: Coord, coord2: Coord) => number;
interface ScoreComponents {
    distance: number;
    multiplier: number;
}
interface FinalScore extends ScoreComponents {
    flightType: FlightType;
    score: number;
    coords: ReadonlyArray<Coord>;
}
export declare class DistanceMatrix {
    readonly n: number;
    readonly distances: ReadonlyArray<number>;
    constructor(config: {
        coords: ReadonlyArray<Coord>;
        distanceFunc: DistanceFunc;
    });
    distanceBetween(i: number, j: number): number;
}
export declare let cartesianDistance: DistanceFunc;
export declare function scoreCrossCountryCup(config: {
    coords: ReadonlyArray<Coord>;
    distanceKMFunc: DistanceFunc;
}): FinalScore | null;
export declare function scoreWorldXContest(config: {
    coords: ReadonlyArray<Coord>;
    distanceKMFunc: DistanceFunc;
}): FinalScore | null;
export {};
//# sourceMappingURL=index.d.ts.map