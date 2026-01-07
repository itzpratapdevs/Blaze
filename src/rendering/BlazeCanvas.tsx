import React, { useRef, useCallback, useEffect } from 'react';
import { StyleSheet, View, type ViewStyle, type LayoutChangeEvent } from 'react-native';
import {
    Canvas,
    useCanvasRef,
    type SkCanvas,
} from '@shopify/react-native-skia';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import type { Game } from '../core/Game';

/**
 * Props for BlazeCanvas component.
 */
export interface BlazeCanvasProps {
    /**
     * The game instance to render.
     */
    game: Game;

    /**
     * Optional style for the canvas container.
     */
    style?: ViewStyle;

    /**
     * Called when the canvas is ready.
     */
    onReady?: () => void;

    /**
     * Whether to use gesture handler for touch input.
     * @default true
     */
    enableGestures?: boolean;
}

/**
 * React component that renders the Blaze game.
 *
 * This component:
 * - Creates a Skia canvas
 * - Connects it to the Game instance
 * - Handles touch input
 * - Manages lifecycle
 */
export const BlazeCanvas: React.FC<BlazeCanvasProps> = ({
    game,
    style,
    onReady,
    enableGestures = true,
}) => {
    const canvasRef = useCanvasRef();
    const isReadyRef = useRef(false);
    const layoutRef = useRef({ width: 0, height: 0 });

    // Handle canvas ready
    const handleCanvasReady = useCallback(
        (canvas: SkCanvas) => {
            if (!isReadyRef.current) {
                isReadyRef.current = true;
                game._setCanvas(canvas);
                onReady?.();
            }
        },
        [game, onReady]
    );

    // Handle layout changes
    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        layoutRef.current = { width, height };
    }, []);

    // Create touch gesture
    const panGesture = Gesture.Pan()
        .minDistance(0)
        .onBegin((event) => {
            if (enableGestures) {
                game._handleTouchStart(event.x, event.y, 0);
            }
        })
        .onUpdate((event) => {
            if (enableGestures) {
                game._handleTouchMove(event.x, event.y, 0);
            }
        })
        .onEnd(() => {
            if (enableGestures) {
                game._handleTouchEnd(0);
            }
        })
        .onFinalize(() => {
            if (enableGestures) {
                game._handleTouchEnd(0);
            }
        });

    // Tap gesture for single taps
    const tapGesture = Gesture.Tap().onStart((event) => {
        if (enableGestures) {
            game._handleTouchStart(event.x, event.y, 0);
            // Immediately end for tap
            setTimeout(() => {
                game._handleTouchEnd(0);
            }, 16);
        }
    });

    // Combine gestures
    const composedGesture = Gesture.Race(panGesture, tapGesture);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            game._setCanvas(null);
        };
    }, [game]);

    const containerStyle = [styles.container, style];

    // Canvas draw callback
    const onDraw = useCallback(
        (canvas: SkCanvas) => {
            handleCanvasReady(canvas);
        },
        [handleCanvasReady]
    );

    if (enableGestures) {
        return (
            <GestureHandlerRootView style={containerStyle}>
                <GestureDetector gesture={composedGesture}>
                    <View style={styles.canvasWrapper} onLayout={handleLayout}>
                        <Canvas ref={canvasRef} style={styles.canvas} onTouch={onDraw}>
                            {/* Drawing happens imperatively in the game loop */}
                        </Canvas>
                    </View>
                </GestureDetector>
            </GestureHandlerRootView>
        );
    }

    return (
        <View style={containerStyle} onLayout={handleLayout}>
            <Canvas ref={canvasRef} style={styles.canvas} onTouch={onDraw}>
                {/* Drawing happens imperatively in the game loop */}
            </Canvas>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    canvasWrapper: {
        flex: 1,
    },
    canvas: {
        flex: 1,
    },
});
