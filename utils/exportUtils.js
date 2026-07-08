// Export utilities for CSV and Print functionality

export const exportToCSV = (data, filename) => {
  // Convert array of objects to CSV
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
  element.setAttribute('download', `${filename}.csv`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const printContent = (elementId, title) => {
  const printWindow = window.open('', '', 'width=800,height=600');
  const element = document.getElementById(elementId);

  if (!element) {
    alert('Content not found');
    return;
  }

  const content = element.innerHTML;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .print-header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          .print-header p {
            font-size: 12px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          table th {
            background-color: #f0f0f0;
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
            font-weight: bold;
          }
          table td {
            padding: 8px;
            border: 1px solid #ddd;
          }
          table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .summary {
            margin-top: 20px;
            padding: 10px;
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .summary-row strong {
            font-weight: bold;
          }
          .print-date {
            text-align: right;
            font-size: 12px;
            color: #999;
            margin-top: 20px;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>${title}</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
        </div>
        ${content}
        <div class="print-date">
          <p>This is an electronically generated document.</p>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 100);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const downloadLedgerPDF = (customerName, ledgerData) => {
  // Simple text-based PDF download (requires external library for better formatting)
  const lines = [
    `=== DIGITAL LEDGER (BAHI-KHATA) ===`,
    `Customer: ${customerName}`,
    `Date: ${new Date().toLocaleDateString('en-IN')}`,
    ``,
    `Date\tParticular\tDebit\tCredit\tBalance`,
    `${'='.repeat(80)}`,
  ];

  ledgerData.forEach(entry => {
    const date = new Date(entry.date).toLocaleDateString('en-IN');
    const debit = entry.debit > 0 ? `₹${entry.debit}` : '-';
    const credit = entry.credit > 0 ? `₹${entry.credit}` : '-';
    const balance = `₹${entry.runningBalance}`;
    lines.push(`${date}\t${entry.particular}\t${debit}\t${credit}\t${balance}`);
  });

  const content = lines.join('\n');
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', `ledger_${customerName}_${Date.now()}.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const generateReportSummary = (reportType, data) => {
  const summary = [];

  switch (reportType) {
    case 'outstanding':
      summary.push(`Total Outstanding Customers: ${data.length}`);
      const totalOutstanding = data.reduce((sum, item) => sum + item.outstanding, 0);
      summary.push(`Total Outstanding Amount: ₹${totalOutstanding.toLocaleString('en-IN')}`);
      break;

    case 'sales':
      summary.push(`Total Sales Transactions: ${data.length}`);
      const totalSales = data.reduce((sum, item) => sum + item.debit, 0);
      summary.push(`Total Sales Value: ₹${totalSales.toLocaleString('en-IN')}`);
      break;

    case 'payments':
      summary.push(`Total Payment Transactions: ${data.length}`);
      const totalPayments = data.reduce((sum, item) => sum + item.credit, 0);
      summary.push(`Total Payments Received: ₹${totalPayments.toLocaleString('en-IN')}`);
      break;

    default:
      break;
  }

  return summary.join('\n');
};
