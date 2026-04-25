import type { AIModel, SemanticProfile } from '@types/index'
import { callAI } from '@lib/ai/providers'
import { hasKey } from '@lib/apiKeys'

const SEMANTIC_SYSTEM_PROMPT = `You are a data semantics analyst. Given a sample of raw, unstructured data, identify its meaning and structure.

Return ONLY valid JSON matching this schema (no markdown, no commentary):
{
  "summary": "1-2 sentence description of what this data is",
  "domain": "finance|sales|hr|legal|tech|healthcare|marketing|operations|general",
  "language": "English|Spanish|French|German|...",
  "recordType": "document|transcript|log|tabular|mixed|other",
  "topics": ["topic1", "topic2"],
  "entities": [
    { "name": "entity name", "type": "PERSON|ORG|DATE|MONEY|PRODUCT|LOCATION|EMAIL|PHONE|URL|OTHER", "confidence": 0.95, "examples": ["example1"] }
  ],
  "inferredSchema": [
    { "name": "field_name", "type": "string|number|date|boolean|array|object", "description": "what this field represents", "examples": ["sample value"] }
  ],
  "quality": {
    "completeness": 0.85,
    "consistency": 0.7,
    "containsPII": true,
    "piiTypes": ["email","phone","name"]
  }
}

Be specific and concise. Identify 3-10 entities and 4-12 schema fields. Confidence values must be 0..1. Numbers must be JSON numbers, not strings.`

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) return text.slice(start, end + 1)
  return text
}

function heuristicProfile(content: string, modelLabel: string): SemanticProfile {
  const sample = content.slice(0, 4000)
  const emails = Array.from(sample.matchAll(/[\w.+-]+@[\w-]+\.[\w.-]+/g)).map(m => m[0])
  const phones = Array.from(sample.matchAll(/\+?\d[\d\s\-().]{7,}\d/g)).map(m => m[0].trim())
  const urls = Array.from(sample.matchAll(/https?:\/\/[^\s)]+/g)).map(m => m[0])
  const dates = Array.from(sample.matchAll(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/g)).map(m => m[0])
  const money = Array.from(sample.matchAll(/[$€£¥]\s?\d[\d,]*(?:\.\d+)?/g)).map(m => m[0])
  const caps = Array.from(sample.matchAll(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g)).map(m => m[1])

  const entities: SemanticProfile['entities'] = []
  const push = (name: string, type: string, examples: string[]) => {
    if (examples.length) entities.push({ name, type, confidence: 0.55, examples: examples.slice(0, 4) })
  }
  push('Email Address', 'EMAIL', Array.from(new Set(emails)))
  push('Phone Number', 'PHONE', Array.from(new Set(phones)))
  push('URL', 'URL', Array.from(new Set(urls)))
  push('Date', 'DATE', Array.from(new Set(dates)))
  push('Monetary Value', 'MONEY', Array.from(new Set(money)))
  push('Proper Noun', 'OTHER', Array.from(new Set(caps)).slice(0, 6))

  const piiTypes: string[] = []
  if (emails.length) piiTypes.push('email')
  if (phones.length) piiTypes.push('phone')
  if (caps.length > 2) piiTypes.push('name')

  return {
    summary: `Heuristic profile of ${content.length.toLocaleString()} characters. AI analysis unavailable — configure an API key for full semantic detection.`,
    domain: 'general',
    language: /[áéíóúñ]/i.test(sample) ? 'Spanish' : /[äöüß]/.test(sample) ? 'German' : 'English',
    recordType: 'document',
    topics: [],
    entities,
    inferredSchema: [
      { name: 'content',   type: 'string', description: 'Raw text body', examples: [sample.slice(0, 80)] },
      { name: 'length',    type: 'number', description: 'Character count', examples: [String(content.length)] },
      { name: 'extracted_at', type: 'date', description: 'When the source was ingested', examples: [new Date().toISOString()] },
    ],
    quality: {
      completeness: content.length > 200 ? 0.7 : 0.4,
      consistency: 0.5,
      containsPII: piiTypes.length > 0,
      piiTypes,
    },
    analyzedAt: new Date().toISOString(),
    modelUsed: `${modelLabel} (heuristic fallback)`,
  }
}

function providerKey(model: AIModel): 'anthropic' | 'google' | 'openai' | 'ollama' {
  switch (model.provider) {
    case 'Anthropic': return 'anthropic'
    case 'Google':    return 'google'
    case 'OpenAI':    return 'openai'
    default:          return 'ollama'
  }
}

export interface AnalyzeOptions {
  content: string
  sourceType: string
  model: AIModel
}

export async function analyzeSemantics({ content, sourceType, model }: AnalyzeOptions): Promise<SemanticProfile> {
  const trimmed = content.slice(0, 12000)
  const provider = providerKey(model)

  if (provider !== 'ollama' && !hasKey(provider)) {
    return heuristicProfile(content, model.name)
  }

  try {
    const result = await callAI(model, {
      systemPrompt: SEMANTIC_SYSTEM_PROMPT,
      userMessage: `Source type: ${sourceType}\n\nSample content (first ${trimmed.length} chars):\n---\n${trimmed}\n---\n\nReturn the JSON profile now.`,
      maxTokens: 2048,
    })
    if (result.error || !result.text) {
      return { ...heuristicProfile(content, model.name), summary: `AI analysis failed: ${result.error ?? 'empty response'}. Using heuristic fallback.` }
    }
    const json = extractJSON(result.text)
    const parsed = JSON.parse(json) as Partial<SemanticProfile>
    return {
      summary: parsed.summary ?? '(no summary)',
      domain: parsed.domain ?? 'general',
      language: parsed.language ?? 'English',
      recordType: parsed.recordType ?? 'document',
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      entities: Array.isArray(parsed.entities) ? parsed.entities : [],
      inferredSchema: Array.isArray(parsed.inferredSchema) ? parsed.inferredSchema : [],
      quality: {
        completeness: parsed.quality?.completeness ?? 0.7,
        consistency:  parsed.quality?.consistency  ?? 0.7,
        containsPII:  parsed.quality?.containsPII  ?? false,
        piiTypes:     parsed.quality?.piiTypes     ?? [],
      },
      analyzedAt: new Date().toISOString(),
      modelUsed: model.name,
    }
  } catch (err) {
    return {
      ...heuristicProfile(content, model.name),
      summary: `AI parse failed: ${err instanceof Error ? err.message : String(err)}. Using heuristic fallback.`,
    }
  }
}
