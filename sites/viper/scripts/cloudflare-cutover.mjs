// One-off, idempotent cutover: bind vipersecurity.ch to the `viper-security`
// Worker as a Cloudflare Workers custom domain.
//
// Order matters: attach first. Only when Cloudflare reports a conflicting DNS
// record does this remove the legacy Infomaniak apex A record (128.65.195.180)
// and retry, so a permission error aborts before the live site loses its origin.
//
// Env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID

const HOST = "vipersecurity.ch";
const SERVICE = "viper-security";
const LEGACY_IP = "128.65.195.180";
const API = "https://api.cloudflare.com/client/v4";

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!token || !accountId) {
  throw new Error(
    "CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required",
  );
}

const baseHeaders = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...baseHeaders, ...(init.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const detail =
      (body.errors ?? []).map((e) => `${e.code}: ${e.message}`).join("; ") ||
      res.statusText;
    const error = new Error(
      `${init.method ?? "GET"} ${path} -> ${res.status} ${detail}`,
    );
    error.status = res.status;
    throw error;
  }
  return body.result;
}

const zones = await api(`/zones?name=${HOST}`);
if (!Array.isArray(zones) || zones.length === 0) {
  throw new Error(`zone ${HOST} is not reachable with this token`);
}
const zoneId = zones[0].id;
console.log(`zone ${HOST}: ${zoneId}`);

function attach() {
  return api(`/accounts/${accountId}/workers/domains`, {
    method: "PUT",
    body: JSON.stringify({
      environment: "production",
      hostname: HOST,
      service: SERVICE,
      zone_id: zoneId,
    }),
  });
}

let domain;
try {
  domain = await attach();
} catch (error) {
  if (!/already exists|conflict/i.test(error.message)) throw error;

  console.log(`attach blocked by an existing record: ${error.message}`);
  const records = await api(`/zones/${zoneId}/dns_records?name=${HOST}`);
  const legacy = records.filter(
    (r) => r.type === "A" && r.content === LEGACY_IP,
  );
  if (legacy.length === 0) {
    const found =
      records.map((r) => `${r.type} ${r.content}`).join(", ") || "none";
    throw new Error(
      `no legacy A record ${LEGACY_IP} to remove (records: ${found})`,
    );
  }
  for (const record of legacy) {
    await api(`/zones/${zoneId}/dns_records/${record.id}`, {
      method: "DELETE",
    });
    console.log(
      `deleted legacy record: ${record.type} ${record.name} -> ${record.content}`,
    );
  }
  domain = await attach();
}

console.log(
  `custom domain: ${domain.hostname} -> ${domain.service} (zone ${domain.zone_name})`,
);

// Verify the edge serves the Worker rather than the old Infomaniak origin.
const checks = [
  `https://${HOST}/`,
  `https://${HOST}/images/cms/hero-black-mercedes-s-class-side.webp`,
];
for (let attempt = 1; attempt <= 12; attempt += 1) {
  const results = [];
  for (const url of checks) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      results.push(`${res.status} ${res.headers.get("server") ?? "?"}`);
      await res.body?.cancel();
    } catch (error) {
      results.push(`error ${error.message}`);
    }
  }
  console.log(
    `check ${attempt}: ${checks.map((u, i) => `${u} -> ${results[i]}`).join(" | ")}`,
  );
  if (results.every((r) => r.startsWith("200") && /cloudflare/i.test(r))) {
    console.log("cutover verified: apex is served by Cloudflare Workers");
    process.exit(0);
  }
  await new Promise((resolve) => setTimeout(resolve, 10_000));
}

console.log(
  "::warning::apex did not answer from Cloudflare within 2 minutes; re-run or check DNS",
);
process.exit(1);
