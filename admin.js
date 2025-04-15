// 主標籤切換功能
document.getElementById('paperToolTab').addEventListener('click', () => {
    document.getElementById('paperToolTab').classList.add('active');
    document.getElementById('learnToolTab').classList.remove('active');
    document.getElementById('paperToolContent').classList.add('active');
    document.getElementById('learnToolContent').classList.remove('active');
});

document.getElementById('learnToolTab').addEventListener('click', () => {
    document.getElementById('paperToolTab').classList.remove('active');
    document.getElementById('learnToolTab').classList.add('active');
    document.getElementById('paperToolContent').classList.remove('active');
    document.getElementById('learnToolContent').classList.add('active');
});

// 試卷工具子標籤切換
document.getElementById('paperEncryptTab').addEventListener('click', () => {
    document.getElementById('paperEncryptTab').classList.add('active');
    document.getElementById('paperDecryptTab').classList.remove('active');
    document.getElementById('paperEncryptContent').classList.add('active');
    document.getElementById('paperDecryptContent').classList.remove('active');
});

document.getElementById('paperDecryptTab').addEventListener('click', () => {
    document.getElementById('paperEncryptTab').classList.remove('active');
    document.getElementById('paperDecryptTab').classList.add('active');
    document.getElementById('paperEncryptContent').classList.remove('active');
    document.getElementById('paperDecryptContent').classList.add('active');
});

// 學習資料工具子標籤切換
document.getElementById('learnEncryptTab').addEventListener('click', () => {
    document.getElementById('learnEncryptTab').classList.add('active');
    document.getElementById('learnDecryptTab').classList.remove('active');
    document.getElementById('learnEncryptContent').classList.add('active');
    document.getElementById('learnDecryptContent').classList.remove('active');
});

document.getElementById('learnDecryptTab').addEventListener('click', () => {
    document.getElementById('learnEncryptTab').classList.remove('active');
    document.getElementById('learnDecryptTab').classList.add('active');
    document.getElementById('learnEncryptContent').classList.remove('active');
    document.getElementById('learnDecryptContent').classList.add('active');
});

// 試卷加密功能
document.getElementById('loadOriginalBtn').addEventListener('click', async () => {
    const paperNumber = document.getElementById('paperNumber').value;
    if (!paperNumber || paperNumber < 1 || paperNumber > 12) {
        alert('請輸入有效的試卷編號 (1-12)');
        return;
    }
    
    try {
        const response = await fetch(`data/paper${paperNumber}.json`);
        if (!response.ok) {
            throw new Error(`無法載入試卷 ${paperNumber}`);
        }
        
        const data = await response.text();
        document.getElementById('originalContent').value = data;
    } catch (error) {
        alert('載入試卷失敗: ' + error.message);
    }
});

document.getElementById('encryptBtn').addEventListener('click', () => {
    const originalContent = document.getElementById('originalContent').value;
    const encryptionKey = document.getElementById('adminEncryptionKey').value;
    
    if (!originalContent) {
        alert('請先載入原始試卷內容');
        return;
    }
    
    if (!encryptionKey) {
        alert('請輸入加密金鑰');
        return;
    }
    
    try {
        // 先嘗試解析為 JSON 以確保格式正確
        let jsonData;
        try {
            jsonData = JSON.parse(originalContent);
        } catch (e) {
            alert('原始內容不是有效的 JSON 格式');
            return;
        }
        
        // 加密整個 JSON 字符串
        const encryptedData = CryptoJS.AES.encrypt(originalContent, encryptionKey).toString();
        document.getElementById('encryptedContent').value = encryptedData;
    } catch (error) {
        alert('加密失敗: ' + error.message);
    }
});

