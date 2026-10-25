const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504, 524]);
const RETRY_DELAYS_MS = [500, 1200];
const ATTEMPT_TIMEOUT_MS = 18000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiModel(model, prompt, apiKey) {
  const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent";
  let lastError = {httpStatus:502, status:"UNKNOWN", message:"Falha desconhecida"};

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    let response;
    try {
      response = await fetch(apiUrl, {
        method:"POST",
        headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},
        body:JSON.stringify({
          contents:[{role:"user",parts:[{text:prompt}]}],
          generationConfig:{temperature:0.25,maxOutputTokens:2000}
        }),
        signal:AbortSignal.timeout(ATTEMPT_TIMEOUT_MS)
      });
    } catch (error) {
      const timedOut = error && (error.name === "TimeoutError" || error.name === "AbortError");
      lastError = {
        httpStatus:timedOut ? 524 : 502,
        status:timedOut ? "UPSTREAM_TIMEOUT" : "NETWORK_ERROR",
        message:timedOut ? "Tempo limite de 18 segundos excedido" : String(error && error.message || "Falha de rede")
      };
      if (attempt < RETRY_DELAYS_MS.length) {
        console.warn("Gemini connection failure; retrying", {model,attempt:attempt+1,status:lastError.status});
        await wait(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      break;
    }

    let result = {};
    try { result = await response.json(); } catch {}

    if (response.ok) {
      const specification = (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts || [])
        .map((part) => part.text || "").join("").trim();
      return {ok:true,specification,model};
    }

    const apiError = result && result.error ? result.error : {};
    lastError = {
      httpStatus:response.status,
      status:apiError.status || "UNKNOWN",
      message:apiError.message || "Sem mensagem de erro"
    };
    console.error("Gemini API error", {model,attempt:attempt+1,...lastError});

    if (!RETRYABLE_STATUSES.has(response.status) || attempt >= RETRY_DELAYS_MS.length) break;
    await wait(RETRY_DELAYS_MS[attempt]);
  }

  return {ok:false,...lastError,model};
}

async function generateSpecificationWithFallback(prompt, env) {
  const primaryModel = String(env.GEMINI_MODEL || "gemini-3.8-flash").trim();
  const fallbackModel = String(env.GEMINI_FALLBACK_MODEL || "").trim();
  const primary = await callGeminiModel(primaryModel, prompt, env.GEMINI_API_KEY);
  if (primary.ok) return primary;

  if (fallbackModel && fallbackModel !== primaryModel && RETRYABLE_STATUSES.has(primary.httpStatus)) {
    console.warn("Primary Gemini model unavailable; trying configured fallback", {
      primaryModel, fallbackModel, httpStatus:primary.httpStatus
    });
    const fallback = await callGeminiModel(fallbackModel, prompt, env.GEMINI_API_KEY);
    if (fallback.ok) return fallback;
    return {
      ...fallback,
      userMessage:"A IA está temporariamente indisponível. O modelo principal e o alternativo falharam. Tente novamente em instantes."
    };
  }

  const userMessage = primary.httpStatus === 429
    ? "O limite de solicitações da IA foi atingido. Aguarde um pouco e tente novamente."
    : primary.httpStatus === 503 || primary.status === "UNAVAILABLE"
      ? "O Gemini está com alta demanda no momento. Tentamos novamente automaticamente, mas o serviço continua indisponível. Tente novamente em instantes."
      : primary.httpStatus === 524 || primary.status === "UPSTREAM_TIMEOUT" || primary.status === "NETWORK_ERROR"
        ? "A resposta da IA demorou demais ou a conexão falhou. As tentativas automáticas não resolveram; tente novamente em instantes."
        : primary.httpStatus === 400 || primary.httpStatus === 401 || primary.httpStatus === 403
          ? "A API do Gemini recusou a solicitação. Verifique o modelo configurado e as credenciais no Cloudflare."
          : "Não foi possível gerar a especificação com IA após novas tentativas. Tente novamente em instantes.";

  return {...primary,userMessage};
}

export { generateSpecificationWithFallback };
