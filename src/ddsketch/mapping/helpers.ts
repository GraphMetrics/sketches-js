/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2021 GraphMetrics
 */

export const MIN_INT_16 = -32767;
export const MAX_INT_16 = 32767;
export const MIN_SAFE_FLOAT = Math.pow(2, -1023);
export const MAX_SAFE_FLOAT = Number.MAX_VALUE;
export const EXP_OVERFLOW = Math.log(MAX_SAFE_FLOAT);
export const withinTolerance = (
    x: number,
    y: number,
    tolerance: number
): boolean => {
    if (x == 0 || y == 0) {
        return Math.abs(x) <= tolerance && Math.abs(y) <= tolerance;
    } else {
        return (
            Math.abs(x - y) <= tolerance * Math.max(Math.abs(x), Math.abs(y))
        );
    }
};
