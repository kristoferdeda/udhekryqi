const express = require('express');
const Subscriber = require('../models/Subscriber');
const crypto = require('crypto');
const { buildWelcomeEmailHtml } = require('../utils/newsletter');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST /api/subscriptions
 * Body: { email }
 * Adds subscriber instantly — no verification.
 */
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let subscriber = await Subscriber.findOne({ email: normalizedEmail });

    if (!subscriber) {
      const unsubscribeToken = generateToken();

      subscriber = await Subscriber.create({
        email: normalizedEmail,
        unsubscribeToken,
      });
      console.log('Created new subscriber:', subscriber.email);
    } else {
      console.log('Existing subscriber:', subscriber.email);

      // just in case old subscriber had no token
      if (!subscriber.unsubscribeToken) {
        subscriber.unsubscribeToken = generateToken();
        await subscriber.save();
        console.log('Assigned new unsubscribe token to:', subscriber.email);
      }
    }

    // 👉 PASS THE TOKEN HERE
    const html = buildWelcomeEmailHtml(subscriber.unsubscribeToken);
    await sendEmail(subscriber.email, 'Mirë se vini në Udhëkryqin!', html);
    console.log('Welcome email sent to:', subscriber.email);

    return res.json({
      message: 'Abonimi u krye. Email mirëseardhjeje u dërgua.',
    });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ message: 'Server error while subscribing' });
  }
});


/**
 * POST /api/subscriptions/unsubscribe
 * Body: { token }
 * Removes subscriber
 */
// GET /api/subscriptions/unsubscribe?token=...
router.get('/unsubscribe', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send('Token mungon.');
    }

    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });

    if (!subscriber) {
      return res.status(400).send('Token i pavlefshëm ose tashmë i çabonuar.');
    }

    await subscriber.deleteOne();

    return res.send(`
      <!DOCTYPE html>
      <html lang="sq">
      <head>
        <meta charset="utf-8" />
        <title>Çabonim i suksesshëm</title>
      </head>
      <body style="font-family: Georgia, serif; text-align: center; margin-top: 50px;">
        <h1>U çabonuat me sukses</h1>
        <p>Nuk do të merrni më email-e nga Udhëkryqi në këtë adresë.</p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Unsubscribe (GET) error:', err);
    return res.status(500).send('Gabim serveri gjatë çabonimit.');
  }
});


module.exports = router;
