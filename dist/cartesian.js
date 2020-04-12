"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// cartesianDistance returns the Cartesian distance between coord1 and coord2
// using the Pythagorean theorem.
exports.cartesianDistance = (coord1, coord2) => {
    const deltaX = coord1[0] - coord2[0];
    const deltaY = coord1[1] - coord2[1];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};
//# sourceMappingURL=cartesian.js.map