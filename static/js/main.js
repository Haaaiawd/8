// 常量定义
const DEFAULT_PROMPT = `你是一档名为《降噪》的AI科技广播节目的资深编辑，擅长将专业的AI文章转化为通俗易懂的广播内容。请将以下原始内容改写成适合播报的稿件。

原始内容
{{input}}
====End======

要求：
1. 请先全面的阅读一遍所有的新闻
2. 使用疯癫的吉瑞的身份，用怪诞疯癫又有讽刺性的却暗含哲理，给AI小白讲清楚最新的资讯
3. 每个新闻控制在100字以内，确保听众能在短时间内抓住重点
4. 语言风格要求：
   - 用怪诞疯癫却大白话表达
   - 适当使用语气词增加自然感（比如"嗯"、"那么"、"其实"等）
   - 避免过于口语化的方言用语
   - 像跟朋友聊天一样轻松自然
6. 在保持通俗易懂的同时，准确传达AI技术的关键概念
7. 适当增加转场语，使话题之间衔接自然
8.例如："（敲击铁锅开场）哈！各位AI小饼干听好了！今天吉瑞老师用大葱蘸着电子酱料给你们讲新闻！（突然压低声音）听说霓虹国高中生的裤袜啊…（突然尖叫）被校规封印啦！黑色！禁！禁！禁！（敲锣）明明营养均衡的裤袜就像神经网络嘛——输入什么颜色都能自适应输出文明！可那些校规老顽固啊（打喷嚏）活像过时的算法死守黑白二值判断！（抛撒彩虹糖）呐呐呐"
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
            this.updateButtonStates(true);
        });
    }

    setAudioData(data) {
        // 释放之前的Blob URL
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
        }

        this.audioData = data;
        const blob = new Blob([data], { type: 'audio/mp3' });
        this.currentBlobUrl = URL.createObjectURL(blob);
        
        // 重置音频状态
        this.audio.src = this.currentBlobUrl;
        this.isPlaying = false;
        this.audio.load(); // 确保加载新的音频数据
        
        console.log('设置新的音频数据');
    }

    play() {
        if (this.audio.src) {
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
    }

    pause() {
        console.log('暂停播放音频');
        this.audio.pause();
        this.isPlaying = false;
        this.updateButtonStates();
    }

    download() {
        if (this.audioData) {
            const blob = new Blob([this.audioData], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '广播内容.mp3';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            toast.show('没有可下载的音频', 'warning');
        }
    }

    updateButtonStates(hasAudio = false) {
        const audioAvailable = hasAudio || (this.audio.src && this.audioData);
        console.log('更新按钮状态:', { audioAvailable, isPlaying: this.isPlaying });
        
        this.playButton.disabled = !audioAvailable || this.isPlaying;
        this.pauseButton.disabled = !audioAvailable || !this.isPlaying;
        this.downloadButton.disabled = !audioAvailable;
    }
}

// T2A API管理器
class T2AManager {
    constructor(voiceSettings) {
        this.voiceSettings = voiceSettings;
    }

    async generateSpeech(text) {
        try {
            const settings = this.voiceSettings.getSettings();
            const requestData = {
                model: 'speech-01-turbo',
                text: text,
                stream: false,
                voice_setting: {
                    voice_id: 'jirui666',
                    speed: settings.speed,
                    vol: settings.volume,
                    pitch: settings.pitch,
                    emotion: settings.emotion
                },
                audio_setting: {
                    sample_rate: 32000,
                    bitrate: 128000,
                    format: 'mp3',
                    channel: 1
                }
            };

            console.log('T2A请求数据:', requestData);

            const response = await fetch(`${CONFIG.ENDPOINTS.T2A}?GroupId=${CONFIG.GROUP_ID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.API_KEY}`
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('T2A错误响应:', errorText);
                throw new Error(`语音合成失败: ${response.status}`);
            }

            return await response.arrayBuffer();

        } catch (error) {
            console.error('T2A API调用失败:', error);
            throw error;
        }
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