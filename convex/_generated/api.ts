/* eslint-disable */
// Placeholder — replaced by `npx convex dev` or `npx convex deploy`.
// Uses a Proxy so any property access (e.g. api.hello.hello) returns null safely.
const stub: any = new Proxy({}, { get: () => new Proxy({}, { get: () => null }) });
export const api = stub;
export const internal = stub;
