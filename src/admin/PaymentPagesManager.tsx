import { ExternalLink, ShieldCheck, Lock, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function PaymentPagesManager() {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 animate-fade-in font-sans">
      {/* Main Glassmorphic Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden text-center relative">
        {/* Top Decorative Header Accent */}
        <div className="h-3 bg-gradient-to-r from-[#0C2340] via-[#0C83FE] to-[#00BAF2]" />

        {/* Ambient background glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0C83FE]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-8 sm:p-14 space-y-8 relative z-10 flex flex-col items-center">
          
          {/* Official Razorpay Logo (Large Size) */}
          <div className="py-5 px-10 sm:px-14 rounded-3xl bg-white border border-slate-200/90 shadow-lg inline-flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105">
            <img 
              src="/razorpay-logo.png" 
              alt="Razorpay" 
              className="h-20 sm:h-28 md:h-32 w-auto max-w-[340px] sm:max-w-[440px] object-contain"
            />
          </div>

          {/* Security Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50/90 border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold shadow-xs">
            <ShieldCheck className="h-4.5 w-4.5 text-[#0C83FE]" />
            <span>Bank-Grade 256-Bit SSL Encrypted &amp; PCI-DSS Level 1 Compliant</span>
          </div>

          {/* Title and Main Notice Message */}
          <div className="space-y-5 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Donations &amp; Payment Records
            </h2>
            
            <div className="bg-amber-50/90 border-2 border-amber-200/80 rounded-2xl p-6 sm:p-7 text-amber-950 shadow-xs">
              <div className="flex items-center justify-center gap-2 mb-2.5 text-amber-800 font-extrabold text-base sm:text-lg">
                <Lock className="h-5 w-5 text-amber-700" />
                <span>Security Notice</span>
              </div>
              <p className="text-base sm:text-lg font-bold leading-relaxed text-slate-800">
                Donation &amp; Payment Records can be viewed in official Razorpay Dashboard only due to security reasons!
              </p>
            </div>
          </div>

          {/* Primary Action Button: View Razorpay Dashboard */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg">
            <a
              href="https://dashboard.razorpay.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-5 px-10 rounded-2xl bg-gradient-to-r from-[#0C83FE] via-[#0070E0] to-[#005bb8] hover:from-[#0070E0] hover:to-[#004a99] text-white font-extrabold text-lg shadow-xl shadow-[#0C83FE]/30 hover:shadow-2xl hover:shadow-[#0C83FE]/45 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3.5 cursor-pointer group"
            >
              <span>View Razorpay Dashboard</span>
              <ArrowUpRight className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>

          {/* Feature highlights / verification points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl pt-4 border-t border-slate-100 text-left text-xs text-slate-600">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Real-time transaction history and instant settlements</span>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Full donor details, UPI &amp; card authorization logs</span>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Official 80G tax receipt &amp; automated invoicing</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
