const Order = require('../models/Order');
const nodemailer = require('nodemailer');

/**
 * Create a new order and send confirmation email
 */
exports.createOrder = async (req, res) => {
  try {
    console.log('Order request body:', JSON.stringify(req.body, null, 2));

    const { customerName, customerEmail, items, totalAmount } = req.body;

    console.log('Order request received:', { customerName, customerEmail, itemsCount: items?.length, totalAmount });

    // Validate request
    if (!customerName || !customerEmail || !items || items.length === 0 || !totalAmount) {
      console.log('Validation failed:', { customerName, customerEmail, hasItems: !!items, itemsLength: items?.length, totalAmount });
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes pour la commande'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Adresse courriel invalide'
      });
    }

    // Create new order in database
    const newOrder = new Order({
      customerName,
      customerEmail,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      })),
      totalAmount
    });

    console.log('About to save order:', JSON.stringify(newOrder, null, 2));

    const savedOrder = await newOrder.save();

    console.log('Order saved successfully:', savedOrder._id);

    // Send confirmation email
    await sendOrderConfirmationEmail(savedOrder);

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message
    });
  }
};

/**
 * Get all orders (admin only)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
};

/**
 * Helper function to send order confirmation email
 */
async function sendOrderConfirmationEmail(order) {
  // In production, use real email provider credentials
  // For now, we'll use a test account from Ethereal

  // Create test account (in real app, use environment variables)
  const testAccount = await nodemailer.createTestAccount();

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  // Generate HTML for order items
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;">${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;">${item.price.toFixed(2)} $</td>
      <td style="padding:10px;border-bottom:1px solid #eee;">${(item.price * item.quantity).toFixed(2)} $</td>
    </tr>
  `).join('');

  // Email content
  const mailOptions = {
    from: '"Notre Boutique" <shop@example.com>',
    to: order.customerEmail,
    subject: 'Confirmation de commande',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#4CAF50;">Merci pour votre commande!</h2>
        <p>Bonjour ${order.customerName},</p>
        <p>Nous avons bien reçu votre commande et nous la traiterons dans les plus brefs délais.</p>
        
        <h3>Récapitulatif de votre commande:</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background-color:#f9f9f9;">
              <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Produit</th>
              <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Quantité</th>
              <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Prix</th>
              <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:10px;text-align:right;font-weight:bold;">Total:</td>
              <td style="padding:10px;font-weight:bold;">${order.totalAmount.toFixed(2)} $</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top:30px;padding:20px;background-color:#f9f9f9;border-radius:5px;">
          <p style="margin:0;">Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.</p>
        </div>
        
        <p style="margin-top:30px;font-size:12px;color:#999;">
          Ceci est un email automatique, merci de ne pas y répondre.
        </p>
      </div>
    `
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  // For testing - this provides a URL to preview the email
  console.log('Email sent. Preview URL:', nodemailer.getTestMessageUrl(info));

  return info;
}