document.getElementById('saveBtn').addEventListener('click', () => {
    const encryptedContent = document.getElementById('encryptedContent').value;
    const paperNumber = document.getElementById('paperNumber').value;
    
    if (!encryptedContent) {
        alert('請先加密試卷內容');
        return;
    }
    
    const blob = new Blob([encryptedContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `paper${paperNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// 試卷解密測試功能
document.getElementById('loadEncryptedBtn').addEventListener('click', async () => {
    const paperNumber = document.getElementById('testPaperNumber').value;
    if (!paperNumber || paperNumber < 1 || paperNumber > 12) {
        alert('請輸入有效的試卷編號 (1-12)');
        return;
    }
    
    try {
        const response = await fetch(`data/paper${paperNumber}.json`);
        if (!response.ok) {
            throw new Error(`無法載入試卷 ${paperNumber}`);
        }
        
        const data = await response.text();
        document.getElementById('testEncryptedContent').value = data;
        
        // 重設訊息狀態
        document.getElementById('paperDecryptSuccess').style.display = 'none';
        document.getElementById('paperDecryptError').style.display = 'none';
        document.getElementById('testDecryptedContent').value = '';
    } catch (error) {
        alert('載入試卷失敗: ' + error.message);
    }
});

document.getElementById('decryptBtn').addEventListener('click', () => {
    const encryptedContent = document.getElementById('testEncryptedContent').value;
    const decryptionKey = document.getElementById('testEncryptionKey').value;
    
    if (!encryptedContent) {
        alert('請先載入加密試卷內容');
        return;
    }
    
    if (!decryptionKey) {
        alert('請輸入解密金鑰');
        return;
    }
    
    try {
        // 嘗試解密
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedContent, decryptionKey);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedText) {
            throw new Error('解密失敗，可能是金鑰不正確');
        }
        
        // 嘗試解析 JSON 以驗證格式
        try {
            const jsonData = JSON.parse(decryptedText);
            document.getElementById('testDecryptedContent').value = JSON.stringify(jsonData, null, 2);
            document.getElementById('paperDecryptSuccess').style.display = 'block';
            document.getElementById('paperDecryptError').style.display = 'none';
        } catch (e) {
            document.getElementById('testDecryptedContent').value = decryptedText;
            document.getElementById('paperDecryptError').style.display = 'block';
            document.getElementById('paperDecryptSuccess').style.display = 'none';
        }
    } catch (error) {
        document.getElementById('testDecryptedContent').value = '解密失敗: ' + error.message;
        document.getElementById('paperDecryptError').style.display = 'block';
        document.getElementById('paperDecryptSuccess').style.display = 'none';
    }
});

// 學習資料加密功能
document.getElementById('loadLearnBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('data/learn.json');
        if (!response.ok) {
            throw new Error('無法載入學習資料');
        }
        
        const data = await response.text();
        document.getElementById('learnOriginalContent').value = data;
    } catch (error) {
        alert('載入學習資料失敗: ' + error.message);
    }
});

document.getElementById('encryptLearnBtn').addEventListener('click', () => {
    const originalContent = document.getElementById('learnOriginalContent').value;
    const encryptionKey = document.getElementById('learnEncryptionKey').value;
    
    if (!originalContent) {
        alert('請先載入原始學習資料內容');
        return;
    }
    
    if (!encryptionKey) {
        alert('請輸入加密金鑰');
        return;
    }
    
    try {
        // 先嘗試解析為 JSON 以確保格式正確
        let jsonData;
        try {
            jsonData = JSON.parse(originalContent);
        } catch (e) {
            alert('原始內容不是有效的 JSON 格式');
            return;
        }
        
        // 加密整個 JSON 字符串
        const encryptedData = CryptoJS.AES.encrypt(originalContent, encryptionKey).toString();
        document.getElementById('learnEncryptedContent').value = encryptedData;
    } catch (error) {
        alert('加密失敗: ' + error.message);
    }
});

document.getElementById('saveLearnBtn').addEventListener('click', () => {
    const encryptedContent = document.getElementById('learnEncryptedContent').value;
    
    if (!encryptedContent) {
        alert('請先加密學習資料內容');
        return;
    }
    
    const blob = new Blob([encryptedContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learn.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// 學習資料解密功能
document.getElementById('loadEncryptedLearnBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('data/learn.json');
        if (!response.ok) {
            throw new Error('無法載入加密學習資料');
        }
        
        const data = await response.text();
        document.getElementById('learnEncryptedTestContent').value = data;
        
        // 重設訊息狀態
        document.getElementById('learnDecryptSuccess').style.display = 'none';
        document.getElementById('learnDecryptError').style.display = 'none';
        document.getElementById('learnDecryptedContent').value = '';
    } catch (error) {
        alert('載入加密學習資料失敗: ' + error.message);
    }
});

document.getElementById('decryptLearnBtn').addEventListener('click', () => {
    const encryptedContent = document.getElementById('learnEncryptedTestContent').value;
    const decryptionKey = document.getElementById('learnDecryptionKey').value;
    
    if (!encryptedContent) {
        alert('請先載入加密學習資料內容');
        return;
    }
    
    if (!decryptionKey) {
        alert('請輸入解密金鑰');
        return;
    }
    
    try {
        // 嘗試解密
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedContent, decryptionKey);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedText) {
            throw new Error('解密失敗，可能是金鑰不正確');
        }
        
        // 嘗試解析 JSON 以驗證格式
        try {
            const jsonData = JSON.parse(decryptedText);
            document.getElementById('learnDecryptedContent').value = JSON.stringify(jsonData, null, 2);
            document.getElementById('learnDecryptSuccess').style.display = 'block';
            document.getElementById('learnDecryptError').style.display = 'none';
        } catch (e) {
            document.getElementById('learnDecryptedContent').value = decryptedText;
            document.getElementById('learnDecryptError').style.display = 'block';
            document.getElementById('learnDecryptSuccess').style.display = 'none';
        }
    } catch (error) {
        document.getElementById('learnDecryptedContent').value = '解密失敗: ' + error.message;
        document.getElementById('learnDecryptError').style.display = 'block';
        document.getElementById('learnDecryptSuccess').style.display = 'none';
    }
});
