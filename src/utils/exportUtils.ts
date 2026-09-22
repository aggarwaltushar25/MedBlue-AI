/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join(
      '\n'
    );
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function triggerPrintDashboard() {
  window.print();
}
