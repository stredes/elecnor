import { DisabledCExtractReader } from "../adapters/outbound/disabled-c-extract-reader";
import { HttpCExtractReader } from "../adapters/outbound/http-c-extract-reader";
import type { CExtractReader } from "../ports/c-extract-reader";
import { resolveBackendSelection } from "./backend-config";

export function createCExtractReader(
  endpoint = process.env.FASTAPI_API_URL,
  fetcher?: typeof fetch,
): CExtractReader {
  if (!endpoint) return new DisabledCExtractReader();
  const selection = resolveBackendSelection({ ...process.env, FASTAPI_API_URL: endpoint });
  if (selection.mode !== "http" || !selection.url) return new DisabledCExtractReader();
  return new HttpCExtractReader(selection.url, fetcher ?? fetch, selection.paths.extract, {
    contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs,
  });
}
