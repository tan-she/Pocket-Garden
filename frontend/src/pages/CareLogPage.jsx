import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Droplets, FlaskConical, Scissors, Sprout, Bug, Sun, Edit2, Trash2, Filter } from 'lucide-react'
import { careLogsApi, plantsApi } from '../services/api'
import { LoadingSpinner, EmptyState, PageHeader, Modal, Alert, ConfirmDialog, Badge } from '../components/ui'

const ACTIVITY_TYPES = ['Watering', 'Fertilizing', 'Pruning', 'Repotting', 'Pest Control', 'Health Check', 'Other']
const ACTIVITY_ICONS = {
  Watering: { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
  Fertilizing: { icon: FlaskConical, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  Pruning: { icon: Scissors, color: 'text-primary', bg: 'bg-sage/40' },
  Repotting: { icon: Sprout, color: 'text-forest', bg: 'bg-forest/10' },
  'Pest Control': { icon: Bug, color: 'text-red-500', bg: 'bg-red-50' },
  'Health Check': { icon: Sun, color: 'text-terracotta', bg: 'bg-terracotta/10' },
  Other: { icon: Droplets, color: 'text-muted', bg: 'bg-cream' },
}

function CareLogForm({ plants, initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial || {
      plant_id: '',
      activity_type: 'Watering',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
      quantity_ml: '',
      duration_minutes: '',
    }
  )
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Plant *</label>
        <select className="select" value={form.plant_id} onChange={(e) => set('plant_id', e.target.value)} required>
          <option value="">— Select a plant —</option>
          {plants.map((p) => <option key={p._id} value={p._id}>{p.emoji || '🌿'} {p.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Activity *</label>
          <select className="select" value={form.activity_type} onChange={(e) => set('activity_type', e.target.value)}>
            {ACTIVITY_TYPES.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Date *</label>
          <input className="input" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </div>
      </div>
      {form.activity_type === 'Watering' && (
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Amount (ml)</label>
          <input className="input" type="number" min="0" placeholder="e.g. 250" value={form.quantity_ml} onChange={(e) => set('quantity_ml', e.target.value)} />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Duration (minutes)</label>
        <input className="input" type="number" min="0" placeholder="e.g. 10" value={form.duration_minutes} onChange={(e) => set('duration_minutes', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Notes</label>
        <textarea className="input resize-none" rows={3} placeholder="Observations, product used, etc." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary py-2 px-4 text-sm">
          {loading ? 'Saving...' : initial ? 'Update Log' : 'Log Activity'}
        </button>
      </div>
    </form>
  )
}

export default function CareLogPage() {
  const [logs, setLogs] = useState([])
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editLog, setEditLog] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filterType, setFilterType] = useState('All')
  const [alert, setAlert] = useState(null)

  const load = async () => {
    try {
      const [lRes, pRes] = await Promise.all([careLogsApi.getAll(), plantsApi.getAll()])
      setLogs(lRes.data.care_logs || [])
      setPlants(pRes.data.plants || [])
    } catch {
      setAlert({ type: 'error', message: 'Failed to load care logs. Is the backend running?' })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      const payload = { ...form, quantity_ml: form.quantity_ml ? Number(form.quantity_ml) : null, duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null }
      await careLogsApi.create(payload)
      setShowAdd(false)
      setAlert({ type: 'success', message: 'Care activity logged!' })
      load()
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.error || 'Failed to log activity.' })
    } finally { setSaving(false) }
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try {
      await careLogsApi.update(editLog._id, form)
      setEditLog(null)
      setAlert({ type: 'success', message: 'Log updated!' })
      load()
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.error || 'Failed to update log.' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await careLogsApi.delete(deleteId)
      setAlert({ type: 'success', message: 'Log deleted.' })
      load()
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete log.' })
    }
  }

  const filtered = filterType === 'All' ? logs : logs.filter((l) => l.activity_type === filterType)

  // Group by date
  const grouped = filtered.reduce((acc, log) => {
    const date = new Date(log.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {})

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Care Log"
        subtitle={`${logs.length} care activities recorded`}
        actions={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Log Activity
          </button>
        }
      />

      <AnimatePresence>
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {['All', ...ACTIVITY_TYPES].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterType === type ? 'bg-primary text-white' : 'bg-white border border-sage text-muted hover:text-primary hover:border-primary'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading care logs..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Droplets}
          title="No care activities yet"
          description="Start logging watering, fertilizing, pruning and more to track your plants' care history."
          action={<button onClick={() => setShowAdd(true)} className="btn-primary">Log First Activity</button>}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, dateLogs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-sage/60" />
                <span className="text-sm text-muted font-medium">{date}</span>
                <div className="h-px flex-1 bg-sage/60" />
              </div>
              <div className="space-y-3">
                {dateLogs.map((log, i) => {
                  const actInfo = ACTIVITY_ICONS[log.activity_type] || ACTIVITY_ICONS.Other
                  const Icon = actInfo.icon
                  return (
                    <motion.div
                      key={log._id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="card flex items-start gap-4 group hover:shadow-sm transition-all duration-200"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${actInfo.bg}`}>
                        <Icon size={18} className={actInfo.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-dark text-sm">{log.activity_type}</span>
                          {log.plant_name && (
                            <span className="text-xs text-muted">• {log.plant_emoji || '🌿'} {log.plant_name}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted">
                          {log.quantity_ml && <span>💧 {log.quantity_ml} ml</span>}
                          {log.duration_minutes && <span>⏱ {log.duration_minutes} min</span>}
                        </div>
                        {log.notes && <p className="text-sm text-muted/80 mt-1 italic">{log.notes}</p>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditLog(log)} className="p-1.5 rounded-lg hover:bg-sage/60 text-muted hover:text-primary transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteId(log._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Log Care Activity">
        <CareLogForm plants={plants} onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={saving} />
      </Modal>

      <Modal isOpen={!!editLog} onClose={() => setEditLog(null)} title="Edit Care Log">
        {editLog && (
          <CareLogForm plants={plants} initial={{ ...editLog, date: editLog.date?.slice(0, 10) }} onSubmit={handleUpdate} onCancel={() => setEditLog(null)} loading={saving} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Log Entry"
        message="This care log entry will be permanently removed."
      />
    </div>
  )
}
