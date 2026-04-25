export interface SourceType {
  id: string          // key in INFRA_DEFS if wizard exists
  label: string
  category: SourceCategory
  color: string
  icon: string
  description: string
  hasWizard: boolean  // true = INFRA_DEFS[id] exists
  badge?: string      // optional extra tag, e.g. "Popular"
}

export type SourceCategory =
  | 'Unstructured Data'
  | 'Files & Storage'
  | 'SQL Databases'
  | 'NoSQL & Search'
  | 'APIs & Web'
  | 'SaaS Connectors'
  | 'Streaming'
  | 'Cloud Warehouses'

export const SOURCE_CATEGORIES: SourceCategory[] = [
  'Unstructured Data',
  'Files & Storage',
  'SQL Databases',
  'NoSQL & Search',
  'APIs & Web',
  'SaaS Connectors',
  'Streaming',
  'Cloud Warehouses',
]

export const UNSTRUCTURED_TYPE_IDS = new Set<string>([
  'PDF Document', 'Word Document', 'Plain Text', 'Markdown',
  'HTML Page', 'Email (EML)', 'Audio Transcript', 'Image OCR', 'Code Files',
])

export function isUnstructuredType(typeId: string): boolean {
  return UNSTRUCTURED_TYPE_IDS.has(typeId)
}

