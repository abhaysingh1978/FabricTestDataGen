import { useState, useCallback } from 'react'
import { COLORS } from '@lib/theme'
import { DEMOS } from '@data/usecases'
import { SOURCE_TYPES, SOURCE_CATEGORIES, type SourceCategory, isUnstructuredType } from '@data/sourceTypes'
import { getSources, saveSources, toggleSource, deleteSource, updateSource, makeId } from '@lib/dataSources'
import { INFRA_DEFS } from '@data/infraConfig'
import { InfraWizard } from './InfraWizard'
import { UnstructuredIngestion } from './UnstructuredIngestion'
import type { DataSource } from '@types/index'

interface DataSourceManagerProps {
  onClose: () => void
}

// Build flat list of flows from DEMOS
interface Flow { id: string; label: string; category: string; categoryColor: string }

function buildFlows(): Flow[] {
  const flows: Flow[] = [{ id: 'global', label: 'Global', category: '', categoryColor: COLORS.accent }]
  for (const [catKey, cat] of Object.entries(DEMOS)) {
    for (const [, uc] of Object.entries(cat.sub)) {
      flows.push({ id: uc.caseKey, label: uc.label, category: cat.label, categoryColor: cat.color })
    }
  }
  return flows
}

const FLOWS = buildFlows()

// ── Source type picker ────────────────────────────────────────────────────────

interface TypePickerProps {
  onPick: (typeId: string) => void
  onCancel: () => void
}

