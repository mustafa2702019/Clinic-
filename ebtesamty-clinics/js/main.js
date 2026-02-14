// Main Dashboard Logic
document.addEventListener('DOMContentLoaded', function() {
    // Display current date in Arabic
    displayCurrentDate();
    
    // Load branch cards
    loadBranchCards();
    
    // Load quick stats
    loadQuickStats();
    
    // Load charts
    loadCharts();
    
    // Load alerts
    loadAlerts();
    
    // Load upcoming appointments
    loadUpcomingAppointments();
});

function displayCurrentDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const today = new Date().toLocaleDateString('ar-EG', options);
    document.getElementById('currentDate').textContent = today;
}

function loadBranchCards() {
    const branchCards = document.getElementById('branchCards');
    branchCards.innerHTML = '';

    EbtesamtySystem.branches.forEach(branch => {
        const stats = EbtesamtySystem.getBranchStats(branch.name);
        
        const card = document.createElement('div');
        card.className = 'branch-card';
        card.innerHTML = `
            <div class="branch-header">
                <h4>${branch.name}</h4>
                <span class="branch-status">نشط</span>
            </div>
            <div class="branch-stats">
                <div class="stat-item">
                    <div class="stat-value">${stats.patients}</div>
                    <div class="stat-label">مرضى اليوم</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.revenue} ج.م</div>
                    <div class="stat-label">إيرادات اليوم</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${getTodayAppointments(branch.name)}</div>
                    <div class="stat-label">مواعيد</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value ${stats.lowStock > 0 ? 'text-danger' : ''}">${stats.lowStock}</div>
                    <div class="stat-label">مخزون منخفض</div>
                </div>
            </div>
        `;
        branchCards.appendChild(card);
    });
}

function getTodayAppointments(branchName) {
    const today = new Date().toISOString().split('T')[0];
    return EbtesamtySystem.appointments.filter(apt => 
        apt.branch === branchName && apt.date === today
    ).length;
}

function loadQuickStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Total patients today across all branches
    const todayPatients = EbtesamtySystem.appointments.filter(apt => 
        apt.date === today
    ).length;
    document.getElementById('todayPatients').textContent = todayPatients;

    // Total appointments today
    document.getElementById('todayAppointments').textContent = todayPatients;

    // Total revenue today
    const todayRevenue = EbtesamtySystem.transactions
        .filter(t => t.date === today)
        .reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('todayRevenue').textContent = `${todayRevenue} ج.م`;

    // Low stock items count
    const lowStock = EbtesamtySystem.inventory.filter(item => 
        item.quantity <= item.minThreshold
    ).length;
    document.getElementById('lowStockCount').textContent = lowStock;
}

function loadCharts() {
    // Daily Revenue Chart
    const ctx1 = document.getElementById('dailyRevenueChart').getContext('2d');
    const last7Days = getLast7Days();
    const revenueData = getRevenueForDays(last7Days);

    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: last7Days.map(day => formatDateArabic(day)),
            datasets: [{
                label: 'الإيرادات',
                data: revenueData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + ' ج.م';
                        }
                    }
                }
            }
        }
    });

    // Branch Comparison Chart
    const ctx2 = document.getElementById('branchComparisonChart').getContext('2d');
    const branchRevenue = EbtesamtySystem.branches.map(branch => {
        return EbtesamtySystem.transactions
            .filter(t => t.branch === branch.name)
            .reduce((sum, t) => sum + t.amount, 0);
    });

    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: EbtesamtySystem.branches.map(b => b.name),
            datasets: [{
                label: 'إجمالي الإيرادات',
                data: branchRevenue,
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(155, 89, 182, 0.8)'
                ],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + ' ج.م';
                        }
                    }
                }
            }
        }
    });
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }
    return days;
}

function getRevenueForDays(days) {
    return days.map(day => {
        return EbtesamtySystem.transactions
            .filter(t => t.date === day)
            .reduce((sum, t) => sum + t.amount, 0);
    });
}

function formatDateArabic(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { weekday: 'short' });
}

function loadAlerts() {
    const alertsList = document.getElementById('alertsList');
    const alerts = EbtesamtySystem.getAlerts();
    
    if (alerts.length === 0) {
        alertsList.innerHTML = '<p class="no-alerts">لا توجد تنبيهات جديدة</p>';
        return;
    }

    alertsList.innerHTML = '';
    alerts.slice(0, 5).forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = `alert-item ${alert.type}`;
        alertElement.innerHTML = `
            <i class="fas ${alert.type === 'danger' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-description">${alert.description}</div>
                <div class="alert-time">${alert.time}</div>
            </div>
        `;
        alertsList.appendChild(alertElement);
    });
}

function loadUpcomingAppointments() {
    const tbody = document.getElementById('upcomingAppointments');
    const today = new Date().toISOString().split('T')[0];
    
    const upcoming = EbtesamtySystem.appointments
        .filter(apt => apt.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    tbody.innerHTML = '';
    upcoming.forEach(apt => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${apt.patientName}</td>
            <td>${apt.branch}</td>
            <td>${apt.doctor}</td>
            <td>${apt.time}</td>
            <td>
                <span class="status-badge status-${apt.status}">
                    ${getStatusText(apt.status)}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusText(status) {
    const statusMap = {
        'confirmed': 'مؤكد',
        'pending': 'معلق',
        'cancelled': 'ملغي',
        'completed': 'مكتمل'
    };
    return statusMap[status] || status;
}

// Auto-refresh data every 5 minutes
setInterval(() => {
    loadBranchCards();
    loadQuickStats();
    loadAlerts();
    loadUpcomingAppointments();
}, 300000);