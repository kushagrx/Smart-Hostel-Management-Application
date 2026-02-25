import ExcelJS from 'exceljs';
import { Response } from 'express';
import fs from 'fs';
import puppeteer from 'puppeteer';

/**
 * Export data to Excel format
 */
export const exportToExcel = async (
    data: any[],
    filename: string,
    headers: { key: string; header: string; width?: number }[]
): Promise<Buffer> => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Add headers
    worksheet.columns = headers.map(h => ({
        header: h.header,
        key: h.key,
        width: h.width || 20
    }));

    // Add data
    worksheet.addRows(data);

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
    };

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
};

/**
 * Export data to PDF format using HTML template
 */
export const exportToPDF = async (
    data: any[],
    filename: string,
    title: string,
    headers: { key: string; header: string }[]
): Promise<Buffer> => {
    const html = generateHTMLTemplate(data, title, headers);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A3',
            landscape: true,
            printBackground: true,
            scale: 0.8, // Scale down to fit more content
            margin: {
                top: '15mm',
                right: '10mm',
                bottom: '15mm',
                left: '10mm'
            }
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
};

/**
 * Generate HTML template for PDF export
 */
const generateHTMLTemplate = (
    data: any[],
    title: string,
    headers: { key: string; header: string }[]
): string => {
    const tableRows = data.map(row => {
        const cells = headers.map(header =>
            `<td>${row[header.key] || ''}</td>`
        ).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    const tableHeaders = headers.map(header =>
        `<th>${header.header}</th>`
    ).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #3B82F6;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #1F2937;
                margin: 0;
                font-size: 28px;
            }
            .header .subtitle {
                color: #6B7280;
                margin: 5px 0 0 0;
                font-size: 14px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                table-layout: auto;
            }
            th {
                background-color: #3B82F6;
                color: white;
                padding: 8px 4px;
                text-align: left;
                font-weight: 600;
                font-size: 11px;
                white-space: nowrap;
            }
            td {
                padding: 6px 4px;
                border-bottom: 1px solid #E5E7EB;
                font-size: 10px;
                word-wrap: break-word;
                max-width: 150px;
            }
            tr:nth-child(even) {
                background-color: #F9FAFB;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                color: #6B7280;
                font-size: 12px;
                border-top: 1px solid #E5E7EB;
                padding-top: 20px;
            }
            .summary {
                background-color: #F3F4F6;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .summary-item {
                display: inline-block;
                margin-right: 30px;
                font-size: 14px;
            }
            .summary-label {
                font-weight: 600;
                color: #374151;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>SmartStay Hostel Management</h1>
            <div class="subtitle">${title}</div>
            <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}</div>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <span class="summary-label">Total Records:</span> ${data.length}
            </div>
        </div>
        
        <table>
            <thead>
                <tr>${tableHeaders}</tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
        
        <div class="footer">
            <p>© 2026 SmartStay Hostel Management System | Confidential Report</p>
        </div>
    </body>
    </html>
    `;
};

/**
 * Send file response with proper headers
 */
export const sendFileResponse = (
    res: Response,
    buffer: Buffer,
    filename: string,
    mimeType: string
): void => {
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
};

/**
 * Clean up temporary files
 */
export const cleanupTempFile = (filepath: string): void => {
    try {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
    } catch (error) {
        console.error('Error cleaning up temp file:', error);
    }
};
