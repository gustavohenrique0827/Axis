export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) {
    return;
  }

  // Obter as chaves (cabeçalhos do CSV)
  const separator = ',';
  const keys = Object.keys(data[0]);

  // Montar o conteúdo do CSV
  const csvContent =
    keys.join(separator) +
    '\n' +
    data.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = cell instanceof Date
          ? cell.toLocaleString()
          : cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  // Adicionar BOM para Excel abrir corretamente caracteres UTF-8 (acentos)
  const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });

  // Disparar o download
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
