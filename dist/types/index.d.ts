/**
 * A type of flight.
 */
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
/**
 * A coordinate.
 */
declare type Coord = any;
/**
 * Return the distance between two coords.
 */
declare type DistFunc = (coord1: Coord, coord2: Coord) => number;
/**
 * A scored flight. Note that the score is not necessariliy equal to the product
 * of the distance and the multiplier due to rounding.
 */
interface FinalScore {
    /** Flight type. */
    flightType: FlightType;
    /** Distance. */
    dist: number;
    /** Multipler. */
    multiplier: number;
    /** Rounded score. */
    score: number;
    /** Coords. */
    coords: ReadonlyArray<Coord>;
}
/**
 * Score coords using the SHV's Cross Country Cup 2020 rules. See:
 * https://www.xcontest.org/switzerland/en/rules/.
 * https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/ReglementSportif_D_CCC_2020.pdf
 * https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sport/Reglemente/2020/Sportreglement_D_CCC_2020.pdf
 *
 * @param config.coords Coords.
 * @param config.distKMFunc Function to return distance between two coords in
 * kilometers.
 */
export declare function scoreCHCrossCountryCup(config: {
    coords: ReadonlyArray<Coord>;
    distKMFunc: DistFunc;
}): FinalScore | null;
/**
 * Score coords using the 2020 World XContest rules. See:
 * https://www.xcontest.org/world/en/rules/.
 *
 * @param config.coords Coords.
 * @param config.distKMFunc Function to return distance between two coords in
 * kilometers.
 */
export declare function scoreWorldXContest(config: {
    coords: ReadonlyArray<Coord>;
    distKMFunc: DistFunc;
}): FinalScore | null;
export {};
//# sourceMappingURL=index.d.ts.map