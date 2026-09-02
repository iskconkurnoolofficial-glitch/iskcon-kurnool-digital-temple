import { Download, Printer, X, CheckCircle2, ShieldCheck, Heart, Stamp, Sparkles, MessageCircle, Share2 } from "lucide-react";
import { useAdmin, ReceiptSettings, defaultReceiptSettings, SiteSettings } from "@/context/AdminContext";

export type ReceiptData = {
  receiptNo: string;
  date: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  category?: string;
  sevaTitle: string;
  notes?: string;
  panNumber?: string;
  paymentMethod?: string;
  address?: string;
  gotram?: string;
};

/**
 * Builds formatted text with all donation details for WhatsApp transmission.
 */
export function generateReceiptWhatsAppText(
  data: ReceiptData,
  customReceiptSettings?: ReceiptSettings,
  customSiteSettings?: SiteSettings
): string {
  const cfg = customReceiptSettings || defaultReceiptSettings;
  const site = customSiteSettings;

  const formattedDate = new Date(data.date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const templeTitle = cfg.templeName || "ISKCON KURNOOL";
  const deitySubtitle = cfg.deityName || "Sri Sri Jagannath Baladev Subhadra Temple";

  return `🙏 *HARE KRISHNA! OFFICIAL DONATION RECEIPT*
🏛️ *${templeTitle}*
_${deitySubtitle}_
📍 ${cfg.address ? cfg.address.split("\n")[0] : "Kurnool, Andhra Pradesh"}

━━━━━━━━━━━━━━━━━━━━━
📋 *RECEIPT REF NO:* \`${data.receiptNo}\`
📅 *DATE & TIME:* ${formattedDate}
👤 *DEVOTEE NAME:* ${data.donorName}
📞 *PHONE NUMBER:* ${data.donorPhone || "—"}
✉️ *EMAIL ADDRESS:* ${data.donorEmail || "—"}
🪔 *SEVA / PURPOSE:* ${data.sevaTitle}${data.category ? ` (${data.category})` : ""}
${data.notes ? `📜 *GOTRAM / NOTES:* ${data.notes}\n` : ""}${data.panNumber ? `🆔 *PAN (80G TAX EXEMPTION):* ${data.panNumber.toUpperCase()}\n` : ""}💳 *PAYMENT MODE:* ${data.paymentMethod || "Online (UPI / Gateway)"}
━━━━━━━━━━━━━━━━━━━━━

💰 *TOTAL CONTRIBUTION RECEIVED:*
*₹${data.amount.toLocaleString("en-IN")}.00*
✅ *STATUS:* Successful & Verified

🌺 _"${cfg.blessingMessage || 'May Lord Sri Jagannath shower eternal blessings upon you and your family.'}"_

📜 *Tax Exemption:* ${cfg.taxExemptionText || 'All donations to ISKCON Kurnool are eligible for 80G tax exemption.'}${cfg.taxRegNumber ? ' · Reg. No: ' + cfg.taxRegNumber : ''}

📞 *Temple Helpline:* ${cfg.phone || site?.phone || "+91 95053 77520"}
🌐 *Website:* https://iskconkurnool.org`;
}

/**
 * Creates WhatsApp URL for sending the donation receipt to the temple desk or a specific number.
 */
export function getReceiptWhatsAppUrl(
  data: ReceiptData,
  recipientPhone?: string,
  customReceiptSettings?: ReceiptSettings,
  customSiteSettings?: SiteSettings
): string {
  const text = generateReceiptWhatsAppText(data, customReceiptSettings, customSiteSettings);
  const rawTarget = recipientPhone || customSiteSettings?.whatsapp || customReceiptSettings?.phone || customSiteSettings?.phone || "+91 95053 77520";
  const digits = rawTarget.replace(/\D/g, "");
  const formattedDigits = digits.length === 10 ? `91${digits}` : digits;

  return `https://wa.me/${formattedDigits}?text=${encodeURIComponent(text)}`;
}

/**
 * Creates generic WhatsApp share URL (opens WhatsApp contact selector).
 */
export function getReceiptShareUrl(
  data: ReceiptData,
  customReceiptSettings?: ReceiptSettings,
  customSiteSettings?: SiteSettings
): string {
  const text = generateReceiptWhatsAppText(data, customReceiptSettings, customSiteSettings);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!url || typeof url !== "string") {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateAndDownloadReceiptPNG(
  data: ReceiptData,
  customReceiptSettings?: ReceiptSettings,
  customSiteSettings?: SiteSettings
) {
  if (typeof window === "undefined") return;

  const cfg = customReceiptSettings || defaultReceiptSettings;
  const site = customSiteSettings;

  // Resolve logo URL
  const resolvedLogoUrl = cfg.useNavLogo
    ? (site?.logo || cfg.customReceiptLogo || "")
    : (cfg.customReceiptLogo || site?.logo || "");

  // Asynchronously load images
  const [logoImg, sigImg, sealImg] = await Promise.all([
    resolvedLogoUrl ? loadImage(resolvedLogoUrl) : Promise.resolve(null),
    cfg.signatureImage ? loadImage(cfg.signatureImage) : Promise.resolve(null),
    cfg.sealImage ? loadImage(cfg.sealImage) : Promise.resolve(null),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1680;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const pColor = cfg.primaryColor || "#5b2c9b";
  const sColor = cfg.secondaryColor || "#d97706";
  const aColor = cfg.accentColor || "#059669";
  const bgColor = cfg.backgroundColor || "#ffffff";
  const fontFam = cfg.fontFamily === "Cinzel" ? "'Cinzel', Georgia, serif" : cfg.fontFamily === "Playfair" ? "'Playfair Display', Georgia, serif" : "'Inter', system-ui, -apple-system, sans-serif";

  // 1. Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Outer Ornate Border
  ctx.strokeStyle = pColor;
  ctx.lineWidth = 10;
  ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

  // Inner Gold Accent Line
  ctx.strokeStyle = sColor;
  ctx.lineWidth = 3.5;
  ctx.strokeRect(44, 44, canvas.width - 88, canvas.height - 88);

  // Subtle Thin Inner Border
  ctx.strokeStyle = `${pColor}25`;
  ctx.lineWidth = 1;
  ctx.strokeRect(54, 54, canvas.width - 108, canvas.height - 108);

  // Corner Rosettes / Flourishes
  const cornerSize = 24;
  const corners = [
    [44, 44],
    [canvas.width - 44 - cornerSize, 44],
    [44, canvas.height - 44 - cornerSize],
    [canvas.width - 44 - cornerSize, canvas.height - 44 - cornerSize]
  ];
  ctx.fillStyle = sColor;
  corners.forEach(([cx, cy]) => {
    ctx.fillRect(cx, cy, cornerSize, cornerSize);
  });

  // 3. Subtle Background Watermark
  if (cfg.showWatermark) {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-0.38);
    ctx.font = `900 80px ${fontFam}`;
    ctx.fillStyle = "rgba(15, 23, 42, 0.028)";
    ctx.textAlign = "center";
    ctx.fillText((cfg.watermarkText || "ISKCON KURNOOL").toUpperCase(), 0, 0);
    ctx.fillText((cfg.watermarkText || "ISKCON KURNOOL").toUpperCase(), 0, 180);
    ctx.fillText((cfg.watermarkText || "ISKCON KURNOOL").toUpperCase(), 0, -180);
    ctx.restore();
  }

  // 4. Header Royal Box
  const headerHeight = 220;
  if (cfg.headerBgStyle === "solid") {
    ctx.fillStyle = pColor;
  } else {
    const gradient = ctx.createLinearGradient(60, 60, canvas.width - 120, 60 + headerHeight);
    gradient.addColorStop(0, pColor);
    gradient.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = gradient;
  }
  ctx.fillRect(60, 60, canvas.width - 120, headerHeight);

  // Gold accent strip on header bottom
  ctx.fillStyle = sColor;
  ctx.fillRect(60, 60 + headerHeight - 6, canvas.width - 120, 6);

  // Header Logo (Left or Centered)
  let headerTextCenter = canvas.width / 2;
  if (logoImg) {
    const logoSize = 100;
    const logoX = 100;
    const logoY = 110;

    // Draw circular mask for logo
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    // Gold ring around logo
    ctx.strokeStyle = sColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    headerTextCenter = canvas.width / 2 + 35;
  }

  // Header Text
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 40px ${fontFam}`;
  ctx.fillText(cfg.templeName || "ISKCON KURNOOL", headerTextCenter, 125);

  ctx.font = `bold 22px ${fontFam}`;
  ctx.fillStyle = sColor;
  ctx.fillText(cfg.deityName || "Sri Sri Jagannath Baladev Subhadra Temple", headerTextCenter, 168);

  ctx.font = `16px ${fontFam}`;
  ctx.fillStyle = "#e2e8f0";
  const contactStr = `${cfg.address ? cfg.address.split("\n")[0] : "Kurnool, Andhra Pradesh"} · Phone: ${cfg.phone || site?.phone || "+91 95053 77520"}`;
  ctx.fillText(contactStr, headerTextCenter, 205);

  ctx.font = `14px ${fontFam}`;
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText(`Email: ${cfg.email || site?.email || "info@iskconkurnool.org"}`, headerTextCenter, 235);

  // 5. Official Receipt Badge
  const badgeY = 310;
  const badgeWidth = 520;
  const badgeHeight = 52;
  ctx.fillStyle = "#fffdf0";
  ctx.fillRect(canvas.width / 2 - badgeWidth / 2, badgeY, badgeWidth, badgeHeight);
  ctx.strokeStyle = sColor;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(canvas.width / 2 - badgeWidth / 2, badgeY, badgeWidth, badgeHeight);

  ctx.fillStyle = pColor;
  ctx.font = `bold 24px ${fontFam}`;
  ctx.fillText(cfg.receiptTitle || "OFFICIAL DONATION RECEIPT", canvas.width / 2, badgeY + 36);

  // 6. Metadata Bar (Receipt Ref & Date)
  const metaY = 385;
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(80, metaY, canvas.width - 160, 56);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(80, metaY, canvas.width - 160, 56);

  ctx.textAlign = "left";
  ctx.font = `bold 16px ${fontFam}`;
  ctx.fillStyle = "#64748b";
  ctx.fillText("RECEIPT / TXN REF:", 105, metaY + 35);
  ctx.font = `bold 20px monospace`;
  ctx.fillStyle = pColor;
  const displayReceiptNo = data.receiptNo && !data.receiptNo.startsWith("UPI_") ? data.receiptNo : "";
  ctx.fillText(displayReceiptNo, 290, metaY + 36);

  ctx.textAlign = "right";
  const formattedDate = new Date(data.date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  ctx.font = `bold 16px ${fontFam}`;
  ctx.fillStyle = "#64748b";
  ctx.fillText("DATE & TIME:", canvas.width - 320, metaY + 35);
  ctx.font = `bold 18px ${fontFam}`;
  ctx.fillStyle = "#1e293b";
  ctx.fillText(formattedDate, canvas.width - 105, metaY + 35);

  // 7. Details Table
  let currentY = 465;
  const items: [string, string][] = [
    ["Devotee Name:", data.donorName],
    ["Phone Number:", data.donorPhone || "—"],
    ["Email Address:", data.donorEmail || "—"],
    ["Seva / Purpose:", data.sevaTitle + (data.category ? ` (${data.category})` : "")],
    ["Payment Mode:", data.paymentMethod || "Online / UPI"],
  ];

  if (data.notes) {
    items.push(["Gotram / Purpose:", data.notes]);
  }
  if (data.panNumber) {
    items.push(["PAN Number (80G):", data.panNumber.toUpperCase()]);
  }

  items.forEach(([label, val], idx) => {
    ctx.fillStyle = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
    ctx.fillRect(80, currentY, canvas.width - 160, 56);
    ctx.strokeStyle = "#edf2f7";
    ctx.lineWidth = 1;
    ctx.strokeRect(80, currentY, canvas.width - 160, 56);

    ctx.textAlign = "left";
    ctx.font = `bold 19px ${fontFam}`;
    ctx.fillStyle = "#64748b";
    ctx.fillText(label, 110, currentY + 36);

    ctx.font = label.includes("Seva") ? `bold 20px ${fontFam}` : `bold 20px ${fontFam}`;
    ctx.fillStyle = label.includes("Seva") ? pColor : "#0f172a";
    
    // Truncate long value cleanly if needed
    const maxValWidth = canvas.width - 540;
    let displayVal = val;
    if (ctx.measureText(displayVal).width > maxValWidth) {
      while (ctx.measureText(displayVal + "...").width > maxValWidth && displayVal.length > 0) {
        displayVal = displayVal.slice(0, -1);
      }
      displayVal += "...";
    }
    ctx.fillText(displayVal, 400, currentY + 36);

    currentY += 60;
  });

  // 8. Amount Box (Prominent & Elegant)
  currentY += 20;
  const amtHeight = 120;
  ctx.fillStyle = `${aColor}12`;
  ctx.fillRect(80, currentY, canvas.width - 160, amtHeight);
  ctx.strokeStyle = aColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(80, currentY, canvas.width - 160, amtHeight);

  ctx.textAlign = "left";
  ctx.font = `bold 20px ${fontFam}`;
  ctx.fillStyle = aColor;
  ctx.fillText("TOTAL CONTRIBUTION RECEIVED", 115, currentY + 46);
  
  ctx.font = `17px ${fontFam}`;
  ctx.fillStyle = "#15803d";
  ctx.fillText("✓ Status: Successful, Verified & Recorded", 115, currentY + 84);

  ctx.textAlign = "right";
  ctx.font = `bold 46px ${fontFam}`;
  ctx.fillStyle = aColor;
  ctx.fillText(`₹${data.amount.toLocaleString("en-IN")}.00`, canvas.width - 115, currentY + 76);

  // 9. Devotional Blessing & 80G Tax Exemption Note
  currentY += amtHeight + 40;
  ctx.textAlign = "center";
  ctx.font = `italic 20px ${fontFam}`;
  ctx.fillStyle = pColor;
  ctx.fillText(`"${cfg.blessingMessage || 'May Lord Sri Jagannath shower eternal blessings upon you and your family.'}"`, canvas.width / 2, currentY);

  currentY += 34;
  ctx.font = `bold 16px ${fontFam}`;
  ctx.fillStyle = "#475569";
  const taxStr = `${cfg.taxExemptionText || 'All donations to ISKCON Kurnool are eligible for 80G tax exemption.'}${cfg.taxRegNumber ? ' · Reg. No: ' + cfg.taxRegNumber : ''}`;
  ctx.fillText(taxStr, canvas.width / 2, currentY);

  currentY += 24;
  ctx.font = `14px ${fontFam}`;
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(cfg.footerNotes || "This is a computer-generated official receipt issued by ISKCON Kurnool.", canvas.width / 2, currentY);

  // 10. Bottom Footer: Stamp on Left & Signature on Right
  currentY += 45;

  // Left: Official Temple Stamp / Seal
  if (cfg.showSeal) {
    if (sealImg) {
      ctx.drawImage(sealImg, 110, currentY + 10, 120, 120);
    } else {
      // Draw golden circular temple seal
      const sealX = 160;
      const sealY = currentY + 70;
      const sealR = 50;

      ctx.save();
      ctx.strokeStyle = sColor;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = sColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealR - 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = sColor;
      ctx.font = `bold 12px ${fontFam}`;
      ctx.fillText("ISKCON KURNOOL", sealX, sealY - 14);
      ctx.font = `bold 18px ${fontFam}`;
      ctx.fillText("★ SEAL ★", sealX, sealY + 6);
      ctx.font = `bold 11px ${fontFam}`;
      ctx.fillText("VERIFIED", sealX, sealY + 25);
      ctx.restore();
    }
  }

  // Right: Authorized Signature Area (Prominent & Large)
  const sigRightX = canvas.width - 110;
  const sigWidth = 360;

  if (sigImg) {
    const sigAspect = sigImg.width / sigImg.height;
    const sigRenderHeight = 115;
    const sigRenderWidth = Math.min(sigRenderHeight * sigAspect, sigWidth);
    ctx.drawImage(
      sigImg,
      sigRightX - sigRenderWidth,
      currentY - 15,
      sigRenderWidth,
      sigRenderHeight
    );
  }

  // Signature line
  const lineY = currentY + 105;
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sigRightX - sigWidth, lineY);
  ctx.lineTo(sigRightX, lineY);
  ctx.stroke();

  ctx.textAlign = "right";
  ctx.font = `bold 24px ${fontFam}`;
  ctx.fillStyle = pColor;
  ctx.fillText(cfg.signatoryName || "Vaishnava Krupa Das", sigRightX, lineY + 34);

  ctx.font = `bold 17px ${fontFam}`;
  ctx.fillStyle = "#334155";
  ctx.fillText(cfg.signatoryTitle || "Temple President / Authorised Signatory", sigRightX, lineY + 60);

  ctx.font = `15px ${fontFam}`;
  ctx.fillStyle = "#64748b";
  ctx.fillText(cfg.signatoryOrg || "ISKCON Kurnool", sigRightX, lineY + 84);

  // Trigger Download
  const link = document.createElement("a");
  link.download = `ISKCON_Kurnool_Official_Receipt_${data.receiptNo}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export default function OfficialReceiptModal({
  data,
  onClose,
}: {
  data: ReceiptData;
  onClose: () => void;
}) {
  const { receiptSettings, settings } = useAdmin();
  const cfg = receiptSettings || defaultReceiptSettings;

  const handleDownloadPNG = async () => {
    await generateAndDownloadReceiptPNG(data, cfg, settings);
  };

  const handlePrint = () => {
    window.print();
  };

  const resolvedLogo = cfg.useNavLogo
    ? (settings.logo || cfg.customReceiptLogo)
    : (cfg.customReceiptLogo || settings.logo);

  const fontFamStyle = cfg.fontFamily === "Cinzel"
    ? "'Cinzel', Georgia, serif"
    : cfg.fontFamily === "Playfair"
    ? "'Playfair Display', Georgia, serif"
    : "inherit";

  const whatsappDeskUrl = getReceiptWhatsAppUrl(data, undefined, cfg, settings);
  const whatsappShareUrl = getReceiptShareUrl(data, cfg, settings);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl border space-y-5 max-h-[94vh] overflow-y-auto">
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between border-b pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-display font-bold text-slate-900 text-sm">Official Donation Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={whatsappDeskUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              title="Send to WhatsApp"
            >
              <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <button
              onClick={handleDownloadPNG}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Download className="h-4 w-4" /> Download PNG
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT BODY */}
        <div
          id="official-receipt-printable"
          className="border-2 rounded-3xl p-5 sm:p-7 space-y-5 text-slate-900 shadow-sm relative overflow-hidden transition-all"
          style={{
            backgroundColor: cfg.backgroundColor || "#ffffff",
            borderColor: cfg.secondaryColor || "#d97706",
            fontFamily: fontFamStyle,
          }}
        >
          {/* Subtle Watermark */}
          {cfg.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none rotate-[-25deg]">
              <span className="text-6xl font-black uppercase tracking-widest text-slate-900 whitespace-nowrap">
                {cfg.watermarkText || "ISKCON KURNOOL"}
              </span>
            </div>
          )}

          {/* Header Banner */}
          <div
            className="rounded-2xl p-4 sm:p-5 text-center text-white relative shadow-sm"
            style={{
              background: cfg.headerBgStyle === "solid"
                ? cfg.primaryColor
                : `linear-gradient(135deg, ${cfg.primaryColor} 0%, #1e1b4b 100%)`,
              borderBottom: `3px solid ${cfg.secondaryColor}`,
            }}
          >
            {resolvedLogo ? (
              <img
                src={resolvedLogo}
                alt="ISKCON Logo"
                className="h-14 w-14 rounded-full mx-auto mb-2.5 object-cover shadow-md ring-2"
                style={{ borderColor: cfg.secondaryColor }}
              />
            ) : (
              <div
                className="h-14 w-14 rounded-full font-bold text-lg flex items-center justify-center mx-auto mb-2.5 shadow-md border-2"
                style={{
                  backgroundColor: cfg.secondaryColor,
                  color: cfg.primaryColor,
                  borderColor: "#ffffff",
                }}
              >
                IK
              </div>
            )}

            <h2 className="font-display font-black text-xl tracking-wider text-white uppercase">
              {cfg.templeName || "ISKCON KURNOOL"}
            </h2>
            <p className="text-xs font-semibold mt-0.5" style={{ color: cfg.secondaryColor }}>
              {cfg.deityName || "Sri Sri Jagannath Baladev Subhadra Temple"}
            </p>
            <p className="text-[11px] text-white/80 mt-1">
              {cfg.address || "Kurnool, Andhra Pradesh"} · Phone: {cfg.phone || settings?.phone || "+91 95053 77520"}
            </p>

            <div
              className="mt-3 inline-block px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs"
              style={{
                backgroundColor: "#fffdf0",
                color: cfg.primaryColor,
                border: `1.5px solid ${cfg.secondaryColor}`,
              }}
            >
              {cfg.receiptTitle || "OFFICIAL DONATION RECEIPT"}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Receipt / Txn Ref No:</p>
              <p className="font-mono font-bold text-xs truncate" style={{ color: cfg.primaryColor }}>
                {data.receiptNo && !data.receiptNo.startsWith("UPI_") ? data.receiptNo : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Date &amp; Time:</p>
              <p className="font-semibold text-slate-800 text-xs">
                {new Date(data.date).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Devotee & Seva Info */}
          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between pb-1.5">
              <span className="text-slate-500">Devotee Name:</span>
              <span className="font-bold text-slate-900">{data.donorName}</span>
            </div>
            {data.donorPhone && (
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Phone Number:</span>
                <span className="font-semibold text-slate-800">{data.donorPhone}</span>
              </div>
            )}
            {data.donorEmail && (
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-semibold text-slate-800">{data.donorEmail}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Seva / Purpose:</span>
              <span className="font-bold" style={{ color: cfg.primaryColor }}>{data.sevaTitle}</span>
            </div>
            {data.notes && (
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Gotram / Notes:</span>
                <span className="font-semibold text-slate-800">{data.notes}</span>
              </div>
            )}
            {data.panNumber && (
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">PAN Number (80G):</span>
                <span className="font-mono font-bold uppercase text-slate-900">{data.panNumber}</span>
              </div>
            )}
            <div className="flex justify-between pt-1.5">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-semibold text-slate-800">{data.paymentMethod || "Online (Razorpay / UPI)"}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div
            className="p-4 rounded-2xl border flex items-center justify-between shadow-xs"
            style={{
              backgroundColor: `${cfg.accentColor}12`,
              borderColor: `${cfg.accentColor}40`,
            }}
          >
            <div>
              <p className="text-[10px] uppercase font-extrabold tracking-wider" style={{ color: cfg.accentColor }}>
                Total Contribution Received
              </p>
              <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Status: Verified &amp; Recorded
              </p>
            </div>
            <p className="font-display font-black text-2xl" style={{ color: cfg.accentColor }}>
              ₹{data.amount.toLocaleString("en-IN")}.00
            </p>
          </div>

          {/* WhatsApp Direct Details Section (Print-hidden for clean paper/PDF print) */}
          <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 space-y-2.5 print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                  <MessageCircle className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-emerald-950">WhatsApp Donation Details</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">1-Click Redirect</span>
            </div>

            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Instantly forward all donation details (Ref No, Seva, Amount, PAN, Gotram) to the Temple WhatsApp Desk for receipt tracking or share to your personal chat.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <a
                href={whatsappDeskUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Send to Temple WhatsApp
              </a>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 bg-white hover:bg-emerald-100/60 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-700" /> Share on WhatsApp
              </a>
            </div>
          </div>

          {/* Footer Blessing & 80G Note */}
          <div className="text-center text-xs space-y-1 pt-1">
            <p className="font-semibold italic" style={{ color: cfg.primaryColor }}>
              "{cfg.blessingMessage || 'May Lord Sri Jagannath shower eternal blessings upon you and your family.'}"
            </p>
            <p className="text-[11px] text-slate-500">
              {cfg.taxExemptionText || 'All donations to ISKCON Kurnool are eligible for 80G tax exemption.'}
              {cfg.taxRegNumber ? ` · Reg: ${cfg.taxRegNumber}` : ''}
            </p>
          </div>

          {/* BOTTOM SIGNATURE BLOCK */}
          <div className="pt-5 border-t border-slate-200/80 flex items-end justify-between">
            {/* Left Seal Badge */}
            <div>
              {cfg.showSeal && (
                <div className="flex items-center gap-2">
                  {cfg.sealImage ? (
                    <img src={cfg.sealImage} alt="Temple Seal" className="h-12 w-12 object-contain" />
                  ) : (
                    <div
                      className="h-11 w-11 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1 text-center"
                      style={{ borderColor: cfg.secondaryColor, color: cfg.secondaryColor }}
                    >
                      <Stamp className="h-4 w-4" />
                      <span className="text-[7px] font-black uppercase leading-none">SEAL</span>
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <span className="text-[9px] font-bold text-slate-700 uppercase block">Official Seal</span>
                    <span className="text-[8px] text-slate-400">ISKCON Verified</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Signature Area */}
            <div className="text-right flex flex-col items-end">
              {cfg.signatureImage ? (
                <div className="h-16 sm:h-20 mb-1.5 max-w-[220px] flex items-end">
                  <img
                    src={cfg.signatureImage}
                    alt="Authorized Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-8 w-44 border-b-2 border-slate-400 mb-1.5" />
              )}

              <p className="font-display font-bold text-xs sm:text-sm leading-tight" style={{ color: cfg.primaryColor }}>
                {cfg.signatoryName || "Vaishnava Krupa Das"}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-700">
                {cfg.signatoryTitle || "Temple President / Authorised Signatory"}
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500">
                {cfg.signatoryOrg || "ISKCON Kurnool"}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2 print:hidden">
          <button
            onClick={handleDownloadPNG}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Download Official Receipt (PNG)
          </button>
          <a
            href={whatsappDeskUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp Details
          </a>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
