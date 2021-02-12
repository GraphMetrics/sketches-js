/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

export interface IndexMapping {
    readonly relativeAccuracy: number;
    /** The smallest possible value the sketch can distinguish from 0 */
    readonly minIndexableValue: number;
    /** The largest possible value the sketch can handle */
    readonly maxIndexableValue: number;
    /** Retrieve the index specifying the bucket for a `value` */
    index: (value: number) => number;
    /** Retrieve the value represented by the bucket at `key` */
    value: (key: number) => number;
    /** Compare two mappings */
    equals: (other: IndexMapping) => boolean;
}
