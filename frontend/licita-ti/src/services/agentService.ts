import { api } from "../api";
import { type ChatResponse, type ChatRequest } from "../types/agent";


export async function enviarMessagem(
    message: string,
): Promise<ChatResponse>{
    const payload: ChatRequest = {
        message,
    };

    const { data } = await api.post<ChatResponse>("/chat", payload);

    return data;
}