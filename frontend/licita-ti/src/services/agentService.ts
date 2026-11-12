import { agentApi } from "../api";
import { type ChatResponse, type ChatRequest } from "../types/agent";

export async function enviarMensagem(
    message: string,
): Promise<ChatResponse> {
    const payload: ChatRequest = {
        message,
    };

    const { data } = await agentApi.post<ChatResponse>("/api/v1/chat", payload);

    return data;
}