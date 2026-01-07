import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Game, BlazeCanvas } from 'blaze-engine';
import { MainScene } from './scenes/MainScene';

export const GameScreen: React.FC = () => {
    const gameRef = useRef<Game | null>(null);

    useEffect(() => {
        // Create game instance
        const game = new Game({
            width: 360,
            height: 640,
            backgroundColor: '#1a1a2e',
            targetFPS: 60,
            debug: __DEV__,
        });

        gameRef.current = game;

        // Set initial scene and start
        game.setScene(new MainScene()).then(() => {
            game.start();
        });

        // Cleanup on unmount
        return () => {
            game.stop();
        };
    }, []);

    if (!gameRef.current) {
        return (
            <View style={styles.loading}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BlazeCanvas game={gameRef.current} style={styles.canvas} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    canvas: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
    },
    loadingText: {
        color: '#ffffff',
        fontSize: 18,
    },
});
