import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { Send, CheckCircle2, MessageSquareHeart } from "lucide-react";
import { useAdmin, ContactEntry } from "@/context/AdminContext";

export default function ContactFormSection() {
  const { contacts, setContacts } = useAdmin();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setBusy(true);
    try {
      const newEntry: ContactEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        date: new Date().toISOString(),
        read: false,
      };

      const updated = [newEntry, ...(contacts || [])];
      setContacts(updated);

      toast.success("Message sent successfully!");
      setSubmittedName(name.trim());
      
      // Reset Form
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="py-20 md:py-28 bg-white border-t">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Information & Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 text-accent text-xs font-semibold uppercase tracking-wider">
              <MessageSquareHeart className="h-4 w-4" /> Reach Out
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
              Share Your Thoughts &amp; Queries
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We would love to hear from you. Whether you have queries about temple programs, need spiritual guidance, want to request prayers, or would like to share feedback, feel free to drop a message.
            </p>
            
            {/* Guidance Cards */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-surface border">
                <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary">Responsive Answers</h4>
                  <p className="text-sm text-muted-foreground">Our temple devotees respond to all query submissions within 24-48 hours.</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 rounded-2xl bg-surface border">
                <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary">Prayer Request Seva</h4>
                  <p className="text-sm text-muted-foreground">All prayer requests received here are placed before the altar of Sri Sri Jagannatha Baladeva Subhadra.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form or Success View */}
          <div className="lg:col-span-7">
            {submittedName ? (
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-elegant border border-border/85 text-center space-y-6 flex flex-col items-center justify-center min-h-[450px] animate-fade-in relative overflow-hidden">
                <div className="absolute -top-3 -right-3 h-16 w-16 rounded-full bg-gradient-to-tr from-[#e65c00] to-[#ff9933] opacity-5 blur-xl"></div>
                
                {/* Custom Tick Animation */}
                <div className="relative flex items-center justify-center h-20 w-20">
                  <div className="absolute h-20 w-20 rounded-full bg-emerald-100 animate-ping opacity-25"></div>
                  <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25 animate-scale-circle relative z-10">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-draw-check" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <h3 className="font-display text-3xl font-extrabold text-primary leading-tight">
                    Hare Krishna, {submittedName}!
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-emerald-600">
                      Your response has stored.
                    </p>
                    <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
                      Our Team will contact you.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSubmittedName("")}
                  className="mt-4 px-6 py-2.5 rounded-full border border-primary/20 hover:border-primary/40 text-primary hover:bg-primary/5 font-semibold text-sm transition relative z-10"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 md:p-10 shadow-elegant border border-border/80 relative">
                <div className="absolute -top-3 -right-3 h-16 w-16 rounded-full bg-gradient-to-tr from-[#e65c00] to-[#ff9933] opacity-10 blur-xl"></div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-primary/90">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-border/70 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none transition duration-200"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-primary/90">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 border border-border/70 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-primary/90">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-3 border border-border/70 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none transition duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-primary/90">Message / Query *</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your message or request here..."
                      className="w-full px-4 py-3 border border-border/70 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none transition duration-200 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#e65c00] to-[#ff9933] text-white font-semibold shadow-[0_4px_14px_rgba(230,92,0,0.35)] hover:shadow-[0_6px_20px_rgba(230,92,0,0.5)] hover:from-[#d35400] hover:to-[#e67e22] hover:-translate-y-0.5 transition duration-300 disabled:opacity-75 cursor-pointer text-base"
                  >
                    <Send className="h-5 w-5" />
                    {busy ? "Sending Message..." : "Submit Message"}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
