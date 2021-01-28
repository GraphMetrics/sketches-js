/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

declare module 'math-float64-ldexp' {
    function ldexp(mantissa: number, exponent: number): number;

    export = ldexp;
}
