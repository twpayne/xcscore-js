"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
function cartesianDist(coord1, coord2) {
    const deltaX = coord1[0] - coord2[0];
    const deltaY = coord1[1] - coord2[1];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}
describe("scoreCHCrossCountryCup", () => {
    test("no coords, none", () => {
        const score = _1.scoreCHCrossCountryCup({
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
    });
    test("one coord, none", () => {
        const score = _1.scoreCHCrossCountryCup({
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
    });
    test("two coords, straight distance", () => {
        const score = _1.scoreCHCrossCountryCup({
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
    });
    test("three coords, straight distance", () => {
        const score = _1.scoreCHCrossCountryCup({
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
    });
    test("three coords, flat triangle", () => {
        const score = _1.scoreCHCrossCountryCup({
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
                [1, 0],
            ],
        });
    });
    test("four coords, straight distance", () => {
        const score = _1.scoreCHCrossCountryCup({
            coords: [
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3],
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
    });
    test("four coords, free distance", () => {
        const score = _1.scoreCHCrossCountryCup({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [9, 4],
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
                [9, 4],
            ],
        });
    });
    test("four coords, flat triangle", () => {
        const score = _1.scoreCHCrossCountryCup({
            coords: [
                [1, 0],
                [0, 0],
                [3, 0],
                [2, 0],
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
                [2, 0],
            ],
        });
    });
    test("four coords, free distance (almost flat triangle)", () => {
        const score = _1.scoreCHCrossCountryCup({
            coords: [
                [1, 0],
                [0, 0],
                [4, 0],
                [3, 0],
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
                [3, 0],
            ],
        });
    });
    test("four coords, FAI triangle", () => {
        const score = _1.scoreCHCrossCountryCup({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [1, 0],
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
                [1, 0],
            ],
        });
    });
    test("four coords, free distance (almost FAI triangle)", () => {
        const score = _1.scoreCHCrossCountryCup({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [3, 0],
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
                [3, 0],
            ],
        });
    });
    test("five coords, straight distance", () => {
        const score = _1.scoreCHCrossCountryCup({
            coords: [
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
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
                [4, 0],
            ],
        });
    });
    test("five coords, free distance", () => {
        const score = _1.scoreCHCrossCountryCup({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [9, 4],
                [12, 0],
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
                [12, 0],
            ],
        });
    });
    test("five coords, flat triangle", () => {
        const score = _1.scoreCHCrossCountryCup({
            coords: [
                [3, 0],
                [0, 0],
                [4, 3],
                [8, 0],
                [5, 0],
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
                [5, 0],
            ],
        });
    });
    test("five coords, FAI triangle", () => {
        const score = _1.scoreCHCrossCountryCup({
            coords: [
                [2, 0],
                [0, 0],
                [3, 4],
                [6, 0],
                [4, 0],
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
                [4, 0],
            ],
        });
    });
});
describe("scoreWorldXContest", () => {
    test("no coords, none", () => {
        const score = _1.scoreWorldXContest({
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
    });
    test("one coord, none", () => {
        const score = _1.scoreWorldXContest({
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
    });
    test("two coords, open distance", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [0, 0],
                [0, 1],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "openDist",
            dist: 1,
            multiplier: 1,
            score: 1,
            coords: [
                [0, 0],
                [0, 1],
            ],
        });
    });
    test("three coords, open distance", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [0, 0],
                [0, 1],
                [0, 2],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "openDist",
            dist: 2,
            multiplier: 1,
            score: 2,
            coords: [
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 2],
                [0, 2],
            ],
        });
    });
    test("three coords, flat triangle", () => {
        const score = _1.scoreWorldXContest({
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
                [1, 0],
            ],
        });
    });
    test("three coords, closed flat triangle", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [0, 0],
                [3, 0],
                [0, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "closedFlatTri",
            dist: 6,
            multiplier: 1.4,
            score: 8.4,
            coords: [
                [0, 0],
                [0, 0],
                [3, 0],
                [0, 0],
                [0, 0],
            ],
        });
    });
    test("four coords, open distance", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "openDist",
            dist: 3,
            multiplier: 1,
            score: 3,
            coords: [
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3],
                [0, 3],
            ],
        });
    });
    test("four coords, open distance", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [9, 4],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "openDist",
            dist: 15,
            multiplier: 1,
            score: 15,
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [9, 4],
                [9, 4],
            ],
        });
    });
    test("four coords, flat triangle", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [1, 0],
                [0, 0],
                [3, 0],
                [2, 0],
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
                [2, 0],
            ],
        });
    });
    test("four coords, closed flat triangle", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [1, 0],
                [0, 0],
                [3, 0],
                [1, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "closedFlatTri",
            dist: 6,
            multiplier: 1.4,
            score: 8.4,
            coords: [
                [1, 0],
                [1, 0],
                [0, 0],
                [3, 0],
                [1, 0],
            ],
        });
    });
    test("four coords, open distance (almost flat triangle)", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [1, 0],
                [0, 0],
                [4, 0],
                [3, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "openDist",
            dist: 6,
            multiplier: 1,
            score: 6,
            coords: [
                [1, 0],
                [0, 0],
                [4, 0],
                [3, 0],
                [3, 0],
            ],
        });
    });
    test("four coords, FAI triangle", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [1, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "faiTri",
            dist: 15,
            multiplier: 1.4,
            score: 21,
            coords: [
                [0, 0],
                [0, 0],
                [3, 4],
                [6, 0],
                [1, 0],
            ],
        });
    });
    test("four coords, closed FAI triangle", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [0, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "closedFAITri",
            dist: 16,
            multiplier: 1.6,
            score: 25.6,
            coords: [
                [0, 0],
                [0, 0],
                [3, 4],
                [6, 0],
                [0, 0],
            ],
        });
    });
    test("four coords, open distance (almost FAI triangle)", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [3, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "openDist",
            dist: 13,
            multiplier: 1,
            score: 13,
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [3, 0],
                [3, 0],
            ],
        });
    });
    test("five coords, open distance", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "openDist",
            dist: 4,
            multiplier: 1,
            score: 4,
            coords: [
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
            ],
        });
    });
    test("five coords, open distance", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [9, 4],
                [12, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "openDist",
            dist: 20,
            multiplier: 1,
            score: 20,
            coords: [
                [0, 0],
                [3, 4],
                [6, 0],
                [9, 4],
                [12, 0],
            ],
        });
    });
    test("five coords, flat triangle", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [3, 0],
                [0, 0],
                [4, 3],
                [8, 0],
                [5, 0],
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
                [5, 0],
            ],
        });
    });
    test("five coords, closed flat triangle", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [4, 0],
                [0, 0],
                [4, 3],
                [8, 0],
                [4, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "closedFlatTri",
            dist: 18,
            multiplier: 1.4,
            score: 25.2,
            coords: [
                [4, 0],
                [0, 0],
                [4, 3],
                [8, 0],
                [4, 0],
            ],
        });
    });
    test("five coords, FAI triangle", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [2, 0],
                [0, 0],
                [3, 4],
                [6, 0],
                [4, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "faiTri",
            dist: 14,
            multiplier: 1.4,
            score: 19.6,
            coords: [
                [2, 0],
                [0, 0],
                [3, 4],
                [6, 0],
                [4, 0],
            ],
        });
    });
    test("five coords, closed FAI triangle", () => {
        const score = _1.scoreWorldXContest({
            coords: [
                [3, 0],
                [0, 0],
                [3, 4],
                [6, 0],
                [3, 0],
            ],
            distKMFunc: cartesianDist,
        });
        expect(score).toStrictEqual({
            flightType: "closedFAITri",
            dist: 16,
            multiplier: 1.6,
            score: 25.6,
            coords: [
                [3, 0],
                [0, 0],
                [3, 4],
                [6, 0],
                [3, 0],
            ],
        });
    });
});
//# sourceMappingURL=index.spec.js.map