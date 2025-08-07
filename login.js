// API base URL - Deployed backend URL
const API_BASE_URL = 'https://tekrar-backend.onrender.com'; // Production API URL

// Login durumunu kontrol et
function checkLoginStatus() {
    const token = localStorage.getItem('licenseToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (token && isLoggedIn === 'true') {
        // Token'ı doğrula
        verifyToken(token);
    }
}

// Token doğrulama
async function verifyToken(token) {
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
            // Token geçerli, main sayfasına yönlendir
            window.location.href = 'main.html';
        } else {
            // Token geçersiz, local storage'ı temizle
            clearLoginData();
        }
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        clearLoginData();
    }
}

// Login verilerini temizle
function clearLoginData() {
    localStorage.removeItem('licenseToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('licenseCode');
}

// Login form işlemi
async function handleLogin(event) {
    event.preventDefault();
    
    const codeInput = document.getElementById('code');
    const messageElement = document.getElementById('message');
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    const code = codeInput.value.trim();
    
    if (!code) {
        showMessage('Lütfen bir kod girin.', 'error');
        return;
    }
    
    // Button'ı deaktif et
    submitButton.disabled = true;
    submitButton.textContent = 'Kontrol ediliyor...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/check_code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code })
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.allowed) {
            // Başarılı login
            localStorage.setItem('licenseToken', data.token);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('licenseCode', code);
            
            showMessage(data.message, 'success');
            
            // 1 saniye sonra main sayfasına yönlendir
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1000);
            
        } else {
            // Hatalı login
            showMessage(data.message, 'error');
            codeInput.value = '';
        }
        
    } catch (error) {
        console.error('Login hatası:', error);
        showMessage('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
    } finally {
        // Button'ı tekrar aktif et
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
}

// Mesaj gösterme
function showMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
    
    // 5 saniye sonra mesajı gizle
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Login durumunu kontrol et
    checkLoginStatus();
    
    // Login form event listener
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});
