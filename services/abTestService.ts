import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
  traffic: number; // percentage
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  variants: ABTestVariant[];
  metric: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  minSampleSize: number;
  confidenceLevel: number;
  createdAt: Date;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  variantName: string;
  sampleSize: number;
  conversionRate: number;
  averageValue: number;
  confidence: number;
  winner: boolean;
}

export interface ABTestAnalysis {
  testId: string;
  status: 'running' | 'completed' | 'inconclusive';
  results: ABTestResult[];
  winner?: ABTestResult;
  statisticalSignificance: number;
  recommendation: string;
  estimatedLift: number;
}

class ABTestService {
  private tests: Map<string, ABTest> = new Map();
  private results: Map<string, ABTestResult[]> = new Map();
  private analyses: Map<string, ABTestAnalysis> = new Map();

  /**
   * Create A/B test
   */
  async createTest(
    name: string,
    description: string,
    hypothesis: string,
    variants: ABTestVariant[],
    metric: string,
    minSampleSize: number = 100,
    confidenceLevel: number = 95
  ): Promise<ABTest> {
    const testId = `test_${Date.now()}`;
    const test: ABTest = {
      id: testId,
      name,
      description,
      hypothesis,
      variants,
      metric,
      status: 'draft',
      startDate: new Date(),
      minSampleSize,
      confidenceLevel,
      createdAt: new Date(),
    };

    this.tests.set(testId, test);

    try {
      await this.saveToFirebase(test);
    } catch (error) {
      console.error('Failed to save test:', error);
    }

    return test;
  }

  /**
   * Start test
   */
  startTest(testId: string): ABTest | undefined {
    const test = this.tests.get(testId);
    if (test) {
      test.status = 'running';
      test.startDate = new Date();
      return test;
    }
    return undefined;
  }

  /**
   * Pause test
   */
  pauseTest(testId: string): ABTest | undefined {
    const test = this.tests.get(testId);
    if (test) {
      test.status = 'paused';
      return test;
    }
    return undefined;
  }

  /**
   * Complete test
   */
  completeTest(testId: string): ABTest | undefined {
    const test = this.tests.get(testId);
    if (test) {
      test.status = 'completed';
      test.endDate = new Date();
      return test;
    }
    return undefined;
  }

  /**
   * Record test result
   */
  recordResult(
    testId: string,
    variantId: string,
    variantName: string,
    conversionRate: number,
    averageValue: number,
    sampleSize: number
  ): ABTestResult {
    const result: ABTestResult = {
      testId,
      variantId,
      variantName,
      sampleSize,
      conversionRate,
      averageValue,
      confidence: Math.min(100, (sampleSize / 100) * 100),
      winner: false,
    };

    if (!this.results.has(testId)) {
      this.results.set(testId, []);
    }

    this.results.get(testId)!.push(result);
    return result;
  }

  /**
   * Analyze test results
   */
  analyzeTest(testId: string): ABTestAnalysis {
    const test = this.tests.get(testId);
    const testResults = this.results.get(testId) || [];

    if (!test || testResults.length === 0) {
      throw new Error('Test or results not found');
    }

    // Simple statistical analysis
    const sortedResults = [...testResults].sort((a, b) => b.conversionRate - a.conversionRate);
    const winner = sortedResults[0];

    // Calculate statistical significance
    let statisticalSignificance = 0;
    if (sortedResults.length > 1) {
      const control = sortedResults[0];
      const challenger = sortedResults[1];
      const pooledStdErr = Math.sqrt(
        (control.conversionRate * (1 - control.conversionRate)) / control.sampleSize +
        (challenger.conversionRate * (1 - challenger.conversionRate)) / challenger.sampleSize
      );
      const zScore = Math.abs(control.conversionRate - challenger.conversionRate) / pooledStdErr;
      statisticalSignificance = Math.min(100, (zScore / 1.96) * 100);
    }

    const estimatedLift = sortedResults.length > 1
      ? ((sortedResults[0].conversionRate - sortedResults[1].conversionRate) / sortedResults[1].conversionRate) * 100
      : 0;

    const analysis: ABTestAnalysis = {
      testId,
      status: statisticalSignificance > 80 ? 'completed' : test.status === 'completed' ? 'inconclusive' : 'running',
      results: testResults,
      winner: statisticalSignificance > 80 ? winner : undefined,
      statisticalSignificance,
      recommendation: this.generateRecommendation(statisticalSignificance, estimatedLift),
      estimatedLift,
    };

    this.analyses.set(testId, analysis);
    return analysis;
  }

  /**
   * Get test
   */
  getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId);
  }

  /**
   * Get all tests
   */
  getAllTests(status?: ABTest['status']): ABTest[] {
    let tests = Array.from(this.tests.values());

    if (status) {
      tests = tests.filter((t) => t.status === status);
    }

    return tests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get test results
   */
  getTestResults(testId: string): ABTestResult[] {
    return this.results.get(testId) || [];
  }

  /**
   * Get test analysis
   */
  getTestAnalysis(testId: string): ABTestAnalysis | undefined {
    return this.analyses.get(testId);
  }

  /**
   * Calculate sample size needed
   */
  calculateSampleSize(
    baselineConversion: number,
    minDetectableEffect: number,
    confidenceLevel: number = 95,
    statisticalPower: number = 80
  ): number {
    // Simplified sample size calculation
    const zAlpha = confidenceLevel === 95 ? 1.96 : confidenceLevel === 90 ? 1.645 : 2.576;
    const zBeta = statisticalPower === 80 ? 0.84 : statisticalPower === 90 ? 1.28 : 1.645;

    const p1 = baselineConversion;
    const p2 = baselineConversion * (1 + minDetectableEffect);

    const numerator = (zAlpha + zBeta) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2));
    const denominator = (p2 - p1) ** 2;

    return Math.ceil(numerator / denominator);
  }

  /**
   * Private: Generate recommendation
   */
  private generateRecommendation(significance: number, lift: number): string {
    if (significance > 80) {
      if (lift > 10) {
        return `Implement winning variant - estimated ${lift.toFixed(1)}% lift`;
      } else {
        return `Implement winning variant - estimated ${lift.toFixed(1)}% lift`;
      }
    } else if (significance > 50) {
      return 'Continue test - approaching statistical significance';
    } else {
      return 'Continue test - more data needed for conclusive results';
    }
  }

  /**
   * Private: Save to Firebase
   */
  private async saveToFirebase(test: ABTest): Promise<void> {
    try {
      const testsRef = collection(db, 'abTests');
      await addDoc(testsRef, {
        ...test,
        startDate: Timestamp.fromDate(test.startDate),
        endDate: test.endDate ? Timestamp.fromDate(test.endDate) : null,
        createdAt: Timestamp.fromDate(test.createdAt),
      });
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
    }
  }
}

export const abTestService = new ABTestService();
