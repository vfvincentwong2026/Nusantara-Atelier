import rawData from '../../../data/cases.json';
import type { ProjectCase } from './types';

export const cases: ProjectCase[] = (rawData as unknown as { cases: ProjectCase[] }).cases;

export const casesWithPricing = cases.filter(
  (c) => c.hard_cost_per_sqm !== null && c.soft_cost_per_sqm !== null
);
