import { LogOut } from 'lucide-react'
import './Layout.css'

function Layout({ user, onLogout, children, tabs, activeTab, setActiveTab }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="logo">
          <svg viewBox="0 0 200 60" width="150" height="45">
            <text x="10" y="40" fontFamily="Arial, sans-serif" fontSize="35" fontWeight="bold">
              <tspan fill="#E91E63">iN</tspan>
              <tspan fill="#fff">10N</tspan>
              <tspan fill="#E91E63">T</tspan>
            </text>
          </svg>
        </div>
        <div className="user-info">
          <span>{user.fullName} ({user.role})</span>
          <button onClick={onLogout} className="btn-logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      
      {tabs && (
        <nav className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}
      
      <main className="content">
        {children}
      </main>
    </div>
  )
}

export default Layout
