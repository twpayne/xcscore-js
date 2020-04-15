import Benchmark = require('benchmark');
import {
    FlightType,
    scoreCHCrossCountryCup,
    scoreWorldXContest,
} from "../src/index";
import {
	CartesianCoord,
	cartesianDist,
} from './cartesian';

const suite = new Benchmark.Suite();
suite.add('scoreWorldXContest, 13 coords', () => {
	const score = scoreWorldXContest({
		coords: [
			[6, 0],
			[3, 0],
			[0, 0],
			[1.5, 2],
			[3, 4],
			[4.5, 6],
			[6, 8],
			[7.5, 6],
			[9, 4],
			[10.5, 2],
			[12, 0],
			[9, 0],
			[6, 0],
		],
		distKMFunc: cartesianDist,
	});
	if (score.flightType !== FlightType.ClosedFAITri || score.score !== 51.2) {
		throw new Error("Bad result");
	}
}).add('scoreCHCrossCountryCup, 13 coords', () => {
	const score = scoreCHCrossCountryCup({
		coords: [
			[6, 0],
			[3, 0],
			[0, 0],
			[1.5, 2],
			[3, 4],
			[4.5, 6],
			[6, 8],
			[7.5, 6],
			[9, 4],
			[10.5, 2],
			[12, 0],
			[9, 0],
			[6, 0],
		],
		distKMFunc: cartesianDist,
	});
	if (score.flightType !== FlightType.FAITri || score.score !== 41.6) {
		throw new Error("Bad result");
	}
}).add('scoreCHCrossCountryCup, 25 coords', () => {
	const n = 25;
	const coords: CartesianCoord[] = [];
	for (let x = 0; x < n; ++x) {
		coords.push([x, 0]);
	}
	const score = scoreCHCrossCountryCup({
		coords,
		distKMFunc: cartesianDist,
	});
	if (score.flightType !== FlightType.StraightDist || score.dist !== n - 1) {
		throw new Error("Bad result");
	}
}).add('scoreCHCrossCountryCup, 50 coords', () => {
	const n = 50;
	const coords: CartesianCoord[] = [];
	for (let x = 0; x < n; ++x) {
		coords.push([x, 0]);
	}
	const score = scoreCHCrossCountryCup({
		coords,
		distKMFunc: cartesianDist,
	});
	if (score.flightType !== FlightType.StraightDist || score.dist !== n - 1) {
		throw new Error("Bad result");
	}
}).on('cycle', (event: any) => {
	// tslint:disable-next-line:no-console
	console.log(String(event.target));
}).run({
	async: true,
});

