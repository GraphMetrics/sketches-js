/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * Copyright 2020 Datadog, Inc. for original work
 * Copyright 2021 GraphMetrics for modifications
 */

import { IndexMapping, LogarithmicMapping } from '../src/ddsketch/mapping';
import { MAX_INT_16, MIN_INT_16 } from '../src/ddsketch/mapping/helpers';

describe('Mapping', () => {
    const relativeAccuracyMultiplier = 1 - Math.sqrt(2) * 1e-1;
    const minRelativeAccuracy = 1e-8;
    const INITIAL_RELATIVE_ACCURACY = 1 - 1e-3;

    const calculateRelativeError = (
        expectedMin: number,
        expectedMax: number,
        actual: number
    ): number => {
        if (expectedMin < 0 || expectedMax < 0 || actual < 0) {
            throw Error;
        }

        if (expectedMin <= actual && actual <= expectedMax) {
            return 0;
        }

        if (expectedMin === 0 && expectedMax === 0) {
            if (actual === 0) {
                return 0;
            }
            return Infinity;
        }

        if (actual < expectedMin) {
            return (expectedMin - actual) / expectedMin;
        }

        return (actual - expectedMax) / expectedMax;
    };

    const evaluateValueRelativeAccuracy = (mapping: IndexMapping) => {
        const valueMultiplier = 2 - Math.sqrt(2) * 1e-1;
        let maxRelativeAccuracy = 0;
        let value = mapping.minIndexableValue;

        while (value < mapping.maxIndexableValue / valueMultiplier) {
            value *= valueMultiplier;
            const mapValue = mapping.value(mapping.index(value));
            const relativeError = calculateRelativeError(
                value,
                value,
                mapValue
            );
            if (relativeError >= mapping.relativeAccuracy) {
                console.error(
                    `\nValue: ${value}\nMapping relativeAccuracy: ${
                        mapping.relativeAccuracy
                    }\nMapping value: ${mapValue}\nRelative error: ${relativeError}\nMapping maxPoss: ${
                        mapping.maxIndexableValue
                    }\nMapping minPoss: ${
                        mapping.minIndexableValue
                    }\nMapping key: ${mapping.index(value)}`
                );
            }
            expect(relativeError).toBeLessThan(mapping.relativeAccuracy);
            maxRelativeAccuracy = Math.max(maxRelativeAccuracy, relativeError);
        }
        maxRelativeAccuracy = Math.max(
            maxRelativeAccuracy,
            calculateRelativeError(
                mapping.maxIndexableValue,
                mapping.maxIndexableValue,
                mapping.value(mapping.index(mapping.maxIndexableValue))
            )
        );
        return maxRelativeAccuracy;
    };

    describe('LogarithmicMapping', () => {
        it('is accurate', () => {
            let relativeAccuracy = INITIAL_RELATIVE_ACCURACY;

            while (relativeAccuracy >= minRelativeAccuracy) {
                const mapping = new LogarithmicMapping(relativeAccuracy);
                const maxRelativeAccuracy = evaluateValueRelativeAccuracy(
                    mapping
                );
                expect(maxRelativeAccuracy).toBeLessThan(
                    mapping.relativeAccuracy
                );
                relativeAccuracy *= relativeAccuracyMultiplier;
            }
        });

        it('is within bounds', () => {
            const mapping = new LogarithmicMapping(0.01);

            const minIndex = mapping.index(mapping.minIndexableValue);
            const maxIndex = mapping.index(mapping.maxIndexableValue);

            expect(minIndex).toBeGreaterThan(MIN_INT_16);
            expect(maxIndex).toBeLessThan(MAX_INT_16);
        });
    });
});
