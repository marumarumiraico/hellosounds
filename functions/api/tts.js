
const COUNTRY_VOICE_MAP = {
  "USA": { lang: "en-US", voice: "en-US-Neural2-A" },
  "Korea": { lang: "ko-KR", voice: "ko-KR-Neural2-A" },
  "Japan": { lang: "ja-JP", voice: "ja-JP-Neural2-C" },
  "Spain": { lang: "es-ES", voice: "es-ES-Neural2-A" },
  "France": { lang: "fr-FR", voice: "fr-FR-Neural2-A" },
  "Germany": { lang: "de-DE", voice: "de-DE-Neural2-A" },
  "Italy": { lang: "it-IT", voice: "it-IT-Neural2-A" },
  "Russia": { lang: "ru-RU", voice: "ru-RU-Wavenet-A" },
  "Thailand": { lang: "th-TH", voice: "th-TH-Neural2-A" },
  "Egypt": { lang: "ar-EG", voice: "ar-EG-Wavenet-A" },
  "Brazil": { lang: "pt-BR", voice: "pt-BR-Neural2-A" },
  "China": { lang: "zh-CN", voice: "zh-CN-Neural2-A" },
  "India": { lang: "hi-IN", voice: "hi-IN-Neural2-A" },
  "Kenya": { lang: "sw-KE", voice: "sw-KE-Wavenet-A" },
  "Greece": { lang: "el-GR", voice: "el-GR-Wavenet-A" }
};

export async function onRequestGet(context) {
  return new Response(JSON.stringify({ 
    status: "alive", 
    message: "TTS Function is active!",
    env_configured: !!context.env.GOOGLE_TTS_API_KEY
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { text, country } = await request.json();
    const voiceConfig = COUNTRY_VOICE_MAP[country] || { lang: "en-US", voice: "en-US-Neural2-A" };

    const API_KEY = env.GOOGLE_TTS_API_KEY;
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "API Key not configured in Cloudflare environment variables" }), { status: 500 });
    }

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

    const body = {
      input: { text: text },
      voice: { 
        languageCode: voiceConfig.lang,
        name: voiceConfig.voice
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        effectsProfileId: ['small-bluetooth-class-device']
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ audioContent: data.audioContent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
