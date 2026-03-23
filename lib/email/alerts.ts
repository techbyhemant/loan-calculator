/**
 * Email alerts via Resend.
 * Requires RESEND_API_KEY in .env.local.
 */

import { Resend } from "resend";

import type { Loan, DashboardStats } from "@/types";

import { formatINR, formatLakhs, formatDate } from "@/lib/utils/formatters";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

const FROM_EMAIL = "alerts@emipartpay.com";

export async function sendMonthlySummary(
  to: string,
  userName: string,
  stats: DashboardStats,
  loans: Loan[],
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const loanRows = loans
    .filter((l) => l.isActive)
    .map(
      (l) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${l.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatLakhs(l.currentOutstanding)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${l.interestRate}%</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatINR(l.emiAmount)}</td>
        </tr>`,
    )
    .join("");

  const debtFreeText = stats.debtFreeDate
    ? formatDate(stats.debtFreeDate)
    : "Add loans to calculate";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#1f2937">
      <h2 style="color:#1f2937;margin-bottom:4px">Monthly Loan Summary</h2>
      <p style="color:#6b7280;margin-top:0">Hi ${userName || "there"},</p>

      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin:16px 0">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px"><strong>Total Debt</strong><br/>${formatLakhs(stats.totalDebt)}</td>
            <td style="padding:8px"><strong>Monthly EMI</strong><br/>${formatINR(stats.monthlyEmiTotal)}</td>
          </tr>
          <tr>
            <td style="padding:8px"><strong>Interest Left</strong><br/>${formatLakhs(stats.totalInterestRemaining)}</td>
            <td style="padding:8px"><strong>Debt-Free</strong><br/>${debtFreeText}</td>
          </tr>
        </table>
      </div>

      ${
        loans.length > 0
          ? `<table style="width:100%;border-collapse:collapse;font-size:14px">
              <thead>
                <tr style="background:#f3f4f6">
                  <th style="padding:8px;text-align:left">Loan</th>
                  <th style="padding:8px;text-align:right">Outstanding</th>
                  <th style="padding:8px;text-align:right">Rate</th>
                  <th style="padding:8px;text-align:right">EMI</th>
                </tr>
              </thead>
              <tbody>${loanRows}</tbody>
            </table>`
          : ""
      }

      <p style="margin-top:24px">
        <a href="https://emipartpay.com/dashboard"
           style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">
          View Dashboard
        </a>
      </p>

      <p style="color:#9ca3af;font-size:12px;margin-top:24px">
        You're receiving this because you have an account on EMIPartPay.
        <br/>Visit your dashboard to manage preferences.
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your Loan Summary — ${formatLakhs(stats.totalDebt)} outstanding`,
      html,
    });
    return true;
  } catch (err) {
    console.error("[sendMonthlySummary]", err);
    return false;
  }
}

export async function sendPartPaymentAlert(
  to: string,
  loanName: string,
  amount: number,
  interestSaved: number,
  monthsReduced: number,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#1f2937">
      <h2 style="color:#1f2937">Part Payment Logged!</h2>
      <p>Great move! You made a part payment on <strong>${loanName}</strong>.</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0">
        <p style="margin:4px 0"><strong>Amount:</strong> ${formatINR(amount)}</p>
        ${interestSaved > 0 ? `<p style="margin:4px 0;color:#15803d"><strong>Interest Saved:</strong> ${formatINR(interestSaved)}</p>` : ""}
        ${monthsReduced > 0 ? `<p style="margin:4px 0;color:#1d4ed8"><strong>Months Reduced:</strong> ${monthsReduced}</p>` : ""}
      </div>

      <p>
        <a href="https://emipartpay.com/dashboard"
           style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">
          View Updated Schedule
        </a>
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Part payment of ${formatINR(amount)} logged on ${loanName}`,
      html,
    });
    return true;
  } catch (err) {
    console.error("[sendPartPaymentAlert]", err);
    return false;
  }
}
