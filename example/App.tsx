import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GameScreen } from './src/GameScreen';

export default function App() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
            <SafeAreaView style={styles.container}>
                <GameScreen />
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
});
