"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.casesWithPricing = exports.cases = void 0;
const cases_json_1 = __importDefault(require("../../../data/cases.json"));
exports.cases = cases_json_1.default.cases;
exports.casesWithPricing = exports.cases.filter((c) => c.hard_cost_per_sqm !== null && c.soft_cost_per_sqm !== null);
