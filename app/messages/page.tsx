"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { apiGet, apiPost, apiPatch } from "../lib/api";

interface Message {
  id: number;
  sender_name: string;
  sender_email: string;
  recipient_email: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

type Tab = "inbox" | "sent" | "compose";

export default function MessagesPage() {
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("inbox");
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Compose form
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientId, setRecipientId] = useState<number | "">("");
  const [sending, setSending] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "staff";

  useEffect(() => {
    if (!isLoggedIn) { router.push("/signin"); return; }
    fetchMessages();
    if (isAdmin) fetchUsers();
  }, [isLoggedIn]);

  async function fetchMessages() {
    if (!user?.token) return;
    setLoading(true);
    try {
      const [inboxData, sentData] = await Promise.all([
        apiGet("/messages/inbox/", user.token),
        apiGet("/messages/sent/", user.token),
      ]);
      setInbox(inboxData);
      setSent(sentData);
    } catch {
      showToast("Failed to load messages", "error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    if (!user?.token) return;
    try {
      const data = await apiGet("/messages/users/", user.token);
      setUsers(data);
    } catch { /* ignore */ }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.token) return;
    setSending(true);
    try {
      await apiPost("/messages/send/", {
        subject,
        body,
        recipient_id: recipientId || null,
      }, user.token);
      showToast("Message sent!", "success");
      setSubject(""); setBody(""); setRecipientId("");
      setTab("sent");
      fetchMessages();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to send", "error");
    } finally {
      setSending(false);
    }
  }

  async function handleMarkRead(msg: Message) {
    if (!user?.token || msg.is_read) return;
    try {
      await apiPatch(`/messages/${msg.id}/read/`, {}, user.token);
      setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    } catch { /* ignore */ }
  }

  function openMessage(msg: Message) {
    setSelected(msg);
    handleMarkRead(msg);
  }

  const unread = inbox.filter(m => !m.is_read).length;

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a]">
            Messages
          </h1>
          <button
            onClick={() => { setTab("compose"); setSelected(null); }}
            className="bg-[#8b3a2a] text-white text-sm px-5 py-2.5 rounded-sm hover:bg-[#7a3225] transition-colors"
          >
            + New Message
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white border border-[#d6cfc6] rounded-sm overflow-hidden">
              {(["inbox", "sent", "compose"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSelected(null); }}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors border-b border-[#f0ebe4] last:border-0 ${
                    tab === t ? "bg-[#f5f0ea] text-[#8b3a2a] font-medium" : "text-[#1a1a1a] hover:bg-[#faf7f3]"
                  }`}
                >
                  <span className="capitalize">{t === "compose" ? "✏ Compose" : t === "inbox" ? "📥 Inbox" : "📤 Sent"}</span>
                  {t === "inbox" && unread > 0 && (
                    <span className="bg-[#8b3a2a] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main panel */}
          <div className="md:col-span-3">

            {/* Compose */}
            {tab === "compose" && (
              <div className="bg-white border border-[#d6cfc6] rounded-sm p-6">
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-normal text-[#1a1a1a] mb-5">New Message</h2>
                <form onSubmit={handleSend} className="flex flex-col gap-4">
                  {isAdmin && (
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-[#1a1a1a]">To</label>
                      <select
                        value={recipientId}
                        onChange={e => setRecipientId(Number(e.target.value))}
                        required
                        className="bg-[#f5f0ea] border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]"
                      >
                        <option value="">Select a customer...</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {!isAdmin && (
                    <div className="px-4 py-2.5 bg-[#f5f0ea] border border-[#d6cfc6] rounded-sm text-sm text-[#5a5a5a]">
                      To: <span className="text-[#1a1a1a]">Fernwood &amp; Co. Support</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-[#1a1a1a]">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      required
                      placeholder="What's this about?"
                      className="bg-[#f5f0ea] border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-[#1a1a1a]">Message</label>
                    <textarea
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      required
                      rows={6}
                      placeholder="Write your message here..."
                      className="bg-[#f5f0ea] border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a] resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="self-end bg-[#8b3a2a] text-white text-sm px-8 py-2.5 rounded-sm hover:bg-[#7a3225] transition-colors disabled:opacity-60"
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            )}

            {/* Inbox / Sent list */}
            {(tab === "inbox" || tab === "sent") && !selected && (
              <div className="bg-white border border-[#d6cfc6] rounded-sm overflow-hidden">
                {loading ? (
                  <p className="text-center text-sm text-[#5a5a5a] py-12">Loading...</p>
                ) : (tab === "inbox" ? inbox : sent).length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-sm text-[#5a5a5a]">No messages yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f0ebe4]">
                    {(tab === "inbox" ? inbox : sent).map(msg => (
                      <button
                        key={msg.id}
                        onClick={() => openMessage(msg)}
                        className={`w-full text-left px-5 py-4 hover:bg-[#faf7f3] transition-colors ${!msg.is_read && tab === "inbox" ? "bg-[#fdf9f7]" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              {!msg.is_read && tab === "inbox" && (
                                <span className="w-2 h-2 bg-[#8b3a2a] rounded-full flex-shrink-0" />
                              )}
                              <p className={`text-sm truncate ${!msg.is_read && tab === "inbox" ? "font-semibold text-[#1a1a1a]" : "text-[#1a1a1a]"}`}>
                                {tab === "inbox" ? msg.sender_name : `To: ${msg.recipient_email}`}
                              </p>
                            </div>
                            <p className="text-sm text-[#5a5a5a] truncate">{msg.subject}</p>
                            <p className="text-xs text-[#a89f96] truncate mt-0.5">{msg.body.slice(0, 80)}...</p>
                          </div>
                          <p className="text-xs text-[#a89f96] flex-shrink-0">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Message detail */}
            {selected && (
              <div className="bg-white border border-[#d6cfc6] rounded-sm p-6">
                <button onClick={() => setSelected(null)} className="text-sm text-[#5a5a5a] hover:text-[#8b3a2a] mb-5 transition-colors">
                  ← Back
                </button>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-normal text-[#1a1a1a] mb-1">{selected.subject}</h2>
                <div className="flex items-center gap-4 text-xs text-[#5a5a5a] mb-6">
                  <span>From: <span className="text-[#1a1a1a]">{selected.sender_name} ({selected.sender_email})</span></span>
                  <span>·</span>
                  <span>{new Date(selected.created_at).toLocaleString()}</span>
                </div>
                <div className="bg-[#faf7f3] border border-[#f0ebe4] rounded-sm p-5">
                  <p className="text-sm text-[#1a1a1a] leading-relaxed whitespace-pre-wrap">{selected.body}</p>
                </div>
                {/* Quick reply */}
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setSubject(`Re: ${selected.subject}`);
                      setRecipientId(isAdmin ? (users.find(u => u.email === selected.sender_email)?.id ?? "") : "");
                      setTab("compose");
                      setSelected(null);
                    }}
                    className="text-sm bg-[#8b3a2a] text-white px-6 py-2.5 rounded-sm hover:bg-[#7a3225] transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
