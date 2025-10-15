import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const data = localStorage.getItem('adminData');
    if (data) setAdminData(JSON.parse(data));
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin');
  };

  const cards = [
    {
      title: 'Upload Notes',
      description: 'Upload study materials and notes',
      icon: '📚',
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/admin/notes')
    },
    {
      title: 'Timetable',
      description: 'Create or upload timetable images',
      icon: '📅',
      color: 'from-green-500 to-green-600',
      action: () => navigate('/admin/timetable')
    },
    {
      title: 'Important Notes',
      description: 'Send important notifications to students',
      icon: '⚠️',
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/admin/important-notes')
    },
    {
      title: 'MCQ Tests',
      description: 'Create and manage MCQ tests',
      icon: '📝',
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/admin/mcq')
    }
  ];

  const stats = [
    { label: 'Active Students', value: '1,234', change: '+12%' },
    { label: 'Total Notes', value: '89', change: '+5%' },
    { label: 'MCQ Tests', value: '23', change: '+8%' },
    { label: 'Notifications', value: '156', change: '+15%' }
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div className="admin-dashboard-title">
            <div className="admin-welcome">
              <h1>Welcome back, {adminData?.name || 'Admin'} 👋</h1>
              <p>{currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <div className="admin-time">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
          <button onClick={handleLogout} className="admin-dashboard-logout">
            <span>🚪</span>
            Logout
          </button>
        </div>

        <div className="admin-stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="admin-stat-card">
              <div className="admin-stat-value">{stat.value}</div>
              <div className="admin-stat-label">{stat.label}</div>
              <div className="admin-stat-change positive">{stat.change}</div>
            </div>
          ))}
        </div>

        <div className="admin-dashboard-grid">
          {cards.map((card, index) => (
            <div key={index} className="admin-dashboard-card" onClick={card.action}>
              <div className={`admin-card-icon bg-gradient-to-r ${card.color}`}>
                {card.icon}
              </div>
              <div className="admin-card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="admin-card-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;