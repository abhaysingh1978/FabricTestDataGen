import { useState, useCallback } from 'react'
import { COLORS } from '@lib/theme'
import { SOURCE_TYPES } from '@data/sourceTypes'
import { analyzeSemantics } from '@lib/semantics'
import { extractFile, acceptForType } from '@lib/fileExtract'
import { AI_MODELS, DEFAULT_MODEL } from '@data/models'

const FLAT_MODELS = [...AI_MODELS.cloud, ...AI_MODELS.local]
import type { DataSource, SemanticProfile, SemanticEntity, SemanticField, SignoffRecord, AIModel } from '@types/index'

interface Props {
  source: DataSource
  onSave: (updated: DataSource) => void
  onCancel: () => void
}

type Step = 'content' | 'analyzing' | 'review' | 'signoff'

const SAMPLE_PRESETS: Record<string, string> = {
  'Plain Text': `Q4 2025 Earnings Call — Acme Corp · Date: 2026-01-15
Participants: John Smith (CEO), Mary Johnson (CFO), Analyst Q&A

CEO Smith: We delivered $4.2B in revenue, up 18% YoY, driven by strong demand
in our cloud segment. Operating margin expanded to 27%, our highest ever.
Customers like JPMorgan and BMW renewed multi-year contracts.

CFO Johnson: Free cash flow was $1.1B. We returned $800M via buybacks and
declared a quarterly dividend of $0.42/share. Guidance for FY26: revenue
growth of 14-16%, with margin expansion of 100-150 bps.

Q: What about regulatory headwinds in the EU?
CEO: We're investing $50M to ensure GDPR and DMA compliance. No material impact expected.`,
  'Email (EML)': `From: sarah.lee@example.com
To: support@vendor.io
Date: 2026-04-15
Subject: Issue with invoice INV-2024-0042

Hi team,

I noticed a discrepancy on invoice INV-2024-0042 dated April 1st. The total
shows $12,450 but the line items only sum to $11,950. Could you reconcile?

My contact is +1-415-555-0142.

Thanks,
Sarah Lee
VP Finance, ContosoCorp`,
  'PDF Document': `MASTER SERVICES AGREEMENT
This Agreement is made on March 12, 2026 between Aethon Holdings Inc.
("Provider") and Globex Corporation ("Customer").

1. SERVICES. Provider shall deliver the analytics platform described in
Exhibit A for an annual fee of $480,000 USD, payable quarterly.

2. TERM. This Agreement is effective for 36 months from the Effective Date.

3. CONFIDENTIALITY. Each party shall protect the other's Confidential
Information using reasonable care. Customer Personal Data is governed by
the Data Processing Addendum.

4. LIABILITY. Aggregate liability is limited to fees paid in the 12 months
preceding the claim. Indirect damages are excluded.`,
}

function smallButton(color: string, primary = false): React.CSSProperties {
  return {
    fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
    color: primary ? '#fff' : color,
    background: primary ? color : `${color}14`,
    border: primary ? 'none' : `1px solid ${color}55`,
    borderRadius: 6, padding: '6px 12px', cursor: 'pointer',
    transition: 'all 0.15s',
  }
}

