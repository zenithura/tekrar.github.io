// Authentication kontrolü için ayrı dosya
// Bu dosya main.html'de kullanılacak

// API base URL - Deployed backend URL
const API_BASE_URL = 'https://pythonapi256.pythonanywhere.com/'; // Production API URL

// Login durumunu kontrol et ve koruma sağla
function protectPage() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // Eğer kullanıcı 'isLoggedIn' durumu 'true' değilse, giriş sayfasına yönlendir.
    // Bu kontrol, sayfa her yenilendiğinde sunucuya gitmek yerine
    // tarayıcıda yerel olarak yapılır, bu da hızlı ve güvenilirdir.
    if (isLoggedIn !== 'true') {
        // Tutarsızlığı önlemek için tüm giriş verilerini temizle
        clearLoginData();
        window.location.href = 'index.html';
    }
    // 'isLoggedIn' durumu 'true' ise, kullanıcının sayfada kalmasına izin verilir.
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