function SourceTypePicker({ onPick, onCancel }: TypePickerProps) {
  const [activeCategory, setActiveCategory] = useState<SourceCategory | 'All'>('All')

  const visible = activeCategory === 'All'
    ? SOURCE_TYPES
    : SOURCE_TYPES.filter(s => s.category === activeCategory)

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: COLORS.bgPanel,
      display: 'flex', flexDirection: 'column',
      zIndex: 10,
    }}>
      {/* Picker header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: COLORS.text }}>
          Choose Source Type
        </span>
        <button onClick={onCancel} style={{ fontFamily: 'monospace', fontSize: 13, color: COLORS.textMuted, background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 20px', flexWrap: 'wrap', flexShrink: 0, borderBottom: `1px solid ${COLORS.border}` }}>
        {(['All', ...SOURCE_CATEGORIES] as Array<SourceCategory | 'All'>).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              fontFamily: 'monospace', fontSize: 9, fontWeight: activeCategory === cat ? 700 : 400,
              color: activeCategory === cat ? COLORS.accent : COLORS.textDim,
              background: activeCategory === cat ? `${COLORS.accent}14` : COLORS.bgCard,
              border: `1px solid ${activeCategory === cat ? COLORS.accent + '66' : COLORS.border}`,
              borderRadius: 5, padding: '4px 10px', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Type grid */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 20px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10,
        alignContent: 'start',
      }}>
        {visible.map(t => (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5,
              padding: '10px 12px', textAlign: 'left',
              background: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8, cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = t.color
              el.style.boxShadow = `0 0 0 1px ${t.color}44`
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = COLORS.border
              el.style.boxShadow = 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%' }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: COLORS.text, flex: 1 }}>
                {t.label}
              </span>
              {t.badge && (
                <span style={{ fontFamily: 'monospace', fontSize: 8, color: t.color, background: `${t.color}18`, border: `1px solid ${t.color}44`, borderRadius: 3, padding: '1px 5px' }}>
                  {t.badge}
                </span>
              )}
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: COLORS.textMuted, lineHeight: 1.5 }}>
              {t.description}
            </span>
            {!t.hasWizard && (
              <span style={{ fontFamily: 'monospace', fontSize: 8, color: COLORS.textMuted, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 3, padding: '1px 5px' }}>
                basic config
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Source card ───────────────────────────────────────────────────────────────

interface SourceCardProps {
  source: DataSource
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}

function SourceCard({ source, onEdit, onToggle, onDelete }: SourceCardProps) {
  const typeInfo = SOURCE_TYPES.find(t => t.id === source.type)
  const color = typeInfo?.color ?? COLORS.accent
  const icon = typeInfo?.icon ?? '⚙'
  const configuredFields = Object.values(source.config).filter(v => v.trim()).length
  const totalFields = INFRA_DEFS[source.type]?.fields.length ?? 0
  const isUnstructured = source.isUnstructured || isUnstructuredType(source.type)

  // Status text
  let statusText: string
  if (isUnstructured) {
    if (source.signoff?.status === 'verified') {
      statusText = `✓ Signed off by ${source.signoff.signedBy} · ${source.semantics?.entities.length ?? 0} entities · ${source.semantics?.inferredSchema.length ?? 0} fields`
    } else if (source.signoff?.status === 'rejected') {
      statusText = `✕ Rejected by ${source.signoff.signedBy}`
    } else if (source.semantics) {
      statusText = `Analyzed · awaiting sign-off`
    } else {
      statusText = `Unverified · click Ingest to analyze`
    }
  } else {
    statusText = totalFields > 0
      ? `${configuredFields}/${totalFields} fields configured`
      : 'Basic source · click Edit to configure'
  }

  // Status badge
  let statusBadge: { label: string; color: string } | null = null
  if (isUnstructured) {
    if (source.signoff?.status === 'verified') statusBadge = { label: '✓ Verified', color: COLORS.accent3 }
    else if (source.signoff?.status === 'rejected') statusBadge = { label: '✕ Rejected', color: COLORS.accentDanger }
    else if (source.semantics) statusBadge = { label: '⏳ Pending Sign-Off', color: COLORS.accentWarn }
    else statusBadge = { label: '! Unverified', color: COLORS.accentDanger }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px',
      background: source.enabled ? COLORS.bgCard : COLORS.bg,
      border: `1px solid ${source.enabled ? color + '33' : COLORS.border}`,
      borderRadius: 8,
      opacity: source.enabled ? 1 : 0.6,
      transition: 'all 0.2s',
    }}>
      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 7, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
      }}>
        {icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: COLORS.text }}>
            {source.name}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 8, color, background: `${color}14`, border: `1px solid ${color}44`, borderRadius: 3, padding: '1px 6px' }}>
            {source.type}
          </span>
          {statusBadge && (
            <span style={{ fontFamily: 'monospace', fontSize: 8, fontWeight: 700, color: statusBadge.color, background: `${statusBadge.color}14`, border: `1px solid ${statusBadge.color}55`, borderRadius: 3, padding: '1px 6px' }}>
              {statusBadge.label}
            </span>
          )}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: COLORS.textMuted }}>
          {statusText}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        title={source.enabled ? 'Disable' : 'Enable'}
        style={{
          width: 32, height: 18, borderRadius: 9, border: 'none',
          background: source.enabled ? color : COLORS.border,
          cursor: 'pointer', position: 'relative', flexShrink: 0,
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: 12, height: 12, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3,
          left: source.enabled ? 17 : 3,
          transition: 'left 0.2s',
        }} />
      </button>

      {/* Edit / Ingest / Verify */}
      <button
        onClick={onEdit}
        style={{
          fontFamily: 'monospace', fontSize: 9, fontWeight: 700,
          color: COLORS.accent, background: `${COLORS.accent}10`,
          border: `1px solid ${COLORS.accent}44`,
          borderRadius: 5, padding: '4px 10px', cursor: 'pointer', flexShrink: 0,
          transition: 'all 0.15s',
        }}
      >
        {isUnstructured ? (source.signoff?.status === 'verified' ? 'Review' : source.semantics ? 'Sign Off' : 'Ingest') : 'Edit'}
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        title="Remove source"
        style={{
          fontFamily: 'monospace', fontSize: 11,
          color: COLORS.accentDanger, background: 'transparent',
          border: `1px solid ${COLORS.accentDanger}44`,
          borderRadius: 5, padding: '3px 7px', cursor: 'pointer', flexShrink: 0,
          transition: 'all 0.15s',
        }}
      >
        ✕
      </button>
    </div>
  )
}

// ── Simple name dialog for sources without a wizard ───────────────────────────

interface NameDialogProps {
  typeId: string
  onConfirm: (name: string) => void
  onCancel: () => void
}

