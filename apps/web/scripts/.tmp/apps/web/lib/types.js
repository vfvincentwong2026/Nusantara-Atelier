"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STYLE_PENDING = exports.STYLES = void 0;
/** 风格筛选项。「更多」对应数据中 style === '待补充' 的案例 */
exports.STYLES = [
    '全部',
    '法式',
    '现代',
    '侘寂',
    '意式极简',
    '现代奶油',
    '法式轻奢',
    '现代小法',
    '更多',
];
/** style 数据值：已核定的风格 + 待补充（新案例元数据未确认时使用） */
exports.STYLE_PENDING = '待补充';
