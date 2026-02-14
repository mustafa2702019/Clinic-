// Data Management System
const EbtesamtySystem = {
    // Clinic branches
    branches: [
        { id: 1, name: 'سمالوط', nameEn: 'Samalout', active: true },
        { id: 2, name: 'التوفيقية', nameEn: 'Tawfiqeya', active: true },
        { id: 3, name: 'قلوصنا', nameEn: 'Qulusna', active: true }
    ],

    // Sample patients data
    patients: [
        {
            id: 1,
            name: 'أحمد محمد',
            phone: '01234567890',
            branch: 'سمالوط',
            doctor: 'د. إبراهيم',
            treatment: 'حشو عصب',
            lastVisit: '2024-01-15',
            totalPayments: 1500,
            pendingPayment: 0
        },
        // Add more patients...
    ],

    // Appointments data
    appointments: [
        {
            id: 1,
            patientId: 1,
            patientName: 'أحمد محمد',
            branch: 'سمالوط',
            doctor: 'د. إبراهيم',
            date: '2024-01-20',
            time: '10:00',
            status: 'confirmed',
            treatment: 'حشو عصب'
        },
        // Add more appointments...
    ],

    // Inventory data
    inventory: [
        {
            id: 1,
            name: 'مخدر موضعي',
            category: 'مخدر',
            quantity: 50,
            minThreshold: 20,
            unit: 'علبة',
            branch: 'سمالوط'
        },
        {
            id: 2,
            name: 'حشو كومبوزيت',
            category: 'حشوات',
            quantity: 15,
            minThreshold: 10,
            unit: 'علبة',
            branch: 'التوفيقية'
        },
        {
            id: 3,
            name: 'مادة طبعة',
            category: 'مواد طبعة',
            quantity: 5,
            minThreshold: 10,
            unit: 'علبة',
            branch: 'قلوصنا'
        },
        // Add more inventory items...
    ],

    // Transactions/Revenue data
    transactions: [
        {
            id: 1,
            patientId: 1,
            patientName: 'أحمد محمد',
            branch: 'سمالوط',
            amount: 500,
            type: 'كشف',
            date: '2024-01-15',
            paymentMethod: 'نقدي'
        },
        // Add more transactions...
    ],

    // User roles
    users: [
        {
            id: 1,
            name: 'د. ابرام عبد لمعى',
            role: 'admin',
            branch: 'all',
            username: 'dr_ebram',
            password: 'admin123' // In production, use hashed passwords
        },
        {
            id: 2,
            name: 'أحمد علي',
            role: 'staff',
            branch: 'سمالوط',
            username: 'ahmed_samalout',
            password: 'staff123'
        }
    ],

    // Get today's stats for a branch
    getBranchStats: function(branchName) {
        const today = new Date().toISOString().split('T')[0];
        
        const todayPatients = this.appointments.filter(apt => 
            apt.branch === branchName && apt.date === today
        ).length;

        const todayRevenue = this.transactions
            .filter(t => t.branch === branchName && t.date === today)
            .reduce((sum, t) => sum + t.amount, 0);

        const lowStockItems = this.inventory.filter(item => 
            item.branch === branchName && item.quantity <= item.minThreshold
        ).length;

        return {
            patients: todayPatients,
            revenue: todayRevenue,
            lowStock: lowStockItems
        };
    },

    // Get all alerts
    getAlerts: function() {
        let alerts = [];

        // Low inventory alerts
        this.inventory.forEach(item => {
            if (item.quantity <= item.minThreshold) {
                alerts.push({
                    type: 'danger',
                    title: `نقص في المخزون - ${item.name}`,
                    description: `الكمية المتبقية: ${item.quantity} ${item.unit} (${item.branch})`,
                    time: new Date().toLocaleTimeString('ar-EG')
                });
            }
        });

        // Pending payments alerts
        this.patients.forEach(patient => {
            if (patient.pendingPayment > 0) {
                alerts.push({
                    type: 'warning',
                    title: `مدفوعات متأخرة - ${patient.name}`,
                    description: `المبلغ المستحق: ${patient.pendingPayment} ج.م`,
                    time: new Date().toLocaleTimeString('ar-EG')
                });
            }
        });

        return alerts;
    },

    // Save data to localStorage (offline-first)
    saveToLocalStorage: function() {
        localStorage.setItem('ebtesamty_patients', JSON.stringify(this.patients));
        localStorage.setItem('ebtesamty_appointments', JSON.stringify(this.appointments));
        localStorage.setItem('ebtesamty_inventory', JSON.stringify(this.inventory));
        localStorage.setItem('ebtesamty_transactions', JSON.stringify(this.transactions));
    },

    // Load data from localStorage
    loadFromLocalStorage: function() {
        const savedPatients = localStorage.getItem('ebtesamty_patients');
        const savedAppointments = localStorage.getItem('ebtesamty_appointments');
        const savedInventory = localStorage.getItem('ebtesamty_inventory');
        const savedTransactions = localStorage.getItem('ebtesamty_transactions');

        if (savedPatients) this.patients = JSON.parse(savedPatients);
        if (savedAppointments) this.appointments = JSON.parse(savedAppointments);
        if (savedInventory) this.inventory = JSON.parse(savedInventory);
        if (savedTransactions) this.transactions = JSON.parse(savedTransactions);
    },

    // Add new patient
    addPatient: function(patientData) {
        const newPatient = {
            id: this.patients.length + 1,
            ...patientData,
            lastVisit: new Date().toISOString().split('T')[0],
            pendingPayment: 0
        };
        this.patients.push(newPatient);
        this.saveToLocalStorage();
        return newPatient;
    },

    // Add new appointment
    addAppointment: function(appointmentData) {
        const newAppointment = {
            id: this.appointments.length + 1,
            ...appointmentData,
            status: 'pending'
        };
        this.appointments.push(newAppointment);
        this.saveToLocalStorage();
        return newAppointment;
    }
};

// Initialize data from localStorage on load
EbtesamtySystem.loadFromLocalStorage();