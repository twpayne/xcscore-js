import {
    cartesianDist,
    DistMatrix,
    scoreCrossCountryCup,
} from ".";

describe("cartesianDist", () => {
    test.each([
        [[0, 0], [3, 4], 5],
        [[10, 20], [13, 24], 5],
    ])("cartesianDist(%p, %p)", (coord1, coord2, expected) => {
        expect(cartesianDist(coord1, coord2)).toBe(expected);
    });
});

describe("DistMatrix", () => {
    describe("simple", () => {
        const distMatrix = new DistMatrix({
            coords: [
                [0, 0],
                [0, 1],
                [0, 2],
            ],
            distFunc: cartesianDist,
        });
        test("n", () => {
            expect(distMatrix.n).toBe(3);
        })
        test.each([
            [0, 0, 0],
            [0, 1, 1],
            [0, 2, 2],
            [1, 1, 0],
            [1, 2, 1],
            [2, 2, 0],
        ])("dist(%i, %i)", (i, j, expected) => {
            expect(distMatrix.dist(i, j)).toBe(expected);
        })
    })

    describe("triangle", () => {
        const distMatrix = new DistMatrix({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
            ],
            distFunc: cartesianDist,
        });
        test("n", () => {
            expect(distMatrix.n).toBe(3);
        })
        test.each([
            [0, 0, 0],
            [0, 1, 5],
            [0, 2, 6],
            [1, 1, 0],
            [1, 2, 5],
            [2, 2, 0],
        ])("dist(%i, %i)", (i, j, expected) => {
            expect(distMatrix.dist(i, j)).toBe(expected);
        })
    })
})

describe("scoreCrossCountryCup", () => {
    test("no coords, none", () => {
        const score = scoreCrossCountryCup({
            coords: [],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "none",
            dist: 0,
            multiplier: 0,
            score: 0,
            coords: [],
        });
    })

    test("one coord, none", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [0, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "none",
            dist: 0,
            multiplier: 0,
            score: 0,
            coords: [],
        });
    })

    test("two coords, straight distance", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [0, 0],
                [0, 1],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "straightDist",
            dist: 1,
            multiplier: 1.2,
            score: 1.2,
            coords: [
                [0, 0],
                [0, 1],
            ],
        });
    })

    test("three coords, straight distance", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [0, 0],
                [0, 1],
                [0, 2],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "straightDist",
            dist: 2,
            multiplier: 1.2,
            score: 2.4,
            coords: [
                [0, 0],
                [0, 2],
            ],
        });
    })

    test("three coords, flat triangle", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [0, 0],
                [3, 0],
                [1, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "flatTri",
            dist: 5,
            multiplier: 1.2,
            score: 6,
            coords: [
                [0, 0],
                [0, 0],
                [3, 0],
                [1, 0],
                [1, 0]
            ],
        });
    })

    test("four coords, straight distance", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3,]
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "straightDist",
            dist: 3,
            multiplier: 1.2,
            score: 3.6,
            coords: [
                [0, 0],
                [0, 3],
            ],
        });
    })

    test("four coords, free distance", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [9, 4]
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "freeDist",
            dist: 15,
            multiplier: 1,
            score: 15,
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [9, 4],
                [9, 4]
            ],
        });
    })

    test("four coords, flat triangle", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [1, 0],
                [0, 0],
                [3, 0],
                [2, 0]
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "flatTri",
            dist: 5,
            multiplier: 1.2,
            score: 6,
            coords: [
                [1, 0],
                [1, 0],
                [0, 0],
                [3, 0],
                [2, 0]
            ],
        });
    })

    test("four coords, free distance (almost flat triangle)", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [1, 0],
                [0, 0],
                [4, 0],
                [3, 0]
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "freeDist",
            dist: 6,
            multiplier: 1,
            score: 6,
            coords: [
                [1, 0],
                [0, 0],
                [4, 0],
                [3, 0],
                [3, 0]
            ],
        });
    })

    test("four coords, FAI triangle", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [1, 0]
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "faiTri",
            dist: 15,
            multiplier: 1.3,
            score: 19.5,
            coords: [
                [0, 0],
                [0, 0],
                [3, 4],
                [6, 0],
                [1, 0]
            ],
        });
    })

    test("four coords, free distance (almost FAI triangle)", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [3, 0]
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "freeDist",
            dist: 13,
            multiplier: 1,
            score: 13,
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [3, 0],
                [3, 0]
            ],
        });
    })

    test("five coords, straight distance", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0]
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "straightDist",
            dist: 4,
            multiplier: 1.2,
            score: 4.8,
            coords: [
                [0, 0],
                [4, 0]
            ],
        });
    })

    test("five coords, free distance", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [9, 4],
                [12, 0]
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "freeDist",
            dist: 20,
            multiplier: 1,
            score: 20,
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [9, 4],
                [12, 0]
            ],
        });
    })

    test("five coords, flat triangle", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [3, 0],
                [0, 0],
                [4, 3],
                [8, 0],
                [5, 0]
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "flatTri",
            dist: 16,
            multiplier: 1.2,
            score: 19.2,
            coords: [
                [3, 0],
                [0, 0],
                [4, 3],
                [8, 0],
                [5, 0]
            ],
        });
    })

    test("five coords, FAI triangle", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [2, 0],
                [0, 0],
                [3, 4],
                [6, 0],
                [4, 0]
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "faiTri",
            dist: 14,
            multiplier: 1.3,
            score: 18.2,
            coords: [
                [2, 0],
                [0, 0],
                [3, 4],
                [6, 0],
                [4, 0]
            ],
        });
    })
})
