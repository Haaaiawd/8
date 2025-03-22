// 常量定义
const DEFAULT_PROMPT = `你是一档名为《降噪》的AI科技广播节目的资深编辑，擅长将专业的AI文章转化为通俗易懂的广播内容。请将以下原始内容改写成适合播报的稿件。

原始内容
{{input}}
====End======

要求：
1. 请先全面的阅读一遍所有的新闻
2. 使用疯癫的吉瑞的身份，模仿马督工的语气和风格，给AI小白讲清楚最新的资讯
3. 每个新闻控制在100字以内，确保听众能在短时间内抓住重点
4. 语言风格要求：
   - 用怪诞疯癫却大白话表达
   - 结合马督工的语言特点，喜欢引申，针砭时弊。
   - 适当使用语气词增加自然感（比如"嗯"、"那么"、"其实"等）
   - 避免过于口语化的方言用语
   - 像跟朋友聊天一样轻松自然
7. 适当增加转场语，使话题之间衔接自然
8.例如："哎哟喂！日本学生冻成狗还得光腿穿校服，校方倒好，死守“黑校规”不放！要说这事儿啊，日本教育就是个奇葩——冬天积雪三米厚，校服薄得像纸，却禁止穿裤袜、羽绒服，连围巾都不让围！学生冻出冻疮、家长缝棉袄、网购“光腿神器”，这波操作直接把我看傻了！其实啊，这些“黑校规”都是陈年老黄历了，比如强制染黑发、检查内衣颜色，连美国血统的棕发学生都被逼辍学！现在倒好，寒潮一来全暴露了！东京有学校开始松口，允许穿羽绒服了，但大部分学校还在装死！扯犊子归扯犊子，教育要是连人命关天的温度都管不好，还谈什么培养人才？赶紧废除这些狗屁规定吧，别让下一代在寒风里读“冰书”！

"
`;

// 导入配置
import CONFIG from './config.js';

// 本地存储键名
const STORAGE_KEYS = {
    SYSTEM_PROMPT: 'system_prompt',
  VOICE_SETTINGS: 'voice_settings'
};

// Toast提示管理器
class ToastManager {
    constructor() {
        this.toast = document.getElementById('toast');
        this.toastBody = this.toast.querySelector('.toast-body');
        this.hideTimeout = null;
    }

    show(message, type = 'info', duration = 3000) {
        // 清除之前的超时
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }

        // 设置消息和样式
        this.toastBody.textContent = message;
        this.toast.className = `toast show toast-${type}`;
        this.toast.style.display = 'block';

        // 设置自动隐藏
        this.hideTimeout = setTimeout(() => {
            this.hide();
        }, duration);
    }

    hide() {
        this.toast.style.display = 'none';
    }
}

// 加载状态管理器
class LoadingManager {
    constructor() {
        this.loading = document.getElementById('loading');
    }

    show() {
        this.loading.style.display = 'block';
    }

    hide() {
        this.loading.style.display = 'none';
    }
}

// 创建管理器实例
const toast = new ToastManager();
const loading = new LoadingManager();

// API调用函数
async function callTextAPI(prompt, input) {
    const generateButton = document.getElementById('generateContent');
    const outputText = document.getElementById('outputText');

    try {
        // 显示加载状态
        loading.show();
        generateButton.disabled = true;
        toast.show('正在生成内容...', 'info');

        // 准备请求数据
        const requestData = {
            model: 'MiniMax-Text-01',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: input }
            ]
        };

        console.log('发送请求数据:', JSON.stringify(requestData, null, 2));
        console.log('请求URL:', `${CONFIG.ENDPOINTS.TEXT}?GroupId=${CONFIG.GROUP_ID}`);
        console.log('Authorization:', `Bearer ${CONFIG.API_KEY}`);

        // 发送请求
        const response = await fetch(`${CONFIG.ENDPOINTS.TEXT}?GroupId=${CONFIG.GROUP_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.API_KEY}`
            },
            body: JSON.stringify(requestData)
        });

        // 获取原始响应文本
        const responseText = await response.text();
        console.log('原始响应文本:', responseText);

        // 检查响应状态
        if (!response.ok) {
            let errorMessage = `服务器响应错误: ${response.status}`;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error?.message || errorMessage;
                console.error('错误响应数据:', errorData);
            } catch (e) {
                console.error('解析错误响应失败:', e);
                console.log('错误响应文本:', responseText);
            }
            throw new Error(errorMessage);
        }

        // 解析响应数据
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('解析后的响应数据:', data);
        } catch (e) {
            console.error('解析响应JSON失败:', e);
            console.log('响应文本:', responseText);
            throw new Error('解析响应数据失败');
        }

        // 检查响应格式
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('无效的API响应格式:', data);
            throw new Error('API返回数据格式错误');
        }

        // 更新输出
        outputText.value = data.choices[0].message.content;
        toast.show('内容生成成功！', 'success');

    } catch (error) {
        // 错误处理
        console.error('API调用失败:', error);
        toast.show(`生成失败: ${error.message}`, 'error', 5000);
    } finally {
        // 恢复界面状态
        loading.hide();
        generateButton.disabled = false;
    }
}

