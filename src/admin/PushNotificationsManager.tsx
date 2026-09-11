import React, { useState, useEffect } from "react";
import { Bell, Send, Users, Sparkles, CheckCircle2, History, Smartphone, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getPushStatsServer, sendPushBroadcastServer, SentNotificationRecord } from "@/lib/push-notification.functions";

export default function PushNotificationsManager() {
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [history, setHistory] = useState<SentNotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form fields
  const [title, setTitle] = useState("Sri Sri Jagannath Daily Darshan 🌸");
  const [body, setBody] = useState("Today's divine Sringara Darshan photos are updated. Tap to behold Their Lordships' blessings!");
  const [url, setUrl] = useState("/daily-darshan");
  const [image, setImage] = useState("");

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await getPushStatsServer();
      if (res.ok) {
        setTotalSubscribers(res.totalSubscribers || 0);
        setHistory(res.history || []);
      }
    } catch (err) {
      console.error("Error loading push stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleTemplateSelect = (template: { title: string; body: string; url: string }) => {
    setTitle(template.title);
    setBody(template.body);
    setUrl(template.url);
    toast.info("Template loaded into composer!");
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Please provide both a Title and Message body.");
      return;
    }

    setSending(true);
    try {
      const res = await sendPushBroadcastServer({
        data: {
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || "/",
          image: image.trim() || undefined,
        },
      });

      if (res.ok) {
        // Trigger live native notification output on sender device if permitted
        if (typeof window !== "undefined" && "serviceWorker" in navigator && Notification.permission === "granted") {
          try {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification(title.trim(), {
              body: body.trim(),
              icon: "/iskcon-logo.png",
              badge: "/favicon.png",
              image: image.trim() || undefined,
              vibrate: [100, 50, 100, 50, 100],
              data: { url: url.trim() || "/" },
              tag: `broadcast-${Date.now()}`,
            });
          } catch (err) {
            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              new Notification(title.trim(), {
                body: body.trim(),
                icon: "/iskcon-logo.png",
              });
            }
          }
        }

        toast.success(`🚀 Notification broadcast sent to ${res.recipientCount} subscribers!`, {
          duration: 5000,
        });
        setTitle("");
        setBody("");
        setImage("");
        loadStats();
      } else {
        toast.error("Failed to send push notification.");
      }
    } catch (err) {
      console.error("Error sending push broadcast:", err);
      toast.error("An error occurred while broadcasting push notification.");
    } finally {
      setSending(false);
    }
  };

  const handleTestLiveNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }

    let perm = Notification.permission;
    if (perm === "default") {
      perm = await Notification.requestPermission();
    }

    if (perm !== "granted") {
      toast.info("Notification permission was not granted.");
      return;
    }

    const testTitle = title.trim() || "ISKCON Kurnool Test Notification 🌸";
    const testBody = body.trim() || "Hari Bol! This is a live test notification output from Sri Sri Puri Jagannath Temple.";

    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(testTitle, {
          body: testBody,
          icon: "/iskcon-logo.png",
          badge: "/favicon.png",
          image: image.trim() || undefined,
          vibrate: [100, 50, 100, 50, 100],
          data: { url: url.trim() || "/" },
          tag: `test-notif-${Date.now()}`,
        });
        toast.success("🔔 Live Test Notification pop-up fired on your screen!");
        return;
      } catch (err) {}
    }

    new Notification(testTitle, {
      body: testBody,
      icon: "/iskcon-logo.png",
    });
    toast.success("🔔 Live Test Notification pop-up fired on your screen!");
  };

  const templates = [
    {
      name: "Daily Darshan 🌸",
      title: "Sri Sri Jagannath Daily Darshan 🌸",
      body: "Today's divine Sringara Darshan photos are updated. Tap to behold Their Lordships' blessings!",
      url: "/daily-darshan",
    },
    {
      name: "Live Aarti Stream 🪔",
      title: "Live Temple Aarti Stream Starting 🪔",
      body: "Tune into live Mangala Aarti & Sankirtana stream live from ISKCON Kurnool Mandir.",
      url: "/temple/live",
    },
    {
      name: "Sunday Feast Program 🎉",
      title: "Sunday Gita Discourse & Prasadam Feast 🍲",
      body: "Join us this Sunday at 6:00 PM for soul-stirring kirtan, Gita lecture, and delicious feast!",
      url: "/temple/sunday",
    },
    {
      name: "Gita Course Announcement 📖",
      title: "New Bhagavad Gita Course Registration Open 📖",
      body: "Transform your life with practical Gita wisdom. Register today for upcoming online/offline classes.",
      url: "/courses",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in p-2 sm:p-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-900/30 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Mobile Web Push
            </span>
            <span className="text-xs text-purple-200/70">Android & iOS PWA Compatible</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Mobile Push Broadcast Center
          </h2>
          <p className="text-sm text-purple-100/80 leading-relaxed">
            Send real-time mobile push notifications to all subscribed temple app users for Daily Darshan, Live Streams, Sunday Programs, and Festival Sevas.
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 min-w-[200px] text-center shrink-0 w-full md:w-auto">
          <Users className="h-7 w-7 text-amber-400 mx-auto mb-2" />
          <div className="text-3xl font-extrabold text-white">
            {loading ? "..." : totalSubscribers}
          </div>
          <div className="text-xs text-amber-200/80 font-medium mt-0.5">Active Subscribers</div>
        </div>
      </div>

      {/* Main Grid: Composer & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Notification Composer */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Send className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                Compose Notification
              </h3>
            </div>
            <button
              onClick={loadStats}
              className="p-2 text-slate-400 hover:text-primary transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Refresh subscriber stats"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Notification Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sri Sri Jagannath Daily Darshan 🌸"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Message Body *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Write message description for mobile notification banner..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Click Destination Link
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/daily-darshan or /temple/live"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Optional Image URL
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://... (banner image)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-gold hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4.5 w-4.5" />
                <span>{sending ? "Broadcasting..." : `Send Mobile Broadcast (${totalSubscribers} Recipients)`}</span>
              </button>

              <button
                type="button"
                onClick={handleTestLiveNotification}
                className="w-full sm:w-auto py-4 px-5 rounded-2xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
              >
                <Bell className="h-4 w-4" />
                <span>Test Output 🔔</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Preset Templates */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Quick Notification Templates
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any template to quickly fill the notification composer:
            </p>

            <div className="space-y-3">
              {templates.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleTemplateSelect(tmpl)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-500/5 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-amber-700 dark:text-amber-400">
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-primary transition font-medium">
                      Use Template &rarr;
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-white">
                    {tmpl.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {tmpl.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sent History Table */}
      <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              Broadcast History Log
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {history.length} Notifications Sent
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No push notification broadcasts sent yet. Use the composer above to send your first broadcast!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Sent Time</th>
                  <th className="py-3 px-4">Title & Message</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Link</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {new Date(record.sentAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {record.title}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {record.body}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">
                      {record.recipientCount} Users
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {record.url ? (
                        <a
                          href={record.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <span>{record.url}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" /> Delivered
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
