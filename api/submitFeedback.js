import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, loveFeatures, improveFeatures, newFeatures } = req.body;

    // Build email content
    const emailHtml = `
      <h2>New Feedback from Networking BudE</h2>

      <p><strong>From:</strong> ${name || 'Anonymous'} ${email ? `(${email})` : ''}</p>

      <hr/>

      ${loveFeatures ? `
        <h3>👍 I love these features:</h3>
        <p>${loveFeatures}</p>
      ` : ''}

      ${improveFeatures ? `
        <h3>💡 These features could use some work:</h3>
        <p>${improveFeatures}</p>
      ` : ''}

      ${newFeatures ? `
        <h3>❤️ I'd love to see this feature:</h3>
        <p>${newFeatures}</p>
      ` : ''}

      <hr/>
      <p><em>Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Detroit' })}</em></p>
    `;

    // Send email via Resend
    await resend.emails.send({
      from: 'Networking BudE Feedback <noreply@networkingbude.com>',
      to: 'grjeff@gmail.com',
      subject: `Feedback from ${name || 'Anonymous User'}`,
      html: emailHtml,
      replyTo: email || undefined,
    });

    return res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
}
