// Store custom subject names
let subjectNames = JSON.parse(localStorage.getItem('subjectNames')) || {
    physics: 'Fizika',
    math: 'Riyaziyyat',
    informatics: 'İnformatika'
};

// Global variables for each subject
let physicsChapters = JSON.parse(localStorage.getItem('physicsChapters')) || [];
let mathChapters = JSON.parse(localStorage.getItem('mathChapters')) || [];
let informaticsChapters = JSON.parse(localStorage.getItem('informaticsChapters')) || [];

// Track completed reviews per subject
let physicsCompletedReviews = parseInt(localStorage.getItem('physicsCompletedReviews')) || 0;
let mathCompletedReviews = parseInt(localStorage.getItem('mathCompletedReviews')) || 0;
let informaticsCompletedReviews = parseInt(localStorage.getItem('informaticsCompletedReviews')) || 0;

// Initialize creationDate for old entries if missing
[physicsChapters, mathChapters, informaticsChapters].forEach(chapterList => {
    chapterList.forEach(chapter => {
        if (!chapter.creationDate) {
            chapter.creationDate = new Date().toISOString();
        }
    });
});

let currentSubject = 'today-all';
let chapters = [];

let simulatedCurrentDate = new Date(); // Simulyasiya üçün tarix
simulatedCurrentDate.setHours(0, 0, 0, 0); // Set to start of the day

const reviewIntervals = [3, 7, 14, 30, 60]; // günlər

const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
    'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

// Get all chapters from all subjects
function getAllChapters() {
    return [...physicsChapters, ...mathChapters, ...informaticsChapters];
}

// Tab switching functionality
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.subject-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        const subject = this.getAttribute('data-subject');
        document.getElementById(`${subject}-content`).classList.add('active');
        
        // Update current subject and chapters
        currentSubject = subject;
        switch(subject) {
            case 'physics':
                chapters = physicsChapters;
                break;
            case 'math':
                chapters = mathChapters;
                break;
            case 'informatics':
                chapters = informaticsChapters;
                break;
            case 'today-all':
            case 'tomorrow-all':
                chapters = getAllChapters();
                break;
        }
        
        // Refresh display
        updateDisplay();
    });
});

function saveData() {
    localStorage.setItem('physicsChapters', JSON.stringify(physicsChapters));
    localStorage.setItem('physicsCompletedReviews', physicsCompletedReviews);
    localStorage.setItem('mathChapters', JSON.stringify(mathChapters));
    localStorage.setItem('mathCompletedReviews', mathCompletedReviews);
    localStorage.setItem('informaticsChapters', JSON.stringify(informaticsChapters));
    localStorage.setItem('informaticsCompletedReviews', informaticsCompletedReviews);
}

function addChapter(subject) {
    const nameInputId = `${subject}ChapterName`;
    const numberInputId = `${subject}ChapterNumber`;
    const chapterName = document.getElementById(nameInputId).value.trim();
    const chapterNumber = parseInt(document.getElementById(numberInputId).value);
    
    let subjectChapters;
    switch(subject) {
        case 'physics':
            subjectChapters = physicsChapters;
            break;
        case 'math':
            subjectChapters = mathChapters;
            break;
        case 'informatics':
            subjectChapters = informaticsChapters;
            break;
    }
    
    if (!chapterName || !chapterNumber) {
        alert('Zəhmət olmasa, bölmənin adını və nömrəsini daxil edin!');
        return;
    }
    
    if (subjectChapters.find(ch => ch.number === chapterNumber)) {
        alert('Bu nömrədə bölmə artıq mövcuddur!');
        return;
    }
    
    const newChapter = {
        id: Date.now(),
        name: chapterName,
        number: chapterNumber,
        subject: subject,
        reviewLevel: 0,
        nextReviewDate: simulatedCurrentDate.toISOString(),
        lastReviewDate: null,
        isCompleted: false,
        creationDate: new Date().toISOString()
    };
    
    subjectChapters.push(newChapter);
    subjectChapters.sort((a, b) => a.number - b.number);
    
    document.getElementById(nameInputId).value = '';
    document.getElementById(numberInputId).value = '';
    
    // Update current chapters if needed
    if (currentSubject === subject) {
        chapters = subjectChapters;
    } else if (currentSubject === 'today-all' || currentSubject === 'tomorrow-all') {
        chapters = getAllChapters();
    }
    
    saveData();
    updateDisplay();
}

