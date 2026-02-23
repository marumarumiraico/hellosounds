import { onRequestPost as __api_tts_js_onRequestPost } from "F:\\dev\\Hello Sounds\\functions\\api\\tts.js"

export const routes = [
    {
      routePath: "/api/tts",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_tts_js_onRequestPost],
    },
  ]