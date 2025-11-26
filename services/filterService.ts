export type FilterOperator = 
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'notIn'
  | 'exists'
  | 'notExists';

export interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  caseSensitive?: boolean;
}

export interface FilterConfig {
  id: string;
  name: string;
  description?: string;
  rules: FilterRule[];
  logic: 'AND' | 'OR';
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterPreset {
  id: string;
  name: string;
  config: FilterConfig;
  isDefault?: boolean;
}

export class FilterService {
  private presets: Map<string, FilterPreset> = new Map();
  private ruleCounter = 0;

  createRule(
    field: string,
    operator: FilterOperator,
    value: any,
    caseSensitive: boolean = false
  ): FilterRule {
    return {
      id: `rule_${++this.ruleCounter}`,
      field,
      operator,
      value,
      caseSensitive,
    };
  }

  createFilter(
    name: string,
    rules: FilterRule[] = [],
    logic: 'AND' | 'OR' = 'AND',
    description?: string
  ): FilterConfig {
    return {
      id: `filter_${Date.now()}`,
      name,
      description,
      rules,
      logic,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  addRule(filter: FilterConfig, rule: FilterRule): FilterConfig {
    return {
      ...filter,
      rules: [...filter.rules, rule],
      updatedAt: new Date(),
    };
  }

  removeRule(filter: FilterConfig, ruleId: string): FilterConfig {
    return {
      ...filter,
      rules: filter.rules.filter(r => r.id !== ruleId),
      updatedAt: new Date(),
    };
  }

  updateRule(filter: FilterConfig, ruleId: string, updates: Partial<FilterRule>): FilterConfig {
    return {
      ...filter,
      rules: filter.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r),
      updatedAt: new Date(),
    };
  }

  applyFilters<T extends Record<string, any>>(
    data: T[],
    filter: FilterConfig
  ): T[] {
    if (filter.rules.length === 0) {
      return data;
    }

    return data.filter(item => {
      const results = filter.rules.map(rule => this.evaluateRule(item, rule));
      
      if (filter.logic === 'AND') {
        return results.every(r => r);
      } else {
        return results.some(r => r);
      }
    });
  }

  private evaluateRule<T extends Record<string, any>>(item: T, rule: FilterRule): boolean {
    const value = this.getNestedValue(item, rule.field);

    switch (rule.operator) {
      case 'equals':
        return this.compareValues(value, rule.value, rule.caseSensitive) === 0;
      
      case 'contains':
        return this.stringContains(String(value), String(rule.value), rule.caseSensitive);
      
      case 'startsWith':
        return this.stringStartsWith(String(value), String(rule.value), rule.caseSensitive);
      
      case 'endsWith':
        return this.stringEndsWith(String(value), String(rule.value), rule.caseSensitive);
      
      case 'gt':
        return Number(value) > Number(rule.value);
      
      case 'gte':
        return Number(value) >= Number(rule.value);
      
      case 'lt':
        return Number(value) < Number(rule.value);
      
      case 'lte':
        return Number(value) <= Number(rule.value);
      
      case 'between':
        return Number(value) >= Number(rule.value[0]) && Number(value) <= Number(rule.value[1]);
      
      case 'in':
        return Array.isArray(rule.value) ? rule.value.includes(value) : false;
      
      case 'notIn':
        return Array.isArray(rule.value) ? !rule.value.includes(value) : true;
      
      case 'exists':
        return value !== null && value !== undefined;
      
      case 'notExists':
        return value === null || value === undefined;
      
      default:
        return true;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private compareValues(a: any, b: any, caseSensitive: boolean = false): number {
    if (typeof a === 'string' && typeof b === 'string') {
      const aVal = caseSensitive ? a : a.toLowerCase();
      const bVal = caseSensitive ? b : b.toLowerCase();
      return aVal.localeCompare(bVal);
    }
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  private stringContains(str: string, search: string, caseSensitive: boolean = false): boolean {
    if (!caseSensitive) {
      return str.toLowerCase().includes(search.toLowerCase());
    }
    return str.includes(search);
  }

  private stringStartsWith(str: string, search: string, caseSensitive: boolean = false): boolean {
    if (!caseSensitive) {
      return str.toLowerCase().startsWith(search.toLowerCase());
    }
    return str.startsWith(search);
  }

  private stringEndsWith(str: string, search: string, caseSensitive: boolean = false): boolean {
    if (!caseSensitive) {
      return str.toLowerCase().endsWith(search.toLowerCase());
    }
    return str.endsWith(search);
  }

  savePreset(preset: FilterPreset): void {
    this.presets.set(preset.id, preset);
  }

  getPreset(id: string): FilterPreset | undefined {
    return this.presets.get(id);
  }

  getAllPresets(): FilterPreset[] {
    return Array.from(this.presets.values());
  }

  deletePreset(id: string): void {
    this.presets.delete(id);
  }

  updatePreset(id: string, updates: Partial<FilterPreset>): void {
    const preset = this.presets.get(id);
    if (preset) {
      this.presets.set(id, { ...preset, ...updates });
    }
  }

  // Utility methods for common filters
  createStatusFilter(status: string): FilterRule {
    return this.createRule('status', 'equals', status);
  }

  createDateRangeFilter(field: string, startDate: Date, endDate: Date): FilterRule {
    return this.createRule(field, 'between', [startDate, endDate]);
  }

  createSearchFilter(field: string, searchTerm: string): FilterRule {
    return this.createRule(field, 'contains', searchTerm);
  }

  createNumberRangeFilter(field: string, min: number, max: number): FilterRule {
    return this.createRule(field, 'between', [min, max]);
  }

  createMultiSelectFilter(field: string, values: any[]): FilterRule {
    return this.createRule(field, 'in', values);
  }

  // Discount-specific filters
  createDiscountStatusFilter(status: 'active' | 'expired' | 'used'): FilterRule {
    return this.createRule('status', 'equals', status);
  }

  createDiscountTypeFilter(type: 'percentage' | 'fixed'): FilterRule {
    return this.createRule('type', 'equals', type);
  }

  createDiscountCodeSearchFilter(searchTerm: string): FilterRule {
    return this.createRule('code', 'contains', searchTerm);
  }

  // User-specific filters
  createUserTierFilter(tier: string): FilterRule {
    return this.createRule('tier', 'equals', tier);
  }

  createUserPointsRangeFilter(min: number, max: number): FilterRule {
    return this.createRule('points', 'between', [min, max]);
  }

  createUserNameSearchFilter(searchTerm: string): FilterRule {
    return this.createRule('name', 'contains', searchTerm);
  }

  // Points-specific filters
  createPointsTypeFilter(type: 'earn' | 'redeem' | 'admin_add' | 'admin_remove'): FilterRule {
    return this.createRule('type', 'equals', type);
  }

  createPointsAmountRangeFilter(min: number, max: number): FilterRule {
    return this.createRule('points', 'between', [min, max]);
  }

  // Export/Import
  exportFilter(filter: FilterConfig): string {
    return JSON.stringify(filter, null, 2);
  }

  importFilter(json: string): FilterConfig {
    return JSON.parse(json);
  }

  exportPresets(): string {
    const presets = Array.from(this.presets.values());
    return JSON.stringify(presets, null, 2);
  }

  importPresets(json: string): void {
    const presets = JSON.parse(json) as FilterPreset[];
    presets.forEach(preset => this.savePreset(preset));
  }
}

// Singleton instance
let instance: FilterService | null = null;

export function getFilterService(): FilterService {
  if (!instance) {
    instance = new FilterService();
  }
  return instance;
}

export function resetFilterService(): void {
  if (instance) {
    instance = null;
  }
}
