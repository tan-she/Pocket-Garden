import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

// ── LoadingSpinner ────────────────────────────────────────────────────
export function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' }
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className={`${sizes[size]} animate-spin rounded-full border-4 border-sage border-t-primary`} />
      <p className="text-muted text-sm">{message}</p>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {Icon && (
        <div className="w-20 h-20 bg-sage rounded-2xl flex items-center justify-center mb-6">
          <Icon size={36} className="text-primary" />
        </div>
      )}
      <h3 className="font-serif text-2xl text-dark mb-2">{title}</h3>
      <p className="text-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}

// ── Toast / Alert ─────────────────────────────────────────────────────
export function Alert({ type = 'info', message, onClose }) {
  const styles = {
    success: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: CheckCircle, iconColor: 'text-green-600' },
    error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: AlertCircle, iconColor: 'text-red-600' },
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: Info, iconColor: 'text-blue-600' },
  }
  const { bg, text, icon: Icon, iconColor } = styles[type]
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} ${text}`}
    >
      <Icon size={18} className={iconColor} />
      <span className="text-sm font-medium flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
          <X size={16} />
        </button>
      )}
    </motion.div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, trend, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    terracotta: 'bg-terracotta/10 text-terracotta',
    forest: 'bg-forest/10 text-forest',
    sage: 'bg-sage text-primary',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {Icon && <Icon size={22} />}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-3xl font-serif text-dark mb-1">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </motion.div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(38,53,43,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-sage/40">
          <h3 className="font-serif text-xl text-dark">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sage/60 transition-colors">
            <X size={18} className="text-muted" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────
export function Badge({ label, variant = 'default' }) {
  const variants = {
    default: 'bg-sage text-primary',
    terracotta: 'bg-terracotta/15 text-terracotta',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`badge ${variants[variant]}`}>{label}</span>
  )
}

// ── PageHeader ────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="section-title mb-1">{title}</h1>
        {subtitle && <p className="text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

// ── ConfirmDialog ─────────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-muted mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose() }}
          className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-all ${
            danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-forest'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
