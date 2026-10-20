export const BACKEND_CONTRACT_HEADER = "X-Fasapi-Contract";
export const BACKEND_CONTRACT_VERSION_HEADER = "X-Fasapi-Contract-Version";
export const BACKEND_CONTRACT_VERSION = "c-legacy-inspections/1.0.0";
export const DRIVE_CONTRACT_VERSION = BACKEND_CONTRACT_VERSION;

export type BackendProvenance = Readonly<Record<string, unknown>>;
