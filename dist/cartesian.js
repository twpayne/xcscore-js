"use strict";
// cartesianDistance returns the Cartesian distance between coord1 and coord2
// using the Pythagorean theorem.
var cartesianDistance = function (coord1, coord2) {
    var deltaX = coord1[0] - coord2[0];
    var deltaY = coord1[1] - coord2[1];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};
//# sourceMappingURL=cartesian.js.map