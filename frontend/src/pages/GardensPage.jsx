import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Leaf, Edit2, Trash2, MapPin, Sun, Grid } from 'lucide-react'
import { gardensApi } from '../services/api'
import { LoadingSpinner, EmptyState, PageHeader, Modal, Alert, ConfirmDialog } from '../components/ui'

const gardenTypes = ['Balcony', 'Windowsill', 'Rooftop', 'Indoor', 'Vertical', 'Container']
const sunlightOptions = ['Full Sun (6+ hrs)', 'Partial Sun (3–6 hrs)', 'Shade (<3 hrs)']

function GardenForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial || { name: '', type: 'Balcony', location: '', sunlight: 'Partial Sun (3–6 hrs)', area_sqft: '', notes: '' }
  )
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Garden Name *</label>
        <input className="input" placeholder="e.g. Balcony Herb Garden" value={form.name} onChange={(e) => set('name', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Type</label>
          <select className="select" value={form.type} onChange={(e) => set('type', e.target.value)}>
            {gardenTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Sunlight</label>
          <select className="select" value={form.sunlight} onChange={(e) => set('sunlight', e.target.value)}>
            {sunlightOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Location</label>
          <input className="input" placeholder="e.g. North-facing balcony" value={form.location} onChange={(e) => set('location', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Area (sq ft)</label>
          <input className="input" type="number" min="0" step="0.1" placeholder="e.g. 12" value={form.area_sqft} onChange={(e) => set('area_sqft', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Notes</label>
        <textarea className="input resize-none" rows={3} placeholder="Any special considerations..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary py-2 px-4 text-sm">
          {loading ? 'Saving...' : initial ? 'Update Garden' : 'Create Garden'}
        </button>
      </div>
    </form>
  )
}

const typeColors = {
  Balcony: 'bg-primary/10 text-primary',
  Windowsill: 'bg-terracotta/10 text-terracotta',
  Rooftop: 'bg-forest/10 text-forest',
  Indoor: 'bg-blue-100 text-blue-700',
  Vertical: 'bg-yellow-100 text-yellow-700',
  Container: 'bg-purple-100 text-purple-700',
}

export default function GardensPage() {
  const [gardens, setGardens] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editGarden, setEditGarden] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [alert, setAlert] = useState(null)

  const load = async () => {
    try {
      const res = await gardensApi.getAll()
      setGardens(res.data.gardens || [])
    } catch {
      setAlert({ type: 'error', message: 'Failed to load gardens. Is the backend running?' })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await gardensApi.create(form)
      setShowAdd(false)
      setAlert({ type: 'success', message: 'Garden created successfully!' })
      load()
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.error || 'Failed to create garden.' })
    } finally { setSaving(false) }
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try {
      await gardensApi.update(editGarden._id, form)
      setEditGarden(null)
      setAlert({ type: 'success', message: 'Garden updated!' })
      load()
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.error || 'Failed to update garden.' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await gardensApi.delete(deleteId)
      setAlert({ type: 'success', message: 'Garden deleted.' })
      load()
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete garden.' })
    }
  }

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="My Gardens"
        subtitle="Design and manage your personal micro-garden spaces"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Garden
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

      {loading ? (
        <LoadingSpinner message="Loading your gardens..." />
      ) : gardens.length === 0 ? (
        <EmptyState
          icon={Grid}
          title="No gardens yet"
          description="Create your first micro-garden to start tracking plants and care activities."
          action={<button onClick={() => setShowAdd(true)} className="btn-primary">Create Your First Garden</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gardens.map((g, i) => (
            <motion.div
              key={g._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`badge ${typeColors[g.type] || 'bg-sage text-primary'}`}>
                  <Grid size={11} /> {g.type}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditGarden(g)} className="p-1.5 rounded-lg hover:bg-sage/60 text-muted hover:text-primary transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteId(g._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-serif text-xl text-dark mb-2">{g.name}</h3>
              <div className="space-y-1.5 text-sm text-muted">
                {g.location && (
                  <div className="flex items-center gap-1.5"><MapPin size={13} />{g.location}</div>
                )}
                <div className="flex items-center gap-1.5"><Sun size={13} />{g.sunlight}</div>
                {g.area_sqft && <div className="flex items-center gap-1.5"><Leaf size={13} />{g.area_sqft} sq ft</div>}
              </div>
              {g.notes && (
                <p className="mt-3 text-sm text-muted/80 italic border-t border-sage/40 pt-3">{g.notes}</p>
              )}
              <div className="mt-4 pt-4 border-t border-sage/40 flex items-center justify-between">
                <span className="text-xs text-muted">{g.plant_count ?? 0} plants</span>
                <span className="text-xs text-muted">
                  {new Date(g.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Create New Garden">
        <GardenForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editGarden} onClose={() => setEditGarden(null)} title="Edit Garden">
        {editGarden && (
          <GardenForm initial={editGarden} onSubmit={handleUpdate} onCancel={() => setEditGarden(null)} loading={saving} />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Garden"
        message="Are you sure you want to delete this garden? All plants in this garden will also be removed."
      />
    </div>
  )
}
