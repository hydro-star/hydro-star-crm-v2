const ALLOWED_ORIGINS = new Set([
  "https://hydro-star.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
]);

function json(data, status, origin) {
  const headers = {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Vary":"Origin"};
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return new Response(JSON.stringify(data), {status:status,headers:headers});
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      if (!ALLOWED_ORIGINS.has(origin)) return new Response(null,{status:403});
      return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"86400","Vary":"Origin"}});
    }
    if (!ALLOWED_ORIGINS.has(origin)) return json({error:"Origem não autorizada."},403,origin);
    const url = new URL(request.url);
    if (url.pathname !== "/generate-specification") return json({error:"Rota não encontrada."},404,origin);
    if (request.method !== "POST") return json({error:"Método não permitido."},405,origin);
    if (!env.GEMINI_API_KEY) return json({error:"A chave do Gemini ainda não foi configurada no serviço."},503,origin);
    if (env.RATE_LIMITER) {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const limit = await env.RATE_LIMITER.limit({key:ip});
      if (!limit.success) return json({error:"Limite temporário de solicitações atingido. Aguarde um minuto e tente novamente."},429,origin);
    }
    let body;
    try { body = await request.json(); } catch { return json({error:"Envie os dados em formato JSON."},400,origin); }
    if (!Array.isArray(body.services) || body.services.length < 1 || body.services.length > 20) return json({error:"Informe de 1 a 20 itens de mão de obra."},400,origin);
    const services = body.services.map((item) => ({
      service:String(item && item.service || "").trim().slice(0,300),
      details:String(item && item.details || "").trim().slice(0,1000),
      quantity:Number(item && item.quantity || 0),
      unit:String(item && item.unit || "").trim().slice(0,30)
    })).filter((item) => item.service || item.details);
    if (!services.length) return json({error:"Não há descrição suficiente para gerar a especificação."},400,origin);
    const serviceText = services.map((item,index) => {
      let line = (index+1) + ". " + (item.service || "Serviço");
      if (item.details) line += " — " + item.details;
      if (item.quantity > 0) line += " (quantidade: " + item.quantity + (item.unit ? " " + item.unit : "") + ")";
      return line;
    }).join("\n");
    const prompt = "Você redige a seção ESPECIFICAÇÃO de orçamentos da Hydro Star, empresa de instalação e manutenção de banheiras de hidromassagem e spas. Escreva em português brasileiro, com palavras simples para qualquer cliente entender. Explique o que será feito com base SOMENTE nos serviços informados abaixo. Organize em itens numerados, cada um com um título curto e uma explicação clara de 1 a 3 frases. Não mencione preços. Não invente etapas técnicas, diagnósticos, peças, materiais, testes, prazos, resultados garantidos ou serviços não informados. Se houver pouca informação, descreva apenas o escopo confirmado e não presuma detalhes. Não inclua introdução, conclusão, avisos sobre IA nem formatação em tabela.\n\nMÃO DE OBRA / SERVIÇOS INFORMADOS:\n" + serviceText;
    const model = String(env.GEMINI_MODEL || "gemini-3.8-flash").trim();
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent";
    let geminiResponse;
    try {
      geminiResponse = await fetch(apiUrl,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:0.2,maxOutputTokens:1200}})});
    } catch {
      return json({error:"Não foi possível acessar o serviço do Gemini. Tente novamente."},502,origin);
    }
    let result;
    try { result = await geminiResponse.json(); } catch { result = {}; }
    if (!geminiResponse.ok) return json({error:"O Gemini não conseguiu gerar o texto. Verifique a configuração da API e tente novamente."},502,origin);
    const specification = (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts || []).map((part)=>part.text||"").join("").trim();
    if (!specification) return json({error:"O Gemini não retornou texto. Revise a descrição dos serviços e tente novamente."},502,origin);
    return json({specification:specification},200,origin);
  }
};
