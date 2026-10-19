import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit2, Trash2, Sun, Droplets, Leaf, Calendar, FlaskConical, Sprout } from 'lucide-react'
import { plantsApi, careLogsApi } from '../services/api'
import { LoadingSpinner, Badge, ConfirmDialog, Alert } from '../components/ui'

const HEALTH_VARIANTS = { Healthy: 'green', Wilting: 'yellow', Diseased: 'red', Dormant: 'blue' }
const ACTIVITY_ICONS = { Watering: Droplets, Fertilizing: FlaskConical, Pruning: Leaf, Repotting: Sprout, 'Pest Control': Leaf, 'Health Check': Sun }

export default function PlantDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plant, setPlant] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    Promise.all([plantsApi.getById(id), careLogsApi.getAll(id)])
      .then(([pRes, lRes]) => {
        setPlant(pRes.data.plant)
        setLogs(lRes.data.care_logs || [])
      })
      .catch(() => setAlert({ type: 'error', message: 'Failed to load plant details.' }))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    try {
      await plantsApi.delete(id)
      navigate('/plants')
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete plant.' })
    }
  }

  if (loading) return <LoadingSpinner message="Loading plant details..." />
  if (!plant) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-muted">Plant not found.</p>
      <button onClick={() => navigate('/plants')} className="btn-primary mt-4">Back to Plants</button>
    </div>
  )

  const details = [
    { icon: Sun, label: 'Sunlight', value: `${plant.sunlight_hours_per_day} hrs/day` },
    { icon: Droplets, label: 'Watering', value: `Every ${plant.watering_frequency_days} days` },
    { icon: Calendar, label: 'Date Planted', value: plant.date_planted ? new Date(plant.date_planted).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
    { icon: Leaf, label: 'Soil Type', value: plant.soil_type || '—' },
    { icon: Sprout, label: 'Pot Size', value: plant.pot_size_cm ? `${plant.pot_size_cm} cm` : '—' },
    { icon: FlaskConical, label: 'Fertilize', value: plant.fertilizer_frequency_weeks ? `Every ${plant.fertilizer_frequency_weeks} weeks` : '—' },
  ]

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate('/plants')} className="flex items-center gap-2 text-muted hover:text-primary transition-colors mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> Back to Plants
      </button>

      {alert && <div className="mb-4"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main card */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-sage rounded-2xl flex items-center justify-center text-4xl">{plant.emoji || '🌿'}</div>
                <div>
                  <h1 className="font-serif text-3xl text-dark">{plant.name}</h1>
                  <p className="text-muted italic text-sm">{plant.scientific_name || 'No scientific name'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge label={plant.category} variant="default" />
                    <Badge label={plant.health_status || 'Healthy'} variant={HEALTH_VARIANTS[plant.health_status] || 'green'} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/plants/edit/${id}`)} className="btn-outline py-2 px-3 text-sm flex items-center gap-1.5">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => setShowDelete(true)} className="px-3 py-2 rounded-xl border-2 border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-1.5">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-cream rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-muted text-xs mb-1">
                    <Icon size={12} /> {label}
                  </div>
                  <div className="font-medium text-dark text-sm">{value}</div>
                </div>
              ))}
            </div>

            {plant.notes && (
              <div className="mt-4 p-4 bg-sage/30 rounded-xl">
                <p className="text-sm text-dark/80 italic leading-relaxed">📝 {plant.notes}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Care Log sidebar */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-dark">Care History</h2>
              <span className="badge bg-sage text-primary">{logs.length} logs</span>
            </div>
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <Droplets size={32} className="text-sage mx-auto mb-2" />
                <p className="text-sm text-muted">No care logs yet.</p>
                <button onClick={() => navigate('/care-log')} className="text-primary text-sm font-medium mt-1 hover:underline">Log care activity</button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {logs.slice(0, 20).map((log) => {
                  const Icon = ACTIVITY_ICONS[log.activity_type] || Leaf
                  return (
                    <div key={log._id} className="flex items-start gap-3 p-3 bg-cream rounded-xl">
                      <div className="w-7 h-7 bg-sage rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={13} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-dark">{log.activity_type}</div>
                        <div className="text-xs text-muted">{new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                        {log.notes && <div className="text-xs text-muted/80 mt-0.5 truncate">{log.notes}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Plant"
        message={`Are you sure you want to delete "${plant.name}"? All care logs will also be removed.`}
      />
    </div>
  )
}
