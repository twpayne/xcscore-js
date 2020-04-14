var Benchmark = require('benchmark');
var xcscore = require('../dist/index');

function cartesianDist(coord1, coord2){
    var deltaX = coord1[0]-coord2[0];
    var deltaY = coord1[1]-coord2[1];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

var suite = new Benchmark.Suite;

suite.add('scoreWorldXContest, 13 coords', function() {
	const score = xcscore.scoreWorldXContest({
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
	if (score.flightType != "closedFAITri" || score.score != 51.2) {
		throw new Error("Bad result");
	}
}).add('scoreCHCrossCountryCup, 13 coords', function() {
	const score = xcscore.scoreCHCrossCountryCup({
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
	if (score.flightType != "faiTri" || score.score != 41.6) {
		throw new Error("Bad result");
	}
}).add('scoreCHCrossCountryCup, 25 coords', function() {
	const n = 25;
	let coords = [];
	for (let x = 0; x < n; ++x) {
		coords.push([x, 0]);
	}
	const score = xcscore.scoreCHCrossCountryCup({
		coords,
		distKMFunc: cartesianDist,
	});
	if (score.flightType != "straightDist" || score.dist != n - 1) {
		console.log(score)
		throw new Error("Bad result");
	}
}).add('scoreCHCrossCountryCup, 50 coords', function() {
	const n = 50;
	let coords = [];
	for (let x = 0; x < n; ++x) {
		coords.push([x, 0]);
	}
	const score = xcscore.scoreCHCrossCountryCup({
		coords,
		distKMFunc: cartesianDist,
	});
	if (score.flightType != "straightDist" || score.dist != n - 1) {
		console.log(score)
		throw new Error("Bad result");
	}
}).on('cycle', function(event) {
   console.log(String(event.target));
}).run({ 'async': true });

