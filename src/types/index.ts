export interface AIModel {
  id: string
  name: string
  provider: 'Anthropic' | 'Google' | 'OpenAI' | 'Local'
  tag: string
  color: string
}

export interface ETLConfig {
  batchSize: number
  refreshInterval: number
  parallelAgents: number
  vectorStore: string
  dataWarehouse: string
  streamProcessor: string
}

export interface DataSource {
  id: string
  name: string
  type: string          // matches INFRA_DEFS key or sourceTypes id
  flowId: string        // caseKey or 'global'
  enabled: boolean
  config: Record<string, string>
  createdAt: string
  // Unstructured ingestion + semantics + signoff
  isUnstructured?: boolean
  sampleContent?: string
  semantics?: SemanticProfile
  signoff?: SignoffRecord
}

export interface SemanticEntity {
  name: string
  type: string         // PERSON | ORG | DATE | MONEY | PRODUCT | LOCATION | EMAIL | PHONE | OTHER
  confidence: number   // 0..1
  examples: string[]
}

export interface SemanticField {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object'
  description: string
  examples: string[]
}

export interface SemanticProfile {
  summary: string
  domain: string                // finance | sales | hr | legal | tech | general | ...
  language: string
  recordType: 'document' | 'transcript' | 'log' | 'tabular' | 'mixed' | 'other'
  topics: string[]
  entities: SemanticEntity[]
  inferredSchema: SemanticField[]
  quality: {
    completeness: number        // 0..1
    consistency: number         // 0..1
    containsPII: boolean
    piiTypes: string[]
  }
  analyzedAt: string
  modelUsed: string
}

export interface SignoffRecord {
  status: 'verified' | 'rejected'
  signedBy: string
  signedAt: string
  notes?: string
}

export interface KPI {
  l: string
  v: string
  d?: string
}

export interface UseCase {
  label: string
  icon: string
  desc: string
  datasets: string[]
  agents: string[]
  kpis: KPI[]
  caseKey: string
}

export interface Category {
  label: string
  icon: string
  color: string
  sub: Record<string, UseCase>
}

export interface AppState {
  category: string
  sub: string
  configOpen: boolean
  model: AIModel
  etl: ETLConfig
  running: boolean
  logs: string[]
  activeStage: 0 | 1 | 2 | 3 | 4 | 5
  activeAgents: number[]
  logIdx: number
  records: number
  throughput: number
  aiResponse: string
  aiLoading: boolean
  aiQuery: string
}

export enum PipelineStage {
  Extract = 0,
  Validate = 1,
  Transform = 2,
  Aggregate = 3,
  Load = 4,
  Index = 5,
}

export interface AgentMessage {
  messageId: string
  fromAgent: string
  toAgent: string
  messageType: string
  payload: unknown
  createdAt: string
}
