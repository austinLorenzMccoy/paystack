import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const {
      type,
      creatorId,
      contentId,
      paymentId,
      amount,
      asset,
      payerAddress,
    } = await req.json()

    // Get creator's notification preferences
    const { data: creator } = await supabaseClient
      .from('users')
      .select('email, notification_settings')
      .eq('id', creatorId)
      .single()

    if (!creator) {
      return new Response(
        JSON.stringify({ error: 'Creator not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const settings = creator.notification_settings || {}

    // Send notifications based on type
    if (type === 'payment_received') {
      await sendPaymentNotification({
        creator,
        contentId,
        paymentId,
        amount,
        asset,
        payerAddress,
        settings,
      })
    } else if (type === 'ai_agent_payment') {
      await sendAIAgentNotification({
        creator,
        contentId,
        amount,
        asset,
        payerAddress,
        settings,
      })
    }

    // Record notification sent
    await supabaseClient
      .from('notification_logs')
      .insert({
        type,
        creator_id: creatorId,
        content_id: contentId,
        payment_id: paymentId,
        recipient: creator.email,
        sent_at: new Date().toISOString(),
        status: 'sent',
      })

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({ error: 'Notification failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Send payment received notification
async function sendPaymentNotification(data: any) {
  const { creator, contentId, amount, asset, payerAddress, settings } = data

  // Email notification via SendGrid
  if (settings.email_enabled && creator.email) {
    await sendEmail({
      to: creator.email,
      subject: `💰 New Payment Received - ${amount} ${asset}`,
      html: `
        <h2>New Payment Received!</h2>
        <p>You received a payment of <strong>${amount} ${asset}</strong> for your content.</p>
        <p><strong>Content ID:</strong> ${contentId}</p>
        <p><strong>From:</strong> ${payerAddress}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><a href="${Deno.env.get('FRONTEND_URL')}/dashboard">View in Dashboard</a></p>
      `,
    })
  }

  // Slack webhook
  if (settings.slack_webhook) {
    await sendSlackMessage(settings.slack_webhook, {
      text: `💰 New Payment: ${amount} ${asset} from ${payerAddress}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*New Payment Received!*\nAmount: ${amount} ${asset}\nFrom: ${payerAddress}\nContent: ${contentId}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Dashboard',
              },
              url: `${Deno.env.get('FRONTEND_URL')}/dashboard`,
            },
          ],
        },
      ],
    })
  }

  // Telegram bot (if configured)
  if (settings.telegram_bot_token && settings.telegram_chat_id) {
    await sendTelegramMessage(
      settings.telegram_bot_token,
      settings.telegram_chat_id,
      `💰 New Payment: ${amount} ${asset} from ${payerAddress} for content ${contentId}`
    )
  }
}

// Send AI agent payment notification
async function sendAIAgentNotification(data: any) {
  const { creator, contentId, amount, asset, payerAddress, settings } = data

  if (settings.email_enabled && creator.email) {
    await sendEmail({
      to: creator.email,
      subject: `🤖 AI Agent Payment - ${amount} ${asset}`,
      html: `
        <h2>AI Agent Payment!</h2>
        <p>An AI agent paid <strong>${amount} ${asset}</strong> for your content.</p>
        <p><strong>Content ID:</strong> ${contentId}</p>
        <p><strong>Agent:</strong> ${payerAddress}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><a href="${Deno.env.get('FRONTEND_URL')}/dashboard/analytics">View Analytics</a></p>
      `,
    })
  }

  if (settings.slack_webhook) {
    await sendSlackMessage(settings.slack_webhook, {
      text: `🤖 AI Agent Payment: ${amount} ${asset} from ${payerAddress}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*AI Agent Payment!*\nAmount: ${amount} ${asset}\nAgent: ${payerAddress}\nContent: ${contentId}`,
          },
        },
      ],
    })
  }
}

// Send email via SendGrid
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@paystack.xyz' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    })

    if (!response.ok) {
      console.error('SendGrid error:', await response.text())
    }
  } catch (error) {
    console.error('Email send failed:', error)
  }
}

// Send Slack message
async function sendSlackMessage(webhookUrl: string, payload: any) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error('Slack message failed:', error)
  }
}

// Send Telegram message
async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })
  } catch (error) {
    console.error('Telegram message failed:', error)
  }
}
