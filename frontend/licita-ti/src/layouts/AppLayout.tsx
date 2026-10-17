import { useEffect, useState } from 'react';
import { healthCheck } from "../api";

import {
    Activity,
    BarChart3,
    Bell,
    Bot,
    ChevronLeft,
    ChevronRight,
    FileBarChart,
    Heart,
    LayoutDashboard,
    Menu,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    Users,
    X,
    Zap,
} from "lucide-react";

import { NavLink, Outlet } from "react-router-dom";

const navigation = [
    {
        to: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        to: "/agent",
        label: "AI Agent",
        icon: Bot,
    },
    {
        to: "/licitacoes",
        label: "Licitações",
        icon: FileBarChart,
    },
    {
        to: "/pesquisa",
        label: "Pesquisa",
        icon: Search,
    },
    {
        to: "/monitoramento",
        label: "Monitoramento",
        icon: Activity,
    },
    {
        to: "/alertas",
        label: "Alertas",
        icon: Bell,
    },
    {
        to: "/fornecedores",
        label: "Fornecedores",
        icon: Users,
    },
    {
        to: "/favoritos",
        label: "Favoritos",
        icon: Heart,
    },
    {
        to: "/analises",
        label: "Analises",
        icon: BarChart3,
    },
    {
        to: "/relatorios",
        label: "Relatórios",
        icon: FileBarChart,
    },
    {
        to: "/integracoes",
        label: "Integrações",
        icon: Zap,
    },

];

export function AllLayout() {
    const [collapsed, setCollapsed] =
        useState(false);

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const [apiOnline, setApiOnline] = useState<boolean | null>(null);

    useEffect(() => {
        let active = true;

        healthCheck()
            .then(() => {
                if (active) setApiOnline(true);
            })
            .catch((error: unknown) => {
                console.error("Falha ao verificar a API:", error);
                if (active) setApiOnline(false);
            });

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className='min-h-screen bg-[#07090d] text-slate-100'>
            {/* Sidebar */}

            <aside className={`
                fixed inset-y-0 left-0 z-50
                flex flex-col
                border-r border-[#242833]
                bg-[#0b0e13]
                transition-all duration-200

                ${collapsed ? "w-[76px]" : "w-[252px]"}

                ${mobileOpen
                    ? "translate-x-0"
                    : "-translate-x-full lg:translate-x-0"
                }
            `}
            >
                {/* logo */}
                <div className='flex h-16 items-center border-b border-[#242833] px-4'>
                    <div className='flex min-w-0 flex-1 items-center gap-3'>

                        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black'>
                            <ShieldCheck size={19} />
                        </div>

                        {!collapsed && (
                            <div>
                                <p className='font-semibold tracking-tight'>
                                    LICITA SMART
                                </p>

                                <p className='text-[10px] uppercase tracking-[.2em] text-slate-500'>
                                    Intelligence
                                </p>
                            </div>
                        )}

                    </div>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className='text-slate-500 lg:hidden'
                    >
                        <X size={19} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className='scrollbar flex-1 space-y-1 overflow-y-auto p-3'>

                    {!collapsed && (
                        <p className='px-3 pb-2 pt-3 text-[10px] font-semibold tracking-[.18em] text-slate-600'>
                            WORKSPACE
                        </p>
                    )}

                    {navigation.map(
                        ({
                            to,
                            label,
                            icon: Icon,
                        }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === "/"}
                                onClick={() =>
                                    setMobileOpen(false)
                                }
                                className={({ isActive }: { isActive: boolean }) =>
                                    `
                            group flex items-center gap-3
                            rounded-xl px-3 py-2.5
                            text-sm transition

                            ${isActive
                                        ? "bg-white/[.08] text-white"
                                        : "text-slate-400 hover:bg-white/[.04] hover:text-slate-100"
                                    }
                            `
                                }
                            >
                                <Icon
                                    size={18}
                                    className="shrink-0"
                                />
                                {!collapsed && (
                                    <span>{label}</span>
                                )}
                                {!collapsed &&
                                    label === "Alertas" && (
                                        <span className='ml-auto rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300'>
                                            8
                                        </span>
                                    )}
                            </NavLink>
                        )
                    )}
                    {!collapsed && (
                        <p className='px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-600'>
                            Sistema
                        </p>
                    )}
                    <NavLink
                        to="/settings"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/[.04] hover:text-white"
                    >
                        <Settings size={18} className="shrink-0" />
                        {!collapsed && "Settings"}
                    </NavLink>
                </nav>
                {/* API STATUS */}

                <div className='border-t border-[#242833] p-3'>
                    {!collapsed && (
                        <div className={`mb-3 rounded-xl border p-3 ${
                            apiOnline === true
                                ? "border-emerald-500/10 bg-emerald-500/[.04]"
                                : apiOnline === false
                                    ? "border-rose-500/10 bg-rose-500/[.04]"
                                    : "border-[#242833] bg-white/[.02]"
                        }`}>
                        <div className='flex items-center gap-2 text-xs font-medium'>

                            <span className={`h-2 w-2 rounded-full ${
                                apiOnline === true
                                    ? "bg-emerald-400"
                                    : apiOnline === false
                                        ? "bg-rose-400"
                                        : "bg-slate-500"
                            }`} />

                            <span>
                                {apiOnline === null
                                    ? "Verificando API..."
                                    : apiOnline
                                        ? "API on-line"
                                        : "API indisponível"}
                            </span>
                            </div>

                            <p className='mt-1 text-[11px] text-slate-500'>
                                Rust / Axum
                            </p>
                        </div>
                    )}
                    <button
                        onClick={() =>
                            setCollapsed((value) => !value)
                        }
                        className='hidden w-full items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-white/[.04] hover:text-white lg:flex'
                    >
                        {!collapsed ? (
                            <ChevronRight size={17} />
                        ) : (
                            <ChevronLeft size={17} />
                        )}
                    </button>
                </div>
            </aside>

            {/* Main */}

            <div className={`
                transition-all duration-200

                ${collapsed
                    ? "lg:pl-[76px]"
                    : "lg:pl-[252px]"
                }
                
                `}
            >
                {/* Header */}
                <header className='sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#242833]
                    bg-[#07090d]/85 px-4 backdrop-blur-xl lg:px-7'>

                    <div className='flex items-center gap-3'>
                        <button
                            onClick={() =>
                                setMobileOpen(true)
                            }
                            className='rounded-lg p-2 text-slate-400 hover:bg-white/[.05] lg:hidden'
                        >
                            <Menu size={20} />
                        </button>

                        <div className='hidden items-center gap-2 text-xs text-slate-500 sm:flex'>
                            <Sparkles size={14} />
                            Procurement Intelligence
                        </div>
                    </div>

                    <div className='flex items-center gap-3'>
                        <div className='hidden items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[.05] px-3 py-1.5 text-xs text-emerald-300 sm:flex'>

                            <span className='h-1.5 w-1.5 rounded-full bg-emerald-400 ' />
                            Sistema Operacional

                        </div>

                        <button className='relative rounded-xl border border-[#242833] p-2 text-slate-400 hover:text-white'
                        >
                            <Bell size={18} />

                            <span className='absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400' />
                        </button>

                        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-300 to-slate-600 text-xs font-bold text-black'>
                            LL
                        </div>
                    </div>
                </header>
                {/* content */}
                <main className='grid-bg min-h-[calc(100vh-4rem)] p-4 lg:p-7'>

                    <Outlet />

                </main>
            </div>
        </div>
    );
}