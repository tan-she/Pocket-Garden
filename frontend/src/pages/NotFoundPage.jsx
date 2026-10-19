import { Link } from 'react-router-dom'
import { Leaf, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-sage rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Leaf size={44} className="text-primary" />
        </div>
        <h1 className="font-serif text-6xl text-dark mb-3">404</h1>
        <h2 className="font-serif text-2xl text-dark mb-3">Page Not Found</h2>
        <p className="text-muted mb-8 max-w-sm mx-auto">
          This page seems to have gone dormant. Let's get you back to your garden.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </div>
  )
}
