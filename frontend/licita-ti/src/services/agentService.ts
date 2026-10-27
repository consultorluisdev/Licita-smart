import { api } from "../api";
import { ChatResponse, type ChatRequest } from "../types/agent";


export async function enviarMessagem(
    message: string,
): Promise<ChatResponse>{
    const payload: ChatRequest = {
        message,
    };

    const { data } = await api.post<ChatResponse>("/chat", payload);

    return data;
}