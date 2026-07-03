const CF = "https://api.cloudflare.com/client/v4/accounts";

const base = () => `${CF}/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_KV_NAMESPACE_ID}`;
const headers = () => ({ Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` });

export async function kvGet(key) {
  const r = await fetch(`${base()}/values/${encodeURIComponent(key)}`, { headers: headers() });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`kv get failed: ${r.status}`);
  return r.text();
}

export async function kvPut(key, value, ttlSeconds) {
  const url = new URL(`${base()}/values/${encodeURIComponent(key)}`);
  if (ttlSeconds) url.searchParams.set("expiration_ttl", ttlSeconds);
  const r = await fetch(url, {
    method: "PUT",
    headers: { ...headers(), "Content-Type": "text/plain" },
    body: value,
  });
  if (!r.ok) throw new Error(`kv put failed: ${r.status}`);
}
