/**
 * Fallback provider list, mirroring the seed rows in sql/001_schema.sql.
 *
 * Live runs read providers from the database so config can change without a
 * deploy. This list exists so `--dry` works with no database and no keys at
 * all: clone, run, see numbers.
 */

export const DEFAULT_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', edge_url: 'https://api.openai.com/v1/models', edge_method: 'GET', statuspage_url: 'https://status.openai.com/api/v2/summary.json', sort: 10 },
  { id: 'anthropic', name: 'Anthropic', edge_url: 'https://api.anthropic.com/v1/messages', edge_method: 'GET', statuspage_url: 'https://status.claude.com/api/v2/summary.json', sort: 20 },
  { id: 'google', name: 'Google Gemini', edge_url: 'https://generativelanguage.googleapis.com/v1beta/models', edge_method: 'GET', statuspage_url: null, sort: 30 },
  { id: 'groq', name: 'Groq', edge_url: 'https://api.groq.com/openai/v1/models', edge_method: 'GET', statuspage_url: 'https://groqstatus.com/api/v2/summary.json', sort: 40 },
  { id: 'mistral', name: 'Mistral', edge_url: 'https://api.mistral.ai/v1/models', edge_method: 'GET', statuspage_url: null, sort: 50 },
  { id: 'cohere', name: 'Cohere', edge_url: 'https://api.cohere.com/v1/models', edge_method: 'GET', statuspage_url: 'https://status.cohere.com/api/v2/summary.json', sort: 60 },
];
