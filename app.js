let allWords = [];
let wordQueue = [];
let totalAttempts = 0;
let correctAttempts = 0;

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
    const mồi = new SpeechSynthesisUtterance("ok");
    mồi.volume = 0;
    window.speechSynthesis.speak(mồi);
    
    wordQueue = allWords.filter(w => w.lesson_id === lessonId);
    if(wordQueue.length === 0) { alert("Bài học này chưa có dữ liệu!"); return; }
    
    wordQueue.sort(() => Math.random() - 0.5);
    
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    totalAttempts = 0;
    correctAttempts = 0;
    
    loadQuestion();
}

// 3. Tải câu hỏi
function loadQuestion() {
    if (wordQueue.length === 0) {
        showResult();
        return;
    }
    const current = wordQueue[0];
    const questionEl = document.getElementById('question');
    
    // Ẩn chữ triệt để
    questionEl.classList.add('hidden-text'); 
    questionEl.style.visibility = 'hidden'; 
    questionEl.classList.remove('text-correct', 'text-wrong');
    
    questionEl.innerText = current.word;
    
    // Tạo nút đáp án
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
}

// 4. Hàm phát âm thanh (Gộp logic)
function speakQuestion() {
    window.speechSynthesis.cancel();
    // Lấy chữ trực tiếp từ dữ liệu bài học để đảm bảo luôn lấy được dù chữ đang bị ẩn
    const text = wordQueue[0].word;
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = 'vi-VN';
    utterance.rate = 0.6;
    
    // Ưu tiên giọng Việt nếu có
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang === 'vi-VN' || v.name.includes('Vietnamese'));
    if (viVoice) utterance.voice = viVoice;

    window.speechSynthesis.speak(utterance);
}

// 5. Kiểm tra đáp án
function checkAnswer(selected, correct, btn) {
    document.getElementById('options').style.pointerEvents = 'none';
    const questionEl = document.getElementById('question');
    
    totalAttempts++;
    questionEl.classList.remove('hidden-text');
    questionEl.style.visibility = 'visible';
    
    if (selected === correct) {
        correctAttempts++;
        btn.style.backgroundColor = "#4CAF50";
        questionEl.classList.add('text-correct');
        setTimeout(() => { 
            wordQueue.shift(); 
            document.getElementById('options').style.pointerEvents = 'auto';
            loadQuestion(); 
        }, 3000);
    } else {
        btn.style.backgroundColor = "#f44336";
        questionEl.classList.add('text-wrong');
        const wrongWord = wordQueue.shift(); 
        wordQueue.push(wrongWord); 
        setTimeout(() => { 
            btn.style.backgroundColor = "#007bff"; 
            document.getElementById('options').style.pointerEvents = 'auto';
            loadQuestion(); 
        }, 3000);
    }
}

function showResult() {
    const percent = Math.round((correctAttempts / totalAttempts) * 100);
    const resultText = document.getElementById('resultText');
    resultText.innerHTML = `Khả năng ghi nhớ: <b>${percent}%</b>`;
    document.getElementById('resultModal').style.display = 'flex';
}