function StepDot({ idx, label, active, done, color }: { idx: number; label: string; active: boolean; done: boolean; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        background: done ? color : active ? `${color}33` : COLORS.bgCard,
        border: `1px solid ${active || done ? color : COLORS.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontSize: 9, fontWeight: 700,
        color: done ? '#fff' : active ? color : COLORS.textMuted,
      }}>
        {done ? '✓' : idx}
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: active ? 700 : 400, color: active || done ? color : COLORS.textMuted }}>
        {label}
      </span>
    </div>
  )
}

export function UnstructuredIngestion({ source, onSave, onCancel }: Props) {
  const typeInfo = SOURCE_TYPES.find(t => t.id === source.type)
  const color = typeInfo?.color ?? COLORS.accent
  const [step, setStep] = useState<Step>(source.semantics ? 'review' : 'content')
  const [name, setName] = useState(source.name)
  const [content, setContent] = useState(source.sampleContent ?? SAMPLE_PRESETS[source.type] ?? '')
  const [model, setModel] = useState<AIModel>(DEFAULT_MODEL)
  const [profile, setProfile] = useState<SemanticProfile | null>(source.semantics ?? null)
  const [error, setError] = useState<string | null>(null)
  const [signoffName, setSignoffName] = useState(source.signoff?.signedBy ?? '')
  const [signoffNotes, setSignoffNotes] = useState(source.signoff?.notes ?? '')

  const runAnalysis = useCallback(async () => {
    if (!content.trim()) { setError('Please provide content to analyze'); return }
    setError(null)
    setStep('analyzing')
    try {
      const result = await analyzeSemantics({ content, sourceType: source.type, model })
      setProfile(result)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStep('content')
    }
  }, [content, source.type, model])

  function persist(signoff: SignoffRecord | undefined) {
    if (!profile) return
    onSave({
      ...source,
      name: name.trim() || source.type,
      isUnstructured: true,
      sampleContent: content,
      semantics: profile,
      signoff,
    })
  }

  function updateProfile(patch: Partial<SemanticProfile>) {
    if (!profile) return
    setProfile({ ...profile, ...patch })
  }

  function updateEntity(idx: number, patch: Partial<SemanticEntity>) {
    if (!profile) return
    const next = profile.entities.map((e, i) => i === idx ? { ...e, ...patch } : e)
    setProfile({ ...profile, entities: next })
  }

  function removeEntity(idx: number) {
    if (!profile) return
    setProfile({ ...profile, entities: profile.entities.filter((_, i) => i !== idx) })
  }

  function addEntity() {
    if (!profile) return
    setProfile({ ...profile, entities: [...profile.entities, { name: 'New entity', type: 'OTHER', confidence: 0.5, examples: [] }] })
  }

  function updateField(idx: number, patch: Partial<SemanticField>) {
    if (!profile) return
    const next = profile.inferredSchema.map((f, i) => i === idx ? { ...f, ...patch } : f)
    setProfile({ ...profile, inferredSchema: next })
  }

  function removeField(idx: number) {
    if (!profile) return
    setProfile({ ...profile, inferredSchema: profile.inferredSchema.filter((_, i) => i !== idx) })
  }

  function addField() {
    if (!profile) return
    setProfile({ ...profile, inferredSchema: [...profile.inferredSchema, { name: 'new_field', type: 'string', description: '', examples: [] }] })
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
    >
      <div style={{
        width: 920, maxWidth: '96vw', height: '88vh',
        display: 'flex', flexDirection: 'column',
        background: COLORS.bgPanel,
        border: `1px solid ${color}55`,
        borderRadius: 14,
        boxShadow: `0 0 60px ${color}22`,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{typeInfo?.icon ?? '📄'}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: COLORS.text }}>Ingest Unstructured Source · {source.type}</span>
          </div>
          <button onClick={onCancel} style={{ fontFamily: 'monospace', fontSize: 14, color: COLORS.textMuted, background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Stepper */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', gap: 18, flexShrink: 0, background: COLORS.bgCard }}>
          <StepDot idx={1} label="Content" active={step === 'content' || step === 'analyzing'} done={step === 'review' || step === 'signoff'} color={color} />
          <span style={{ color: COLORS.border }}>━</span>
          <StepDot idx={2} label="Detect Semantics" active={step === 'analyzing'} done={step === 'review' || step === 'signoff'} color={color} />
          <span style={{ color: COLORS.border }}>━</span>
          <StepDot idx={3} label="Verify" active={step === 'review'} done={step === 'signoff'} color={color} />
          <span style={{ color: COLORS.border }}>━</span>
          <StepDot idx={4} label="Sign Off" active={step === 'signoff'} done={false} color={color} />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {step === 'content' && (
            <ContentStep
              sourceType={source.type}
              name={name} setName={setName}
              content={content} setContent={setContent}
              model={model} setModel={setModel}
              error={error} setError={setError}
              color={color}
              onAnalyze={runAnalysis}
              onCancel={onCancel}
            />
          )}

          {step === 'analyzing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${color}33`, borderTop: `3px solid ${color}`, animation: 'spin 1s linear infinite' }} />
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.textDim }}>Detecting semantics with {model.name}…</div>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: COLORS.textMuted }}>extracting entities · inferring schema · scoring quality</div>
              <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {step === 'review' && profile && (
            <ReviewStep
              profile={profile}
              color={color}
              onUpdateProfile={updateProfile}
              onUpdateEntity={updateEntity}
              onRemoveEntity={removeEntity}
              onAddEntity={addEntity}
              onUpdateField={updateField}
              onRemoveField={removeField}
              onAddField={addField}
              onReanalyze={runAnalysis}
              onContinue={() => setStep('signoff')}
              onBack={() => setStep('content')}
            />
          )}

          {step === 'signoff' && profile && (
            <SignoffStep
              profile={profile}
              color={color}
              signoffName={signoffName} setSignoffName={setSignoffName}
              signoffNotes={signoffNotes} setSignoffNotes={setSignoffNotes}
              onApprove={() => persist({
                status: 'verified',
                signedBy: signoffName.trim() || 'Anonymous',
                signedAt: new Date().toISOString(),
                notes: signoffNotes.trim() || undefined,
              })}
              onReject={() => persist({
                status: 'rejected',
                signedBy: signoffName.trim() || 'Anonymous',
                signedAt: new Date().toISOString(),
                notes: signoffNotes.trim() || undefined,
              })}
              onBack={() => setStep('review')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Step 1: Content ──────────────────────────────────────────────────────────

function ContentStep({
  sourceType, name, setName, content, setContent, model, setModel, error, setError, color, onAnalyze, onCancel,
}: {
  sourceType: string
  name: string; setName: (v: string) => void
  content: string; setContent: (v: string) => void
  model: AIModel; setModel: (m: AIModel) => void
  error: string | null; setError: (v: string | null) => void
  color: string
  onAnalyze: () => void
  onCancel: () => void
}) {
  const [extracting, setExtracting] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setExtracting(true)
    setWarning(null)
    setError(null)
    setFilename(file.name)
    try {
      const result = await extractFile(file)
      if (result.text) setContent(result.text)
      if (result.warning) setWarning(result.warning)
      if (!result.text && result.warning) setError(result.warning)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setExtracting(false)
      e.target.value = ''
    }
  }

  const accept = acceptForType(sourceType)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.textDim, display: 'block', marginBottom: 6 }}>Source Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Q4 Earnings Calls"
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 11, color: COLORS.text, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '8px 10px', outline: 'none' }}
        />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.textDim }}>Sample Content (paste or upload)</label>
          <label style={{ fontFamily: 'monospace', fontSize: 9, color, cursor: extracting ? 'wait' : 'pointer', background: `${color}14`, border: `1px solid ${color}44`, borderRadius: 4, padding: '3px 8px', opacity: extracting ? 0.6 : 1 }}>
            {extracting ? '⏳ Extracting…' : `↑ Upload file (${accept})`}
            <input type="file" accept={accept} style={{ display: 'none' }} onChange={onFileChange} disabled={extracting} />
          </label>
        </div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste a representative sample of the unstructured content. The semantic analyzer will use this to infer entities, schema, and quality."
          style={{
            width: '100%', minHeight: 240, fontFamily: 'monospace', fontSize: 10,
            color: COLORS.text, background: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '10px 12px', outline: 'none',
            resize: 'vertical', lineHeight: 1.55,
          }}
        />
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: COLORS.textMuted, marginTop: 4 }}>
          {filename && <span style={{ color }}>📎 {filename} · </span>}
          {content.length.toLocaleString()} characters · first 12,000 sent for analysis
        </div>
        {warning && (
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: COLORS.accentWarn, background: `${COLORS.accentWarn}10`, border: `1px solid ${COLORS.accentWarn}44`, borderRadius: 5, padding: '6px 10px', marginTop: 6 }}>
            ⚠ {warning}
          </div>
        )}
      </div>

      <div>
        <label style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.textDim, display: 'block', marginBottom: 6 }}>Analyzer Model</label>
        <select
          value={model.id}
          onChange={e => { const m = FLAT_MODELS.find(x => x.id === e.target.value); if (m) setModel(m) }}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 11, color: COLORS.text, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '8px 10px', outline: 'none' }}
        >
          {FLAT_MODELS.map(m => (
            <option key={m.id} value={m.id}>{m.name} · {m.provider}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.accentDanger, background: `${COLORS.accentDanger}10`, border: `1px solid ${COLORS.accentDanger}44`, borderRadius: 5, padding: '8px 10px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <button onClick={onCancel} style={smallButton(COLORS.textMuted)}>Cancel</button>
        <button onClick={onAnalyze} disabled={!content.trim()} style={{ ...smallButton(color, true), opacity: content.trim() ? 1 : 0.5 }}>
          Analyze Semantics →
        </button>
      </div>
    </div>
  )
}

// ── Step 2: Review ───────────────────────────────────────────────────────────

function ReviewStep({
  profile, color,
  onUpdateProfile, onUpdateEntity, onRemoveEntity, onAddEntity,
  onUpdateField, onRemoveField, onAddField,
  onReanalyze, onContinue, onBack,
}: {
  profile: SemanticProfile
  color: string
  onUpdateProfile: (patch: Partial<SemanticProfile>) => void
  onUpdateEntity: (idx: number, patch: Partial<SemanticEntity>) => void
  onRemoveEntity: (idx: number) => void
  onAddEntity: () => void
  onUpdateField: (idx: number, patch: Partial<SemanticField>) => void
  onRemoveField: (idx: number) => void
  onAddField: () => void
  onReanalyze: () => void
  onContinue: () => void
  onBack: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <Stat label="Domain" value={profile.domain} color={color} />
        <Stat label="Record Type" value={profile.recordType} color={color} />
        <Stat label="Language" value={profile.language} color={color} />
        <Stat label="Model" value={profile.modelUsed} color={color} small />
      </div>

      {/* Summary (editable) */}
      <Section title="Summary" color={color}>
        <textarea
          value={profile.summary}
          onChange={e => onUpdateProfile({ summary: e.target.value })}
          style={editableStyle(60)}
        />
      </Section>

      {/* Topics */}
      <Section title="Topics" color={color}>
        <input
          value={profile.topics.join(', ')}
          onChange={e => onUpdateProfile({ topics: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="comma-separated topics"
          style={{ ...editableStyle(0), height: 'auto', padding: '8px 10px' }}
        />
      </Section>

      {/* Entities */}
      <Section
        title={`Entities (${profile.entities.length})`}
        color={color}
        action={<button onClick={onAddEntity} style={smallButton(color)}>+ Add</button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {profile.entities.length === 0 && <Empty text="No entities detected" />}
          {profile.entities.map((e, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.6fr 1.6fr 24px', gap: 6, alignItems: 'center' }}>
              <input value={e.name} onChange={ev => onUpdateEntity(i, { name: ev.target.value })} style={cellStyle()} />
              <select value={e.type} onChange={ev => onUpdateEntity(i, { type: ev.target.value })} style={cellStyle()}>
                {['PERSON','ORG','DATE','MONEY','PRODUCT','LOCATION','EMAIL','PHONE','URL','OTHER'].map(t => <option key={t}>{t}</option>)}
              </select>
              <input type="number" min={0} max={1} step={0.05} value={e.confidence} onChange={ev => onUpdateEntity(i, { confidence: Number(ev.target.value) })} style={cellStyle()} />
              <input value={e.examples.join(', ')} onChange={ev => onUpdateEntity(i, { examples: ev.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="examples" style={cellStyle()} />
              <button onClick={() => onRemoveEntity(i)} style={{ ...smallButton(COLORS.accentDanger), padding: '3px 6px', fontSize: 11 }}>✕</button>
            </div>
          ))}
        </div>
      </Section>

      {/* Schema */}
      <Section
        title={`Inferred Schema (${profile.inferredSchema.length})`}
        color={color}
        action={<button onClick={onAddField} style={smallButton(color)}>+ Add Field</button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {profile.inferredSchema.length === 0 && <Empty text="No schema fields inferred" />}
          {profile.inferredSchema.map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 1.6fr 1.2fr 24px', gap: 6, alignItems: 'center' }}>
              <input value={f.name} onChange={ev => onUpdateField(i, { name: ev.target.value })} style={cellStyle()} />
              <select value={f.type} onChange={ev => onUpdateField(i, { type: ev.target.value as SemanticField['type'] })} style={cellStyle()}>
                {(['string','number','date','boolean','array','object'] as const).map(t => <option key={t}>{t}</option>)}
              </select>
              <input value={f.description} onChange={ev => onUpdateField(i, { description: ev.target.value })} placeholder="description" style={cellStyle()} />
              <input value={f.examples.join(', ')} onChange={ev => onUpdateField(i, { examples: ev.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="examples" style={cellStyle()} />
              <button onClick={() => onRemoveField(i)} style={{ ...smallButton(COLORS.accentDanger), padding: '3px 6px', fontSize: 11 }}>✕</button>
            </div>
          ))}
        </div>
      </Section>

      {/* Quality */}
      <Section title="Data Quality" color={color}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <QualityBar label="Completeness" value={profile.quality.completeness} color={color} />
          <QualityBar label="Consistency"  value={profile.quality.consistency}  color={color} />
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 4,
            padding: '8px 10px',
            background: profile.quality.containsPII ? `${COLORS.accentWarn}10` : COLORS.bgCard,
            border: `1px solid ${profile.quality.containsPII ? COLORS.accentWarn + '55' : COLORS.border}`,
            borderRadius: 6,
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: COLORS.textMuted }}>PII Detected</span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: profile.quality.containsPII ? COLORS.accentWarn : COLORS.accent3 }}>
              {profile.quality.containsPII ? `Yes · ${profile.quality.piiTypes.join(', ') || 'unspecified'}` : 'None detected'}
            </span>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 4 }}>
        <button onClick={onBack} style={smallButton(COLORS.textMuted)}>← Back</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onReanalyze} style={smallButton(COLORS.accent2)}>↻ Re-analyze</button>
          <button onClick={onContinue} style={smallButton(color, true)}>Continue to Sign Off →</button>
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Sign Off ─────────────────────────────────────────────────────────

function SignoffStep({
  profile, color, signoffName, setSignoffName, signoffNotes, setSignoffNotes,
  onApprove, onReject, onBack,
}: {
  profile: SemanticProfile
  color: string
  signoffName: string; setSignoffName: (v: string) => void
  signoffNotes: string; setSignoffNotes: (v: string) => void
  onApprove: () => void
  onReject: () => void
  onBack: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, margin: '0 auto', paddingTop: 8 }}>
      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: COLORS.text }}>
        Verify and Sign Off
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.textDim, lineHeight: 1.6 }}>
        By signing off, you confirm that the semantic profile correctly represents this source. The pipeline will use this profile to map ingested records into the downstream schema. Rejecting marks the source as unreliable — the pipeline will skip it.
      </div>

      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Row label="Domain"        value={profile.domain} />
        <Row label="Record Type"   value={profile.recordType} />
        <Row label="Entities"      value={String(profile.entities.length)} />
        <Row label="Schema Fields" value={String(profile.inferredSchema.length)} />
        <Row label="Topics"        value={String(profile.topics.length)} />
        <Row label="PII"           value={profile.quality.containsPII ? `Yes · ${profile.quality.piiTypes.join(', ')}` : 'None'} warn={profile.quality.containsPII} />
        <Row label="Quality"       value={`${Math.round(profile.quality.completeness * 100)}% complete · ${Math.round(profile.quality.consistency * 100)}% consistent`} />
      </div>

      <div>
        <label style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.textDim, display: 'block', marginBottom: 6 }}>Your Name</label>
        <input
          value={signoffName}
          onChange={e => setSignoffName(e.target.value)}
          placeholder="e.g. Jane Doe (Pre-Sales Engineer)"
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 11, color: COLORS.text, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '8px 10px', outline: 'none' }}
        />
      </div>
      <div>
        <label style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.textDim, display: 'block', marginBottom: 6 }}>Notes (optional)</label>
        <textarea
          value={signoffNotes}
          onChange={e => setSignoffNotes(e.target.value)}
          placeholder="Any caveats, scope notes, or follow-up items"
          style={{ width: '100%', minHeight: 80, fontFamily: 'monospace', fontSize: 10, color: COLORS.text, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '10px 12px', outline: 'none', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={onBack} style={smallButton(COLORS.textMuted)}>← Back</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onReject} style={smallButton(COLORS.accentDanger)}>Reject Source</button>
          <button onClick={onApprove} style={smallButton(COLORS.accent3, true)}>✓ Sign Off & Save</button>
        </div>
      </div>
    </div>
  )
}

