// 全局變數
let questionCount = 10; // 預設題目數量

const paperNames = {
    "1": "卷一 (第一章 風險及保險)",
    "2": "卷一 (第二章 法律原則)",
    "3": "卷一 (第三章 保險原則)",
    "4": "卷一 (第四章 保險公司的主要功能)",
    "5": "卷一 (第五章 香港保險業結構)",
    "6": "卷一 (第六章 保險業規管架構)",
    "7": "卷一 (第七章 職業道德及其他有關問題)",
    "8": "卷三 (第一章 人壽保險簡介)",
    "9": "卷三 (第二章 人壽保險及年金的種類)",
    "10": "卷三 (第三章 保險利益附約及其他產品)",
    "11": "卷三 (第四章 闡釋人壽保險單)",
    "12": "卷三 (第五章 人壽保險程序)"
};

const paperFiles = {
    "1": "data/paper1.json",
    "2": "data/paper2.json",
    "3": "data/paper3.json",
    "4": "data/paper4.json",
    "5": "data/paper5.json",
    "6": "data/paper6.json",
    "7": "data/paper7.json",
    "8": "data/paper8.json",
    "9": "data/paper9.json",
    "10": "data/paper10.json",
    "11": "data/paper11.json",
    "12": "data/paper12.json"
};

// 卷一模擬考試配置
const mockExamConfig = {
    duration: 120, // 考試時間（分鐘）
    totalQuestions: 75, // 總題數
    passScore: 53, // 及格分數
    chapterDistribution: {
        "1": 9,  // 第一章佔9題
        "2": 12, // 第二章佔12題
        "3": 22, // 第三章佔22題
        "4": 7,  // 第四章佔7題
        "5": 4,  // 第五章佔4題
        "6": 16, // 第六章佔16題
        "7": 5   // 第七章佔5題
    }
};

// 卷三模擬考試配置
const mockExamPaper3Config = {
    duration: 75, // 考試時間（分鐘）
    totalQuestions: 50, // 總題數
    passScore: 35, // 及格分數
    chapterDistribution: {
        "8": 5,   // 第一章佔5題
        "9": 10,  // 第二章佔10題
        "10": 12, // 第三章佔12題
        "11": 12, // 第四章佔12題
        "12": 11  // 第五章佔11題
    }
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
     // 獲取用戶設定的題目數量
     const inputCount = document.getElementById('question-count').value;
     questionCount = parseInt(inputCount) || 10; // 如果輸入無效，使用預設值10
     
     // 限制題目數量在合理範圍內
     questionCount = Math.max(1, Math.min(questionCount, 100));

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
    const filePath = paperFiles[paperNumber];
    console.log(`嘗試載入文件: ${filePath}`);
    
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`成功載入試卷 ${paperNumber} 數據`);
            // 儲存載入的資料
            loadedPapers[paperNumber] = data;
            
            // 載入成功後開始測驗
            loadingScreen.classList.remove('active');
            startQuiz(paperNumber);
        })
        .catch(error => {
            console.error(`載入試卷資料失敗 (${paperNumber}):`, error);
            loadingScreen.classList.remove('active');
            paperSelection.classList.add('active');
            loadError.textContent = `載入試卷資料時發生錯誤: ${error.message}`;
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
    currentPaperInfo.textContent = `試卷：${currentPaper} (共${questionCount}題)`;
    
    // 從載入的試卷中獲取所有題目
    const allQuestions = [];
    const paperData = loadedPapers[paperNumber];
    
    // 將各章節的題目合併到一個陣列中
    for (const chapter in paperData) {
        paperData[chapter].forEach(question => {
            allQuestions.push({...question, chapter});
        });
    }
    
    // 檢查可用題目數量是否足夠
    const availableCount = Math.min(questionCount, allQuestions.length);

    // 隨機選取用戶指定數量的題目
    quizQuestions = getRandomQuestions(allQuestions, availableCount);
    
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
                    <label for="${optionId}" class="option-label">${option.key}. ${option.text}</label>
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
        

        // 從題目中提取選項
        const options = extractOptions(detail.question.題目);

        // 找到用戶答案的選項內容
        const userOption = options.find(option => option.key === detail.userAnswer);
        const userOptionText = userOption ? userOption.text : '';

        // 用戶答案
        resultHTML += `
            <div class="user-answer">
                您的答案：<span class="${detail.isCorrect ? 'correct-answer' : 'wrong-answer'}">
                    ${detail.userAnswer}. ${userOptionText}
                </span>
            </div>
        `;

        // 如果答錯，顯示正確答案
        if (!detail.isCorrect) {
            // 找到正確答案的選項內容
            const correctOption = options.find(option => option.key === detail.question.答案);
            const correctOptionText = correctOption ? correctOption.text : '';
            
            resultHTML += `
                <div class="answer-section">
                    正確答案：<span class="correct-answer">${detail.question.答案}. ${correctOptionText}</span>
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

// 模擬考試按鈕事件監聽
document.getElementById('mock-exam-btn-paper1').addEventListener('click', () => {
    startMockExam(mockExamConfig, "卷一模擬考試", "mock1");
});

document.getElementById('mock-exam-btn-paper3').addEventListener('click', () => {
    startMockExam(mockExamPaper3Config, "卷三模擬考試", "mock3");
});


// 開始模擬考試
function startMockExam(config, paperName, paperCode) {
    // 設置題目數量
    questionCount = config.totalQuestions;
    
    // 顯示載入畫面
    paperSelection.classList.remove('active');
    loadingScreen.classList.add('active');
    loadError.classList.remove('show');
    
    // 載入所有需要的試卷數據
    loadAllPapersForMockExam(config, paperName, paperCode);
}

// 載入模擬考試所需的所有試卷數據
function loadAllPapersForMockExam(config, paperName, paperCode) {
    const chaptersToLoad = Object.keys(config.chapterDistribution);
    let loadedCount = 0;
    let hasError = false;
    
    // 顯示載入進度
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = `正在載入試卷數據 (0/${chaptersToLoad.length})...`;
    }
    
    // 載入每個章節的數據
    chaptersToLoad.forEach(chapter => {
        if (!loadedPapers[chapter]) {
            fetch(paperFiles[chapter])
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`載入第${chapter}章數據失敗: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    loadedPapers[chapter] = data;
                    loadedCount++;
                    
                    if (loadingText) {
                        loadingText.textContent = `正在載入試卷數據 (${loadedCount}/${chaptersToLoad.length})...`;
                    }
                    
                    // 所有數據都已載入
                    if (loadedCount === chaptersToLoad.length && !hasError) {
                        startMockExamWithLoadedData(config, paperName, paperCode);
                    }
                })
                .catch(error => {
                    console.error(`載入第${chapter}章數據失敗:`, error);
                    hasError = true;
                    loadingScreen.classList.remove('active');
                    paperSelection.classList.add('active');
                    loadError.textContent = `載入試卷數據失敗: ${error.message}`;
                    loadError.classList.add('show');
                });
        } else {
            loadedCount++;
            if (loadingText) {
                loadingText.textContent = `正在載入試卷數據 (${loadedCount}/${chaptersToLoad.length})...`;
            }
            
            // 所有數據都已載入
            if (loadedCount === chaptersToLoad.length && !hasError) {
                startMockExamWithLoadedData(config, paperName, paperCode);
            }
        }
    });
    
    // 如果所有數據已經載入過
    if (loadedCount === chaptersToLoad.length && !hasError) {
        startMockExamWithLoadedData(config, paperName, paperCode);
    }
}

