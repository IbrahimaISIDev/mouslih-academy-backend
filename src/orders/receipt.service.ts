import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface ReceiptData {
  ref: string;
  createdAt: Date;
  amountXof: number;
  courseName: string;
  buyerName: string;
  buyerEmail: string;
  paymentMethod: string;
  transactionRef?: string;
}

const GREEN_INK = '#0b230e';
const GREEN_700 = '#38b349';
const GREY = '#6b7280';
const LINE = '#e5e7eb';
const PAGE_MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4 en points

// Intl.NumberFormat('fr-FR') insère une espace insécable fine (U+202F) comme séparateur de
// milliers, un glyphe absent des polices de base de PDFKit (Helvetica en encodage WinAnsi) —
// elle s'affichait comme "/". Espace ASCII normale à la place, supportée partout.
function formatXof(amount: number): string {
  const withSpaces = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${withSpaces} F CFA`;
}

@Injectable()
export class ReceiptService {
  generatePdf(data: ReceiptData): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });
    const contentWidth = PAGE_WIDTH - PAGE_MARGIN * 2;

    doc
      .fillColor(GREEN_INK)
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Mouslih Academy', PAGE_MARGIN, PAGE_MARGIN);
    doc
      .fillColor(GREY)
      .fontSize(10)
      .font('Helvetica')
      .text('Dakar, Sénégal · mouslihacademy.sn', PAGE_MARGIN, doc.y + 2);

    doc.moveDown(2.5);
    doc.fillColor('#000').fontSize(16).font('Helvetica-Bold').text('Reçu de paiement');
    doc.moveDown(0.4);
    doc
      .fillColor(GREY)
      .fontSize(10)
      .font('Helvetica')
      .text(`Référence ${data.ref} · ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(data.createdAt)}`);

    doc.moveDown(1.5);
    doc.fillColor('#000').fontSize(11).font('Helvetica-Bold').text('Facturé à');
    doc.font('Helvetica').fontSize(10).fillColor(GREY);
    doc.text(data.buyerName);
    doc.text(data.buyerEmail);

    doc.moveDown(2);
    const tableTop = doc.y;
    doc
      .fillColor(GREY)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('FORMATION', PAGE_MARGIN, tableTop, { width: contentWidth - 120 })
      .text('MONTANT', PAGE_MARGIN, tableTop, { width: contentWidth, align: 'right' });
    doc
      .moveTo(PAGE_MARGIN, doc.y + 6)
      .lineTo(PAGE_MARGIN + contentWidth, doc.y + 6)
      .strokeColor(LINE)
      .stroke();

    const rowTop = doc.y + 16;
    doc
      .fillColor('#000')
      .fontSize(11)
      .font('Helvetica')
      .text(data.courseName, PAGE_MARGIN, rowTop, { width: contentWidth - 120 })
      .text(formatXof(data.amountXof), PAGE_MARGIN, rowTop, { width: contentWidth, align: 'right' });

    doc.moveDown(2.5);
    doc
      .moveTo(PAGE_MARGIN, doc.y)
      .lineTo(PAGE_MARGIN + contentWidth, doc.y)
      .strokeColor(LINE)
      .stroke();
    doc.moveDown(0.6);

    const totalTop = doc.y;
    doc
      .fillColor('#000')
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('Total payé', PAGE_MARGIN, totalTop, { width: contentWidth - 120 })
      .fillColor(GREEN_700)
      .text(formatXof(data.amountXof), PAGE_MARGIN, totalTop, { width: contentWidth, align: 'right' });

    doc.moveDown(3);
    doc.fillColor(GREY).fontSize(9).font('Helvetica');
    doc.text(`Moyen de paiement : ${data.paymentMethod}`);
    if (data.transactionRef) doc.text(`Référence de transaction : ${data.transactionRef}`);
    doc.moveDown(1);
    doc.text('Paiement unique, accès à vie à la formation — aucun renouvellement automatique.');
    doc.text('Paiement sécurisé par Wave Sénégal.');

    doc.end();
    return doc;
  }
}
