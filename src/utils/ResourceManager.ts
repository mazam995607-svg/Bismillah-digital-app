// Utility to monitor Gemini API quota, circuit breaker state, memory usage, and orphaned listeners

class ResourceManagerService {
  private isCircuitBreakerOpen = false;
  private circuitBreakerCooldownUntil: number | null = null;
  private trackedListeners: Array<{ target: EventTarget; type: string; listener: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions }> = [];

  /**
   * Checks if AI API calls are allowed under the circuit breaker state.
   */
  public canExecuteAI(): boolean {
    if (this.isCircuitBreakerOpen && this.circuitBreakerCooldownUntil) {
      if (Date.now() > this.circuitBreakerCooldownUntil) {
        // Cooldown period expired, attempt reset
        this.resetCircuitBreaker();
        return true;
      }
      return false;
    }
    return !this.isCircuitBreakerOpen;
  }

  /**
   * Triggers the Circuit Breaker when a 429 Quota Exceeded error is encountered.
   * Disables heavy AI requests for 10 minutes to protect performance and prevent crashes.
   */
  public triggerCircuitBreaker(cooldownMinutes = 10): void {
    this.isCircuitBreakerOpen = true;
    this.circuitBreakerCooldownUntil = Date.now() + cooldownMinutes * 60 * 1000;
    console.warn(`[ResourceManager] AI Circuit Breaker activated for ${cooldownMinutes}m due to 429 Quota limit.`);
  }

  /**
   * Manually or automatically resets the circuit breaker.
   */
  public resetCircuitBreaker(): void {
    this.isCircuitBreakerOpen = false;
    this.circuitBreakerCooldownUntil = null;
  }

  public getCircuitBreakerStatus() {
    const isExhausted = this.isCircuitBreakerOpen && this.circuitBreakerCooldownUntil !== null && Date.now() < this.circuitBreakerCooldownUntil;
    const remainingSeconds = this.circuitBreakerCooldownUntil ? Math.max(0, Math.ceil((this.circuitBreakerCooldownUntil - Date.now()) / 1000)) : 0;
    return {
      isOpen: isExhausted,
      remainingSeconds
    };
  }

  /**
   * Estimates or retrieves browser memory metrics if supported by performance.memory.
   */
  public getMemoryStats() {
    const perf = (performance as any).memory;
    if (perf) {
      const usedMB = Math.round(perf.usedJSHeapSize / (1024 * 1024));
      const totalMB = Math.round(perf.totalJSHeapSize / (1024 * 1024));
      const limitMB = Math.round(perf.jsHeapSizeLimit / (1024 * 1024));
      const isHigh = usedMB > 150 || (limitMB > 0 && usedMB / limitMB > 0.8);
      return {
        supported: true,
        usedMB,
        totalMB,
        limitMB,
        isHighMemory: isHigh,
        formatted: `${usedMB}MB / ${totalMB}MB`
      };
    }

    return {
      supported: false,
      usedMB: 0,
      totalMB: 0,
      limitMB: 0,
      isHighMemory: false,
      formatted: 'Memory API unsupported'
    };
  }

  /**
   * Safely registers an event listener and tracks it for unmount cleanup.
   */
  public addTrackedEventListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(type, listener, options);
    this.trackedListeners.push({ target, type, listener, options });
  }

  /**
   * Cleans up all tracked event listeners to prevent memory leaks and orphaned listeners.
   */
  public removeAllTrackedListeners(): void {
    this.trackedListeners.forEach(({ target, type, listener, options }) => {
      try {
        target.removeEventListener(type, listener, options);
      } catch {}
    });
    this.trackedListeners = [];
  }
}

export const ResourceManager = new ResourceManagerService();
