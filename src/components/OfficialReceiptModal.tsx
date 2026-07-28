import { Download, Printer, X, CheckCircle2, ShieldCheck, Heart } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

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
};

export function generateAndDownloadReceiptPNG(data: ReceiptData, templePhone?: string) {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer Border & Header Banner
  ctx.strokeStyle = "#5b2c9b";
  ctx.lineWidth = 12;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Inner Gold Accent Line
  ctx.strokeStyle = "#f5c518";
  ctx.lineWidth = 4;
  ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

  // Header Purple Box
  ctx.fillStyle = "#5b2c9b";
  ctx.fillRect(50, 50, canvas.width - 100, 180);

  // Header Text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ISKCON KURNOOL", canvas.width / 2, 120);

  ctx.font = "bold 22px sans-serif";
  ctx.fillStyle = "#f5c518";
  ctx.fillText("Sri Sri Jagannath Baladev Subhadra Temple", canvas.width / 2, 160);

  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#e2d5f8";
  ctx.fillText(`Kurnool, Andhra Pradesh · Phone: ${templePhone || "+91 98765 43210"}`, canvas.width / 2, 195);

  // Receipt Title Badge
  ctx.fillStyle = "#fdf4d4";
  ctx.fillRect(canvas.width / 2 - 250, 260, 500, 50);
  ctx.strokeStyle = "#e8670c";
  ctx.lineWidth = 2;
  ctx.strokeRect(canvas.width / 2 - 250, 260, 500, 50);

  ctx.fillStyle = "#5b2c9b";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("OFFICIAL DONATION RECEIPT", canvas.width / 2, 294);

  // Details Table Box
  const startY = 350;
  ctx.textAlign = "left";

  const formattedDate = new Date(data.date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const items = [
    ["Receipt Ref No:", data.receiptNo],
    ["Date & Time:", formattedDate],
    ["Devotee Name:", data.donorName],
    ["Phone Number:", data.donorPhone || "—"],
    ["Email Address:", data.donorEmail || "—"],
    ["Seva / Purpose:", data.sevaTitle + (data.category ? ` (${data.category})` : "")],
    ["Payment Mode:", data.paymentMethod || "Online (Razorpay)"],
  ];

  if (data.notes) {
    items.push(["Gotram / Notes:", data.notes]);
  }
  if (data.panNumber) {
    items.push(["PAN Number (80G):", data.panNumber]);
  }

  let currentY = startY;
  items.forEach(([label, val], idx) => {
    ctx.fillStyle = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
    ctx.fillRect(80, currentY, canvas.width - 160, 55);

    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(label, 110, currentY + 35);

    ctx.font = "bold 22px Inter, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(val, 400, currentY + 35);

    currentY += 60;
  });

  // Amount Box
  currentY += 20;
  ctx.fillStyle = "#ecfdf5";
  ctx.fillRect(80, currentY, canvas.width - 160, 110);
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 3;
  ctx.strokeRect(80, currentY, canvas.width - 160, 110);

  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = "#047857";
  ctx.fillText("TOTAL CONTRIBUTION RECEIVED", 110, currentY + 45);
  ctx.font = "18px sans-serif";
  ctx.fillText("Status: Successful & Verified", 110, currentY + 80);

  ctx.textAlign = "right";
  ctx.font = "bold 42px Inter, sans-serif";
  ctx.fillStyle = "#047857";
  ctx.fillText(`₹${data.amount.toLocaleString("en-IN")}.00`, canvas.width - 110, currentY + 70);

  // 80G Tax Exemption Note
  currentY += 160;
  ctx.textAlign = "center";
  ctx.font = "italic 18px sans-serif";
  ctx.fillStyle = "#475569";
  ctx.fillText('"May Lord Sri Jagannath shower eternal blessings upon you and your family."', canvas.width / 2, currentY);
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("All donations to ISKCON Kurnool are eligible for 80G tax exemption.", canvas.width / 2, currentY + 30);

  // Bottom Signature Block (As requested by user)
  currentY += 110;
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(canvas.width - 450, currentY);
  ctx.lineTo(canvas.width - 120, currentY);
  ctx.stroke();

  ctx.textAlign = "right";
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "#5b2c9b";
  ctx.fillText("Vaishnava Krupa Das", canvas.width - 120, currentY + 35);
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText("Temple President", canvas.width - 120, currentY + 65);
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("ISKCON Kurnool", canvas.width - 120, currentY + 90);

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
  const { settings } = useAdmin();

  const handleDownloadPNG = () => {
    generateAndDownloadReceiptPNG(data, settings.phone);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between border-b pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-display font-bold text-slate-900 text-sm">Official Donation Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPNG}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Download PNG
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT BODY */}
        <div
          id="official-receipt-printable"
          className="border-2 border-primary/20 rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#fffefb] via-[#ffffff] to-[#faf7f2] space-y-5 text-slate-900 shadow-sm"
        >
          {/* Header */}
          <div className="text-center border-b border-primary/20 pb-4 space-y-1">
            {settings.logo ? (
              <img src={settings.logo} alt="ISKCON Logo" className="h-14 w-14 rounded-full mx-auto mb-2 ring-2 ring-primary/40 object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center mx-auto mb-2 shadow-md">
                IK
              </div>
            )}
            <h2 className="font-display font-bold text-xl text-primary tracking-wide">ISKCON KURNOOL</h2>
            <p className="text-xs font-semibold text-slate-700">Sri Sri Jagannath Baladev Subhadra Temple</p>
            <p className="text-[11px] text-slate-500">Kurnool, Andhra Pradesh · Phone: {settings.phone || "+91 98765 43210"}</p>
            <div className="mt-2 inline-block px-3 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full border border-primary/20">
              Official Donation Receipt
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border">
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold">Receipt / Txn Ref No:</p>
              <p className="font-mono font-bold text-primary text-[11px] truncate">{data.receiptNo}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground font-semibold">Date &amp; Time:</p>
              <p className="font-semibold text-slate-800 text-[11px]">
                {new Date(data.date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {/* Devotee & Seva Info */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-500">Devotee Name:</span>
              <span className="font-bold text-slate-900">{data.donorName}</span>
            </div>
            {data.donorPhone && (
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Phone Number:</span>
                <span className="font-semibold text-slate-800">{data.donorPhone}</span>
              </div>
            )}
            {data.donorEmail && (
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-semibold text-slate-800">{data.donorEmail}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-500">Seva / Purpose:</span>
              <span className="font-bold text-primary">{data.sevaTitle}</span>
            </div>
            {data.notes && (
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Gotram / Notes:</span>
                <span className="font-semibold text-slate-800">{data.notes}</span>
              </div>
            )}
            {data.panNumber && (
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">PAN Number (80G):</span>
                <span className="font-mono font-bold uppercase text-slate-900">{data.panNumber}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-semibold text-slate-800">{data.paymentMethod || "Online (Razorpay)"}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-emerald-800 uppercase font-bold">Total Contribution Received</p>
              <p className="text-[10px] text-emerald-700 font-medium">Status: Successful &amp; Verified</p>
            </div>
            <p className="font-sans font-bold text-2xl text-emerald-800">
              ₹{data.amount.toLocaleString("en-IN")}.00
            </p>
          </div>

          {/* Footer Blessing & 80G Note */}
          <div className="text-center text-[10px] text-slate-500 space-y-1 pt-1">
            <p className="font-display italic text-primary font-semibold">"May Lord Sri Jagannath shower eternal blessings upon you and your family."</p>
            <p>All donations to ISKCON Kurnool are eligible for 80G tax exemption.</p>
          </div>

          {/* BOTTOM SIGNATURE BLOCK */}
          <div className="pt-6 border-t flex flex-col items-end text-right">
            <div className="w-48 border-b border-slate-300 mb-1.5" />
            <p className="font-display font-bold text-sm text-primary leading-tight">Vaishnava Krupa Das</p>
            <p className="text-xs font-bold text-slate-700">Temple President</p>
            <p className="text-[10px] text-slate-500">ISKCON Kurnool</p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center gap-3 pt-2 print:hidden">
          <button
            onClick={handleDownloadPNG}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Download Official Receipt (PNG)
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
