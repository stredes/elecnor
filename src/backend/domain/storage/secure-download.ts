export type DownloadSource = {
  readonly kind: "file" | "remote";
  readonly value: string;
};

export type DownloadPolicy = {
  readonly root: string;
  readonly allowedRemoteOrigins: readonly string[];
  readonly resolveRealPath: (path: string) => Promise<string>;
};

export async function authorizeDownload(source: DownloadSource, policy: DownloadPolicy): Promise<DownloadSource> {
  if (source.kind === "remote" && allowedRemote(source.value, policy.allowedRemoteOrigins)) return source;
  if (source.kind === "file" && insideRoot(source.value, policy.root) && await resolvesInsideRoot(source.value, policy)) return source;
  throw new Error("Download source is not allowed");
}

export function attachmentName(filename: string | null | undefined): string {
  const clean = (filename ?? "").replace(/[\u0000-\u001f\u007f"\\/]/g, "");
  return clean || "descarga";
}

function insideRoot(candidate: string, root: string): boolean {
  const normalizedCandidate = normalizePath(candidate);
  const normalizedRoot = normalizePath(root);
  return normalizedCandidate !== null && normalizedRoot !== null
    && (normalizedCandidate === normalizedRoot || normalizedCandidate.startsWith(`${normalizedRoot}/`));
}

function normalizePath(value: string): string | null {
  if (!value.startsWith("/")) return null;
  const parts: string[] = [];
  for (const segment of value.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (!parts.length) return null;
      parts.pop();
    } else parts.push(segment);
  }
  return `/${parts.join("/")}`;
}

async function resolvesInsideRoot(candidate: string, policy: DownloadPolicy): Promise<boolean> {
  try {
    const [resolvedCandidate, resolvedRoot] = await Promise.all([
      policy.resolveRealPath(candidate), policy.resolveRealPath(policy.root),
    ]);
    return insideRoot(resolvedCandidate, resolvedRoot);
  } catch {
    return false;
  }
}

function allowedRemote(value: string, origins: readonly string[]): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && origins.includes(url.origin);
  } catch {
    return false;
  }
}
