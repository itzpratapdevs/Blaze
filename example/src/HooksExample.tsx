import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Note: In actual usage, these would be imported from '../src'
// Using relative paths here since blaze-engine won't be installed in the example

/**
 * Example game using hooks and functional components.
 *
 * This demonstrates the component-based architecture of Blaze.
 */
export function HooksExample() {
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [score, setScore] = useState(0);

    const start = useCallback(() => {
        setIsRunning(true);
        setIsPaused(false);
        setScore(0);
    }, []);

    const stop = useCallback(() => {
        setIsRunning(false);
        setIsPaused(false);
    }, []);

    const pause = useCallback(() => {
        setIsPaused(true);
    }, []);

    const resume = useCallback(() => {
        setIsPaused(false);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.gameArea}>
                <Text style={styles.title}>Blaze Hooks Example</Text>
                <Text style={styles.score}>Score: {score}</Text>
                <Text style={styles.status}>
                    {!isRunning ? 'Stopped' : isPaused ? 'Paused' : 'Running'}
                </Text>
            </View>

            <View style={styles.controls}>
                {!isRunning ? (
                    <Button title="Start" onPress={start} />
                ) : (
                    <>
                        {isPaused ? (
                            <Button title="Resume" onPress={resume} />
                        ) : (
                            <Button title="Pause" onPress={pause} />
                        )}
                        <Button title="Stop" onPress={stop} />
                    </>
                )}
            </View>
        </View>
    );
}

/**
 * Simple button component.
 */
function Button({ title, onPress }: { title: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        color: '#00d9ff',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    score: {
        fontSize: 24,
        color: '#ffffff',
        marginBottom: 10,
    },
    status: {
        fontSize: 18,
        color: '#888888',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 20,
        gap: 10,
    },
    button: {
        backgroundColor: '#00d9ff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
