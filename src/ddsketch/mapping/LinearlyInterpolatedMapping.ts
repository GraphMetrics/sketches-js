/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

import { KeyMapping, MAX_INT_16, MIN_INT_16 } from './KeyMapping';
import frexp from 'math-float64-frexp';
import ldexp from 'math-float64-ldexp';

/**
 * A fast KeyMapping that approximates the memory-optimal one
 * (LogarithmicMapping) by extracting the floor value of the logarithm to the
 * base 2 from the binary representations of floating-point values and
 * linearly interpolating the logarithm in-between.
 */
export class LinearlyInterpolatedMapping extends KeyMapping {
    constructor(relativeAccuracy: number, offset = 0) {
        super(relativeAccuracy, offset);
        this.minPossible = Math.max(
            Math.pow(
                2,
                (MIN_INT_16 - this._offset) / this._multiplier -
                    this._log2Approx(1) +
                    1
            ),
            this.minPossible
        );
        this.maxPossible = Math.min(
            Math.pow(
                2,
                (MAX_INT_16 - this._offset) / this._multiplier -
                    this._log2Approx(1) -
                    1
            ),
            this.maxPossible
        );
    }

    /**
     * Approximates log2 by s + f
     * where v = (s+1) * 2 ** f  for s in [0, 1)
     *
     * frexp(v) returns m and e s.t.
     * v = m * 2 ** e ; (m in [0.5, 1) or 0.0)
     * so we adjust m and e accordingly
     */
    _log2Approx(value: number): number {
        const [mantissa, exponent] = frexp(value);
        const significand = 2 * mantissa - 1;
        return significand + (exponent - 1);
    }

    /** Inverse of _log2Approx */
    _exp2Approx(value: number): number {
        const exponent = Math.floor(value) + 1;
        const mantissa = (value - exponent + 2) / 2;
        return ldexp(mantissa, exponent);
    }

    _logGamma(value: number): number {
        return Math.log2(value) * this._multiplier;
    }

    _powGamma(value: number): number {
        return Math.pow(2, value / this._multiplier);
    }
}
