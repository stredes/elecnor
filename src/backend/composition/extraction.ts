import { DisabledCExtractReader } from "../adapters/outbound/disabled-c-extract-reader";
import { HttpCExtractReader } from "../adapters/outbound/http-c-extract-reader";
import type { CExtractReader } from "../ports/c-extract-reader";

export function createCExtractReader(
  endpoint = process.env.FASTAPI_API_URL,
  fetcher?: typeof fetch,
): CExtractReader {
  if (!endpoint) return new DisabledCExtractReader();
  return new HttpCExtractReader(endpoint, fetcher ?? fetch);
}
