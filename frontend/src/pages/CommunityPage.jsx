import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Tag, MapPin, Users, Edit2, Trash2, Heart, MessageCircle, Leaf, Sprout, Package, BookOpen } from 'lucide-react'
import { communityApi } from '../services/api'
import { LoadingSpinner, EmptyState, PageHeader, Modal, Alert, ConfirmDialog, Badge } from '../components/ui'

const POST_TYPES = ['All', 'Seed Swap', 'Plant Cutting', 'Compost', 'Tool Share', 'Tip & Advice', 'Free Plants']
const DEMO_POSTS = [
  { _id: 'demo-mint', title: 'Mint cuttings looking for a home', post_type: 'Plant Cutting', description: 'A few healthy spearmint cuttings from my balcony planter. Happy to share with a nearby gardener.', location: 'Park Slope', author_name: 'Avery', contact_info: 'Message to arrange pickup', is_available: true, created_at: new Date().toISOString() },
  { _id: 'demo-seeds', title: 'Extra marigold seeds to swap', post_type: 'Seed Swap', description: 'Collected these from last season. Would love to trade for basil or pollinator-friendly seeds.', location: 'Crown Heights', author_name: 'Nina', contact_info: 'Meet near the garden', is_available: true, created_at: new Date().toISOString() },
  { _id: 'demo-compost', title: 'Finished balcony compost', post_type: 'Compost', description: 'Small bag of rich, sifted compost available for a windowsill or container garden.', location: 'Fort Greene', author_name: 'Leo', contact_info: 'Pickup this weekend', is_available: true, created_at: new Date().toISOString() },
]
const readDemoPosts = () => JSON.parse(localStorage.getItem('pocket-garden-exchange') || 'null') || DEMO_POSTS
const saveDemoPosts = (items) => localStorage.setItem('pocket-garden-exchange', JSON.stringify(items))
const TYPE_ICONS = {
  'Seed Swap': Sprout,
  'Plant Cutting': Leaf,
  'Compost': Package,
  'Tool Share': Package,
  'Tip & Advice': BookOpen,
  'Free Plants': Heart,
}
const TYPE_VARIANTS = {
  'Seed Swap': 'green',
  'Plant Cutting': 'default',
  'Compost': 'terracotta',
  'Tool Share': 'blue',
  'Tip & Advice': 'yellow',
  'Free Plants': 'terracotta',
}

function PostForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial || { title: '', post_type: 'Seed Swap', description: '', location: '', author_name: '', contact_info: '', is_available: true }
  )
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Title *</label>
        <input className="input" placeholder="e.g. Free mint cuttings — organic" value={form.title} onChange={(e) => set('title', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Post Type *</label>
          <select className="select" value={form.post_type} onChange={(e) => set('post_type', e.target.value)}>
            {POST_TYPES.filter((t) => t !== 'All').map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Your Name</label>
          <input className="input" placeholder="e.g. Sarah" value={form.author_name} onChange={(e) => set('author_name', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Description *</label>
        <textarea className="input resize-none" rows={3} placeholder="Describe what you are offering, wanting, or sharing..." value={form.description} onChange={(e) => set('description', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Location</label>
          <input className="input" placeholder="e.g. Jurong East, Singapore" value={form.location} onChange={(e) => set('location', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Contact</label>
          <input className="input" placeholder="e.g. email or phone" value={form.contact_info} onChange={(e) => set('contact_info', e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_available" checked={form.is_available} onChange={(e) => set('is_available', e.target.checked)} className="w-4 h-4 accent-primary" />
        <label htmlFor="is_available" className="text-sm font-medium text-dark">Still available</label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary py-2 px-4 text-sm">
          {loading ? 'Posting...' : initial ? 'Update Post' : 'Post to Community'}
        </button>
      </div>
    </form>
  )
}

function PostCard({ post, onEdit, onDelete }) {
  const Icon = TYPE_ICONS[post.post_type] || Leaf
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${!post.is_available ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center">
            <Icon size={15} className="text-primary" />
          </div>
          <Badge label={post.post_type} variant={TYPE_VARIANTS[post.post_type] || 'default'} />
          {!post.is_available && <Badge label="Taken" variant="red" />}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(post)} className="p-1.5 rounded-lg hover:bg-sage/60 text-muted hover:text-primary transition-colors"><Edit2 size={13} /></button>
          <button onClick={() => onDelete(post._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>
      <h3 className="font-semibold text-dark mb-1">{post.title}</h3>
      <p className="text-sm text-muted leading-relaxed mb-3 line-clamp-2">{post.description}</p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        {post.author_name && <span className="flex items-center gap-1"><Users size={11} />{post.author_name}</span>}
        {post.location && <span className="flex items-center gap-1"><MapPin size={11} />{post.location}</span>}
        {post.contact_info && <span className="flex items-center gap-1"><MessageCircle size={11} />{post.contact_info}</span>}
      </div>
      <div className="mt-3 pt-3 border-t border-sage/40 text-xs text-muted">
        Posted {new Date(post.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
    </motion.div>
  )
}

export default function CommunityPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editPost, setEditPost] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [alert, setAlert] = useState(null)

  const load = async () => {
    try {
      const res = await communityApi.getAll()
      setPosts(res.data.posts || [])
    } catch {
      const demoPosts = readDemoPosts()
      setPosts(demoPosts)
      saveDemoPosts(demoPosts)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await communityApi.create(form)
      setShowAdd(false)
      setAlert({ type: 'success', message: 'Post shared with community!' })
      load()
    } catch {
      const next = [{ ...form, _id: `local-${Date.now()}`, created_at: new Date().toISOString() }, ...readDemoPosts()]
      saveDemoPosts(next); setPosts(next); setShowAdd(false)
      setAlert({ type: 'success', message: 'Your listing is saved on this device.' })
    } finally { setSaving(false) }
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try {
      await communityApi.update(editPost._id, form)
      setEditPost(null)
      setAlert({ type: 'success', message: 'Post updated!' })
      load()
    } catch {
      const next = readDemoPosts().map(p => p._id === editPost._id ? { ...editPost, ...form } : p)
      saveDemoPosts(next); setPosts(next); setEditPost(null)
      setAlert({ type: 'success', message: 'Your listing has been updated on this device.' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await communityApi.delete(deleteId)
      setAlert({ type: 'success', message: 'Post removed.' })
      load()
    } catch {
      const next = readDemoPosts().filter(p => p._id !== deleteId)
      saveDemoPosts(next); setPosts(next); setDeleteId(null)
      setAlert({ type: 'success', message: 'Your listing has been removed.' })
    }
  }

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'All' || p.post_type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Community Exchange"
        subtitle="Share seeds, cuttings, tools, and tips with fellow urban gardeners"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Share Something
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

      {/* Search + Type filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {POST_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                typeFilter === type ? 'bg-primary text-white' : 'bg-white border border-sage text-muted hover:text-primary hover:border-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading community posts..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No posts yet"
          description="Be the first to share something with the community — seeds, cuttings, tips, or tools."
          action={<button onClick={() => setShowAdd(true)} className="btn-primary">Share Something</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((post) => (
            <PostCard key={post._id} post={post} onEdit={setEditPost} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Share with Community">
        <PostForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={saving} />
      </Modal>

      <Modal isOpen={!!editPost} onClose={() => setEditPost(null)} title="Edit Post">
        {editPost && <PostForm initial={editPost} onSubmit={handleUpdate} onCancel={() => setEditPost(null)} loading={saving} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="This community post will be permanently removed."
      />
    </div>
  )
}
