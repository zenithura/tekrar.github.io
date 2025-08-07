// Authentication kontrolü için ayrı dosya
// Bu dosya main.html'de kullanılacak

// API base URL - Bu URL'yi kendi API sunucunuzun adresiyle değiştirin
const API_BASE_URL = 'http://localhost:5000'; // Geliştirme için localhost, production'da gerçek API URL'si

// Login durumunu kontrol et ve koruma sağla
async function protectPage() {
    const token = localStorage.getItem('licenseToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!token || isLoggedIn !== 'true') {
        // Login olmamış, login sayfasına yönlendir
        window.location.href = 'index.html';
        return false;
    }
    
    // Token'ı doğrula
    try {
        const response = await fetch(`${API_BASE_URL}/api/verify_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token })
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.valid) {
            // Token geçerli, sayfaya erişim izni var
            return true;
        } else {
            // Token geçersiz, login verilerini temizle ve login sayfasına yönlendir
            clearLoginData();
            window.location.href = 'index.html';
            return false;
        }
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        // Hata durumunda da login sayfasına yönlendir
        clearLoginData();
        window.location.href = 'index.html';
        return false;
    }
}

// Login verilerini temizle
function clearLoginData() {
    localStorage.removeItem('licenseToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('licenseCode');
}

// Sayfa yüklendiğinde koruma kontrolü yap
document.addEventListener('DOMContentLoaded', function() {
    protectPage();
});