export const SOURCE_TYPES: SourceType[] = [
  // ── Unstructured Data ──────────────────────────────────────────────────────
  { id: 'PDF Document',      label: 'PDF Document',     category: 'Unstructured Data', color: '#EF4444', icon: '📄', description: 'Reports, contracts, invoices — auto-detect entities and schema', hasWizard: false, badge: 'AI' },
  { id: 'Word Document',     label: 'Word Document',    category: 'Unstructured Data', color: '#2563EB', icon: '📃', description: 'DOCX files — extract structured fields from prose content', hasWizard: false, badge: 'AI' },
  { id: 'Plain Text',        label: 'Plain Text',       category: 'Unstructured Data', color: '#64748B', icon: '📝', description: 'Logs, notes, transcripts — semantic profiling on raw text', hasWizard: false, badge: 'AI' },
  { id: 'Markdown',          label: 'Markdown',         category: 'Unstructured Data', color: '#0EA5E9', icon: '📐', description: 'Knowledge bases and READMEs — section-aware ingestion', hasWizard: false },
  { id: 'HTML Page',         label: 'HTML Page',        category: 'Unstructured Data', color: '#F59E0B', icon: '🌐', description: 'Web pages and blog content — strip boilerplate and extract entities', hasWizard: false },
  { id: 'Email (EML)',       label: 'Email Archive',    category: 'Unstructured Data', color: '#8B5CF6', icon: '✉', description: 'EML/MBOX archives — thread reconstruction with PII detection', hasWizard: false },
  { id: 'Audio Transcript',  label: 'Audio Transcript', category: 'Unstructured Data', color: '#EC4899', icon: '🎙', description: 'Meeting and call transcripts — speaker tagging and topic detection', hasWizard: false },
  { id: 'Image OCR',         label: 'Image (OCR)',      category: 'Unstructured Data', color: '#10B981', icon: '🖼', description: 'Scanned documents and screenshots — OCR + entity extraction', hasWizard: false },
  { id: 'Code Files',        label: 'Code Files',       category: 'Unstructured Data', color: '#22D3EE', icon: '💻', description: 'Source repositories — semantic mapping of modules and APIs', hasWizard: false },

  // ── Files & Storage ────────────────────────────────────────────────────────
  { id: 'Local Files',        label: 'Local Files',           category: 'Files & Storage',   color: '#64748B', icon: '📁', description: 'Read CSV, JSON, Parquet, Excel from a local directory', hasWizard: true },
  { id: 'AWS S3',             label: 'AWS S3',                category: 'Files & Storage',   color: '#FF9900', icon: '🪣', description: 'Read objects from Amazon S3 buckets', hasWizard: true, badge: 'Popular' },
  { id: 'Azure Blob',         label: 'Azure Blob Storage',    category: 'Files & Storage',   color: '#0078D4', icon: '☁', description: 'Read blobs from Azure Storage containers', hasWizard: true },
  { id: 'Google Cloud Storage', label: 'Google Cloud Storage', category: 'Files & Storage',  color: '#4285F4', icon: '🗄', description: 'Read objects from GCS buckets', hasWizard: true },
  { id: 'SFTP',               label: 'SFTP',                  category: 'Files & Storage',   color: '#6366F1', icon: '🔐', description: 'Read files from an SFTP / SSH file server', hasWizard: true },
  { id: 'FTP',                label: 'FTP',                   category: 'Files & Storage',   color: '#8B5CF6', icon: '📡', description: 'Read files from a legacy FTP server', hasWizard: false },

  // ── SQL Databases ──────────────────────────────────────────────────────────
  { id: 'PostgreSQL',         label: 'PostgreSQL',            category: 'SQL Databases',     color: '#336791', icon: '🐘', description: 'Query or stream changes from PostgreSQL via CDC', hasWizard: true, badge: 'Popular' },
  { id: 'MySQL',              label: 'MySQL',                 category: 'SQL Databases',     color: '#00758F', icon: '🐬', description: 'Extract from MySQL or MariaDB databases', hasWizard: true, badge: 'Popular' },
  { id: 'SQL Server',         label: 'SQL Server',            category: 'SQL Databases',     color: '#CC2927', icon: '🟥', description: 'Extract from Microsoft SQL Server or Azure SQL', hasWizard: true },
  { id: 'Oracle',             label: 'Oracle DB',             category: 'SQL Databases',     color: '#F80000', icon: '🔴', description: 'Connect to Oracle Database 12c+', hasWizard: true },
  { id: 'DB2',                label: 'IBM DB2',               category: 'SQL Databases',     color: '#054ADA', icon: '🔵', description: 'Extract from IBM Db2 on-premise or IBM Cloud', hasWizard: true },
  { id: 'Sybase',             label: 'SAP Sybase ASE',        category: 'SQL Databases',     color: '#0080A3', icon: '🔷', description: 'Connect to SAP Adaptive Server Enterprise', hasWizard: true },
  { id: 'SQLite',             label: 'SQLite',                category: 'SQL Databases',     color: '#003B57', icon: '🗃', description: 'Read from a local SQLite database file', hasWizard: false },

  // ── NoSQL & Search ─────────────────────────────────────────────────────────
  { id: 'MongoDB',            label: 'MongoDB',               category: 'NoSQL & Search',    color: '#47A248', icon: '🍃', description: 'Extract documents from MongoDB collections', hasWizard: true, badge: 'Popular' },
  { id: 'Elasticsearch',      label: 'Elasticsearch',         category: 'NoSQL & Search',    color: '#FEC514', icon: '🔍', description: 'Query documents and indices from Elasticsearch', hasWizard: true },
  { id: 'Redis',              label: 'Redis',                 category: 'NoSQL & Search',    color: '#DC382D', icon: '🏎', description: 'Read keys, streams, or pub/sub from Redis', hasWizard: false },
  { id: 'DynamoDB',           label: 'AWS DynamoDB',          category: 'NoSQL & Search',    color: '#FF9900', icon: '⚡', description: 'Scan or stream changes from DynamoDB tables', hasWizard: false },
  { id: 'Cassandra',          label: 'Apache Cassandra',      category: 'NoSQL & Search',    color: '#1287B1', icon: '👁', description: 'Read from wide-column Cassandra tables', hasWizard: false },
  { id: 'Couchbase',          label: 'Couchbase',             category: 'NoSQL & Search',    color: '#EA2328', icon: '🛋', description: 'Extract from Couchbase buckets and collections', hasWizard: false },

  // ── APIs & Web ─────────────────────────────────────────────────────────────
  { id: 'REST API',           label: 'REST API',              category: 'APIs & Web',        color: '#10B981', icon: '🔌', description: 'Pull data from any HTTP/HTTPS REST endpoint', hasWizard: true, badge: 'Popular' },
  { id: 'GraphQL',            label: 'GraphQL',               category: 'APIs & Web',        color: '#E10098', icon: '⬡', description: 'Query a GraphQL API with custom queries', hasWizard: false },
  { id: 'Webhook',            label: 'Webhook',               category: 'APIs & Web',        color: '#7C3AED', icon: '🪝', description: 'Receive HTTP POST events from external systems', hasWizard: false },
  { id: 'RSS/Atom',           label: 'RSS / Atom Feed',       category: 'APIs & Web',        color: '#F97316', icon: '📰', description: 'Ingest news or blog content from RSS/Atom feeds', hasWizard: false },

  // ── SaaS Connectors ────────────────────────────────────────────────────────
  { id: 'Salesforce',         label: 'Salesforce',            category: 'SaaS Connectors',   color: '#00A1E0', icon: '☁', description: 'Extract CRM data from Salesforce objects via API', hasWizard: true, badge: 'Popular' },
  { id: 'Google Sheets',      label: 'Google Sheets',         category: 'SaaS Connectors',   color: '#34A853', icon: '📊', description: 'Read rows from Google Sheets spreadsheets', hasWizard: true },
  { id: 'HubSpot',            label: 'HubSpot',               category: 'SaaS Connectors',   color: '#FF7A59', icon: '🧡', description: 'Extract contacts, deals, and events from HubSpot CRM', hasWizard: false },
  { id: 'Stripe',             label: 'Stripe',                category: 'SaaS Connectors',   color: '#635BFF', icon: '💳', description: 'Sync payments, charges, and subscriptions from Stripe', hasWizard: false },
  { id: 'GitHub',             label: 'GitHub',                category: 'SaaS Connectors',   color: '#24292F', icon: '🐙', description: 'Pull issues, PRs, commits, and repo data from GitHub', hasWizard: false },
  { id: 'Jira',               label: 'Jira / Confluence',     category: 'SaaS Connectors',   color: '#0052CC', icon: '🎯', description: 'Extract issues, sprints, and pages from Atlassian', hasWizard: false },
  { id: 'Notion',             label: 'Notion',                category: 'SaaS Connectors',   color: '#000000', icon: '📝', description: 'Sync databases and pages from Notion workspaces', hasWizard: false },
  { id: 'Shopify',            label: 'Shopify',               category: 'SaaS Connectors',   color: '#96BF48', icon: '🛍', description: 'Sync orders, products, and customers from Shopify', hasWizard: false },

  // ── Streaming ──────────────────────────────────────────────────────────────
  { id: 'Kafka',              label: 'Apache Kafka',          category: 'Streaming',         color: '#3D3D3D', icon: '📨', description: 'Consume events from Kafka topics', hasWizard: true, badge: 'Popular' },
  { id: 'Kinesis',            label: 'AWS Kinesis',           category: 'Streaming',         color: '#FF9900', icon: '🌊', description: 'Consume records from Kinesis Data Streams', hasWizard: true },
  { id: 'Pulsar',             label: 'Apache Pulsar',         category: 'Streaming',         color: '#188FFF', icon: '💫', description: 'Consume messages from Pulsar topics', hasWizard: true },
  { id: 'RabbitMQ',           label: 'RabbitMQ',              category: 'Streaming',         color: '#FF6600', icon: '🐇', description: 'Consume messages from RabbitMQ queues and exchanges', hasWizard: false },
  { id: 'Azure Event Hubs',   label: 'Azure Event Hubs',      category: 'Streaming',         color: '#0078D4', icon: '⚡', description: 'Consume events from Azure Event Hubs (Kafka-compatible)', hasWizard: false },

  // ── Cloud Warehouses (as source) ───────────────────────────────────────────
  { id: 'Snowflake',          label: 'Snowflake',             category: 'Cloud Warehouses',  color: '#29B5E8', icon: '❄️', description: 'Query Snowflake tables as an extraction source', hasWizard: true },
  { id: 'BigQuery',           label: 'Google BigQuery',       category: 'Cloud Warehouses',  color: '#4285F4', icon: '🔵', description: 'Run BigQuery queries and extract result sets', hasWizard: true },
  { id: 'Redshift',           label: 'Amazon Redshift',       category: 'Cloud Warehouses',  color: '#DD344C', icon: '🔴', description: 'Query Redshift clusters and Redshift Serverless', hasWizard: true },
  { id: 'Databricks',         label: 'Databricks',            category: 'Cloud Warehouses',  color: '#FF3621', icon: '⚡', description: 'Query Delta tables from Databricks SQL Warehouses', hasWizard: true },
]

export function getSourceTypesByCategory(category: SourceCategory): SourceType[] {
  return SOURCE_TYPES.filter(s => s.category === category)
}

export function getSourceType(id: string): SourceType | undefined {
  return SOURCE_TYPES.find(s => s.id === id)
}