function updateDisplay() {
    if (currentSubject === 'today-all') {
        updateAllTodayDisplay();
    } else if (currentSubject === 'tomorrow-all') {
        updateAllTomorrowDisplay();
    } else {
        updateStats();
        updateTodayTasks();
        updateChaptersGrid();
    }
}

function updateAllTodayDisplay() {
    const allChapters = getAllChapters();
    const todayTasks = [];
    const overdueItems = [];

    allChapters.forEach(ch => {
        if (!ch.isCompleted) {
            const overdueDays = isOverdue(ch.nextReviewDate);
            if (isTodayTask(ch.nextReviewDate) || overdueDays > 0) {
                todayTasks.push(ch);
            }
            if (overdueDays > 0) {
                overdueItems.push(ch);
            }
        }
    });

    const totalCompleted = physicsCompletedReviews + mathCompletedReviews + informaticsCompletedReviews;

    document.getElementById('allTodayTasks').textContent = todayTasks.length;
    document.getElementById('allOverdueItems').textContent = overdueItems.length;
    document.getElementById('allTotalChapters').textContent = allChapters.length;
    document.getElementById('allCompletedReviews').textContent = totalCompleted;

    const todayTasksList = document.getElementById('allTodayTasksList');
    todayTasksList.innerHTML = ''; // Clear existing list

    if (todayTasks.length === 0) {
        todayTasksList.innerHTML = `
            <div class="empty-state">
                <h3>Bu gün üçün tapşırıq yoxdur! 🎉</h3>
                <p>Əla! Bu gün üçün bütün təkrarlarınızı tamamladınız.</p>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();
    todayTasks.forEach(chapter => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        const overdueDays = isOverdue(chapter.nextReviewDate);
        taskItem.innerHTML = `
            <div class="task-info">
                <div class="task-name">Bölmə ${chapter.number}: ${chapter.name}</div>
                <div class="task-type">${getReviewTypeText(chapter.reviewLevel)} ${overdueDays > 0 ? `(GECİKMİŞ ${overdueDays} gün)` : ''}</div>
                <div class="task-subject">${getSubjectName(chapter.subject)}</div>
            </div>
            <input type="checkbox" onchange="completeReviewFromAll(${chapter.id}, '${chapter.subject}')" style="width: 20px; height: 20px;">
        `;
        fragment.appendChild(taskItem);
    });
    todayTasksList.appendChild(fragment);
}

function updateAllTomorrowDisplay() {
    const allChapters = getAllChapters();
    const tomorrowDate = new Date(simulatedCurrentDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowDateString = tomorrowDate.toDateString();

    const tomorrowTasks = allChapters.filter(ch => 
        !ch.isCompleted && new Date(ch.nextReviewDate).toDateString() === tomorrowDateString
    );

    document.getElementById('allTomorrowTasks').textContent = tomorrowTasks.length;

    const tomorrowTasksList = document.getElementById('allTomorrowTasksList');
    tomorrowTasksList.innerHTML = ''; // Clear existing list

    if (tomorrowTasks.length === 0) {
        tomorrowTasksList.innerHTML = `
            <div class="empty-state">
                <h3>Sabah üçün tapşırıq yoxdur! 🎉</h3>
                <p>Sabah üçün heç bir təkrar planlanmayıb.</p>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();
    tomorrowTasks.forEach(chapter => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="task-info">
                <div class="task-name">Bölmə ${chapter.number}: ${chapter.name}</div>
                <div class="task-type">${getReviewTypeText(chapter.reviewLevel)}</div>
                <div class="task-subject">${getSubjectName(chapter.subject)}</div>
            </div>
        `;
        fragment.appendChild(taskItem);
    });
    tomorrowTasksList.appendChild(fragment);
}

function getSubjectName(subject) {
    return subjectNames[subject] || subject;
}

function completeReviewFromAll(chapterId, subject) {
    let targetChapters;
    switch(subject) {
        case 'physics':
            targetChapters = physicsChapters;
            break;
        case 'math':
            targetChapters = mathChapters;
            break;
        case 'informatics':
            targetChapters = informaticsChapters;
            break;
    }

    const chapter = targetChapters.find(ch => ch.id === chapterId);
    if (!chapter) return;
    
    chapter.lastReviewDate = simulatedCurrentDate.toISOString();
    chapter.reviewLevel = Math.min(chapter.reviewLevel + 1, reviewIntervals.length);
    
    const nextDate = new Date(simulatedCurrentDate);
    nextDate.setDate(nextDate.getDate() + reviewIntervals[chapter.reviewLevel - 1]);
    chapter.nextReviewDate = nextDate.toISOString();
    
    if (chapter.reviewLevel === reviewIntervals.length) {
        chapter.isCompleted = true;
    }
    
    // Increment subject-specific completed reviews
    switch(subject) {
        case 'physics':
            physicsCompletedReviews++;
            break;
        case 'math':
            mathCompletedReviews++;
            break;
        case 'informatics':
            informaticsCompletedReviews++;
            break;
    }
    
    saveData();
    updateDisplay();
}

function isTomorrowTask(dateString) {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    const tomorrow = new Date(simulatedCurrentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return date.getTime() === tomorrow.getTime();
}

function updateStats() {
    const todayTasks = chapters.filter(ch => 
        !ch.isCompleted && (isTodayTask(ch.nextReviewDate) || isOverdue(ch.nextReviewDate) > 0)
    ).length;
    
    const overdueItems = chapters.filter(ch => 
        !ch.isCompleted && isOverdue(ch.nextReviewDate) > 0
    ).length;
    
    const statsMap = {
        'physics': {
            totalChapters: 'physicalTotalChapters',
            todayTasks: 'physicsTodayTasks',
            completedReviews: 'physicsCompletedReviews',
            overdueItems: 'physicsOverdueItems'
        },
        'math': {
            totalChapters: 'mathTotalChapters',
            todayTasks: 'mathTodayTasks',
            completedReviews: 'mathCompletedReviews',
            overdueItems: 'mathOverdueItems'
        },
        'informatics': {
            totalChapters: 'informaticsTotalChapters',
            todayTasks: 'informaticsTodayTasks',
            completedReviews: 'informaticsCompletedReviews',
            overdueItems: 'informaticsOverdueItems'
        }
    };
    
    const stats = statsMap[currentSubject];
    if (!stats) return; // Exit if currentSubject is not a specific subject
    
    document.getElementById(stats.totalChapters).textContent = chapters.length;
    document.getElementById(stats.todayTasks).textContent = todayTasks;
    
    // Use subject-specific completed reviews
    switch(currentSubject) {
        case 'physics':
            document.getElementById(stats.completedReviews).textContent = physicsCompletedReviews;
            break;
        case 'math':
            document.getElementById(stats.completedReviews).textContent = mathCompletedReviews;
            break;
        case 'informatics':
            document.getElementById(stats.completedReviews).textContent = informaticsCompletedReviews;
            break;
    }
    
    document.getElementById(stats.overdueItems).textContent = overdueItems;
}

function updateTodayTasks() {
    const todayTasksListId = `${currentSubject}TodayTasksList`;
    const todayTasksList = document.getElementById(todayTasksListId);
    if (!todayTasksList) return; // Exit if element doesn't exist for the current view
    
    const todayTasks = chapters.filter(ch => 
        !ch.isCompleted && (isTodayTask(ch.nextReviewDate) || isOverdue(ch.nextReviewDate) > 0)
    );
    
    if (todayTasks.length === 0) {
        todayTasksList.innerHTML = `
            <div class="empty-state">
                <h3>Bu gün üçün tapşırıq yoxdur! 🎉</h3>
                <p>Əla! Bu gün üçün bütün təkrarlarınızı tamamladınız.</p>
            </div>
        `;
        return;
    }
    
    todayTasksList.innerHTML = todayTasks.map(chapter => `
        <div class="task-item">
            <div class="task-info">
                <div class="task-name">Bölmə ${chapter.number}: ${chapter.name}</div>
                <div class="task-type">${getReviewTypeText(chapter.reviewLevel)} ${isOverdue(chapter.nextReviewDate) > 0 ? `(GECİKMİŞ ${isOverdue(chapter.nextReviewDate)} gün)` : ''}</div>
                <div class="task-subject">${getSubjectName(chapter.subject)}</div>
            </div>
            <input type="checkbox" onchange="completeReview(${chapter.id})" style="width: 20px; height: 20px;">
        </div>
    `).join('');
}

function formatNextReviewDateShort(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function updateChaptersGrid() {
    const chaptersGridId = `${currentSubject}ChaptersGrid`;
    const chaptersGrid = document.getElementById(chaptersGridId);
    if (!chaptersGrid) return; // Exit if element doesn't exist

    if (chapters.length === 0) {
        chaptersGrid.innerHTML = `
            <div class="empty-state">
                <h3>Hələ bölmə əlavə edilməyib</h3>
                <p>Yuxarıdakı formu istifadə edərək ilk bölmənizi əlavə edin və aralıqlı təkrar sistemini başladın!</p>
            </div>
        `;
        return;
    }
    
    chaptersGrid.innerHTML = chapters.map(chapter => {
        const nextReviewText = formatDate(chapter.nextReviewDate);
        const nextReviewDateShort = formatNextReviewDateShort(chapter.nextReviewDate);
        const isOverdueChapter = isOverdue(chapter.nextReviewDate) > 0;
        const progressPercent = chapter.reviewLevel * 20;
        
        return `
            <div class="chapter-card">
                <div class="chapter-header">
                    <div class="chapter-title">${chapter.name}</div>
                    <div class="chapter-number">${chapter.number}</div>
                </div>
                <div class="chapter-status">
                    <div class="status-item">
                        <span class="status-label">Təkrar Səviyyəsi:</span>
                        <span class="status-value">${getReviewTypeText(chapter.reviewLevel)}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Sonrakı Təkrar:</span>
                        <span class="status-value ${isOverdueChapter ? 'overdue' : 'next-review'}">
                            ${nextReviewText}
                        </span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Sonrakı Təkrar Tarixi:</span>
                        <span class="status-value">${nextReviewDateShort}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Hazırki İrəliləyiş:</span>
                        <span class="status-value">${Math.round(progressPercent)}%</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Əlavə Edilmə Tarixi:</span>
                        <span class="status-value">${formatCreationDate(chapter.creationDate)}</span>
                    </div>
                    ${chapter.isCompleted ? 
                        '<div style="text-align: center; color: #28a745; font-weight: bold; margin-top: 10px;">✅ Tamamlandı</div>' : 
                        `<div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn" style="background: #6c757d; color: white; font-size: 14px;" onclick="resetChapter(${chapter.id})">
                                Sıfırla
                            </button>
                        </div>`
                    }
                    <button class="btn" style="background: #dc3545; color: white; width: 100%; margin-top: 10px; font-size: 14px;" onclick="deleteChapter(${chapter.id})">
                        Sil
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function completeReview(chapterId) {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;
    
    chapter.lastReviewDate = simulatedCurrentDate.toISOString();
    chapter.reviewLevel = Math.min(chapter.reviewLevel + 1, reviewIntervals.length);
    
    const nextDate = new Date(simulatedCurrentDate);
    nextDate.setDate(nextDate.getDate() + reviewIntervals[chapter.reviewLevel - 1]);
    chapter.nextReviewDate = nextDate.toISOString();
    
    if (chapter.reviewLevel === reviewIntervals.length) {
        chapter.isCompleted = true;
    }
    
    // Increment subject-specific completed reviews
    switch(currentSubject) {
        case 'physics':
            physicsCompletedReviews++;
            break;
        case 'math':
            mathCompletedReviews++;
            break;
        case 'informatics':
            informaticsCompletedReviews++;
            break;
    }
    
    saveData();
    updateDisplay();
}

function resetChapter(chapterId) {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;
    
    chapter.reviewLevel = 0;
    chapter.nextReviewDate = simulatedCurrentDate.toISOString();
    chapter.lastReviewDate = null;
    chapter.isCompleted = false;
    
    saveData();
    updateDisplay();
}

function deleteChapter(chapterId) {
    if (confirm('Bu bölməni silmək istədiyinizdən əminsiniz?')) {
        chapters = chapters.filter(ch => ch.id !== chapterId);
        
        switch(currentSubject) {
            case 'physics':
                physicsChapters = chapters;
                break;
            case 'math':
                mathChapters = chapters;
                break;
            case 'informatics':
                informaticsChapters = chapters;
                break;
        }
        
        saveData();
        updateDisplay();
    }
}

function formatDate(dateString) {
    const overdueDays = isOverdue(dateString);
    if (overdueDays > 0) {
        return `${overdueDays} gün gecikmiş`;
    }

    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    const simulatedDate = new Date(simulatedCurrentDate);
    simulatedDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((date - simulatedDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Bu gün';
    } else if (diffDays === 1) {
        return 'Sabah';
    } else if (diffDays === 60) {
        return 'Tamamlandı';
    } else {
        return `${diffDays} gün sonra`;
    }
}

function isOverdue(dateString) {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((simulatedCurrentDate - date) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

function isTodayTask(dateString) {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === simulatedCurrentDate.getTime();
}

function getReviewTypeText(level) {
    const types = ['İlk Təkrar', '2. Təkrar', '3. Təkrar', '4. Təkrar', 'Tamamlandı'];
    return types[level - 1] || 'Öyrənildi';
}

function formatCreationDate(dateString) {
    if (!dateString) return 'Məlumat yoxdur';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'Yanlış Tarix';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Event listeners for Enter key
document.getElementById('physicsChapterName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addChapter('physics');
});
document.getElementById('physicsChapterNumber').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addChapter('physics');
});
document.getElementById('mathChapterName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addChapter('math');
});
document.getElementById('mathChapterNumber').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addChapter('math');
});
document.getElementById('informaticsChapterName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addChapter('informatics');
});
document.getElementById('informaticsChapterNumber').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addChapter('informatics');
});

