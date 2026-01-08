import { mockAdapter } from "./adapter.mock";

// Later, swap this to httpAdapter (real calls to catering-api)
export const api = mockAdapter;

export type { OverviewRange, OverviewResponse } from "./adapter.mock";
