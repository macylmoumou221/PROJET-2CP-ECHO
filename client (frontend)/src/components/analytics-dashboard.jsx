"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("today")
  const analytics = mockAdminAnalytics

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  const userDistributionData = [
    { name: "Étudiants", value: analytics.userDistribution.students },
    { name: "Enseignants", value: analytics.userDistribution.teachers },
    { name: "Administrateurs", value: analytics.userDistribution.admins },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tableau de bord analytique</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange("today")}
            className={`px-4 py-2 rounded ${timeRange === "today" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded ${timeRange === "week" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Semaine
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded ${timeRange === "month" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Mois
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Nouveaux utilisateurs</h3>
          <p className="text-3xl font-bold">{analytics.today.newUsers}</p>
          <p className="text-sm text-gray-500">Aujourd'hui</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Utilisateurs actifs</h3>
          <p className="text-3xl font-bold">{analytics.today.activeUsers}</p>
          <p className="text-sm text-gray-500">Aujourd'hui</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Nouvelles publications</h3>
          <p className="text-3xl font-bold">{analytics.today.newPosts}</p>
          <p className="text-sm text-gray-500">Aujourd'hui</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Nouvelles réclamations</h3>
          <p className="text-3xl font-bold">{analytics.today.newClaims}</p>
          <p className="text-sm text-gray-500">Aujourd'hui</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Activité par heure</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.activityByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Distribution des utilisateurs</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Création de contenu par jour</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.contentCreationByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="posts" fill="#8884d8" name="Publications" />
              <Bar dataKey="claims" fill="#82ca9d" name="Réclamations" />
              <Bar dataKey="lostFound" fill="#ffc658" name="Objets perdus/trouvés" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total utilisateurs</h3>
          <p className="text-3xl font-bold">{analytics.total.users}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total publications</h3>
          <p className="text-3xl font-bold">{analytics.total.posts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total réclamations</h3>
          <p className="text-3xl font-bold">{analytics.total.claims}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total objets perdus/trouvés</h3>
          <p className="text-3xl font-bold">{analytics.total.lostFound}</p>
        </div>
      </div>
    </div>
  )
}
