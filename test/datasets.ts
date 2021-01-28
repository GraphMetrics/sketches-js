/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

export function generateIncreasing(size: number): number[] {
    const data = new Array<number>(size);
    for (let i = 0; i < size; i++) {
        data[i] = i + 1;
    }

    return data;
}

export function generateDecreasing(size: number): number[] {
    const data = generateIncreasing(size);
    return data.reverse();
}

export function generateConstant(size: number): number[] {
    const data = new Array<number>(size).fill(42);

    return data;
}

export function generateRandomIntegers(
    size: number,
    { scale } = { scale: 1e6 }
): number[] {
    const data = new Array<number>(size);
    for (let i = 0; i < size; i++) {
        data[i] = Math.floor(Math.random() * scale);
    }

    return data;
}

/** Test helper that keeps track of the count of each unique value added to it */
export class Counter {
    entries: { [key: string]: number };

    constructor(values: number[]) {
        this.entries = {};
        this.addAll(values);
    }

    /** Add a single `value` */
    add(value: number): void {
        this.entries[value] = (this.entries[value] || 0) + 1;
    }

    /** Add an array of `values` */
    addAll(values: number[]): void {
        values.forEach(value => this.add(value));
    }

    /** The number of times each `value` was added to the Counter */
    values(): number[] {
        return Object.values(this.entries);
    }

    /** The number of times `value` was added to the Counter */
    get(value: number): number {
        return this.entries[value] || 0;
    }
}
