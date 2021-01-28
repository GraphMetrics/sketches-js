/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

import { KeyMapping } from './KeyMapping';

/**
 * A memory-optimal KeyMapping, i.e., given a targeted relative accuracy, it
 * requires the least number of keys to cover a given range of values. This is
 * done by logarithmically mapping floating-point values to integers.
 */
export class LogarithmicMapping extends KeyMapping {
    constructor(relativeAccuracy: number, offset = 0) {
        super(relativeAccuracy, offset);
        this._multiplier *= Math.log(2);
    }

    _logGamma(value: number): number {
        return Math.log2(value) * this._multiplier;
    }

    _powGamma(value: number): number {
        return Math.pow(2, value / this._multiplier);
    }
}
