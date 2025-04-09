// 全局變數
const paperNames = {
    "1": "卷一 (第一章 風險及保險)",
    "2": "卷一 (第二章 法律原則)",
    "3": "卷一 (第三章 保險原則)",
    "4": "卷一 (第四章 保險公司的主要功能)",
    "5": "卷一 (第五章 香港保險業結構)",
    "6": "卷一 (第六章 保險業規管架構)",
    "7": "卷一 (第七章 職業道德及其他有關問題)"
};

const paperFiles = {
    "1": "data/paper1.json",
    "2": "data/paper2.json",
    "3": "data/paper3.json",
    "4": "data/paper4.json",
    "5": "data/paper5.json",
    "6": "data/paper6.json",
    "7": "data/paper7.json"
};

let currentPaper = "";
let currentPaperNumber = "";
let quizQuestions = [];
let userAnswers = {};
let startTime;
let timerInterval;
let loadedPapers = {};

// DOM元素
const welcomeScreen = document.querySelector('.welcome-screen');
const paperSelection = document.querySelector('.paper-selection');
const loadingScreen = document.querySelector('.loading-screen');
const quizContainer = document.querySelector('.quiz-container');
const resultsContainer = document.querySelector('.results-container');
const questionsContainer = document.getElementById('questions-container');
const resultsListContainer = document.getElementById('results-list');
const scoreDisplay = document.getElementById('score-display');
const progressBar = document.querySelector('.progress-bar');
const progressText = document.getElementById('progress-text');
const currentPaperInfo = document.getElementById('current-paper-info');
const resultPaperInfo = document.getElementById('result-paper-info');
const quizTimer = document.getElementById('quiz-timer');
const timeUsed = document.getElementById('time-used');
const correctCount = document.getElementById('correct-count');
const incorrectCount = document.getElementById('incorrect-count');
const unansweredWarning = document.getElementById('unanswered-warning');
const loadError = document.getElementById('load-error');

// 按鈕事件
document.getElementById('start-btn').addEventListener('click', () => {
    welcomeScreen.classList.remove('active');
    paperSelection.classList.add('active');
});

document.querySelectorAll('.paper-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        currentPaperNumber = e.target.dataset.paper;
        currentPaper = paperNames[currentPaperNumber];
        loadPaperData(currentPaperNumber);
    });
});

document.getElementById('submit-btn').addEventListener('click', submitQuiz);

document.getElementById('retry-same-btn').addEventListener('click', () => {
    resultsContainer.classList.remove('active');
    startQuiz(currentPaperNumber);
});

document.getElementById('retry-btn').addEventListener('click', () => {
    resultsContainer.classList.remove('active');
    paperSelection.classList.add('active');
});

// 從檔案載入試卷資料
function loadPaperData(paperNumber) {
    // 如果已經載入過該試卷，直接使用
    if (loadedPapers[paperNumber]) {
        startQuiz(paperNumber);
        return;
    }
    
    // 顯示載入畫面
    paperSelection.classList.remove('active');
    loadingScreen.classList.add('active');
    loadError.classList.remove('show');
    
    // 從檔案載入資料
    fetch(paperFiles[paperNumber])
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // 儲存載入的資料
            loadedPapers[paperNumber] = data;
            
            // 載入成功後開始測驗
            loadingScreen.classList.remove('active');
            startQuiz(paperNumber);
        })
        .catch(error => {
            console.error("載入試卷資料失敗:", error);
            loadingScreen.classList.remove('active');
            paperSelection.classList.add('active');
            loadError.classList.add('show');
        });
}

// 開始測驗
function startQuiz(paperNumber) {
    // 重置使用者答案
    userAnswers = {};
    
    // 設置當前試卷資訊
    currentPaperNumber = paperNumber;
    currentPaper = paperNames[paperNumber];
    currentPaperInfo.textContent = `試卷：${currentPaper}`;
    
    // 從載入的試卷中獲取所有題目
    const allQuestions = [];
    const paperData = loadedPapers[paperNumber];
    
    // 將各章節的題目合併到一個陣列中
    for (const chapter in paperData) {
        paperData[chapter].forEach(question => {
            allQuestions.push({...question, chapter});
        });
    }
    
    // 隨機選取10道題目
    quizQuestions = getRandomQuestions(allQuestions, 10);
    
    // 生成測驗界面
    generateQuiz(quizQuestions);
    
    // 顯示測驗畫面
    quizContainer.classList.add('active');
    
    // 開始計時
    startTime = new Date();
    startTimer();
}

// 從陣列中隨機選取指定數量的元素
function getRandomQuestions(arr, n) {
    // 複製陣列，避免修改原陣列
    const shuffled = [...arr];
    
    // Fisher-Yates 洗牌算法
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // 返回前n個元素
    return shuffled.slice(0, n);
}

// 生成測驗界面
function generateQuiz(questions) {
    questionsContainer.innerHTML = '';
    
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-container';
        questionDiv.id = `question-${index}`;
        
        // 解析題目選項
        const questionText = question.題目;
        const options = extractOptions(questionText);
        
        // 生成題目文字（不包含選項部分）
        const questionTextWithoutOptions = questionText.split(/\nA |A /).shift().trim();
        
        // 生成題目HTML
        let questionHTML = `
            <div class="question-text">
                <span class="question-number">${index + 1}.</span>
                ${questionTextWithoutOptions}
                ${question['*熱門題目'] ? '<span class="hot-question">[熱門題目]</span>' : ''}
            </div>
            <div class="options">
        `;
        
        // 生成選項HTML
        options.forEach(option => {
            const optionId = `q${index}-${option.key}`;
            questionHTML += `
                <div class="option">
                    <input type="radio" id="${optionId}" name="question-${index}" value="${option.key}">
                    <label for="${optionId}">${option.key}. ${option.text}</label>
                </div>
            `;
        });
        
        questionHTML += `</div>`;
        questionDiv.innerHTML = questionHTML;
        
        // 添加選項變更事件
        questionDiv.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                userAnswers[index] = radio.value;
                updateProgress();
            });
        });
        
        questionsContainer.appendChild(questionDiv);
    });
    
    // 重置進度條
    updateProgress();
}

