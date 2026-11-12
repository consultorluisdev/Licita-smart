export interface ChatRequest {
    message: string;
}

export interface ChatResponse {
    success: boolean;
    agent: string;
    response: string;
}