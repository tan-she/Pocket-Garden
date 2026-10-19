import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { BarChart2, Leaf, Droplets, TrendingUp, Activity } from 'lucide-react'
import { analyticsApi } from '../services/api'
import { LoadingSpinner, StatCard, PageHeader, Alert } from '../components/ui'

const COLORS = ['#3F7952', '#C97955', '#214E34', '#DCE8D8', '#747B73', '#6B8F71']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-sage/40 px-4 py-3 text-sm">
        <p className="font-medium text-dark mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-xs">
            {p.name}: <span className="font-semibold">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [careData, setCareData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [survivalData, setSurvivalData] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    Promise.all([
      analyticsApi.getDashboard(),
      analyticsApi.getCareActivity(),
      analyticsApi.getPopularCategories(),
      analyticsApi.getSurvivalRates(),
    ])
      .then(([dashRes, careRes, catRes, survRes]) => {
        setData(dashRes.data)
        setCareData(careRes.data.care_activity || [])
        setCategoryData(catRes.data.categories || [])
        setSurvivalData(survRes.data.survival_rates || [])
      })
      .catch(() => setAlert({ type: 'error', message: 'Failed to load analytics. Is the backend running?' }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <LoadingSpinner message="Running aggregation queries..." />
    </div>
  )

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Analytics"
        subtitle="Insights from your garden data — powered by MongoDB aggregation pipelines"
      />

      {alert && <div className="mb-6"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}

      {/* Stat Cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard label="Total Plants" value={data.total_plants ?? 0} icon={Leaf} color="primary" />
          <StatCard label="Gardens" value={data.total_gardens ?? 0} icon={BarChart2} color="forest" />
          <StatCard label="Care Activities" value={data.total_care_logs ?? 0} icon={Activity} color="terracotta" />
          <StatCard label="Healthy Plants" value={`${data.healthy_percentage ?? 0}%`} icon={TrendingUp} color="sage" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Care Activity over time */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="font-serif text-xl text-dark mb-1">Care Activity (Last 30 Days)</h2>
          <p className="text-xs text-muted mb-4">Aggregated from care_logs collection</p>
          {careData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-muted text-sm">No care data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={careData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE8D8" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#747B73' }} />
                <YAxis tick={{ fontSize: 11, fill: '#747B73' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3F7952" radius={[4, 4, 0, 0]} name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Popular Plant Categories */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h2 className="font-serif text-xl text-dark mb-1">Popular Plant Categories</h2>
          <p className="text-xs text-muted mb-4">Aggregated from plants collection</p>
          {categoryData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-muted text-sm">No plant data yet.</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%" cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {categoryData.map((cat, i) => (
                  <div key={cat._id} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-dark font-medium">{cat._id}</span>
                    <span className="text-muted">({cat.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plant Survival / Health Rates */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 className="font-serif text-xl text-dark mb-1">Plant Health Distribution</h2>
          <p className="text-xs text-muted mb-4">Aggregated by health_status field</p>
          {survivalData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-muted text-sm">No health data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={survivalData} layout="vertical" margin={{ top: 4, right: 16, left: 60, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE8D8" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#747B73' }} />
                <YAxis type="category" dataKey="_id" tick={{ fontSize: 12, fill: '#26352B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Plants">
                  {survivalData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Care Type Breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="font-serif text-xl text-dark mb-1">Care Activity Summary</h2>
          <p className="text-xs text-muted mb-4">Activity counts by type</p>
          {!data?.care_type_summary || data.care_type_summary.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-muted text-sm">No care data yet.</div>
          ) : (
            <div className="space-y-3">
              {data.care_type_summary.map((item, i) => {
                const max = Math.max(...data.care_type_summary.map((d) => d.count))
                const pct = Math.round((item.count / max) * 100)
                return (
                  <div key={item._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-dark">{item._id}</span>
                      <span className="text-muted">{item.count} times</span>
                    </div>
                    <div className="h-2 bg-sage rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Aggregation pipeline info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 card bg-forest/5 border-forest/20">
        <h3 className="font-semibold text-dark mb-2 flex items-center gap-2">
          <BarChart2 size={16} className="text-primary" /> MongoDB Aggregation Pipelines Used
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted">
          {[
            { label: 'Plant count by category', desc: '$group by category field' },
            { label: 'Care activity timeline', desc: '$group by date with $dateToString' },
            { label: 'Health status distribution', desc: '$group by health_status' },
            { label: 'Survival rate calculation', desc: '$match + $count pipeline' },
            { label: 'Care type summary', desc: '$group on activity_type + $sort' },
            { label: 'Healthy plant percentage', desc: '$facet with multiple pipelines' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <span className="text-dark font-medium">{item.label}</span>
                <span className="text-muted"> — {item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
