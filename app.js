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

// 3. Tải câu hỏi (Chỉ lấy đáp án nhiễu trong cùng bài học)
function loadQuestion() {
    if (wordQueue.length === 0) {
        showResult();
        return;
    }
    const current = wordQueue[0];
    document.getElementById('question').innerText = `Từ "${current.word}" nghĩa là gì?`;
    
    // Đảm bảo có ít nhất 4 từ trong bài để tạo 4 đáp án
    // Nếu bài học ít hơn 4 từ, logic này vẫn hoạt động nhưng sẽ lấy trùng
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

// 4. Kiểm tra đáp án (Nếu sai, đưa từ đó xuống cuối danh sách)
function checkAnswer(selected, correct, btn) {
    totalAttempts++;
    if (selected === correct) {
        correctAttempts++;
        btn.style.backgroundColor = "#4CAF50"; // Màu xanh
        // Trả lời đúng: Xóa từ khỏi hàng đợi và tải câu tiếp theo
        setTimeout(() => { 
            wordQueue.shift(); 
            loadQuestion(); 
        }, 500);
    } else {
        btn.style.backgroundColor = "#f44336"; // Màu đỏ
        // Trả lời sai: Đưa từ hiện tại xuống cuối hàng đợi
        const wrongWord = wordQueue.shift(); 
        wordQueue.push(wrongWord); 
        
        setTimeout(() => { 
            btn.style.backgroundColor = "#007bff"; 
            loadQuestion(); // Tải lại câu tiếp theo (lúc này từ sai đã nằm ở cuối)
        }, 500);
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
