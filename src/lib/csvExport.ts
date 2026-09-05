/** Gera e baixa um CSV real a partir de linhas de dados — usado pelos exports
 * de Financeiro e Produtos (antes só mostravam um toast de sucesso sem gerar nada). */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
  const csvContent = "data:text/csv;charset=utf-8,"
    + headers.map(escape).join(";") + "\r\n"
    + rows.map(row => row.map(escape).join(";")).join("\r\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
