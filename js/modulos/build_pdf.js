
export const OnGeneratePdf = ({
    array = [],
    itensPorPagina = 0,
    onHeader = (array) => { },
    onCreateBody = () => { return HTMLBodyElement },
    onBody = (tbody = HTMLBodyElement, item = Object, index = 0, array = []) => { },
    onFooter = (totalItens = 0, pagina = 0, totalPaginas = 0) => { },
}) => {
    const totalIitens = array.length;
    if (totalIitens < 0) return

    let pagina = 0.
    let totalPaginas = Math.ceil(totalIitens / itensPorPagina)
    let tbody;

    array.forEach((item, index) => {
        if ((index % itensPorPagina) == 0) {
            pagina++
            onHeader?.(array)
            tbody = onCreateBody?.()
        }

        onBody?.(tbody, item, index, array)

        if (((index + 1) % itensPorPagina) == 0 && index > 0) {
            onFooter?.(totalIitens, pagina, totalPaginas)
        }
    })
    onFooter?.(totalIitens, totalPaginas, totalPaginas)
}