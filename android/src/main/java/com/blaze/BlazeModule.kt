package com.blaze

import android.view.Choreographer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * Native module for Blaze game engine.
 * Provides high-precision game loop using Choreographer.
 */
class BlazeModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    companion object {
        const val NAME = "BlazeModule"
        private const val EVENT_FRAME = "onBlazeFrame"
    }

    private var isRunning = false
    private var isPaused = false
    private var lastFrameTimeNanos: Long = 0
    private var targetFps: Int = 60
    private var frameCallback: Choreographer.FrameCallback? = null
    private var frameCount: Long = 0

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String = NAME

    /**
     * Start the native game loop.
     */
    @ReactMethod
    fun start() {
        if (isRunning) return

        isRunning = true
        isPaused = false
        lastFrameTimeNanos = System.nanoTime()
        frameCount = 0

        startLoop()
    }

    /**
     * Stop the native game loop.
     */
    @ReactMethod
    fun stop() {
        isRunning = false
        isPaused = false
        stopLoop()
    }

    /**
     * Pause the native game loop.
     */
    @ReactMethod
    fun pause() {
        if (isRunning && !isPaused) {
            isPaused = true
        }
    }

    /**
     * Resume the native game loop.
     */
    @ReactMethod
    fun resume() {
        if (isRunning && isPaused) {
            isPaused = false
            lastFrameTimeNanos = System.nanoTime()
        }
    }

    /**
     * Set target FPS.
     */
    @ReactMethod
    fun setFPS(fps: Int) {
        targetFps = fps.coerceIn(1, 120)
    }

    /**
     * Check if game loop is running.
     */
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun isRunning(): Boolean = isRunning

    /**
     * Check if game loop is paused.
     */
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun isPaused(): Boolean = isPaused

    /**
     * Get frame count.
     */
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun getFrameCount(): Double = frameCount.toDouble()

    private fun startLoop() {
        frameCallback = object : Choreographer.FrameCallback {
            override fun doFrame(frameTimeNanos: Long) {
                if (!isRunning) return

                // Schedule next frame
                Choreographer.getInstance().postFrameCallback(this)

                // Skip if paused
                if (isPaused) return

                // Calculate delta time in seconds
                val deltaNanos = frameTimeNanos - lastFrameTimeNanos
                lastFrameTimeNanos = frameTimeNanos

                // Convert to seconds (avoid division in hot path)
                val deltaSeconds = deltaNanos / 1_000_000_000.0

                // Clamp delta time to prevent spiral of death
                val clampedDelta = deltaSeconds.coerceAtMost(0.1)

                frameCount++

                // Send frame event to JavaScript
                sendFrameEvent(clampedDelta, frameCount)
            }
        }

        Choreographer.getInstance().postFrameCallback(frameCallback)
    }

    private fun stopLoop() {
        frameCallback?.let {
            Choreographer.getInstance().removeFrameCallback(it)
        }
        frameCallback = null
    }

    private fun sendFrameEvent(deltaTime: Double, frame: Long) {
        val params = Arguments.createMap().apply {
            putDouble("delta", deltaTime)
            putDouble("frame", frame.toDouble())
            putDouble("elapsed", (System.nanoTime() / 1_000_000_000.0))
        }

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EVENT_FRAME, params)
    }

    // Lifecycle events

    override fun onHostResume() {
        if (isRunning && isPaused) {
            resume()
        }
    }

    override fun onHostPause() {
        if (isRunning && !isPaused) {
            pause()
        }
    }

    override fun onHostDestroy() {
        stop()
    }

    override fun invalidate() {
        stop()
        reactContext.removeLifecycleEventListener(this)
        super.invalidate()
    }
}