// 生成内容按钮点击事件
document.getElementById('generateContent').addEventListener('click', async () => {
    const inputText = document.getElementById('inputText').value.trim();
    const systemPrompt = document.getElementById('systemPrompt').value.trim() || DEFAULT_PROMPT;

    if (!inputText) {
        toast.show('请输入需要转换的文本', 'warning');
        return;
    }

    await callTextAPI(systemPrompt, inputText);
});

// 添加样式
const style = document.createElement('style');
style.textContent = `
.toast {
    z-index: 9999;
}
.toast-info {
    background-color: rgba(0, 123, 255, 0.9);
    color: white;
}
.toast-success {
    background-color: rgba(40, 167, 69, 0.9);
    color: white;
}
.toast-warning {
    background-color: rgba(255, 193, 7, 0.9);
    color: black;
}
.toast-error {
    background-color: rgba(220, 53, 69, 0.9);
    color: white;
}
`;
document.head.appendChild(style);

// 语音设置管理器
class VoiceSettingsManager {
    constructor() {
        this.settings = {
            speed: 1.0,
            volume: 1.0,
            pitch: 0,
            emotion: 'neutral'
        };

        // 初始化控件
        this.speedControl = document.getElementById('speedControl');
        this.volumeControl = document.getElementById('volumeControl');
        this.pitchControl = document.getElementById('pitchControl');
        this.emotionSelect = document.getElementById('emotionSelect');

        // 绑定事件
        this.bindEvents();
        
        // 加载保存的设置
        this.loadSettings();
    }

    bindEvents() {
        this.speedControl.addEventListener('input', () => this.updateValue('speed'));
        this.volumeControl.addEventListener('input', () => this.updateValue('volume'));
        this.pitchControl.addEventListener('input', () => this.updateValue('pitch'));
        this.emotionSelect.addEventListener('change', () => this.updateValue('emotion'));
    }

    updateValue(type) {
        const control = this[`${type}Control`] || this[`${type}Select`];
        const value = control.value;
        this.settings[type] = parseFloat(value) || value;
        
        // 更新显示
        const displayElement = document.getElementById(`${type}Value`);
        if (displayElement) {
            displayElement.textContent = type === 'emotion' ? value : parseFloat(value).toFixed(1);
        }

        // 保存设置
        this.saveSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS);
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
                this.updateControls();
            }
        } catch (error) {
            console.error('Failed to load voice settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEYS.VOICE_SETTINGS, JSON.stringify(this.settings));
  } catch (error) {
            console.error('Failed to save voice settings:', error);
        }
    }

    updateControls() {
        this.speedControl.value = this.settings.speed;
        this.volumeControl.value = this.settings.volume;
        this.pitchControl.value = this.settings.pitch;
        this.emotionSelect.value = this.settings.emotion;

        // 更新显示
        document.getElementById('speedValue').textContent = this.settings.speed.toFixed(1);
        document.getElementById('volumeValue').textContent = this.settings.volume.toFixed(1);
        document.getElementById('pitchValue').textContent = this.settings.pitch.toFixed(1);
    }

    getSettings() {
        return { ...this.settings };
    }
}

// T2A API管理器
class T2AManager {
    constructor(voiceSettings) {
        this.voiceSettings = voiceSettings;
    }

