export function brl(value: number){
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
    }).format(value);
}

export function compactNumber(value: number){
    return new Intl.NumberFormat("pt-BR", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}