// ── Small helpers ────────────────────────────────────────────────────────────

function Section({ title, color, action, children }: { title: string; color: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  )
}

function Stat({ label, value, color, small }: { label: string; value: string; color: string; small?: boolean }) {
  return (
    <div style={{ background: COLORS.bgCard, border: `1px solid ${color}33`, borderRadius: 7, padding: '8px 10px' }}>
      <div style={{ fontFamily: 'monospace', fontSize: 8, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontFamily: 'monospace', fontSize: small ? 9 : 12, fontWeight: 700, color: COLORS.text, marginTop: 3, textTransform: small ? 'none' : 'capitalize' }}>{value}</div>
    </div>
  )
}

function QualityBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100)
  return (
    <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: COLORS.textMuted }}>{label}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: COLORS.text }}>{pct}%</span>
      </div>
      <div style={{ width: '100%', height: 5, background: COLORS.bg, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 10 }}>
      <span style={{ color: COLORS.textMuted }}>{label}</span>
      <span style={{ color: warn ? COLORS.accentWarn : COLORS.text, fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.textMuted, padding: '12px', textAlign: 'center', background: COLORS.bgCard, border: `1px dashed ${COLORS.border}`, borderRadius: 6 }}>
      {text}
    </div>
  )
}

function cellStyle(): React.CSSProperties {
  return { fontFamily: 'monospace', fontSize: 10, color: COLORS.text, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 5, padding: '5px 8px', outline: 'none', minWidth: 0 }
}

function editableStyle(minHeight: number): React.CSSProperties {
  return { width: '100%', minHeight: minHeight || undefined, fontFamily: 'monospace', fontSize: 10, color: COLORS.text, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '8px 10px', outline: 'none', resize: 'vertical', lineHeight: 1.5 }
}
