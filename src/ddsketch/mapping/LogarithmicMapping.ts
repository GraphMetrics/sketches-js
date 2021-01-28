/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

import { KeyMapping, MIN_INT_16, MAX_INT_16 } from './KeyMapping';

/**
 * A memory-optimal KeyMapping, i.e., given a targeted relative accuracy, it
 * requires the least number of keys to cover a given range of values. This is
 * done by logarithmically mapping floating-point values to integers.
 */
export class LogarithmicMapping extends KeyMapping {
    constructor(relativeAccuracy: number, offset = 0) {
        super(relativeAccuracy, offset);
        this._multiplier *= Math.log(2);
        this.minPossible = Math.max(
            Math.pow(2, (MIN_INT_16 - this._offset) / this._multiplier + 1),
            this.minPossible
        );
        this.maxPossible = Math.min(
            Math.pow(2, (MAX_INT_16 - this._offset) / this._multiplier - 1),
            this.maxPossible
        );
    }

    _logGamma(value: number): number {
        return Math.log2(value) * this._multiplier;
    }

    _powGamma(value: number): number {
        return Math.pow(2, value / this._multiplier);
    }
}
