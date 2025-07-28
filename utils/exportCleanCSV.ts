export function downloadCSV(name: string, data: Record<string, string>[]) {
  if (!data || data.length === 0) {
    alert(`No data to export for ${name}`);
    return;
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','), // header row
    ...data.map(row =>
      headers.map(field => `"${(row[field] || '').replace(/"/g, '""')}"`).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${name}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
