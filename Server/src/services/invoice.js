// services/invoice.js
const puppeteer = require("puppeteer");
const path = require("path");

module.exports = {
  async generateInvoicePDF(order) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const html = `
      <html>
      <body>
        <h1>Invoice #${order.id}</h1>
        <p>Customer: ${order.customer}</p>
        <p>Total Amount: ₹${order.total}</p>
        <hr/>
        <p>Thank you for your order!</p>
      </body>
      </html>
    `;

    await page.setContent(html);

    const filePath = path.join(
      __dirname,
      `../invoices/invoice-${order.id}.pdf`
    );

    await page.pdf({ path: filePath, format: "A4" });

    await browser.close();

    return { message: "PDF generated", filePath };
  }
};