// Function to save subject names to localStorage
function saveSubjectNames() {
    localStorage.setItem('subjectNames', JSON.stringify(subjectNames));
}

// Function to handle subject name editing
function initializeEditButtons() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent tab switching

            const tab = this.closest('.tab');
            const subject = tab.getAttribute('data-subject');
            const nameSpan = tab.querySelector('.subject-name');
            const currentName = nameSpan.textContent;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.className = 'subject-name-input';

            nameSpan.replaceWith(input);
            input.focus();

            let saved = false; // Flag to prevent double execution
            const saveName = () => {
                if (saved) return; // If already saved, do nothing
                saved = true;

                const newName = input.value.trim();
                if (newName && newName !== currentName) {
                    subjectNames[subject] = newName;
                    saveSubjectNames();
                }

                const newNameSpan = document.createElement('span');
                newNameSpan.className = 'subject-name';
                newNameSpan.textContent = newName || currentName;

                input.replaceWith(newNameSpan);
                updateDisplay(); // Refresh UI to show new name everywhere
            };

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveName();
                }
            });

            input.addEventListener('blur', saveName);
        });
    });
}

// Apply stored subject names to tabs on load
function applyInitialSubjectNames() {
    document.querySelectorAll('.tab[data-subject]').forEach(tab => {
        const subject = tab.getAttribute('data-subject');
        if (subjectNames[subject]) {
            const nameSpan = tab.querySelector('.subject-name');
            if (nameSpan) {
                nameSpan.textContent = subjectNames[subject];
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    applyInitialSubjectNames();
    initializeEditButtons();

    // Set the default tab to 'today-all'
    const defaultTab = document.querySelector('.tab[data-subject="today-all"]');
    if (defaultTab) {
        defaultTab.click();
    }
    updateDisplay(); // Initial display update
});

// Modal functions
function clearAllData() {
    const modal = document.getElementById('clearDataModal');
    modal.style.display = 'flex';
    
    // Reset checkboxes
    document.querySelectorAll('input[name="clearSubject"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('clearAllSubjects').checked = false;
}

function closeClearDataModal() {
    document.getElementById('clearDataModal').style.display = 'none';
}

function confirmClearSelectedData() {
    const clearAllSubjects = document.getElementById('clearAllSubjects').checked;
    const selectedSubjects = Array.from(
        document.querySelectorAll('input[name="clearSubject"]:checked')
    ).map(checkbox => checkbox.value);

    if (!clearAllSubjects && selectedSubjects.length === 0) {
        closeClearDataModal();
        return;
    }

    const confirmMessage = clearAllSubjects 
        ? 'DİQQƏT: Bütün bölmələri silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz!'
        : `DİQQƏT: Seçilmiş bölmələri silmək istədiyinizə əminsiniz? (${selectedSubjects.join(', ')})`;
    
    if (confirm(confirmMessage)) {
        if (clearAllSubjects) {
            // Login bilgilerini koru
            const licenseToken = localStorage.getItem('licenseToken');
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            const licenseCode = localStorage.getItem('licenseCode');
            
            localStorage.removeItem('physicsChapters');
            localStorage.removeItem('physicsCompletedReviews');
            localStorage.removeItem('mathChapters');
            localStorage.removeItem('mathCompletedReviews');
            localStorage.removeItem('informaticsChapters');
            localStorage.removeItem('informaticsCompletedReviews');
            
            // Login bilgilerini geri yükle
            if (licenseToken) localStorage.setItem('licenseToken', licenseToken);
            if (isLoggedIn) localStorage.setItem('isLoggedIn', isLoggedIn);
            if (licenseCode) localStorage.setItem('licenseCode', licenseCode);
            
            physicsChapters = [];
            mathChapters = [];
            informaticsChapters = [];
            physicsCompletedReviews = 0;
            mathCompletedReviews = 0;
            informaticsCompletedReviews = 0;
            chapters = [];
        } else {
            selectedSubjects.forEach(subject => {
                switch(subject) {
                    case 'physics':
                        localStorage.removeItem('physicsChapters');
                        localStorage.removeItem('physicsCompletedReviews');
                        physicsChapters = [];
                        physicsCompletedReviews = 0;
                        break;
                    case 'math':
                        localStorage.removeItem('mathChapters');
                        localStorage.removeItem('mathCompletedReviews');
                        mathChapters = [];
                        mathCompletedReviews = 0;
                        break;
                    case 'informatics':
                        localStorage.removeItem('informaticsChapters');
                        localStorage.removeItem('informaticsCompletedReviews');
                        informaticsChapters = [];
                        informaticsCompletedReviews = 0;
                        break;
                }
            });
        }
        
        chapters = getAllChapters();
        updateDisplay();
        closeClearDataModal();
        alert('Seçilmiş məlumatlar uğurla silindi.');
    }
}

document.getElementById('clearAllSubjects').addEventListener('change', function() {
    document.querySelectorAll('input[name="clearSubject"]').forEach(checkbox => {
        checkbox.checked = this.checked;
    });
});

document.querySelectorAll('input[name="clearSubject"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (!this.checked) {
            document.getElementById('clearAllSubjects').checked = false;
        } else {
            const allChecked = Array.from(document.querySelectorAll('input[name="clearSubject"]')).every(cb => cb.checked);
            document.getElementById('clearAllSubjects').checked = allChecked;
        }
    });
});
