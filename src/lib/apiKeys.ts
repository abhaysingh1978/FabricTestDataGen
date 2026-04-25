const STORAGE_KEYS = {
  anthropic: 'aethon_key_anthropic',
  google:    'aethon_key_google',
  openai:    'aethon_key_openai',
  ollama:    'aethon_ollama_url',
} as const

export type ProviderKey = keyof typeof STORAGE_KEYS

export interface APIKeys {
  anthropic: string
  google:    string
  openai:    string
  ollama:    string
}

function lsGet(key: string): string {
  try { return localStorage.getItem(key) ?? '' } catch { return '' }
}

function lsSet(key: string, val: string) {
  try {
    if (val) localStorage.setItem(key, val)
    else localStorage.removeItem(key)
  } catch { /* storage unavailable */ }
}

export function getAPIKeys(): APIKeys {
  return {
    anthropic: lsGet(STORAGE_KEYS.anthropic) || import.meta.env.VITE_ANTHROPIC_API_KEY || '',
    google:    lsGet(STORAGE_KEYS.google)    || import.meta.env.VITE_GOOGLE_API_KEY    || '',
    openai:    lsGet(STORAGE_KEYS.openai)    || import.meta.env.VITE_OPENAI_API_KEY    || '',
    ollama:    lsGet(STORAGE_KEYS.ollama)    || import.meta.env.VITE_OLLAMA_BASE_URL   || 'http://localhost:11434',
  }
}

export function saveAPIKeys(keys: Partial<APIKeys>) {
  if (keys.anthropic !== undefined) lsSet(STORAGE_KEYS.anthropic, keys.anthropic)
  if (keys.google    !== undefined) lsSet(STORAGE_KEYS.google,    keys.google)
  if (keys.openai    !== undefined) lsSet(STORAGE_KEYS.openai,    keys.openai)
  if (keys.ollama    !== undefined) lsSet(STORAGE_KEYS.ollama,    keys.ollama)
}

export function getKey(provider: ProviderKey): string {
  return getAPIKeys()[provider]
}

export function hasKey(provider: ProviderKey): boolean {
  const v = getAPIKeys()[provider]
  return !!v && v.length > 0
}
