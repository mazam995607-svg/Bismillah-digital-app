// Granular Personalization Engine for Tool Usage & Dynamic Top Features Ranking

export interface ToolUsageMetric {
  id: string;
  name: string;
  category: string;
  count: number;
  lastAccessed: number;
  iconName?: string;
  gradient?: string;
}

const ENGINE_STORAGE_KEY = 'bismillah_personalization_metrics_v2';

export const PersonalizationEngine = {
  getMetrics(): Record<string, ToolUsageMetric> {
    try {
      const data = localStorage.getItem(ENGINE_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  trackToolAccess(toolId: string, toolName: string, category: string = 'General') {
    try {
      const metrics = this.getMetrics();
      const existing = metrics[toolId] || {
        id: toolId,
        name: toolName,
        category,
        count: 0,
        lastAccessed: Date.now()
      };

      metrics[toolId] = {
        ...existing,
        count: existing.count + 1,
        lastAccessed: Date.now()
      };

      localStorage.setItem(ENGINE_STORAGE_KEY, JSON.stringify(metrics));
      
      // Dispatch custom event for real-time UI tray refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('personalization_updated', { detail: metrics[toolId] }));
      }
    } catch (e) {
      console.error('PersonalizationEngine tracking error:', e);
    }
  },

  getTopRankedTools(limit: number = 6): ToolUsageMetric[] {
    const metricsMap = this.getMetrics();
    const list: ToolUsageMetric[] = Object.values(metricsMap);

    // Score calculation: Weight recent usage heavily + total count
    const now = Date.now();
    list.sort((a, b) => {
      const recencyA = Math.max(0, 100 - (now - a.lastAccessed) / (1000 * 60 * 60 * 24)); // decay over days
      const scoreA = a.count * 10 + recencyA;
      
      const recencyB = Math.max(0, 100 - (now - b.lastAccessed) / (1000 * 60 * 60 * 24));
      const scoreB = b.count * 10 + recencyB;

      return scoreB - scoreA;
    });

    return list.slice(0, limit);
  }
};
