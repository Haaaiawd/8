// MiniMax API配置
const CONFIG = {
    // MiniMax API密钥
    API_KEY: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJoYWEiLCJVc2VyTmFtZSI6ImhhYSIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxODc5MTcxNjQ5NTg1MDM3NTg3IiwiUGhvbmUiOiIxNTUzODcxMjMzMSIsIkdyb3VwSUQiOiIxODc5MTcxNjQ5NTc2NjQ4OTc5IiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjUtMDMtMjIgMTM6MzY6MzkiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.CX31LNjL-uMQHjh8uauz_tih3mFByqE-VdsYxiRDaaTS3lIRIFRgRfl6g-2xZJYvTBBc1wcKKiL9_BjKv7JZaeouMeUjrtfDb22lHmD6F7HBVDQK_XC7_LUYEjnUbTNcmhj4dSSleM6wKLNmj8Ojk6vDso02yobaNyaehcW41RzjYGib_MO6um_ceKjTCjXvJItuy5LqDK6ICFy531EaPoNY6yD4sW2AcLlrucx__sU_BW0a1eqG8A4jf00P_g1LN9iGwXPcPVyN40aPHZadY8tgw-69Ud3dLWq3S9vYDzE3zy6N-pFN752WEO0WpIiTO0n8oWrQuewC_4LFCSyidw",
    
    // MiniMax Group ID
    GROUP_ID: "1879171649576648979",
    
    // API端点
    ENDPOINTS: {
        TEXT: "https://api.minimax.chat/v1/text/chatcompletion_v2",
        T2A: "https://api.minimax.chat/v1/t2a_v2"
    },
    
    // 语音设置默认值
    VOICE_DEFAULTS: {
        voice_id: "jirui666",
        speed: 1.0,
        vol: 1.0,
        pitch: 0,
        emotion: "neutral"
    }
};

// 防止直接修改配置
Object.freeze(CONFIG);

export default CONFIG; 