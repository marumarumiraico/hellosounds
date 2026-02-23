const COUNTRY_VOICE_MAP = {
  "USA": { lang: "en-US", voice: "en-US-Neural2-A" },
  "Korea": { lang: "ko-KR", voice: "ko-KR-Neural2-A" },
  "Japan": { lang: "ja-JP", voice: "ja-JP-Neural2-C" },
  "Spain": { lang: "es-ES", voice: "es-ES-Neural2-A" },
  "France": { lang: "fr-FR", voice: "fr-FR-Neural2-A" },
  "Germany": { lang: "de-DE", voice: "de-DE-Neural2-A" },
  "Italy": { lang: "it-IT", voice: "it-IT-Neural2-A" },
  "Russia": { lang: "ru-RU", voice: "ru-RU-Wavenet-A" },
  "Thailand": { lang: "th-TH", voice: "th-TH-Standard-A" },
  "Egypt": { lang: "ar-XA", voice: "ar-XA-Wavenet-A" },
  "Brazil": { lang: "pt-BR", voice: "pt-BR-Neural2-A" },
  "China": { lang: "zh-CN", voice: "zh-CN-Wavenet-C" },
  "India": { lang: "hi-IN", voice: "hi-IN-Neural2-A" },
  "Kenya": { lang: "sw-KE", voice: "sw-KE-Standard-A" },
  "Greece": { lang: "el-GR", voice: "el-GR-Wavenet-A" }
};

export async function onRequestGet(context) {
  return new Response(JSON.stringify({ 
    status: "alive", 
    env_configured: !!context.env.GOOGLE_TTS_API_KEY 
  }), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { text, country } = await request.json();
    
    // 텍스트가 비어있는지 확인
    if (!text) return new Response(JSON.stringify({ error: "Text is empty" }), { status: 400 });

    const voiceConfig = COUNTRY_VOICE_MAP[country] || { lang: "en-US", voice: "en-US-Neural2-A" };
    const API_KEY = env.GOOGLE_TTS_API_KEY;

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "API Key is missing in Cloudflare settings" }), { status: 500 });
    }

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

    const body = {
      input: { text: text },
      voice: { 
        languageCode: voiceConfig.lang,
        name: voiceConfig.voice
      },
      audioConfig: { 
        audioEncoding: 'MP3'
        // 문제가 될 수 있는 effectsProfileId 제거
      }
    };

    const googleResponse = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      // 구글에서 보내준 에러 메시지를 그대로 클라이언트에 전달 (디버깅용)
      return new Response(JSON.stringify({ 
        error: data.error?.message || "Google API Error",
        details: data.error
      }), { status: googleResponse.status });
    }

    return new Response(JSON.stringify({ audioContent: data.audioContent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
