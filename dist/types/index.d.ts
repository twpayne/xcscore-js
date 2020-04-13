declare const enum FlightType {
    None = "none",
    ClosedFAITri = "closedFAITri",
    ClosedFlatTri = "closedFlatTri",
    FAITri = "faiTri",
    FlatTri = "flatTri",
    FreeDist = "freeDist",
    OpenDist = "openDist",
    StraightDist = "straightDist"
}
declare type Coord = any;
declare type DistFunc = (coord1: Coord, coord2: Coord) => number;
interface ScoreComponents {
    dist: number;
    multiplier: number;
}
interface FinalScore extends ScoreComponents {
    flightType: FlightType;
    score: number;
    coords: ReadonlyArray<Coord>;
}
export declare class DistMatrix {
    readonly n: number;
    readonly dists: ReadonlyArray<number>;
    constructor(config: {
        coords: ReadonlyArray<Coord>;
        distFunc: DistFunc;
    });
    dist(i: number, j: number): number;
}
export declare let cartesianDist: DistFunc;
export declare function scoreCrossCountryCup(config: {
    coords: ReadonlyArray<Coord>;
    distKMFunc: DistFunc;
}): FinalScore | null;
export declare function scoreWorldXContest(config: {
    coords: ReadonlyArray<Coord>;
    distKMFunc: DistFunc;
}): FinalScore | null;
export {};
//# sourceMappingURL=index.d.ts.map