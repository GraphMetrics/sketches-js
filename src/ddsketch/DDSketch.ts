/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

import { Bin, DenseStore } from './store';
import { IndexMapping, LogarithmicMapping } from './mapping';

const DEFAULT_RELATIVE_ACCURACY = 0.01;

interface BaseSketchConfig {
    /** The mapping between values and indicies for the sketch */
    mapping: IndexMapping;
    /** Storage for values */
    store: DenseStore;
}

/** Base class for DDSketch*/
class BaseDDSketch {
    /** The mapping between values and indicies for the sketch */
    mapping: IndexMapping;
    /** Storage for values */
    store: DenseStore;
    /** The minimum value seen by the sketch */
    min: number;
    /** The maximum value seen by the sketch */
    max: number;
    /** The total number of values seen by the sketch */
    count: number;
    /** The sum of the values seen by the sketch */
    sum: number;

    constructor({ mapping, store }: BaseSketchConfig) {
        this.mapping = mapping;
        this.store = store;

        this.count = this.store.count;
        this.min = Infinity;
        this.max = -Infinity;
        this.sum = 0;
    }

    /**
     * Add a value to the sketch
     *
     * @param value The value to be added
     * @param weight The amount to weight the value (default 1.0)
     *
     * @throws Error if `weight` is 0 or negative
     */
    accept(value: number, weight = 1): void {
        if (
            value < this.mapping.minIndexableValue ||
            value > this.mapping.maxIndexableValue
        ) {
            throw new Error(
                'Input value is outside the range that is tracked by the sketch'
            );
        }

        if (weight <= 0) {
            throw new Error('Weight must be a positive number');
        }

        const key = this.mapping.index(value);
        this.store.add(key, weight);

        /* Keep track of summary stats */
        this.count += weight;
        this.sum += value * weight;
        if (value < this.min) {
            this.min = value;
        }
        if (value > this.max) {
            this.max = value;
        }
    }

    /**
     * Retrieve a value from the sketch at the quantile
     *
     * @param quantile A number between `0` and `1` (inclusive)
     */
    getValueAtQuantile(quantile: number): number {
        if (quantile < 0 || quantile > 1 || this.count === 0) {
            return NaN;
        }

        const rank = quantile * (this.count - 1);
        const key = this.store.keyAtRank(rank);
        const quantileValue = this.mapping.value(key);

        return quantileValue;
    }

    /**
     * Merge the contents of the parameter `sketch` into this sketch
     *
     * @param sketch The sketch to merge into the caller sketch
     * @throws Error if the sketches were initialized with different `relativeAccuracy` values
     */
    merge(sketch: DDSketch): void {
        if (!this.mergeable(sketch)) {
            throw new Error(
                'Cannot merge two DDSketches with different `relativeAccuracy` parameters'
            );
        }

        if (sketch.count === 0) {
            return;
        }

        if (this.count === 0) {
            this._copy(sketch);
            return;
        }

        this.store.merge(sketch.store);

        /* Merge summary stats */
        this.count += sketch.count;
        this.sum += sketch.sum;
        if (sketch.min < this.min) {
            this.min = sketch.min;
        }
        if (sketch.max > this.max) {
            this.max = sketch.max;
        }
    }

    /**
     * Determine whether two sketches can be merged
     *
     * @param sketch The sketch to be merged into the caller sketch
     */
    mergeable(sketch: DDSketch): boolean {
        return this.mapping.equals(sketch.mapping);
    }

    /*
     * Return an iterator on the bins
     */
    bins(): IterableIterator<Bin> {
        return this.store.iterate();
    }

    /**
     * Helper method to copy the contents of the parameter `store` into this store
     * @see DDSketch.merge to merge two sketches safely
     *
     * @param store The store to be copied into the caller store
     */
    _copy(sketch: DDSketch): void {
        this.store.copy(sketch.store);
        this.min = sketch.min;
        this.max = sketch.max;
        this.count = sketch.count;
        this.sum = sketch.sum;
    }
}

interface SketchConfig {
    /** The accuracy guarantee of the sketch, between 0-1 (default 0.01) */
    relativeAccuracy?: number;
}

const defaultConfig: Required<SketchConfig> = {
    relativeAccuracy: DEFAULT_RELATIVE_ACCURACY
};

/** A quantile sketch with relative-error guarantees */
export class DDSketch extends BaseDDSketch {
    /**
     * Initialize a new DDSketch
     *
     * @param relativeAccuracy The accuracy guarantee of the sketch (default 0.01)
     */
    constructor(
        {
            relativeAccuracy = DEFAULT_RELATIVE_ACCURACY
        } = defaultConfig as SketchConfig
    ) {
        const mapping = new LogarithmicMapping(relativeAccuracy);
        const store = new DenseStore();

        super({ mapping, store });
    }
}
