import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  businessName: string;
  period: string;
  generatedDate: string;
  summary: {
    totalRevenue: number;
    totalExpense: number;
    totalProfit: number;
    totalSales: number;
  };
  weeklyData: Array<{
    day: string;
    revenue: number;
    profit: number;
  }>;
  transactions: Array<{
    date: string;
    description: string;
    type: 'income' | 'expense';
    amount: number;
  }>;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function exportReportToPDF(data: ReportData) {
  const doc = new jsPDF();
  
  // Color scheme
  const primaryColor: [number, number, number] = [34, 197, 94];
  const darkColor: [number, number, number] = [31, 41, 55];
  const lightGray: [number, number, number] = [243, 244, 246];

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.businessName, 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Laporan Keuangan', 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Periode: ${data.period}`, 105, 37, { align: 'center' });

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(9);
  doc.text(`Dicetak: ${data.generatedDate}`, 200, 45, { align: 'right' });

  // Summary Section
  let yPos = 60;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Ringkasan', 14, yPos);
  
  yPos += 10;
  const summaryData = [
    { label: 'Total Pemasukan', value: formatIDR(data.summary.totalRevenue), color: [59, 130, 246] as [number, number, number] },
    { label: 'Total Pengeluaran', value: formatIDR(data.summary.totalExpense), color: [239, 68, 68] as [number, number, number] },
    { label: 'Total Keuntungan', value: formatIDR(data.summary.totalProfit), color: [34, 197, 94] as [number, number, number] },
    { label: 'Total Transaksi', value: data.summary.totalSales.toString(), color: [139, 92, 246] as [number, number, number] },
  ];

  const cardWidth = 90;
  const cardHeight = 25;
  const gap = 10;
  const startX = 14;

  summaryData.forEach((item, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = startX + col * (cardWidth + gap);
    const y = yPos + row * (cardHeight + gap);
    
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
    
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.roundedRect(x, y, 4, cardHeight, 2, 2, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(item.label, x + 8, y + 8);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(item.value, x + 8, y + 18);
  });

  // Weekly Chart Section
  yPos += 70;
  
  const tableColumn = ['Hari', 'Pendapatan', 'Keuntungan'];
  const tableRows = data.weeklyData.map(day => [
    day.day,
    formatIDR(day.revenue),
    formatIDR(day.profit)
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: yPos,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      textColor: darkColor,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 35, halign: 'center' },
      1: { cellWidth: 70, halign: 'right' },
      2: { cellWidth: 70, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'head') {
        data.cell.styles.fontSize = 13;
      }
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Recent Transactions Section
  const transactionRows = data.transactions.slice(0, 10).map(tx => [
    tx.date,
    tx.description,
    tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    tx.type === 'income' ? `+${formatIDR(tx.amount)}` : `-${formatIDR(tx.amount)}`,
  ]);

  autoTable(doc, {
    head: [['Tanggal', 'Deskripsi', 'Tipe', 'Jumlah']],
    body: transactionRows,
    startY: yPos,
    theme: 'striped',
    headStyles: {
      fillColor: darkColor,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 13,
    },
    bodyStyles: {
      textColor: darkColor,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 28, halign: 'center' },
      1: { cellWidth: 75 },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 40, fontStyle: 'bold', halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const text = data.cell.raw as string;
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [34, 197, 94];
        } else if (text.startsWith('-')) {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  const filename = `Laporan_Keuangan_${data.period.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
