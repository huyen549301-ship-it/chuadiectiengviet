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
window.speechSynthesis.onvoiceschanged = () => {
    console.log("Danh sách giọng đọc đã sẵn sàng");
};

// 2. Bắt đầu bài học - Cập nhật để lọc đúng dữ liệu từng bài
function startLesson(lessonId) {
    // Lọc dữ liệu: Chỉ lấy những từ có lesson_id trùng với lessonId truyền vào
    // Lưu ý: Nếu lessonId là số (1, 2, 3...) thì JSON cũng phải là số
    // Nếu lessonId là chữ ('单位'...) thì JSON cũng phải là chữ
    wordQueue = allWords.filter(w => w.lesson_id === lessonId);
    
    // Kiểm tra nếu bài học không có dữ liệu
    if(wordQueue.length === 0) { 
        alert("Bài học này chưa có dữ liệu!"); 
        return; 
    }
     
    // Trộn ngẫu nhiên danh sách từ của bài đó
    wordQueue.sort(() => Math.random() - 0.5);
    
    // Ẩn menu, hiện game
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    // Reset các biến đếm
    totalAttempts = 0;
    correctAttempts = 0;
    
    // Bắt đầu tải câu hỏi đầu tiên
    loadQuestion();
}

// 3. Tải câu hỏi - Sửa lại để luôn ẩn chữ khi load
function speakQuestion() {
    const element = document.getElementById('question');
    if (!element) return;
    
    // Lấy nội dung từ biến global hoặc từ chính object hiện tại thay vì từ giao diện bị ẩn
    const text = wordQueue[0].word; 

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Cấu hình giọng đọc
    utterance.lang = 'vi-VN';
    utterance.rate = 0.6;
    
    // CẦN THIẾT: Đợi danh sách giọng nạp xong
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang === 'vi-VN');
    if (viVoice) utterance.voice = viVoice;

    window.speechSynthesis.speak(utterance);
}

// Hàm phát âm thanh
function speakQuestion() {
    const element = document.getElementById('question');
    if (!element) return;
    
    let text = element.innerText;

    // Kỹ thuật tạo khoảng nghỉ: 
    // Thay thế khoảng trắng giữa các từ bằng dấu phẩy để tạo ngắt quãng khi đọc
    // Bạn có thể tùy chỉnh regex để ngắt quãng nhiều hơn nếu muốn
    const spacedText = text.split(' ').join(',');

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(spacedText);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.5; // Giảm tốc độ hơn nữa để nghe rõ khoảng nghỉ
    utterance.pitch = 1.2; // Tăng nhẹ pitch để nghe thanh thoát hơn (giống giọng nữ)

    const voices = window.speechSynthesis.getVoices();
    
    // Tìm giọng có tên chứa 'female' hoặc ưu tiên các giọng hệ thống
    // Lưu ý: Tên giọng phụ thuộc vào OS của người dùng
    const viVoice = voices.find(v => 
        (v.lang === 'vi-VN' || v.name.includes('Vietnamese')) && 
        (v.name.includes('Google') || v.name.includes('Female'))
    );
    
    if (viVoice) utterance.voice = viVoice;
    
    window.speechSynthesis.speak(utterance);
}

// 4. Kiểm tra đáp án - Tích hợp hiện màu và đợi 3 giây
function checkAnswer(selected, correct, btn) {
    document.getElementById('options').style.pointerEvents = 'none';
    const questionEl = document.getElementById('question');
    
    totalAttempts++;
    
    questionEl.classList.remove('hidden-text');
    questionEl.style.visibility = 'visible';
    
    if (selected === correct) {
        correctAttempts++;
        btn.style.backgroundColor = "#4CAF50";
        questionEl.classList.add('text-correct'); // Màu xanh
        
        setTimeout(() => { 
            wordQueue.shift(); 
            document.getElementById('options').style.pointerEvents = 'auto';
            loadQuestion(); 
        }, 3000); // Đợi 3 giây
    } else {
        btn.style.backgroundColor = "#f44336";
        questionEl.classList.add('text-wrong'); // Màu đỏ
        
        const wrongWord = wordQueue.shift(); 
        wordQueue.push(wrongWord); 
        
        setTimeout(() => { 
            btn.style.backgroundColor = "#007bff"; 
            document.getElementById('options').style.pointerEvents = 'auto';
            loadQuestion(); 
        }, 3000); // Đợi 3 giây
    }
}

// 5. Hiển thị bảng kết quả
function showResult() {
    const percent = Math.round((correctAttempts / totalAttempts) * 100);
    
    // Lấy modal đã thêm trong HTML
    const modal = document.getElementById('resultModal');
    const resultText = document.getElementById('resultText');
    
    // Cập nhật nội dung
    resultText.innerHTML = `Khả năng ghi nhớ: <b>${percent}%</b>`;
    document.getElementById('resultModal').style.display = 'flex';
}
