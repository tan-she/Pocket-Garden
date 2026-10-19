import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Leaf } from 'lucide-react'
import { plantsApi, gardensApi } from '../services/api'
import { LoadingSpinner, Alert } from '../components/ui'

const CATEGORIES = ['Herb', 'Vegetable', 'Fruit', 'Flower', 'Succulent', 'Tropical', 'Vine']
const HEALTH_STATUSES = ['Healthy', 'Wilting', 'Diseased', 'Dormant']
const EMOJIS = ['🌿', '🌱', '🌾', '🌺', '🌸', '🌻', '🌹', '🌵', '🍀', '🎋', '🌴', '🍃', '🥦', '🍅', '🍓', '🌶️', '🫑', '🧄', '🌿', '🍵']

const defaultForm = {
  name: '',
  scientific_name: '',
  category: 'Herb',
  emoji: '🌿',
  garden_id: '',
  sunlight_hours_per_day: 4,
  watering_frequency_days: 2,
  health_status: 'Healthy',
  date_planted: new Date().toISOString().slice(0, 10),
  notes: '',
  soil_type: '',
  pot_size_cm: '',
  fertilizer_frequency_weeks: '',
}

export default function PlantFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(defaultForm)
  const [gardens, setGardens] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    gardensApi.getAll().then((r) => setGardens(r.data.gardens || [])).catch(() => {})
    if (isEdit) {
      plantsApi.getById(id)
        .then((r) => setForm({ ...defaultForm, ...r.data.plant, date_planted: r.data.plant.date_planted?.slice(0, 10) || '' }))
        .catch(() => setAlert({ type: 'error', message: 'Failed to load plant.' }))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        sunlight_hours_per_day: Number(form.sunlight_hours_per_day),
        watering_frequency_days: Number(form.watering_frequency_days),
        pot_size_cm: form.pot_size_cm ? Number(form.pot_size_cm) : null,
        fertilizer_frequency_weeks: form.fertilizer_frequency_weeks ? Number(form.fertilizer_frequency_weeks) : null,
      }
      if (isEdit) {
        await plantsApi.update(id, payload)
        setAlert({ type: 'success', message: 'Plant updated!' })
      } else {
        await plantsApi.create(payload)
        setAlert({ type: 'success', message: 'Plant added!' })
      }
      setTimeout(() => navigate('/plants'), 800)
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.error || 'Failed to save plant.' })
    } finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner message="Loading plant data..." />

  return (
    <div className="page-enter max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-primary transition-colors mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-sage rounded-2xl flex items-center justify-center">
          <Leaf size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-3xl text-dark">{isEdit ? 'Edit Plant' : 'Add New Plant'}</h1>
          <p className="text-muted text-sm">{isEdit ? 'Update plant details and care schedule' : 'Track a new plant in your garden'}</p>
        </div>
      </div>

      <AnimatePresence>
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="font-semibold text-dark mb-4">Basic Information</h2>
          <div className="space-y-4">
            {/* Emoji picker */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Plant Icon</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji} type="button"
                    onClick={() => set('emoji', emoji)}
                    className={`w-9 h-9 rounded-lg text-lg transition-all ${form.emoji === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'bg-sage/40 hover:bg-sage'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Plant Name *</label>
                <input className="input" placeholder="e.g. Basil" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Scientific Name</label>
                <input className="input" placeholder="e.g. Ocimum basilicum" value={form.scientific_name} onChange={(e) => set('scientific_name', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Category *</label>
                <select className="select" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Garden</label>
                <select className="select" value={form.garden_id} onChange={(e) => set('garden_id', e.target.value)}>
                  <option value="">— No garden —</option>
                  {gardens.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Health Status</label>
                <select className="select" value={form.health_status} onChange={(e) => set('health_status', e.target.value)}>
                  {HEALTH_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1">Date Planted</label>
              <input className="input" type="date" value={form.date_planted} onChange={(e) => set('date_planted', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Care Schedule */}
        <div className="card">
          <h2 className="font-semibold text-dark mb-4">Care Schedule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Sunlight (hrs/day) *</label>
              <input className="input" type="number" min="0" max="24" step="0.5" value={form.sunlight_hours_per_day} onChange={(e) => set('sunlight_hours_per_day', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Water every (days) *</label>
              <input className="input" type="number" min="1" max="30" value={form.watering_frequency_days} onChange={(e) => set('watering_frequency_days', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Fertilize every (weeks)</label>
              <input className="input" type="number" min="1" max="52" placeholder="e.g. 4" value={form.fertilizer_frequency_weeks} onChange={(e) => set('fertilizer_frequency_weeks', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Pot & Soil */}
        <div className="card">
          <h2 className="font-semibold text-dark mb-4">Pot & Soil Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Soil Type</label>
              <input className="input" placeholder="e.g. Well-draining potting mix" value={form.soil_type} onChange={(e) => set('soil_type', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Pot Size (cm)</label>
              <input className="input" type="number" min="0" placeholder="e.g. 20" value={form.pot_size_cm} onChange={(e) => set('pot_size_cm', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className="font-semibold text-dark mb-4">Additional Notes</h2>
          <textarea className="input resize-none" rows={4} placeholder="Growing tips, observations, special care requirements..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Update Plant' : 'Add Plant'}
          </button>
        </div>
      </form>
    </div>
  )
}
