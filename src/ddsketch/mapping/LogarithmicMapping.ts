/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

import {
    EXP_OVERFLOW,
    MAX_INT_16,
    MIN_INT_16,
    MIN_SAFE_FLOAT,
    withinTolerance
} from './helpers';
import { IndexMapping } from './types';

/**
 * A memory-optimal KeyMapping, i.e., given a targeted relative accuracy, it
 * requires the least number of keys to cover a given range of values. This is
 * done by logarithmically mapping floating-point values to integers.
 */
export class LogarithmicMapping implements IndexMapping {
    public readonly relativeAccuracy: number;
    public readonly minIndexableValue: number;
    public readonly maxIndexableValue: number;
    private readonly multiplier: number;

    constructor(relativeAccuracy: number) {
        this.relativeAccuracy = relativeAccuracy;
        this.multiplier =
            1 / Math.log1p((2 * relativeAccuracy) / (1 - relativeAccuracy));
        this.minIndexableValue = Math.max(
            Math.exp(MIN_INT_16 / this.multiplier + 1),
            (MIN_SAFE_FLOAT * (1 + relativeAccuracy)) / (1 - relativeAccuracy)
        );
        this.maxIndexableValue = Math.min(
            Math.exp(MAX_INT_16 / this.multiplier - 1),
            Math.exp(EXP_OVERFLOW) / (1 + relativeAccuracy)
        );
    }

    public index(value: number): number {
        const index = Math.log(value) * this.multiplier;
        if (index >= 0) {
            return ~~index;
        } else {
            return ~~index - 1; // faster than Math.Floor
        }
    }

    public value(index: number): number {
        return Math.exp(index / this.multiplier) * (1 + this.relativeAccuracy);
    }

    public equals(other: IndexMapping): boolean {
        if (!(other instanceof LogarithmicMapping)) {
            return false;
        }
        return withinTolerance(this.multiplier, other.multiplier, 1e-12);
    }
}