function NameDialog({ typeId, onConfirm, onCancel }: NameDialogProps) {
  const [name, setName] = useState(typeId)
  const typeInfo = SOURCE_TYPES.find(t => t.id === typeId)
  const isUnstructured = isUnstructuredType(typeId)

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 20,
    }}>
      <div style={{
        width: 360, background: COLORS.bgPanel,
        border: `1px solid ${typeInfo?.color ?? COLORS.border}55`,
        borderRadius: 10, padding: '20px 22px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: COLORS.text }}>
          {typeInfo?.icon} Add {typeId}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.textDim }}>
          {typeInfo?.description}
        </div>
        <div>
          <label style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.textDim, display: 'block', marginBottom: 6 }}>
            Source Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && name.trim() && onConfirm(name.trim())}
            style={{
              width: '100%', fontFamily: 'monospace', fontSize: 11,
              color: COLORS.text, background: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '8px 10px', outline: 'none',
            }}
          />
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: COLORS.textMuted, background: `${(isUnstructured ? typeInfo?.color ?? COLORS.accent : COLORS.accentWarn)}10`, border: `1px solid ${(isUnstructured ? typeInfo?.color ?? COLORS.accent : COLORS.accentWarn)}33`, borderRadius: 5, padding: '8px 10px' }}>
          {isUnstructured
            ? 'Next: paste a sample of your content and the analyzer will detect entities, schema, and quality. You\'ll then verify and sign off.'
            : 'Detailed wizard config coming soon for this source type.'}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.textDim, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '7px 14px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim())}
            disabled={!name.trim()}
            style={{
              fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
              color: '#fff', background: typeInfo?.color ?? COLORS.accent,
              border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer',
              opacity: name.trim() ? 1 : 0.5,
            }}
          >
            Add Source
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main DataSourceManager ────────────────────────────────────────────────────

