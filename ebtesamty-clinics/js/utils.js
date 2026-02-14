// Utility functions for Ebtesamty System

// Format currency to Egyptian Pounds
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format date to Arabic format
function formatDateArabic(date) {
    return new Date(date).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Show notification
function showNotification(message, type = 'info') {
    // You can implement toast notifications here
    console.log(`[${type}] ${message}`);
}

// Validate phone number (Egyptian numbers)
function validatePhone(phone) {
    const regex = /^(01)[0-9]{9}$/;
    return regex.test(phone);
}

// Export data to Excel
function exportToExcel(data, filename) {
    // This would require additional library like SheetJS
    console.log('Exporting to Excel:', filename);
}

// Calculate age from birth date
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Check internet connection
function isOnline() {
    return navigator.onLine;
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}