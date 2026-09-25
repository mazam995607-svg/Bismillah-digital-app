// Smart Usage Tracker for Personalized Recommendations (Facebook/YouTube Style)

import { PersonalizationEngine } from './PersonalizationEngine';

export interface FeatureUsage {
  id: string;
  name: string;
  count: number;
  lastUsed: number;
}

const STORAGE_KEY = 'bismillah_feature_usage_v1';

export const UsageTracker = {
  getUsageMap(): Record<string, FeatureUsage> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? (JSON.parse(data) as Record<string, FeatureUsage>) : {};
    } catch {
      return {};
    }
  },

  trackUsage(featureId: string, featureName: string) {
    try {
      const usageMap = this.getUsageMap();
      const current = usageMap[featureId] || {
        id: featureId,
        name: featureName,
        count: 0,
        lastUsed: Date.now()
      };

      usageMap[featureId] = {
        id: featureId,
        name: featureName,
        count: current.count + 1,
        lastUsed: Date.now()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(usageMap));
      PersonalizationEngine.trackToolAccess(featureId, featureName);
    } catch (e) {
      console.error('Usage tracking error:', e);
    }
  },

  getTopFeatures(limit = 6): FeatureUsage[] {
    const usageMap = this.getUsageMap();
    const list: FeatureUsage[] = Object.values(usageMap);
    
    // Sort by count descending, then lastUsed descending
    list.sort((a: FeatureUsage, b: FeatureUsage) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.lastUsed - a.lastUsed;
    });

    return list.slice(0, limit);
  }
};