    async generateSpeech(text, retryCount = 0) {
        try {
            // 验证配置
            if (!CONFIG.GROUP_ID || !CONFIG.API_KEY) {
                throw new Error('缺少必要的配置参数（GROUP_ID或API_KEY）');
            }

            // 验证文本
            if (!text || text.trim().length === 0) {
                throw new Error('文本内容不能为空');
            }

            const settings = this.voiceSettings.getSettings();
            
            // 使用简化的请求格式
            const requestData = {
                voice_id: 'jirui666',
                text: text.trim(),
                model: 'speech-01',
                speed: parseFloat(settings.speed) || 1.0,
                vol: parseFloat(settings.volume) || 1.0,
                pitch: parseInt(settings.pitch) || 0
            };

            // 使用正确的API端点
            const url = `${CONFIG.ENDPOINTS.TEXT_TO_SPEECH}?GroupId=${CONFIG.GROUP_ID}`;
            
            console.log('T2A请求URL:', url);
            console.log('T2A请求数据:', JSON.stringify(requestData, null, 2));

            loading.show();
            toast.show('正在生成语音...', 'info');
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.API_KEY}`
                },
                body: JSON.stringify(requestData)
            });

            // 检查响应状态
            if (!response.ok) {
                const errorText = await response.text();
                console.error('T2A错误响应:', errorText);
                throw new Error(`语音合成失败 (${response.status}): ${errorText}`);
            }

            // 检查Content-Type
            const contentType = response.headers.get('Content-Type');
            console.log('响应Content-Type:', contentType);

            if (contentType && contentType.includes('application/json')) {
                // 如果是JSON响应,说明有错误
                const errorData = await response.json();
                console.error('T2A错误数据:', errorData);
                throw new Error(errorData.error?.message || '语音合成失败');
            }

            // 直接获取二进制数据
            const audioData = await response.arrayBuffer();
            console.log('获取到音频数据，大小:', audioData.byteLength, '字节');
            
            // 验证数据大小
            if (audioData.byteLength < 100) {
                throw new Error('返回的音频数据过小,可能无效');
            }

            return audioData;
        } catch (error) {
            console.error('T2A API调用失败:', error);
            throw error;
        }
    }
}

// 音频管理器
class AudioManager {
    constructor() {
        this.audio = new Audio();
        this.audioData = null;
        this.isPlaying = false;
        this.currentBlobUrl = null;

        // 获取按钮元素
        this.playButton = document.getElementById('playButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.downloadButton = document.getElementById('downloadButton');

        // 绑定事件
        this.bindEvents();
    }

    bindEvents() {
        this.playButton.addEventListener('click', () => this.play());
        this.pauseButton.addEventListener('click', () => this.pause());
        this.downloadButton.addEventListener('click', () => this.download());

        // 音频事件监听
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updateButtonStates();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('音频播放错误:', e);
            this.isPlaying = false;
            this.updateButtonStates();
            toast.show('音频播放出错，请重试', 'error');
        });

        this.audio.addEventListener('loadeddata', () => {
            console.log('音频数据加载完成');
            toast.show('音频加载完成', 'success');
        });
    }

    setAudioData(data) {
        // 清理之前的资源
        this.cleanup();
        
        // 保存数据
        this.audioData = data;
        console.log('设置音频数据:', data.byteLength, '字节');
        
        try {
            // 创建新的播放方法
            this.setupPlayback();
        } catch (error) {
            console.error('设置音频数据失败:', error);
            toast.show(`音频处理失败: ${error.message}`, 'error');
        }
    }
    
    // 清理资源
    cleanup() {
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
        }
        
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
            this.currentBlobUrl = null;
        }
        
        this.isPlaying = false;
    }
    
    // 设置音频播放
    setupPlayback() {
        if (!this.audioData || this.audioData.byteLength === 0) {
            throw new Error('无效的音频数据');
        }
        
        // 方法1：使用audio元素直接播放
        try {
            const blob = new Blob([this.audioData], { type: 'audio/mpeg' });
            this.currentBlobUrl = URL.createObjectURL(blob);
            
            // 创建一个测试的audio元素来验证
            const testAudio = new Audio();
            testAudio.src = this.currentBlobUrl;
            
            // 设置oncanplaythrough事件来验证音频可以播放
            const canPlayPromise = new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    testAudio.removeEventListener('canplaythrough', canPlayHandler);
                    testAudio.removeEventListener('error', errorHandler);
                    reject(new Error('音频加载超时'));
                }, 5000);
                
                const canPlayHandler = () => {
                    clearTimeout(timeoutId);
                    testAudio.removeEventListener('error', errorHandler);
                    resolve();
                };
                
                const errorHandler = (e) => {
                    clearTimeout(timeoutId);
                    testAudio.removeEventListener('canplaythrough', canPlayHandler);
                    reject(new Error(`音频加载错误: ${e.message}`));
                };
                
                testAudio.addEventListener('canplaythrough', canPlayHandler, { once: true });
                testAudio.addEventListener('error', errorHandler, { once: true });
                
                // 开始加载音频
                testAudio.load();
            });
            
            // 等待验证结果
            canPlayPromise.then(() => {
                console.log('音频验证成功，可以播放');
                // 设置实际的音频元素
                this.audio.src = this.currentBlobUrl;
                this.audio.load();
                this.updateButtonStates(true);
            }).catch(error => {
                console.error('音频验证失败:', error);
                // 如果方法1失败，尝试方法2：使用Web Audio API
                this.setupWebAudioPlayback();
            });
        } catch (error) {
            console.error('设置Audio元素播放失败:', error);
            // 尝试方法2
            this.setupWebAudioPlayback();
        }
    }
    
    // 使用Web Audio API设置播放
    setupWebAudioPlayback() {
        console.log('尝试使用Web Audio API播放');
        
        // 创建AudioContext
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        // 解码音频数据
        this.audioContext.decodeAudioData(
            this.audioData, 
            (buffer) => {
                console.log('音频解码成功，样本数:', buffer.length);
                this.audioBuffer = buffer;
                this.updateButtonStates(true);
                toast.show('音频准备就绪（使用Web Audio API）', 'success');
            },
            (error) => {
                console.error('解码音频失败:', error);
                toast.show('解码音频失败，MP3可能无效', 'error');
            }
        );
    }

    play() {
        try {
            if (this.audioBuffer && this.audioContext) {
                // 使用Web Audio API播放
                if (this.source) {
                    this.source.stop();
                }
                
                this.source = this.audioContext.createBufferSource();
                this.source.buffer = this.audioBuffer;
                this.source.connect(this.audioContext.destination);
                
                this.source.onended = () => {
                    this.isPlaying = false;
                    this.updateButtonStates();
                };
                
                this.source.start(0);
                this.isPlaying = true;
                this.updateButtonStates();
            } else if (this.audio.src) {
                // 使用Audio元素播放
                console.log('开始播放音频');
                this.audio.play().catch(error => {
                    console.error('播放失败:', error);
                    toast.show('播放失败，请重试', 'error');
                });
                this.isPlaying = true;
                this.updateButtonStates();
            } else {
                console.warn('没有可播放的音频数据');
                toast.show('没有可播放的音频', 'warning');
            }
        } catch (error) {
            console.error('播放时出错:', error);
            toast.show(`播放失败: ${error.message}`, 'error');
        }
    }

    pause() {
        try {
            if (this.source) {
                // 停止Web Audio API播放
                this.source.stop();
                this.source = null;
                this.isPlaying = false;
            } else if (this.audio) {
                // 停止Audio元素播放
                this.audio.pause();
                this.isPlaying = false;
            }
            this.updateButtonStates();
        } catch (error) {
            console.error('暂停播放时出错:', error);
        }
    }

    download() {
        if (this.audioData) {
            try {
                const blob = new Blob([this.audioData], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '广播内容.mp3';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.show('下载已开始', 'success');
            } catch (error) {
                console.error('下载音频时出错:', error);
                toast.show(`下载失败: ${error.message}`, 'error');
            }
        } else {
            toast.show('没有可下载的音频', 'warning');
        }
    }

    updateButtonStates(hasAudio = false) {
        const audioAvailable = hasAudio || (this.audio.src && this.audioData) || (this.audioBuffer && this.audioContext);
        console.log('更新按钮状态:', { audioAvailable, isPlaying: this.isPlaying });
        
        this.playButton.disabled = !audioAvailable || this.isPlaying;
        this.pauseButton.disabled = !audioAvailable || !this.isPlaying;
        this.downloadButton.disabled = !audioAvailable;
    }
}

// 创建管理器实例
const voiceSettings = new VoiceSettingsManager();
const audioManager = new AudioManager();
const t2aManager = new T2AManager(voiceSettings);

// 语音合成按钮点击事件
document.getElementById('generateSpeech').addEventListener('click', async () => {
    const outputText = document.getElementById('outputText').value.trim();
    
    if (!outputText) {
        toast.show('请先生成文本内容', 'warning');
        return;
    }

    try {
        loading.show();
        const audioData = await t2aManager.generateSpeech(outputText);
        audioManager.setAudioData(audioData);
        toast.show('语音生成成功！', 'success');
    } catch (error) {
        console.error('语音生成失败:', error);
        toast.show(`语音生成失败: ${error.message}`, 'error', 5000);
    } finally {
        loading.hide();
    }
});