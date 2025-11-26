import React, { useState } from 'react';
import { segmentService, Segment, SegmentRule } from '../services/segmentService';
import '../styles/segment-builder.css';

interface SegmentBuilderProps {
  onSegmentCreated?: (segment: Segment) => void;
}

export const SegmentBuilder: React.FC<SegmentBuilderProps> = ({ onSegmentCreated }) => {
  const [segments, setSegments] = useState<Segment[]>(segmentService.getAllSegments());
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  // Builder form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [rules, setRules] = useState<SegmentRule[]>([]);

  const handleAddRule = () => {
    setRules([
      ...rules,
      {
        field: 'tier',
        operator: 'equals',
        value: '',
      },
    ]);
  };

  const handleUpdateRule = (index: number, updates: Partial<SegmentRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleCreateSegment = async () => {
    if (!name.trim() || rules.length === 0) {
      alert('Please enter a name and add at least one rule');
      return;
    }

    const segment = await segmentService.createSegment(name, description, rules, logic);
    setSegments(segmentService.getAllSegments());
    setName('');
    setDescription('');
    setRules([]);
    setShowBuilder(false);
    onSegmentCreated?.(segment);
  };

  const handleDeleteSegment = (segmentId: string) => {
    if (confirm('Are you sure you want to delete this segment?')) {
      segmentService.deleteSegment(segmentId);
      setSegments(segmentService.getAllSegments());
      setSelectedSegment(null);
    }
  };

  const handleToggleSegment = (segmentId: string) => {
    const segment = segmentService.getSegment(segmentId);
    if (segment) {
      segmentService.updateSegment(segmentId, { active: !segment.active });
      setSegments(segmentService.getAllSegments());
    }
  };

  return (
    <div className="segment-builder">
      <div className="panel-header">
        <h2>Segment Builder</h2>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="btn-primary"
        >
          {showBuilder ? 'Cancel' : 'Create Segment'}
        </button>
      </div>

      {showBuilder && (
        <div className="builder-form">
          <div className="form-group">
            <label>Segment Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High-Value Customers"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this segment..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Logic</label>
            <div className="logic-selector">
              <label>
                <input
                  type="radio"
                  value="AND"
                  checked={logic === 'AND'}
                  onChange={(e) => setLogic(e.target.value as 'AND' | 'OR')}
                />
                AND (all rules must match)
              </label>
              <label>
                <input
                  type="radio"
                  value="OR"
                  checked={logic === 'OR'}
                  onChange={(e) => setLogic(e.target.value as 'AND' | 'OR')}
                />
                OR (any rule can match)
              </label>
            </div>
          </div>

          <div className="rules-section">
            <h3>Rules</h3>
            {rules.map((rule, index) => (
              <div key={index} className="rule-item">
                <select
                  value={rule.field}
                  onChange={(e) => handleUpdateRule(index, { field: e.target.value })}
                >
                  <option value="tier">Tier</option>
                  <option value="totalPoints">Total Points</option>
                  <option value="email">Email</option>
                  <option value="createdAt">Created Date</option>
                  <option value="lastActive">Last Active</option>
                </select>

                <select
                  value={rule.operator}
                  onChange={(e) =>
                    handleUpdateRule(index, { operator: e.target.value as any })
                  }
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="gt">Greater Than</option>
                  <option value="lt">Less Than</option>
                  <option value="gte">Greater or Equal</option>
                  <option value="lte">Less or Equal</option>
                  <option value="in">In List</option>
                  <option value="between">Between</option>
                </select>

                <input
                  type="text"
                  value={rule.value}
                  onChange={(e) => handleUpdateRule(index, { value: e.target.value })}
                  placeholder="Value"
                />

                {rule.operator === 'between' && (
                  <input
                    type="text"
                    value={rule.value2 || ''}
                    onChange={(e) => handleUpdateRule(index, { value2: e.target.value })}
                    placeholder="Value 2"
                  />
                )}

                <button
                  onClick={() => handleRemoveRule(index)}
                  className="btn-remove"
                >
                  ✕
                </button>
              </div>
            ))}

            <button onClick={handleAddRule} className="btn-add-rule">
              + Add Rule
            </button>
          </div>

          <div className="form-actions">
            <button onClick={handleCreateSegment} className="btn-primary">
              Create Segment
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

      <div className="segments-list">
        <h3>Segments ({segments.length})</h3>
        {segments.length === 0 ? (
          <p className="empty-state">No segments yet</p>
        ) : (
          segments.map((segment) => (
            <div
              key={segment.id}
              className={`segment-item ${segment.active ? 'active' : 'inactive'}`}
              onClick={() => setSelectedSegment(segment)}
            >
              <div className="segment-info">
                <div className="segment-name">{segment.name}</div>
                <div className="segment-description">{segment.description}</div>
                <div className="segment-meta">
                  <span className="rule-count">{segment.rules.length} rules</span>
                  <span className="logic">{segment.logic}</span>
                  <span className="user-count">{segment.userCount} users</span>
                </div>
              </div>

              <div className="segment-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSegment(segment.id);
                  }}
                  className={`btn-toggle ${segment.active ? 'active' : ''}`}
                >
                  {segment.active ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSegment(segment.id);
                  }}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedSegment && (
        <div className="segment-details">
          <h3>Segment Details: {selectedSegment.name}</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Total Users</span>
              <span className="value">{selectedSegment.userCount}</span>
            </div>
            <div className="detail-item">
              <span className="label">Rules</span>
              <span className="value">{selectedSegment.rules.length}</span>
            </div>
            <div className="detail-item">
              <span className="label">Logic</span>
              <span className="value">{selectedSegment.logic}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status</span>
              <span className="value">{selectedSegment.active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          <div className="rules-display">
            <h4>Rules</h4>
            <ul>
              {selectedSegment.rules.map((rule, i) => (
                <li key={i}>
                  {rule.field} {rule.operator} {rule.value}
                  {rule.value2 && ` to ${rule.value2}`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
