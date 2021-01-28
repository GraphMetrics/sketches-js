import {
    CubicallyInterpolatedMapping,
    LinearlyInterpolatedMapping,
    LogarithmicMapping
} from '../src/ddsketch/mapping';
import { MAX_INT_16, MIN_INT_16 } from '../src/ddsketch/mapping/KeyMapping';

it('is within bounds', () => {
    const mapping = new CubicallyInterpolatedMapping(0.01);

    const minIndex = mapping.key(mapping.minPossible);
    const maxIndex = mapping.key(mapping.maxPossible);

    console.log(minIndex);
    console.log(maxIndex);

    expect(minIndex).toBeGreaterThan(MIN_INT_16);
    expect(maxIndex).toBeLessThan(MAX_INT_16);
});
