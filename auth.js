// Authentication kontrolü için ayrı dosya
// Bu dosya main.html'de kullanılacak

// API base URL - Deployed backend URL
const API_BASE_URL = 'https://pythonapi256.pythonanywhere.com/'; // Production API URL

// Login durumunu kontrol et ve koruma sağla
function protectPage() {
    const token = localStorage.getItem('licenseToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // 1. İyimser Yerel Kontrol: Sayfayı hızlıca yükle.
    // Kullanıcıyı bekletmeden, tarayıcıdaki verilere güvenerek anında erişim ver.
    // Bu, hızlı yenilemelerde atılma sorununu tamamen çözer.
    if (!token || isLoggedIn !== 'true') {
        clearLoginData();
        window.location.href = 'index.html';
        return; // Erişimi engelle ve fonksiyonu durdur.
    }

    // 2. Arka Planda Sunucu Doğrulaması (Asenkron ve Sessiz)
    // Sayfa yüklendikten sonra, arka planda sunucu ile token'ı doğrula.
    // Bu işlem kullanıcıyı engellemez.
    verifyTokenOnServer(token);
}

async function verifyTokenOnServer(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/verify_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token })
        });

        const data = await response.json();

        // Eğer sunucu token'ın geçersiz olduğunu söylerse, o zaman logout yap.
        if (!data.valid) {
            clearLoginData();
            window.location.href = 'index.html';
        }
        // Token geçerliyse hiçbir şey yapma, kullanıcı oturumuna devam eder.

    } catch (error) {
        // Ağ hatası durumunda kullanıcıyı atmak, kötü bir deneyim olabilir.
        // Bu yüzden sadece konsola hata yazdırıyoruz.
        console.error('Arka plan token doğrulama hatası:', error);
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