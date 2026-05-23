import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import type { LaunchOptions } from 'playwright-core';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const decayMultipliers: Record<string, number> = {
  under5min: 1.0,
  '5to30min': 0.4,
  '30minTo4h': 0.15,
  '4to24h': 0.05,
  over24h: 0.02,
};

function generateReportHTML(data: {
  leadsPerMonth: number;
  conversionRate: number;
  dealValue: number;
  responseDelay: string;
  revenueLeak: number;
  potentialRevenue: number;
  capturedRevenue: number;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Revenue Leak Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
    .metric { margin: 20px 0; padding: 10px; border-left: 4px solid #007bff; background: #f8f9fa; }
    .highlight { font-size: 1.2em; font-weight: bold; color: #dc3545; }
    .btn { display:inline-block; padding:10px 16px; background:#007bff; color:#fff; text-decoration:none; border-radius:6px; }
  </style>
</head>
<body>
  <h1>Revenue Leak Analysis Report</h1>
  <p>Thank you for using our revenue funnel calculator. Below is your personalized analysis:</p>
  
  <div class="metric">
    <strong>Monthly Leads:</strong> ${data.leadsPerMonth.toLocaleString()}
  </div>
  
  <div class="metric">
    <strong>Conversion Rate:</strong> ${(data.conversionRate * 100).toFixed(1)}%
  </div>
  
  <div class="metric">
    <strong>Average Deal Value:</strong> $${data.dealValue.toLocaleString()}
  </div>
  
  <div class="metric">
    <strong>Response Time:</strong> ${data.responseDelay.replace(/([A-Z])/g, ' $1').toLowerCase()}
  </div>
  
  <div class="metric">
    <strong>Potential Monthly Revenue:</strong> $${data.potentialRevenue.toLocaleString()}
  </div>
  
  <div class="metric">
    <strong>Captured Revenue:</strong> $${data.capturedRevenue.toLocaleString()}
  </div>
  
  <div class="metric">
    <strong class="highlight">Revenue Leak:</strong> $${data.revenueLeak.toLocaleString()}
  </div>
  
  <p>This represents the revenue you're potentially losing due to delayed responses. Contact us for strategies to improve your response times and capture more revenue.</p>

  <p>If you'd like to discuss strategies to reduce your revenue leak, feel free to book a consultation.</p>
  <p><a class="btn" href="https://calendly.com/servevelio-agency/30min">Book a consultation</a></p>
</body>
</html>
  `;
}

async function generatePDF(html: string): Promise<Buffer> {
  // Render HTML to PDF using Playwright + Sparticuz Chromium.
  const playwright = await import('playwright-core');
  const { chromium } = playwright;

  const chromiumPkg = await import('@sparticuz/chromium');
  // Resolve executable path from the Sparticuz package (multiple export shapes possible).
  let execPath: string | undefined;
  const pkgRecord = chromiumPkg as unknown as Record<string, unknown>;
  const candidate =
    pkgRecord['executablePath'] ??
    pkgRecord['executablePathSync'] ??
    pkgRecord['default'] ??
    pkgRecord;
  if (typeof candidate === 'function') {
    // Call or instantiate the candidate to obtain a path or helper object.
    let result: unknown;
    try {
      result = (candidate as (...args: unknown[]) => unknown)();
    } catch (err) {
      // If it's a class constructor, instantiate with `new`.
      const fnStr = String(candidate);
      if (/^class\s/.test(fnStr)) {
        const Constructor = candidate as unknown as new (
          ...args: unknown[]
        ) => unknown;
        result = new Constructor();
      } else {
        throw err;
      }
    }

    if (result instanceof Promise) result = await result;

    // Normalize possible return shapes to a string path.
    if (typeof result === 'string') {
      execPath = result;
    } else if (result && typeof result === 'object') {
      const r = result as Record<string, unknown>;
      if (typeof r.executablePath === 'function') {
        const p = (r.executablePath as (...a: unknown[]) => unknown)();
        execPath = p instanceof Promise ? String(await p) : String(p);
      } else if (typeof r.executablePathSync === 'function') {
        execPath = String((r.executablePathSync as () => unknown)());
      } else if (typeof r.path === 'string') {
        execPath = r.path;
      }
    }
  } else if (typeof candidate === 'string') {
    execPath = candidate;
  }

  const launchOptions: LaunchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };

  if (execPath) launchOptions.executablePath = execPath;

  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await page.setContent(html, { waitUntil: 'networkidle' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return Buffer.from(pdf);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const payload = {
    email: String(body.email || '').trim(),
    leads_per_month: Number(body.leadsPerMonth) || 0,
    conversion_rate: Number(body.conversionRate) || 0.3,
    deal_value: Number(body.dealValue) || 0,
    response_delay: String(body.responseDelay || ''),
    consent: Boolean(body.consent),
    created_at: new Date().toISOString(),
  };

  if (!payload.email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  // Calculate revenue metrics
  const D = decayMultipliers[payload.response_delay] || 0;
  const potentialRevenue =
    payload.leads_per_month * payload.conversion_rate * payload.deal_value;
  const capturedRevenue = potentialRevenue * D;
  const revenueLeak = potentialRevenue - capturedRevenue;

  // Save to database
  if (supabase) {
    const { error } = await supabase.from('leads').insert([payload]);
    if (error) {
      console.error('Supabase error:', error);
      // Continue with email sending even if DB fails
    }
  }

  try {
    // Generate PDF
    const reportData = {
      leadsPerMonth: payload.leads_per_month,
      conversionRate: payload.conversion_rate,
      dealValue: payload.deal_value,
      responseDelay: payload.response_delay,
      revenueLeak,
      potentialRevenue,
      capturedRevenue,
    };

    const html = generateReportHTML(reportData);
    const pdfBuffer = await generatePDF(html);

    const replyTo = process.env.MAIL_REPLY_TO || 'servevelio.agency@gmail.com';
    const internalCopy = process.env.MAIL_INTERNAL_COPY?.trim();

    // Send email with PDF attachment
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@servelhub.com',
      to: payload.email,
      replyTo: replyTo,
      bcc: internalCopy ? [internalCopy] : undefined,
      subject: 'Your Revenue Leak Analysis Report',
      html: `
        <p>Thank you for your interest in optimizing your revenue funnel!</p>
        <p>Attached is your personalized revenue leak analysis report.</p>
        <p>If you'd like to discuss strategies to reduce your revenue leak, feel free to book a consultation.</p>
        <p><a href="https://calendly.com/servevelio-agency/30min" style="display:inline-block;padding:10px 16px;background:#007bff;color:#fff;text-decoration:none;border-radius:6px;">Book a consultation</a></p>
        <p>Best regards,<br>The Revenue Team</p>
      `,
      attachments: [
        {
          filename: 'revenue-leak-report.pdf',
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({
      message: 'Report sent successfully to your email.',
    });
  } catch (error) {
    console.error('Error generating/sending report:', error);
    return NextResponse.json(
      { error: 'Failed to generate or send report.' },
      { status: 500 }
    );
  }
}
