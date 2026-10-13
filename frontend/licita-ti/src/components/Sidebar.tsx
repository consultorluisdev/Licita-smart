interface SiderBarProps {
    apiOnline: boolean | null;
    history: string[];
    onNewConversation: () => void;
    onShortcut: (message: string) => void;
    onCloseMobile?: () => void;
}

const shortcuts = [
    "Sass em SC",
    "Software em SP",
    "Sistemas no Paraná",
    "Cloud em Santa Catarina",
    "Brasil todo TI"
];

export function Sidebar({
    apiOnline,
    history,
    onNewConversation,
    onShortcut,
    onCloseMobile
}: SiderBarProps){
    return(
        <aside className="flex h-full w-[290px] shrink-0 flex-col border-white/[0.06] bg-app-900">
            <div className="flex h-16 items-center border-b border-white/[0.06] px-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        ⚡
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">
                            Licita TI
                        </p>
                        <p className="text-[11px] text-slate-500">
                            Inteligência em Licitações
                        </p>
                    </div>
                </div>
                {onCloseMobile && (
                    <button
                        onClick={onCloseMobile}
                        className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
                        aria-label="Fechar menu"
                    >
                        X
                    </button>
                )}
            </div>

            <div className="p-4">
                <button
                    onClick={onNewConversation}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                    Nova conversa
                </button>
            </div>

            <div className="px-4 pb-4">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                    Sugestões
                </p>
                <div className="flex flex-col gap-2">
                    {shortcuts.map((shortcut) => (
                        <button
                            key={shortcut}
                            onClick={() => onShortcut(shortcut)}
                            className="rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                        >
                            {shortcut}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                    Conversas recentes
                </p>
                {history.length > 0 ? (
                    <ul className="flex flex-col gap-1">
                        {history.map((item, index) => (
                            <li
                                key={`${item}-${index}`}
                                className="truncate rounded-lg px-3 py-2 text-sm text-slate-400"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="px-3 py-2 text-sm text-slate-500">
                        Nenhuma conversa recente.
                    </p>
                )}
            </div>

            <div
                className="border-t border-white/[0.06] px-5 py-4 text-xs text-slate-400"
                aria-live="polite"
            >
                {apiOnline === null
                    ? "Verificando conexão com a API..."
                    : apiOnline
                      ? "API conectada"
                      : "API indisponível"}
            </div>
        </aside>
    )
}
