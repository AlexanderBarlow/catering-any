import { mockAdapter } from "./adapter.mock";
import { httpAdapter } from "./adapter.http";

// Flip this when you’re ready to hit Render:
const USE_MOCK = __DEV__; // set false to force Render in dev

export const api = USE_MOCK ? mockAdapter : httpAdapter;

export type { OverviewRange, OverviewResponse } from "./adapter.mock";
