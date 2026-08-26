"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MATERIAL_CATEGORIES = exports.materials = void 0;
const materials_json_1 = __importDefault(require("../../../data/materials.json"));
/** 印尼本地材料 SKU 库（Phase 3a，构建时打包，不依赖运行时 API） */
exports.materials = materials_json_1.default.materials;
/** 大类列表（按数据首见顺序） */
exports.MATERIAL_CATEGORIES = [
    ...new Set(exports.materials.map((m) => m.category)),
];
