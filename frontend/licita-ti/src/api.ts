import type {
  ChatResponse,
  HealthResponse,
  LicitacoesResponse
} from "./types";

export const API_BASE_URL = "http://localhost:8000";

async function request<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(
      `API respondeu com HTTP ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export async function checkHealth(): Promise<HealthResponse> {
  return request<HealthResponse>(
    `${API_BASE_URL}/health`
  );
}

export async function sendChat(
  message: string
): Promise<ChatResponse> {
  return request<ChatResponse>(
    `${API_BASE_URL}/chat`,
    {
      method: "POST",
      body: JSON.stringify({
        message
      })
    }
  );
}

export async function getLicitacoes(
  uf = "SC",
  apenasTi = true,
  pagina = 1,
  tamanho = 50
): Promise<LicitacoesResponse> {
  const params = new URLSearchParams({
    uf,
    apenas_ti: String(apenasTi),
    pagina: String(pagina),
    tamanho: String(tamanho)
  });

  return request<LicitacoesResponse>(
    `${API_BASE_URL}/licitacoes?${params.toString()}`
  );
}

export function detectarUf(message: string): string {
  const normalized = message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const estados: Record<string, string> = {
    acre: "AC",
    alagoas: "AL",
    amapá: "AP",
    amapa: "AP",
    amazonas: "AM",
    bahia: "BA",
    ceará: "CE",
    ceara: "CE",
    "distrito federal": "DF",
    "espírito santo": "ES",
    "espirito santo": "ES",
    goiás: "GO",
    goias: "GO",
    maranhão: "MA",
    maranhao: "MA",
    "mato grosso": "MT",
    "mato grosso do sul": "MS",
    "minas gerais": "MG",
    pará: "PA",
    para: "PA",
    paraíba: "PB",
    paraiba: "PB",
    paraná: "PR",
    parana: "PR",
    pernambuco: "PE",
    piauí: "PI",
    piaui: "PI",
    "rio de janeiro": "RJ",
    "rio grande do norte": "RN",
    "rio grande do sul": "RS",
    rondônia: "RO",
    rondonia: "RO",
    roraima: "RR",
    "santa catarina": "SC",
    "são paulo": "SP",
    "sao paulo": "SP",
    sergipe: "SE",
    tocantins: "TO"
  };

  for (const [state, uf] of Object.entries(estados)) {
    if (normalized.includes(state)) {
      return uf;
    }
  }

  const ufMatch = normalized.match(
    /\b(ac|al|ap|am|ba|ce|df|es|go|ma|mt|ms|mg|pa|pb|pr|pe|pi|rj|rn|rs|ro|rr|sc|sp|se|to)\b/i
  );

  return ufMatch?.[1]?.toUpperCase() ?? "SC";
}

export async function sendChatWithFallback(
  message: string
): Promise<ChatResponse> {
  try {
    return await sendChat(message);
  } catch {
    const uf = detectarUf(message);

    const response = await getLicitacoes(
      uf,
      true,
      1,
      50
    );

    return {
      resposta:
        `Não consegui consultar o agente de chat neste momento. ` +
        `Realizei uma busca direta por licitações de TI em ${uf}.`,
      licitacoes: response.resultados
    };
  }
}