// 使用已載入的數據開始模擬考試
function startMockExamWithLoadedData(config, paperName, paperCode) {
    // 根據配置的比例從各章節選擇題目
    const selectedQuestions = [];
    
    for (const chapter in config.chapterDistribution) {
        const count = config.chapterDistribution[chapter];
        const chapterQuestions = [];
        
        // 將章節題目添加到臨時數組
        if (loadedPapers[chapter]) {
            for (const section in loadedPapers[chapter]) {
                loadedPapers[chapter][section].forEach(question => {
                    chapterQuestions.push({...question, chapter});
                });
            }
        }
        
        // 隨機選擇指定數量的題目
        if (chapterQuestions.length > 0) {
            const selected = getRandomQuestions(chapterQuestions, Math.min(count, chapterQuestions.length));
            selectedQuestions.push(...selected);
        }
    }
    
    // 如果題目不足，提示用戶
    if (selectedQuestions.length < config.totalQuestions) {
        alert(`警告：可用題目不足${config.totalQuestions}題，僅能提供${selectedQuestions.length}題。`);
    }
    
    // 設置當前試卷信息
    currentPaper = paperName;
    currentPaperNumber = paperCode;
    currentPaperInfo.textContent = `試卷：${currentPaper} (共${selectedQuestions.length}題，及格分數：${config.passScore}題)`;
    
    // 生成測驗
    quizQuestions = selectedQuestions;
    generateQuiz(quizQuestions);
    
    // 設置考試時間
    startTime = new Date();
    const examEndTime = new Date(startTime.getTime() + config.duration * 60 * 1000);
    startTimerWithEndTime(examEndTime);
    
    // 顯示測驗畫面
    loadingScreen.classList.remove('active');
    quizContainer.classList.add('active');
}

// 帶有結束時間的計時器
function startTimerWithEndTime(endTime) {
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        const now = new Date();
        const timeDiff = endTime - now;
        
        if (timeDiff <= 0) {
            // 時間到，自動提交
            clearInterval(timerInterval);
            alert("考試時間已到！系統將自動提交您的答案。");
            submitQuiz();
            return;
        }
        
        // 計算剩餘時間
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        quizTimer.textContent = `剩餘時間: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}