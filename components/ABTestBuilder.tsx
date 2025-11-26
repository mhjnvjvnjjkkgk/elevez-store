import React, { useState } from 'react';
import { abTestService, ABTest, ABTestVariant } from '../services/abTestService';
import '../styles/ab-test-builder.css';

interface ABTestBuilderProps {
  onTestCreated?: (test: ABTest) => void;
}

export const ABTestBuilder: React.FC<ABTestBuilderProps> = ({ onTestCreated }) => {
  const [tests, setTests] = useState<ABTest[]>(abTestService.getAllTests());
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  // Builder form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [metric, setMetric] = useState('conversion_rate');
  const [minSampleSize, setMinSampleSize] = useState(100);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [variants, setVariants] = useState<ABTestVariant[]>([
    { id: 'control', name: 'Control', description: 'Current version', config: {}, traffic: 50 },
    { id: 'variant_a', name: 'Variant A', description: 'New version', config: {}, traffic: 50 },
  ]);

  const handleAddVariant = () => {
    const newVariant: ABTestVariant = {
      id: `variant_${Date.now()}`,
      name: `Variant ${String.fromCharCode(65 + variants.length)}`,
      description: '',
      config: {},
      traffic: Math.floor(100 / (variants.length + 1)),
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (index: number, updates: Partial<ABTestVariant>) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], ...updates };
    setVariants(newVariants);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length > 2) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleCreateTest = async () => {
    if (!name.trim() || !hypothesis.trim()) {
      alert('Please enter test name and hypothesis');
      return;
    }

    const test = await abTestService.createTest(
      name,
      description,
      hypothesis,
      variants,
      metric,
      minSampleSize,
      confidenceLevel
    );

    setTests(abTestService.getAllTests());
    setName('');
    setDescription('');
    setHypothesis('');
    setVariants([
      { id: 'control', name: 'Control', description: '', config: {}, traffic: 50 },
      { id: 'variant_a', name: 'Variant A', description: '', config: {}, traffic: 50 },
    ]);
    setShowBuilder(false);
    onTestCreated?.(test);
  };

  const handleStartTest = (testId: string) => {
    abTestService.startTest(testId);
    setTests(abTestService.getAllTests());
  };

  const handleCompleteTest = (testId: string) => {
    abTestService.completeTest(testId);
    setTests(abTestService.getAllTests());
  };

  const handleAnalyzeTest = (testId: string) => {
    const analysis = abTestService.analyzeTest(testId);
    setSelectedTest({ ...selectedTest!, status: analysis.status as any });
  };

  const totalTraffic = variants.reduce((sum, v) => sum + v.traffic, 0);

  return (
    <div className="ab-test-builder">
      <div className="panel-header">
        <h2>A/B Test Builder</h2>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="btn-primary"
        >
          {showBuilder ? 'Cancel' : 'Create Test'}
        </button>
      </div>

      {showBuilder && (
        <div className="builder-form">
          <div className="form-group">
            <label>Test Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Homepage CTA Button Color"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the test..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Hypothesis</label>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="What do you expect to happen?"
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Metric</label>
              <select value={metric} onChange={(e) => setMetric(e.target.value)}>
                <option value="conversion_rate">Conversion Rate</option>
                <option value="click_through_rate">Click Through Rate</option>
                <option value="average_order_value">Average Order Value</option>
                <option value="engagement_time">Engagement Time</option>
              </select>
            </div>

            <div className="form-group">
              <label>Min Sample Size</label>
              <input
                type="number"
                value={minSampleSize}
                onChange={(e) => setMinSampleSize(parseInt(e.target.value))}
                min="10"
              />
            </div>

            <div className="form-group">
              <label>Confidence Level</label>
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
              >
                <option value={90}>90%</option>
                <option value={95}>95%</option>
                <option value={99}>99%</option>
              </select>
            </div>
          </div>

          <div className="variants-section">
            <h3>Variants</h3>
            {variants.map((variant, index) => (
              <div key={variant.id} className="variant-item">
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => handleUpdateVariant(index, { name: e.target.value })}
                  placeholder="Variant name"
                />
                <input
                  type="text"
                  value={variant.description}
                  onChange={(e) => handleUpdateVariant(index, { description: e.target.value })}
                  placeholder="Description"
                />
                <div className="traffic-input">
                  <input
                    type="number"
                    value={variant.traffic}
                    onChange={(e) => handleUpdateVariant(index, { traffic: parseInt(e.target.value) })}
                    min="1"
                    max="100"
                  />
                  <span>%</span>
                </div>
                {variants.length > 2 && (
                  <button
                    onClick={() => handleRemoveVariant(index)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <div className="traffic-total">
              Total Traffic: {totalTraffic}%
              {totalTraffic !== 100 && <span className="warning">Must equal 100%</span>}
            </div>

            <button onClick={handleAddVariant} className="btn-add-variant">
              + Add Variant
            </button>
          </div>

          <div className="form-actions">
            <button
              onClick={handleCreateTest}
              disabled={totalTraffic !== 100}
              className="btn-primary"
            >
              Create Test
            </button>
            <button
              onClick={() => setShowBuilder(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="tests-list">
        <h3>Tests ({tests.length})</h3>
        {tests.length === 0 ? (
          <p className="empty-state">No tests yet</p>
        ) : (
          tests.map((test) => (
            <div key={test.id} className={`test-item status-${test.status}`}>
              <div className="test-info">
                <div className="test-name">{test.name}</div>
                <div className="test-hypothesis">{test.hypothesis}</div>
                <div className="test-meta">
                  <span className="variants">{test.variants.length} variants</span>
                  <span className="metric">{test.metric}</span>
                  <span className="status">{test.status}</span>
                </div>
              </div>

              <div className="test-actions">
                {test.status === 'draft' && (
                  <button
                    onClick={() => handleStartTest(test.id)}
                    className="btn-start"
                  >
                    Start
                  </button>
                )}
                {test.status === 'running' && (
                  <>
                    <button
                      onClick={() => handleAnalyzeTest(test.id)}
                      className="btn-analyze"
                    >
                      Analyze
                    </button>
                    <button
                      onClick={() => handleCompleteTest(test.id)}
                      className="btn-complete"
                    >
                      Complete
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedTest(test)}
                  className="btn-view"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTest && (
        <div className="test-details">
          <h3>{selectedTest.name}</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Status</span>
              <span className="value">{selectedTest.status}</span>
            </div>
            <div className="detail-item">
              <span className="label">Variants</span>
              <span className="value">{selectedTest.variants.length}</span>
            </div>
            <div className="detail-item">
              <span className="label">Metric</span>
              <span className="value">{selectedTest.metric}</span>
            </div>
            <div className="detail-item">
              <span className="label">Confidence</span>
              <span className="value">{selectedTest.confidenceLevel}%</span>
            </div>
          </div>

          <div className="variants-display">
            <h4>Variants</h4>
            <div className="variants-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Traffic</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTest.variants.map((variant) => (
                    <tr key={variant.id}>
                      <td>{variant.name}</td>
                      <td>{variant.description}</td>
                      <td>{variant.traffic}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
