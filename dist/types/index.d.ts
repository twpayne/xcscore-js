declare enum FlightType {
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
declare function score(scoreComponents: ScoreComponents): number;
interface IntermediateScore extends ScoreComponents {
    flightType: FlightType;
    coordIndexes: ReadonlyArray<number>;
}
declare type RoundScoreFunc = (score: number) => number;
interface FinalScore extends ScoreComponents {
    flightType: FlightType;
    score: number;
    coords: ReadonlyArray<Coord>;
}
declare class DistanceMatrix {
    readonly n: number;
    private readonly distances;
    constructor(coords: ReadonlyArray<Coord>, distanceFunc: DistanceFunc);
    distanceBetween(i: number, j: number): number;
}
declare function padCoords(coords: ReadonlyArray<Coord>, n: number): ReadonlyArray<Coord>;
declare function scoreStraightDistance(config: {
    distanceMatrix: DistanceMatrix;
}): IntermediateScore;
declare function scoreDistanceViaThreeTurnpoints(config: {
    flightType: FlightType;
    distanceMatrix: DistanceMatrix;
}): IntermediateScore;
declare type TriangleType = {
    flightType: FlightType;
    multiplier: number;
} | null;
declare type TriangleTypeFunc = (totalDistance: number, shortestLegDistance: number, closingDistance: number) => TriangleType;
declare function scoreTriangles(config: {
    distanceMatrix: DistanceMatrix;
    triangleTypeFunc: TriangleTypeFunc;
}): IntermediateScore | null;
declare function bestScore(config: {
    intermediateScores: ReadonlyArray<IntermediateScore | null>;
    roundScoreFunc: RoundScoreFunc;
    coords: ReadonlyArray<Coord>;
}): FinalScore | null;
//# sourceMappingURL=index.d.ts.map