export function DataSourceManager({ onClose }: DataSourceManagerProps) {
  const [activeFlowId, setActiveFlowId] = useState<string>('global')
  const [version, setVersion] = useState(0) // bump to re-read localStorage
  const [showPicker, setShowPicker] = useState(false)
  const [pendingType, setPendingType] = useState<string | null>(null) // type selected, awaiting name
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  const sources = getSources(activeFlowId)
  const activeFlow = FLOWS.find(f => f.id === activeFlowId)!

  function handlePickType(typeId: string) {
    setShowPicker(false)
    setPendingType(typeId)
  }

  function handleNameConfirm(name: string) {
    const typeId = pendingType!
    const hasWizard = !!INFRA_DEFS[typeId]
    const isUnstructured = isUnstructuredType(typeId)
    const newSource: DataSource = {
      id: makeId(),
      name,
      type: typeId,
      flowId: activeFlowId,
      enabled: true,
      config: {},
      createdAt: new Date().toISOString(),
      ...(isUnstructured && { isUnstructured: true }),
    }
    const list = getSources(activeFlowId)
    saveSources(activeFlowId, [...list, newSource])
    setPendingType(null)
    refresh()
    if (hasWizard || isUnstructured) {
      setEditingSource(newSource)
    }
  }

  function handleSaveUnstructured(updated: DataSource) {
    updateSource(updated)
    setEditingSource(null)
    refresh()
  }

  function handleSaveConfig(source: DataSource, config: Record<string, string>) {
    const list = getSources(source.flowId)
    saveSources(source.flowId, list.map(s => s.id === source.id ? { ...s, config } : s))
    setEditingSource(null)
    refresh()
  }

  function handleToggle(source: DataSource) {
    toggleSource(source.flowId, source.id)
    refresh()
  }

  function handleDelete(source: DataSource) {
    deleteSource(source.flowId, source.id)
    refresh()
  }

  const sourcesByFlow = FLOWS.reduce<Record<string, number>>((acc, f) => {
    acc[f.id] = getSources(f.id).length
    return acc
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, {})
  void version

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}
    >
      <div style={{
        width: 960, maxWidth: '96vw',
        height: '88vh',
        display: 'flex', flexDirection: 'column',
        background: COLORS.bgPanel,
        border: `1px solid ${COLORS.borderBright}`,
        borderRadius: 14,
        boxShadow: `0 0 60px ${COLORS.accent}18`,
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.accent, boxShadow: `0 0 8px ${COLORS.accent}` }} />
            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: COLORS.text }}>Data Sources</span>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: COLORS.textMuted }}>· per-flow configuration</span>
          </div>
          <button onClick={onClose} style={{ fontFamily: 'monospace', fontSize: 14, color: COLORS.textMuted, background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* ── Left: flow sidebar ──────────────────────────────────────── */}
          <div style={{ width: 200, flexShrink: 0, borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '10px 14px 6px', fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.textMuted }}>
              Flows
            </div>
            {FLOWS.map(flow => {
              const active = flow.id === activeFlowId
              const count = sourcesByFlow[flow.id] ?? 0
              return (
                <button
                  key={flow.id}
                  onClick={() => setActiveFlowId(flow.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 14px',
                    background: active ? `${flow.categoryColor}14` : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${active ? flow.categoryColor : 'transparent'}`,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div>
                    {flow.category && (
                      <div style={{ fontFamily: 'monospace', fontSize: 8, color: flow.categoryColor, marginBottom: 1 }}>
                        {flow.category}
                      </div>
                    )}
                    <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: active ? 700 : 400, color: active ? flow.categoryColor : COLORS.textDim }}>
                      {flow.label}
                    </div>
                  </div>
                  {count > 0 && (
                    <span style={{ fontFamily: 'monospace', fontSize: 9, color: flow.categoryColor, background: `${flow.categoryColor}18`, border: `1px solid ${flow.categoryColor}44`, borderRadius: 10, padding: '1px 6px' }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Right: source list ──────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

            {/* Flow header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: activeFlow.categoryColor }}>
                  {activeFlow.category ? `${activeFlow.category} · ` : ''}{activeFlow.label}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: COLORS.textMuted, marginTop: 2 }}>
                  {activeFlowId === 'global'
                    ? 'Sources available to all flows'
                    : 'Sources specific to this flow — supplements global sources'}
                </div>
              </div>
              <button
                onClick={() => setShowPicker(true)}
                style={{
                  fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                  color: activeFlow.categoryColor, background: `${activeFlow.categoryColor}14`,
                  border: `1px solid ${activeFlow.categoryColor}55`,
                  borderRadius: 6, padding: '7px 14px', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                + Add Source
              </button>
            </div>

            {/* Source list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sources.length === 0 ? (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10, paddingTop: 60,
                }}>
                  <div style={{ fontSize: 32, opacity: 0.3 }}>📂</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.textMuted, textAlign: 'center' }}>
                    No sources configured for this flow.
                    <br />
                    <span style={{ color: activeFlow.categoryColor }}>+ Add Source</span> to get started.
                  </div>
                </div>
              ) : (
                sources.map(source => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    onEdit={() => setEditingSource(source)}
                    onToggle={() => handleToggle(source)}
                    onDelete={() => handleDelete(source)}
                  />
                ))
              )}
            </div>

            {/* Overlays inside the right pane */}
            {showPicker && (
              <SourceTypePicker
                onPick={handlePickType}
                onCancel={() => setShowPicker(false)}
              />
            )}

            {pendingType && (
              <NameDialog
                typeId={pendingType}
                onConfirm={handleNameConfirm}
                onCancel={() => setPendingType(null)}
              />
            )}
          </div>
        </div>
      </div>

      {/* InfraWizard rendered at modal level so it overlays the whole DataSourceManager */}
      {editingSource && INFRA_DEFS[editingSource.type] && !isUnstructuredType(editingSource.type) && (
        <InfraWizard
          service={editingSource.type}
          initialValues={editingSource.config}
          onSave={config => handleSaveConfig(editingSource, config)}
          onClose={() => setEditingSource(null)}
        />
      )}

      {/* UnstructuredIngestion overlay for unstructured sources */}
      {editingSource && isUnstructuredType(editingSource.type) && (
        <UnstructuredIngestion
          source={editingSource}
          onSave={handleSaveUnstructured}
          onCancel={() => setEditingSource(null)}
        />
      )}
    </div>
  )
}