// 從題目文字中提取選項
function extractOptions(questionText) {
    const options = [];
    const optionRegex = /\n([A-D]) (.*?)(?=\n[A-D] |\n$|$)/g;
    let match;
    
    while ((match = optionRegex.exec(questionText)) !== null) {
        options.push({
            key: match[1],
            text: match[2].trim()
        });
    }
    
    // 如果正則表達式沒有匹配到選項，嘗試另一種格式
    if (options.length === 0) {
        const lines = questionText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (/^[A-D] /.test(line)) {
                const key = line[0];
                const text = line.substring(2).trim();
                options.push({ key, text });
            }
        }
    }
    
    return options;
}

// 更新進度條
function updateProgress() {
    const answeredCount = Object.keys(userAnswers).length;
    const totalQuestions = quizQuestions.length;
    const progressPercentage = (answeredCount / totalQuestions) * 100;
    
    progressBar.style.width = `${progressPercentage}%`;
    progressText.textContent = `已作答：${answeredCount}/${totalQuestions} 題`;
}

// 開始計時器
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        const currentTime = new Date();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        
        quizTimer.textContent = `時間：${minutes}:${seconds}`;
        
        // 超過30分鐘顯示警告
        if (elapsedTime > 30 * 60) {
            quizTimer.classList.add('time-warning');
        }
    }, 1000);
}

// 提交測驗
function submitQuiz() {
    // 檢查是否所有題目都已回答
    const answeredCount = Object.keys(userAnswers).length;
    const totalQuestions = quizQuestions.length;
    
    if (answeredCount < totalQuestions) {
        unansweredWarning.classList.add('show');
        
        // 滾動到第一個未回答的題目
        for (let i = 0; i < totalQuestions; i++) {
            if (!userAnswers.hasOwnProperty(i)) {
                const questionElement = document.getElementById(`question-${i}`);
                questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                break;
            }
        }
        
        return;
    }
    
    // 停止計時器
    clearInterval(timerInterval);
    
    // 計算測驗結果
    const results = calculateResults();
    
    // 顯示結果
    showResults(results);
    
    // 切換到結果畫面
    quizContainer.classList.remove('active');
    resultsContainer.classList.add('active');
}

// 計算測驗結果
function calculateResults() {
    const results = {
        correctCount: 0,
        incorrectCount: 0,
        score: 0,
        details: []
    };
    
    quizQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.答案;
        const isCorrect = userAnswer === correctAnswer;
        
        if (isCorrect) {
            results.correctCount++;
        } else {
            results.incorrectCount++;
        }
        
        results.details.push({
            question,
            userAnswer,
            isCorrect
        });
    });
    
    // 計算分數（百分比）
    results.score = Math.round((results.correctCount / quizQuestions.length) * 100);
    
    // 計算使用時間
    const endTime = new Date();
    const elapsedSeconds = Math.floor((endTime - startTime) / 1000);
    results.timeUsed = {
        minutes: Math.floor(elapsedSeconds / 60).toString().padStart(2, '0'),
        seconds: (elapsedSeconds % 60).toString().padStart(2, '0')
    };
    
    return results;
}

// 顯示結果
function showResults(results) {
    // 設置試卷資訊
    resultPaperInfo.textContent = `試卷：${currentPaper}`;
    
    // 顯示分數
    scoreDisplay.textContent = `得分：${results.score}%`;
    
    // 顯示統計資訊
    correctCount.textContent = results.correctCount;
    incorrectCount.textContent = results.incorrectCount;
    timeUsed.textContent = `${results.timeUsed.minutes}:${results.timeUsed.seconds}`;
    
    // 生成詳細結果列表
    resultsListContainer.innerHTML = '';
    
    results.details.forEach((detail, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = `result-item ${detail.isCorrect ? 'correct' : 'incorrect'}`;
        
        // 解析題目選項
        const questionText = detail.question.題目;
        const questionTextWithoutOptions = questionText.split(/\nA |A /).shift().trim();
        
        // 生成結果HTML
        let resultHTML = `
            <div class="question-text">
                <span class="question-number">${index + 1}.</span>
                ${questionTextWithoutOptions}
                ${detail.question['*熱門題目'] ? '<span class="hot-question">[熱門題目]</span>' : ''}
            </div>
        `;
        
        // 用戶答案
        resultHTML += `
            <div class="user-answer">
                您的答案：<span class="${detail.isCorrect ? 'correct-answer' : 'wrong-answer'}">${detail.userAnswer}</span>
            </div>
        `;
        
        // 如果答錯，顯示正確答案
        if (!detail.isCorrect) {
            resultHTML += `
                <div class="answer-section">
                    正確答案：<span class="correct-answer">${detail.question.答案}</span>
                </div>
            `;
        }
        
        // 解釋
        resultHTML += `
            <div class="explanation">
                <strong>解釋：</strong><br>
                ${detail.question.解釋.replace(/\n/g, '<br>')}
            </div>
        `;
        
        // 參考
        if (detail.question.參考) {
            resultHTML += `
                <div class="reference">
                    參考：${detail.question.參考}
                </div>
            `;
        }
        
        resultDiv.innerHTML = resultHTML;
        resultsListContainer.appendChild(resultDiv);
    });
}
