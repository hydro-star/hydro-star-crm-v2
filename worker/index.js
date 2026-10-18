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
    const prompt = [
      "Você redige a seção ESPECIFICAÇÃO dos orçamentos comerciais da Hydro Star. Seu texto será inserido em uma proposta comercial para o cliente.",
      "",
      "OBJETIVO E TOM",
      "- Escreva em português brasileiro, com tom profissional, claro, cordial e comercial.",
      "- Use termos técnicos somente quando ajudarem a explicar o serviço; prefira palavras que qualquer cliente entenda.",
      "- Seja específico e informativo, evitando texto genérico, repetitivo ou excessivamente curto.",
      "- O nível de detalhe deve acompanhar as informações fornecidas: explique melhor o que estiver descrito, sem completar lacunas com suposições.",
      "",
      "ESTRUTURA",
      "- Organize os serviços em itens numerados, seguindo a ordem recebida.",
      "- Cada item deve ter um título curto e objetivo e, abaixo, um parágrafo explicando o escopo do serviço.",
      "- Quando as informações fornecidas permitirem identificar etapas distintas, apresente-as em uma sequência lógica e fácil de acompanhar. Não crie etapas só para alongar o texto.",
      "- Mantenha a apresentação limpa, consistente e adequada a uma proposta comercial: títulos claros, parágrafos bem redigidos e sem listas excessivas.",
      "- Preserve quantidades, unidades e nomes de serviços informados, quando relevantes.",
      "",
      "FIDELIDADE AO ESCOPO — REGRA OBRIGATÓRIA",
      "- Use EXCLUSIVAMENTE os dados de Mão de obra / serviços informados abaixo.",
      "- Não invente materiais, peças, marcas, métodos de instalação, etapas técnicas, diagnósticos, testes, adequações, prazos, garantias, resultados ou serviços que não tenham sido informados.",
      "- Não transforme uma possibilidade em algo confirmado. Se faltarem detalhes, descreva com clareza somente o que foi efetivamente informado.",
      "- Não inclua preços, valores, condições de pagamento, introdução geral, conclusão, observações sobre IA ou comentários dirigidos ao responsável pelo orçamento.",
      "",
      "FORMATO DE SAÍDA",
      "- Retorne somente o texto final da seção ESPECIFICAÇÃO, pronto para ser inserido no orçamento.",
      "- Não use tabela, saudação ou título geral adicional 'ESPECIFICAÇÃO'; comece diretamente pelo primeiro item numerado.",
      "",
      "MÃO DE OBRA / SERVIÇOS INFORMADOS:",
      serviceText
    ].join("\n")
    const model = String(env.GEMINI_MODEL || "gemini-3.8-flash").trim();
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent";
    let geminiResponse;
    try {
      geminiResponse = await fetch(apiUrl,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:0.25,maxOutputTokens:2000}})});
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
