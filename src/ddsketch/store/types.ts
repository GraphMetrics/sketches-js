/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

export interface Store<S> {
    /** Update the counter at the specified index key, growing the number of bins if necessary */
    add: (key: number) => void;
    /** Directly clone the contents of the parameter `store` into this store */
    copy: (store: S) => void;
    /** Merge the contents of the parameter `store` into this store */
    merge: (store: S) => void;
    /** Return the length of the underlying storage (`bins`) */
    length: () => number;
    /** Return the key for the value at the given rank */
    keyAtRank: (rank: number, reverse?: boolean) => void;
    /** The total number of values added to the store */
    count: number;
}
