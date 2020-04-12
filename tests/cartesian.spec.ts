import { cartesianDistance } from '../';

describe('cartesianDistance', () => {
    test('works in simple cases', () => {
        expect(cartesianDistance([0, 0], [3, 4])).toBe(5);
    });
});