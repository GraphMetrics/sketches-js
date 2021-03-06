/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

import { DenseStore } from './DenseStore';
import { sumOfRange } from './util';

/**
 * `CollapsingLowestDenseStore` is a dense store that keeps all the bins between
 * the bin for the `minKey` and the `maxKey`, but collapsing the left-most bins
 * if the number of bins exceeds `binLimit`
 */
export class CollapsingLowestDenseStore extends DenseStore {
    /** The maximum number of bins */
    binLimit: number;
    /** Whether the store has been collapsed to make room for additional keys */
    isCollapsed: boolean;

    /**
     * Initialize a new CollapsingLowestDenseStore
     *
     * @param binLimit The maximum number of bins
     * @param chunkSize The number of bins to add each time the bins grow (default 128)
     */
    constructor(binLimit: number, chunkSize?: number) {
        super(chunkSize);
        this.binLimit = binLimit;
        this.isCollapsed = false;
    }

    /**
     * Merge the contents of the parameter `store` into this store
     *
     * @param store The store to merge into the caller store
     */
    merge(store: CollapsingLowestDenseStore): void {
        if (store.count === 0) {
            return;
        }

        if (this.count === 0) {
            this.copy(store);
            return;
        }

        if (store.minKey < this.minKey || store.maxKey > this.maxKey) {
            this._extendRange(store.minKey, store.maxKey);
        }

        const collapseStartIndex = store.minKey - store.offset;
        let collapseEndIndex =
            Math.min(this.minKey, store.maxKey + 1) - store.offset;
        if (collapseEndIndex > collapseStartIndex) {
            const collapseCount = sumOfRange(
                store.bins,
                collapseStartIndex,
                collapseEndIndex
            );
            this.bins[0] += collapseCount;
        } else {
            collapseEndIndex = collapseStartIndex;
        }

        for (
            let key = collapseEndIndex + store.offset;
            key < store.maxKey + 1;
            key++
        ) {
            this.bins[key - this.offset] += store.bins[key - store.offset];
        }

        this.count += store.count;
    }

    /**
     * Directly clone the contents of the parameter `store` into this store
     *
     * @param store The store to be copied into the caller store
     */
    copy(store: CollapsingLowestDenseStore): void {
        super.copy(store);
        this.isCollapsed = store.isCollapsed;
    }

    _getNewLength(newMinKey: number, newMaxKey: number): number {
        const desiredLength = newMaxKey - newMinKey + 1;
        return Math.min(
            this.chunkSize * Math.ceil(desiredLength / this.chunkSize),
            this.binLimit
        );
    }

    /**
     * Adjust the `bins`, the `offset`, the `minKey`, and the `maxKey`
     * without resizing the bins, in order to try to make it fit the specified range.
     * Collapse to the left if necessary
     */
    _adjust(newMinKey: number, newMaxKey: number): void {
        if (newMaxKey - newMinKey + 1 > this.length()) {
            // The range of keys is too wide, the lowest bins need to be collapsed
            newMinKey = newMaxKey - this.length() + 1;

            if (newMinKey >= this.maxKey) {
                // Put everything in the first bin
                this.offset = newMinKey;
                this.minKey = newMinKey;
                this.bins.fill(0);
                this.bins[0] = this.count;
            } else {
                const shift = this.offset - newMinKey;
                if (shift < 0) {
                    const collapseStartIndex = this.minKey - this.offset;
                    const collapseEndIndex = newMinKey - this.offset;
                    const collapsedCount = sumOfRange(
                        this.bins,
                        collapseStartIndex,
                        collapseEndIndex
                    );
                    this.bins.fill(0, collapseStartIndex, collapseEndIndex);
                    this.bins[collapseEndIndex] += collapsedCount;
                    this.minKey = newMinKey;
                    this._shiftBins(shift);
                } else {
                    this.minKey = newMinKey;
                    // Shift the buckets to make room for newMinKey
                    this._shiftBins(shift);
                }
            }

            this.maxKey = newMaxKey;
            this.isCollapsed = true;
        } else {
            this._centerBins(newMinKey, newMaxKey);
            this.minKey = newMinKey;
            this.maxKey = newMaxKey;
        }
    }

    /** Calculate the bin index for the key, extending the range if necessary */
    _getIndex(key: number): number {
        if (key < this.minKey) {
            if (this.isCollapsed) {
                return 0;
            }

            this._extendRange(key);

            if (this.isCollapsed) {
                return 0;
            }
        } else if (key > this.maxKey) {
            this._extendRange(key);
        }

        return key - this.offset;
    }
}
