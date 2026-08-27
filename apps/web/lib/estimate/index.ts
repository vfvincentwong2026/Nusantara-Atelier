/* P1 quick_estimate 估价引擎 —— 模块入口（纯函数，无 React 依赖） */
export { quickEstimate } from './quickEstimate';
export {
  getProcess,
  getLabor,
  getWorkhour,
  loadStyleConfig,
  normalizeStyle,
  supportedStyles,
  STYLE_DEFAULT_CONFIG,
} from './kg';
export * from './rules';
export type {
  EstimateInput,
  EstimateOutput,
  ProcessEstimate,
  CrewPlan,
  Range3,
} from './types';
