import { Bot, FileSearch,  Search, Send, Sparkles, Target } from "lucide-react";
import { useState } from "react";

const suggestions = [
    {
        icon: Search,
        title: "Encontrar oportunidades",
        description: "Procure licitações por segmento, estado ou município",
        prompt: "Encontre oportunidade de Saas em Santa Catarina.",
    },
    {
        icon: FileSearch,
        title: "Analisar licitação",
        description: "Entenda rapidamente objeto, prazo e oportunidade.",
        prompt: "Analise as principais oportunidades de TI em Santa Catarina.",

    },
    {
        icon: Target,
        title: "Encontrar para minha empresa",
        description: "Descubra oportunidade compatíveis com seu negócio.",
        prompt: "Quais licitações abertas podem ser interresantes para uma empresa de tecnologia?",
    },
];

export function Agent() {
    const [message, setMessage] = useState("");

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!message.trim()) {
            return;
        }
        // a integração com POST /chat entra no proximo passo.
        console.log("Mensagem:", message)

        setMessage("");
    }

    function handleSuggestion(prompt: string) {
        setMessage(prompt);
    }

    return (
        <div className="flex min-h-[calc(100vh-7rem) flex-col">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                            <Bot size={22} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-semibold text-white">
                                    AI Agent
                                </h1>

                                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Online
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="max-w-2xl text-sm text-slate-400">
                        Encontre, filtre e analise oportunidades de contratação pública
                        usando linguagem natural.
                    </p>
                </div>
            </div>
            {/* Main Agent*/}
            <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl">
                {/* Empty state */}
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                        <Sparkles size={30} />
                    </div>

                    <h2 className="text-center text-2xl font-semibold text-white">
                        Como posso ajudar?
                    </h2>

                    <p className="mt-2 max-w-xl text-center text-sm leading-6 text-slate-400">
                        Pergunte sobre licitações, oportunidades, órgãos públicos ou
                        qualquer outro dado que você queira encontrar no Licita Smart.
                    </p>

                    {/* Suggestions */}
                    <div className="mt-10 grid w-full max-w-5xl gap-4 md:grid-cols-3">
                        {suggestions.map((suggestion) => {
                            const Icon = suggestion.icon;

                            return (
                                <button
                                    key={suggestion.title}
                                    type="button"
                                    onClick={() => handleSuggestion(suggestion.prompt)}
                                    className="group rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900"
                                >
                                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition group-hover:text-indigo-400">
                                        <Icon size={18} />
                                    </div>

                                    <h3 className="text-sm font-medium text-white">
                                        {suggestion.title}
                                    </h3>

                                    <p className="mt-2 text-xs leading-5 text-slate-400">
                                        {suggestion.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Example */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
                        <span>Experimente:</span>

                        <button
                            type="button"
                            onClick={() =>
                                handleSuggestion(
                                    "Encontre licitações de Saas em Santa Catarina."
                                )
                            }
                            className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
                        >
                            "Encontre licitações de Saas em SC"
                        </button>
                    </div>
                </div>

                {/* composer */}
                <div className="border-t border-slate-800 bg-slate-900/50 p-4">
                    <form onSubmit={handleSubmit}
                        className="mx-auto flex w-full max-w-5xl items-end gap-3"
                    >
                        <div className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 transition focus-within:border-indigo-500/50">
                            <textarea
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                placeholder="Pergunte ao Licita Smart...."
                                rows={1}
                                className="max-h-32 min-h-[24px] w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && !event.shiftKey) {
                                        event.preventDefault();
                                        event.currentTarget.form?.requestSubmit();
                                    }
                                }}
                            />

                            <div className="mt-2 text-[11px] text-slate-600">
                                Entre para enviar . Shift + Enter para nova linha
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!message.trim()}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-400 disable:cursor-not-allowed disable:opacity-40"
                            aria-label="Enviar menssagem"
                        >
                            <Send size={18} />
                        </button>
                    </form>

                    <p className="mx-auto mt-2 max-w-5xl text-center text-[11px] text-slate-600">
                        O AI Agent fornece apoio à pesquisa e análise. As informações
                        devem ser verificadas antes de qualquer decisão.
                    </p>
                </div>
            </div>
        </div>
    );
}



