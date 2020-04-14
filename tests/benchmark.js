var Benchmark = require('benchmark');
var xcscore = require('../dist/index');

function cartesianDist(coord1, coord2){
    var deltaX = coord1[0]-coord2[0];
    var deltaY = coord1[1]-coord2[1];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

var suite = new Benchmark.Suite;

suite.add('13 points, XContest', function() {
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
		throw new Error("Bad result")
	}
}).add('13 points, CCC', function() {
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
		throw new Error("Bad result")
	}
}).on('cycle', function(event) {
   console.log(String(event.target));
}).run({ 'async': true });

