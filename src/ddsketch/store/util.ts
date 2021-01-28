/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

/**
 * Return the sum of the values from range `start` to `end` in `array`
 */
export const sumOfRange = (
    array: number[],
    start: number,
    end: number
): number => {
    let sum = 0;

    for (let i = start; i <= end; i++) {
        sum += array[i];
    }

    return sum;
};
