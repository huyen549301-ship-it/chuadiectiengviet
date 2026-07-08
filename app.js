let allWords = [];
let wordQueue = [];
let totalAttempts = 0;
let correctAttempts = 0;
let currentMode = '';

// 1. Tải dữ liệu
async function loadData() {
    try {
        const response = await fetch('data.json');
        allWords = await response.json();
    } catch (e) { alert("Lỗi tải file data.json"); }
}
loadData();

// 2. Bắt đầu bài học
function startLesson(lessonId) {
    wordQueue = allWords.filter(w => w.lesson_id === lessonId);
    if(wordQueue.length === 0) { alert("Bài học này chưa có dữ liệu!"); return; }
    
    wordQueue.sort(() => Math.random() - 0.5);
    
    // Ẩn menu chọn bài, HIỆN menu chọn chế độ
    document.getElementById('menu').style.display = 'none';
    document.getElementById('mode-menu').style.display = 'block';
    
    totalAttempts = 0;
    correctAttempts = 0;
}

function setMode(mode) {
    currentMode = mode;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('mode-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('options').style.display = (mode === 'dictation') ? 'none' : 'flex';
    document.getElementById('dictation-box').style.display = (mode === 'dictation') ? 'block' : 'none';
    
    // Mồi âm thanh
    const mồi = new SpeechSynthesisUtterance("ok");
    mồi.volume = 0;
    window.speechSynthesis.speak(mồi);
    
    loadQuestion();
}

// 3. Tải câu hỏi
function loadQuestion() {
    if (wordQueue.length === 0) {showResult();return;}
    const current = wordQueue[0];
    const questionEl = document.getElementById('question');
    const inputEl = document.getElementById('answer-input');

    questionEl.innerText = current.word; 
    questionEl.style.color = "";
    questionEl.classList.add('hidden-text');
    inputEl.value = '';
    
    if (currentMode === 'dictation') {
        inputEl.style.display = 'block';
        inputEl.focus();
        setTimeout(() => speakQuestion(), 500);
    } else {
        inputEl.style.display = 'none';}
    
    if (currentMode === 'listen') {
        questionEl.classList.add('hidden-text');}

    let options = [current.meaning];
    while(options.length < 4 && options.length < wordQueue.length) {
        let rand = wordQueue[Math.floor(Math.random() * wordQueue.length)].meaning;
        if (!options.includes(rand)) options.push(rand);
    }
    options.sort(() => Math.random() - 0.5);
    
    const optionsEl = document.getElementById('options');
    optionsEl.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, current.meaning, btn);
        optionsEl.appendChild(btn);
    });
    
    const speakerBtn = document.getElementById('speaker-btn');
    if (currentMode === 'listen') {
        speakerBtn.style.display = 'block';
        setTimeout(() => speakQuestion(), 800);
    } else {
        speakerBtn.style.display = 'none';
    }
} 

// 4. Kiểm tra đáp án
function checkAnswer(selected, correct, btn) {
    document.getElementById('options').style.pointerEvents = 'none';
    const questionEl = document.getElementById('question');
    
    totalAttempts++;
    questionEl.classList.remove('hidden-text');
    
    if (selected === correct) {
        correctAttempts++;
        btn.style.backgroundColor = "#4CAF50";
        questionEl.classList.add('text-correct');
        setTimeout(() => { 
            wordQueue.shift(); 
            document.getElementById('options').style.pointerEvents = 'auto';
            loadQuestion(); 
        }, 1500);
    } else {
        btn.style.backgroundColor = "#f44336";
        questionEl.classList.add('text-wrong');
        
        if (wordQueue.length > 1) {
            const wrongWord = wordQueue.shift(); 
            wordQueue.push(wrongWord); 
        }
        
        setTimeout(() => { 
            btn.style.backgroundColor = "#007bff"; 
            document.getElementById('options').style.pointerEvents = 'auto';
            loadQuestion(); 
        }, 1500);
    }
}

// Thêm vào sau hàm checkAnswer
function checkDictation() {
    totalAttempts++;
    const userInput = document.getElementById('answer-input').value.trim();
    const correct = wordQueue[0].word;
    const qEl = document.getElementById('question');

    qEl.classList.remove('hidden-text');
    if (userInput === correct) {
        correctAttempts++;
        qEl.style.color = "#4CAF50";
        setTimeout(() => { 
            qEl.style.color = "";
            wordQueue.shift(); 
            loadQuestion(); 
        }, 1000);
    } else {
        qEl.style.color = "#f44336";
        qEl.innerText = "Sai: " +correct;
        wordQueue.push(wordQueue.shift());
        setTimeout(() => { 
            qEl.style.color = "";
            qEl.classList.remove('text-wrong'); 
            loadQuestion(); 
        }, 1500);
    }
}

// Hỗ trợ nhấn Enter để kiểm tra
document.getElementById('answer-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkDictation();
});

// 5. Hàm phát âm thanh
function speakQuestion() {
    window.speechSynthesis.cancel();
    const text = wordQueue[0].word;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.6;
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang === 'vi-VN' || v.name.includes('Vietnamese'));
    if (viVoice) utterance.voice = viVoice;
    window.speechSynthesis.speak(utterance);
} 

function showResult() {
    const percent = (totalAttempts > 0) ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
    const resultText = document.getElementById('resultText');
    resultText.innerHTML = `Khả năng ghi nhớ: <b>${percent}%</b>`;
    document.getElementById('resultModal').style.display = 'flex';
}
