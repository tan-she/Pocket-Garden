import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Leaf, Search, Filter, Plus, Edit2, Trash2, Eye, Sun, Droplets, Sprout } from 'lucide-react'
import { plantsApi, gardensApi } from '../services/api'
import { LoadingSpinner, EmptyState, PageHeader, Alert, ConfirmDialog, Badge } from '../components/ui'

const CATEGORIES = ['All', 'Herb', 'Vegetable', 'Fruit', 'Flower', 'Succulent', 'Tropical', 'Vine']
const HEALTH_STATUS = { Healthy: 'green', Wilting: 'yellow', Diseased: 'red', Dormant: 'blue' }

function PlantCard({ plant, onEdit, onDelete, onView }) {
  const healthVariant = HEALTH_STATUS[plant.health_status] || 'default'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sage rounded-xl flex items-center justify-center text-xl">{plant.emoji || '🌿'}</div>
          <div>
            <h3 className="font-semibold text-dark text-sm">{plant.name}</h3>
            <p className="text-xs text-muted italic">{plant.scientific_name}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(plant._id)} className="p-1.5 rounded-lg hover:bg-sage/60 text-muted hover:text-primary transition-colors"><Eye size={13} /></button>
          <button onClick={() => onEdit(plant)} className="p-1.5 rounded-lg hover:bg-sage/60 text-muted hover:text-primary transition-colors"><Edit2 size={13} /></button>
          <button onClick={() => onDelete(plant._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge label={plant.category} variant="default" />
        <Badge label={plant.health_status || 'Healthy'} variant={healthVariant} />
      </div>

      <div className="space-y-1 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <Sun size={11} className="text-yellow-500" />
          Sunlight: {plant.sunlight_hours_per_day}h/day
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets size={11} className="text-blue-500" />
          Water every {plant.watering_frequency_days}d
        </div>
        {plant.garden_name && (
          <div className="flex items-center gap-1.5">
            <Leaf size={11} className="text-primary" />
            {plant.garden_name}
          </div>
        )}
      </div>

      {plant.date_planted && (
        <div className="mt-3 pt-3 border-t border-sage/40 text-xs text-muted">
          Planted {new Date(plant.date_planted).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )}
    </motion.div>
  )
}

export default function PlantsPage() {
  const [plants, setPlants] = useState([])
  const [gardens, setGardens] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [deleteId, setDeleteId] = useState(null)
  const [alert, setAlert] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const [pRes, gRes] = await Promise.all([plantsApi.getAll(), gardensApi.getAll()])
      setPlants(pRes.data.plants || [])
      setGardens(gRes.data.gardens || [])
    } catch {
      setAlert({ type: 'error', message: 'Failed to load plants. Is the backend running?' })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    try {
      await plantsApi.delete(deleteId)
      setAlert({ type: 'success', message: 'Plant removed.' })
      load()
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete plant.' })
    }
  }

  const filtered = plants.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.scientific_name || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="My Plants"
        subtitle={`Tracking ${plants.length} plant${plants.length !== 1 ? 's' : ''} across your gardens`}
        actions={
          <button onClick={() => navigate('/plants/add')} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Plant
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

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search by name or scientific name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                category === cat ? 'bg-primary text-white' : 'bg-white border border-sage text-muted hover:text-primary hover:border-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading plants..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title={plants.length === 0 ? 'No plants yet' : 'No matching plants'}
          description={plants.length === 0 ? 'Add your first plant to start tracking its care and health.' : 'Try a different search or category filter.'}
          action={plants.length === 0 && <button onClick={() => navigate('/plants/add')} className="btn-primary">Add Your First Plant</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((plant) => (
            <PlantCard
              key={plant._id}
              plant={plant}
              onView={(id) => navigate(`/plants/${id}`)}
              onEdit={(p) => navigate(`/plants/edit/${p._id}`)}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Plant"
        message="This will permanently delete the plant and all associated care logs."
      />
    </div>
  )
}
