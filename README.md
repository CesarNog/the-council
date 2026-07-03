# The Council

Nove versões alternativas de você debatem uma decisão real. Vite + React no frontend, serverless functions na Vercel, inference via Groq (free tier), persistência de resultados em Cloudflare KV.

Produção: https://the-council-murex.vercel.app
Repo: https://github.com/CesarNog/the-council (linkado — push em `main` dispara deploy automático)

## Rodar local

```
npm install
cp .env.example .env.local   # preencher as 4 vars — ver secao Env vars
npm run dev
```

Serverless functions (`api/*.js`) so rodam de fato em `vercel dev`, nao em `npm run dev` puro (Vite nao executa `/api`). Pra testar o backend local:

```
npx vercel dev
```

## Deploy

```
npx vercel deploy --prod
```

Requer as env vars configuradas no projeto Vercel (`vercel env add`).

## Env vars obrigatórias

| var | de onde vem | pra que serve |
|---|---|---|
| `GROQ_API_KEY` | console.groq.com/keys | inference do debate (`api/council.js`) |
| `CLOUDFLARE_API_TOKEN` | dash.cloudflare.com > API Tokens > template "Edit Cloudflare Workers" | KV read/write |
| `CLOUDFLARE_ACCOUNT_ID` | `cloudflare accounts` na dashboard | escopo do KV |
| `CLOUDFLARE_KV_NAMESPACE_ID` | criado via `wrangler kv namespace create` ou API | namespace onde resultados/rate-limit ficam |

Ver `.env.example`.

## Arquitetura

```
src/
  lib/personas.js   dados: 9 personas, cores, mood colors, timing de reveal
  lib/api.js        chamada pro backend + fallback offline (DEMO_Q, FALLBACK)
  lib/share.js       tally/headline/share text/canvas PNG — logica pura, sem React
  components.jsx     toda a UI: Ring, Landing, Onboarding, Chamber, ShareBar, ErrorBoundary
  App.jsx            so orquestracao de rotas (landing/onboarding/chamber/shared)
  styles.css         CSS global

api/
  _kv.js       helper REST pro Cloudflare KV (nao e rota, prefixo _ e ignorado pela Vercel)
  council.js   POST — gera debate via Groq, persiste no KV, aplica rate limit
  result.js    GET  — recupera debate persistido por id (alimenta /r/:id)
```

## Limitações conhecidas (nao maquiadas)

- **TPM da Groq é por organização, não por usuário.** Free tier: 8000 tokens/min compartilhado por todo o tráfego do site. Cada debate consome ~2100 tokens. Na prática: **~3 debates/min agregados, de todos os usuários simultâneos**. Acima disso, 429 → frontend cai no fallback offline estático automaticamente (nunca quebra a UI, mas degrada a experiência).
- **Rate limit por IP (KV) é best-effort, não atômico.** Sob concorrência alta pode passar um pouco do limite configurado (`RATE_LIMIT` em `api/council.js`). Não protege contra o teto agregado da Groq acima.
- **Sem testes automatizados.** `councilHeadline()` foi validado manualmente com casos sintéticos, não há suite persistente.
- **Sem CI/CD.** Deploy é manual (`vercel deploy --prod`).
- **Sem Git/histórico de versão neste ambiente** — recomendado inicializar repo antes de qualquer trabalho colaborativo.
- **Canvas do share card (`downloadShareCard`) depende de fontes já carregadas no browser** — não validado visualmente em produção, só a lógica de layout.
