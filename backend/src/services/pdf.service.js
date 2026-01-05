import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import n2words from 'n2words';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePDF = async (invoice, client, products) => {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const fileName = `invoice-${invoice._id}-${Date.now()}.pdf`;
  const filePath = path.join(uploadDir, fileName);

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let qrCodeDataUrl;
  try {
    const qrCodeUrl = 'https://www.facebook.com/assinet.degache';
    qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);
  } catch (err) {
    console.error('Error generating QR code:', err);
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(20).text('FACTURE', { align: 'center' });
    doc.moveDown();

    // Invoice details
    doc.fontSize(12);
    doc.text(`N° Facture: ${invoice._id}`, { align: 'right' });
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, {
      align: 'right',
    });
    doc.text(`Statut: ${invoice.statut}`, { align: 'right' });
    doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, { align: 'right' });
    doc.moveDown();

    // Client info
    doc.fontSize(14).text('Client:', { underline: true });
    doc.fontSize(12);
    doc.text(`${client.nom} ${client.prenom}`);
    if (client.email) doc.text(`Email: ${client.email}`);
    if (client.contact) doc.text(`Contact: ${client.contact}`);
    if (client.adresse) doc.text(`Adresse: ${client.adresse}`);
    doc.moveDown();

    // Items table
    doc.fontSize(14).text('Articles:', { underline: true });
    doc.moveDown(0.5);

    let yPosition = doc.y;
    doc.fontSize(10);

    // Table header
    doc.text('Produit', 50, yPosition);
    doc.text('Qté', 250, yPosition);
    doc.text('Prix unitaire', 300, yPosition);
    doc.text('Total', 420, yPosition);
    yPosition += 20;

    // Table rows
    invoice.items.forEach((item) => {
      // Product is already populated in item.productId
      const product = item.productId;
      const productName = product ? product.nom : 'Produit inconnu';

      doc.text(productName, 50, yPosition, { width: 200 });
      doc.text(item.qte.toString(), 250, yPosition);
      doc.text(`${item.prixUnitaire.toFixed(2)} DT`, 300, yPosition);
      doc.text(`${item.total.toFixed(2)} DT`, 420, yPosition);
      yPosition += 20;
    });

    // Total
    yPosition += 10;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;
    doc.fontSize(14).text(`TOTAL: ${invoice.total.toFixed(2)} DT`, 420, yPosition);

    // Total in words
    yPosition += 30;
    const total = invoice.total;
    const dinars = Math.floor(total);
    const millimes = Math.round((total - dinars) * 1000);

    let totalInWords = n2words(dinars, { lang: 'fr' }) + ' Dinars';
    if (millimes > 0) {
      totalInWords += ' et ' + n2words(millimes, { lang: 'fr' }) + ' Millimes';
    }

    doc.fontSize(12).text(`Arrêté la présente facture à la somme de : ${totalInWords}`, 50, yPosition, { width: 500 });


    // QR Code
    if (qrCodeDataUrl) {
      yPosition += 50; // Add some space after the total
      // Check if we need a new page
      if (yPosition + 120 > doc.page.height - 50) {
        doc.addPage();
        yPosition = 50;
      }

      doc.image(qrCodeDataUrl, 50, yPosition, { width: 100 });
      doc.fontSize(10).text('Scannez pour nous suivre sur Facebook', 50, yPosition + 110);
    }

    doc.end();

    doc.on('end', () => {
      resolve({
        filePath,
        fileName,
        url: `/uploads/${fileName}`,
      });
    });

    doc.on('error', (error) => {
      reject(error);
    });
  });
};


