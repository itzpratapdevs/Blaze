import Foundation
import QuartzCore
import React

/**
 * Native module for Blaze game engine.
 * Provides high-precision game loop using CADisplayLink.
 */
@objc(BlazeModule)
class BlazeModule: RCTEventEmitter {
    
    private static let EVENT_FRAME = "onBlazeFrame"
    
    private var displayLink: CADisplayLink?
    private var isRunning = false
    private var isPaused = false
    private var lastFrameTime: CFTimeInterval = 0
    private var targetFps: Int = 60
    private var frameCount: Int64 = 0
    private var startTime: CFTimeInterval = 0
    
    override init() {
        super.init()
    }
    
    @objc
    override static func moduleName() -> String! {
        return "BlazeModule"
    }
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    override func supportedEvents() -> [String]! {
        return [BlazeModule.EVENT_FRAME]
    }
    
    /**
     * Start the native game loop.
     */
    @objc
    func start() {
        if isRunning { return }
        
        isRunning = true
        isPaused = false
        frameCount = 0
        startTime = CACurrentMediaTime()
        lastFrameTime = startTime
        
        DispatchQueue.main.async { [weak self] in
            self?.startLoop()
        }
    }
    
    /**
     * Stop the native game loop.
     */
    @objc
    func stop() {
        isRunning = false
        isPaused = false
        
        DispatchQueue.main.async { [weak self] in
            self?.stopLoop()
        }
    }
    
    /**
     * Pause the native game loop.
     */
    @objc
    func pause() {
        if isRunning && !isPaused {
            isPaused = true
            displayLink?.isPaused = true
        }
    }
    
    /**
     * Resume the native game loop.
     */
    @objc
    func resume() {
        if isRunning && isPaused {
            isPaused = false
            lastFrameTime = CACurrentMediaTime()
            displayLink?.isPaused = false
        }
    }
    
    /**
     * Set target FPS.
     */
    @objc
    func setFPS(_ fps: Int) {
        targetFps = max(1, min(120, fps))
        
        if #available(iOS 15.0, *) {
            displayLink?.preferredFrameRateRange = CAFrameRateRange(
                minimum: Float(targetFps),
                maximum: Float(targetFps),
                preferred: Float(targetFps)
            )
        } else {
            displayLink?.preferredFramesPerSecond = targetFps
        }
    }
    
    /**
     * Check if game loop is running (sync method).
     */
    @objc(isRunning:rejecter:)
    func isRunningCheck(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(isRunning)
    }
    
    /**
     * Check if game loop is paused (sync method).
     */
    @objc(isPaused:rejecter:)
    func isPausedCheck(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(isPaused)
    }
    
    /**
     * Get frame count (sync method).
     */
    @objc(getFrameCount:rejecter:)
    func getFrameCountCheck(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(NSNumber(value: frameCount))
    }
    
    private func startLoop() {
        displayLink = CADisplayLink(target: self, selector: #selector(onFrame))
        
        if #available(iOS 15.0, *) {
            displayLink?.preferredFrameRateRange = CAFrameRateRange(
                minimum: Float(targetFps),
                maximum: Float(targetFps),
                preferred: Float(targetFps)
            )
        } else {
            displayLink?.preferredFramesPerSecond = targetFps
        }
        
        displayLink?.add(to: .main, forMode: .common)
    }
    
    private func stopLoop() {
        displayLink?.invalidate()
        displayLink = nil
    }
    
    @objc
    private func onFrame(displayLink: CADisplayLink) {
        guard isRunning && !isPaused else { return }
        
        let currentTime = displayLink.timestamp
        var deltaTime = currentTime - lastFrameTime
        lastFrameTime = currentTime
        
        // Clamp delta time to prevent spiral of death
        deltaTime = min(deltaTime, 0.1)
        
        frameCount += 1
        
        // Send frame event to JavaScript
        let elapsed = currentTime - startTime
        sendEvent(withName: BlazeModule.EVENT_FRAME, body: [
            "delta": deltaTime,
            "frame": NSNumber(value: frameCount),
            "elapsed": elapsed
        ])
    }
    
    override func invalidate() {
        stop()
        super.invalidate()
    }
}
