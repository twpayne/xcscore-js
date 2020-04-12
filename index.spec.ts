import {
    cartesianDistance,
    DistanceMatrix,
    scoreCrossCountryCup,
} from ".";

describe("cartesianDistance", () => {
    test.each([
        [[0, 0], [3, 4], 5],
        [[10, 20], [13, 24], 5],
    ])("cartesianDistance(%p, %p)", (coord1, coord2, expected) => {
        expect(cartesianDistance(coord1, coord2)).toBe(expected);
    });
});

describe("DistanceMatrix", () => {
    describe("simple", () => {
        const distanceMatrix = new DistanceMatrix({
            coords: [
                [0, 0],
                [0, 1],
                [0, 2],
            ],
            distanceFunc: cartesianDistance,
        });
        test("n", () => {
            expect(distanceMatrix.n).toBe(3);
        })
        test.each([
            [0, 0, 0],
            [0, 1, 1],
            [0, 2, 2],
            [1, 1, 0],
            [1, 2, 1],
            [2, 2, 0],
        ])("distanceBetween(%i, %i)", (i, j, expected) => {
            expect(distanceMatrix.distanceBetween(i, j)).toBe(expected);
        })
    })

    describe("triangle", () => {
        const distanceMatrix = new DistanceMatrix({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
            ],
            distanceFunc: cartesianDistance,
        });
        test("n", () => {
            expect(distanceMatrix.n).toBe(3);
        })
        test.each([
            [0, 0, 0],
            [0, 1, 5],
            [0, 2, 6],
            [1, 1, 0],
            [1, 2, 5],
            [2, 2, 0],
        ])("distanceBetween(%i, %i)", (i, j, expected) => {
            expect(distanceMatrix.distanceBetween(i, j)).toBe(expected);
        })
    })
})

describe("scoreCrossCountryCup", () => {
    test("no coords, none", () => {
        const score = scoreCrossCountryCup({
            coords: [],
            distanceFunc: cartesianDistance,
        });
        expect(score).toStrictEqual({
            flightType: "none",
            distance: 0,
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
            distanceFunc: cartesianDistance,
        });
        expect(score).toStrictEqual({
            flightType: "none",
            distance: 0,
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
            distanceFunc: cartesianDistance,
        });
        expect(score).toStrictEqual({
            flightType: "straightDistance",
            distance: 1,
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
            distanceFunc: cartesianDistance,
        });
        expect(score).toStrictEqual({
            flightType: "straightDistance",
            distance: 2,
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
            distanceFunc: cartesianDistance,
        });
        expect(score).toStrictEqual({
            flightType: "flatTriangle",
            distance: 5,
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
            distanceFunc: cartesianDistance,
        });
        expect(score).toStrictEqual({
            flightType: "straightDistance",
            distance: 3,
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
            distanceFunc: cartesianDistance,
        });
        expect(score).toStrictEqual({
            flightType: "freeDistance",
            distance: 15,
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
            distanceFunc: cartesianDistance,
        });
        expect(score).toStrictEqual({
            flightType: "flatTriangle",
            distance: 5,
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
            distanceFunc: cartesianDistance,
        });
        expect(score).toStrictEqual({
            flightType: "freeDistance",
            distance: 6,
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
            distanceFunc: cartesianDistance,
        });
        expect(score).toStrictEqual({
            flightType: "faiTriangle",
            distance: 15,
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

    test("four coords, free distance (FAI triangle)", () => {
        const score = scoreCrossCountryCup({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [3, 0]
            ],
            distanceFunc: cartesianDistance,
        });
        expect(score).toStrictEqual({
            flightType: "freeDistance",
            distance: 13,
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
})