import { API_BASE } from "../lib/api.ts";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Send, Mail, MessageSquare, User, FileText, CheckCircle,
  UserPlus, Phone, BookOpen, Cpu, Code2,
} from "lucide-react";

// ─── Contact Form ─────────────────────────────────────────────────────────────
const ContactForm: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try emailing us directly.");
    }
  };

  if (status === "success")
    return (
      <div className="flex flex-col items-center justify-center min-h-[340px] border border-gray-200 dark:border-[#00ff66]/30 rounded-2xl bg-white dark:bg-[#040c06]/60 p-10 text-center shadow-lg dark:shadow-none">
        <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-[#00ff66] mb-4" />
        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 font-sans">MESSAGE RECEIVED</h3>
        <p className="text-gray-600 dark:text-[#88aa90] text-sm max-w-xs leading-relaxed mb-6 font-sans">
          The Cipher team will review your message and get back to you shortly.
        </p>
        <button onClick={() => setStatus("idle")}
          className="text-xs font-sans font-bold text-emerald-700 dark:text-[#00ff66] uppercase tracking-wider border border-emerald-300 dark:border-[#00ff66]/30 px-6 py-2.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-[#00ff66]/10 transition-colors">
          Send Another
        </button>
      </div>
    );

  return (
    <form onSubmit={submit} className="border border-gray-200 dark:border-[#00ff66]/20 rounded-2xl bg-white dark:bg-[#040c06]/60 backdrop-blur p-6 md:p-8 space-y-5 shadow-lg dark:shadow-none font-sans transition-colors">
      <div className="text-xs font-mono text-emerald-700 dark:text-[#00ff66] font-bold tracking-wider uppercase">// SEND_MESSAGE</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> Name <span className="text-red-500">*</span>
          </label>
          <input type="text" name="name" value={form.name} onChange={handle} required
            placeholder="Your name"
            className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 placeholder-gray-400 dark:placeholder-[#88aa90]/40 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans" />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
            <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> Email <span className="text-red-500">*</span>
          </label>
          <input type="email" name="email" value={form.email} onChange={handle} required
            placeholder="your@email.com"
            className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 placeholder-gray-400 dark:placeholder-[#88aa90]/40 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> Subject
        </label>
        <select name="subject" value={form.subject} onChange={handle}
          className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans">
          <option value="">Select a subject...</option>
          <option value="Collaboration">Collaboration / Partnership</option>
          <option value="Event Inquiry">Event Inquiry</option>
          <option value="Project Idea">Project Idea</option>
          <option value="Sponsorship">Sponsorship</option>
          <option value="General">General / Other</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> Message <span className="text-red-500">*</span>
        </label>
        <textarea name="message" value={form.message} onChange={handle} required rows={5}
          placeholder="Write your message here..."
          className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 placeholder-gray-400 dark:placeholder-[#88aa90]/40 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans resize-none" />
      </div>

      {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

      <button type="submit" disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 dark:bg-[#00ff66] text-white dark:text-[#030804] font-bold text-sm tracking-wider uppercase py-3.5 rounded-lg hover:bg-emerald-500 dark:hover:bg-[#5dfcaa] disabled:opacity-60 transition-colors shadow-md">
        {status === "loading" ? (
          <span className="animate-pulse">TRANSMITTING...</span>
        ) : (
          <><Send className="w-4 h-4" />SEND MESSAGE</>
        )}
      </button>
    </form>
  );
};

// ─── Join Form ────────────────────────────────────────────────────────────────
const JoinForm: React.FC = () => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", usn: "",
    semester: "", domain: "", skills: "", reason: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.reason.trim()) {
      setError("Name, email, and reason are required.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/public/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", phone: "", usn: "", semester: "", domain: "", skills: "", reason: "" });
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  if (status === "success")
    return (
      <div className="flex flex-col items-center justify-center min-h-[340px] border border-gray-200 dark:border-[#00ff66]/30 rounded-2xl bg-white dark:bg-[#040c06]/60 p-10 text-center shadow-lg dark:shadow-none font-sans">
        <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-[#00ff66] mb-4" />
        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 font-sans">APPLICATION SUBMITTED</h3>
        <p className="text-gray-600 dark:text-[#88aa90] text-sm max-w-xs leading-relaxed mb-6 font-sans">
          Your application has been received. The council will review it and reach out to you via email.
        </p>
        <button onClick={() => setStatus("idle")}
          className="text-xs font-sans font-bold text-emerald-700 dark:text-[#00ff66] uppercase tracking-wider border border-emerald-300 dark:border-[#00ff66]/30 px-6 py-2.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-[#00ff66]/10 transition-colors">
          Submit Another
        </button>
      </div>
    );

  return (
    <form onSubmit={submit} className="border border-gray-200 dark:border-[#00ff66]/20 rounded-2xl bg-white dark:bg-[#040c06]/60 backdrop-blur p-6 md:p-8 space-y-5 shadow-lg dark:shadow-none font-sans transition-colors">
      <div className="text-xs font-mono text-emerald-700 dark:text-[#00ff66] font-bold tracking-wider uppercase">// SUBMIT_APPLICATION</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> Full Name <span className="text-red-500">*</span>
          </label>
          <input type="text" name="name" value={form.name} onChange={handle} required
            placeholder="Your full name"
            className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 placeholder-gray-400 dark:placeholder-[#88aa90]/40 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans" />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
            <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> Email <span className="text-red-500">*</span>
          </label>
          <input type="email" name="email" value={form.email} onChange={handle} required
            placeholder="your@email.com"
            className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 placeholder-gray-400 dark:placeholder-[#88aa90]/40 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans" />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> Phone
          </label>
          <input type="tel" name="phone" value={form.phone} onChange={handle}
            placeholder="+91 XXXXXXXXXX"
            className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 placeholder-gray-400 dark:placeholder-[#88aa90]/40 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans" />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> USN
          </label>
          <input type="text" name="usn" value={form.usn} onChange={handle}
            placeholder="4JC22CS000"
            className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 placeholder-gray-400 dark:placeholder-[#88aa90]/40 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans" />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
            <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> Semester
          </label>
          <select name="semester" value={form.semester} onChange={handle}
            className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans">
            <option value="">Select semester...</option>
            {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map((s) => (
              <option key={s} value={s}>{s} Semester</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
            <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> Domain of Interest
          </label>
          <select name="domain" value={form.domain} onChange={handle}
            className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans">
            <option value="">Select domain...</option>
            <option value="Technical">Technical / Development</option>
            <option value="Design">Design / Creative</option>
            <option value="Media">Media / Documentation</option>
            <option value="Events">Events / Management</option>
            <option value="Open">Open to Anything</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
          <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> Skills / Experience
        </label>
        <input type="text" name="skills" value={form.skills} onChange={handle}
          placeholder="e.g. React, Python, UI Design, Video Editing..."
          className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 placeholder-gray-400 dark:placeholder-[#88aa90]/40 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans" />
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#88aa90] tracking-wide uppercase">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff66]" /> Why do you want to join Cipher? <span className="text-red-500">*</span>
        </label>
        <textarea name="reason" value={form.reason} onChange={handle} required rows={4}
          placeholder="Tell us what drives you and what you want to build with Cipher..."
          className="w-full bg-gray-50 dark:bg-[#030804] border border-gray-300 dark:border-[#00ff66]/20 rounded-lg text-gray-900 dark:text-white text-sm px-4 py-2.5 placeholder-gray-400 dark:placeholder-[#88aa90]/40 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ff66]/60 transition-colors font-sans resize-none" />
      </div>

      {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

      <button type="submit" disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 dark:bg-[#00ff66] text-white dark:text-[#030804] font-bold text-sm tracking-wider uppercase py-3.5 rounded-lg hover:bg-emerald-500 dark:hover:bg-[#5dfcaa] disabled:opacity-60 transition-colors shadow-md">
        {status === "loading" ? (
          <span className="animate-pulse">SUBMITTING...</span>
        ) : (
          <><UserPlus className="w-4 h-4" />APPLY TO JOIN</>
        )}
      </button>
    </form>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
type Tab = "join" | "contact";

export const ContactPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>("join");

  return (
    <main className="min-h-screen py-16 px-4 font-sans select-none">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-[#00ff66]/10 border border-emerald-200 dark:border-[#00ff66]/30 text-emerald-700 dark:text-[#00ff66] text-xs font-semibold tracking-wider uppercase mb-5">
          <MessageSquare className="w-3.5 h-3.5" />
          JOIN &amp; CONTACT
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4 leading-tight">
          BE PART OF<br />
          <span className="text-emerald-600 dark:text-[#00ff66] dark:text-glow">SOMETHING BIGGER.</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-[#a0c0a8] max-w-xl mx-auto leading-relaxed">
          Join the Cipher community or reach out to us — whether you are a student ready to build, a collaborator with an idea, or simply curious.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex rounded-xl border border-gray-200 dark:border-[#00ff66]/20 overflow-hidden bg-gray-100 dark:bg-[#040c06]/60 p-1.5 gap-1.5 shadow-sm">
          <button onClick={() => setTab("join")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-sans font-bold uppercase tracking-wider transition-all ${tab === "join" ? "bg-white text-gray-900 dark:bg-[#00ff66] dark:text-[#030804] shadow-sm" : "text-gray-600 dark:text-[#88aa90] hover:text-gray-900 dark:hover:text-white"}`}>
            <UserPlus className="w-4 h-4" /> Join Cipher
          </button>
          <button onClick={() => setTab("contact")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-sans font-bold uppercase tracking-wider transition-all ${tab === "contact" ? "bg-white text-gray-900 dark:bg-[#00ff66] dark:text-[#030804] shadow-sm" : "text-gray-600 dark:text-[#88aa90] hover:text-gray-900 dark:hover:text-white"}`}>
            <Mail className="w-4 h-4" /> Contact Us
          </button>
        </div>
      </div>

      {/* Form Area */}
      <div className="max-w-2xl mx-auto">
        {tab === "join" ? (
          <div className="space-y-4">
            {/* Info strip */}
            <div className="border border-emerald-200 dark:border-[#00ff66]/20 rounded-xl p-4 bg-emerald-50/60 dark:bg-[#040c06]/40 text-emerald-800 dark:text-[#a0c0a8] text-xs sm:text-sm leading-relaxed font-medium">
              Applications are reviewed by the Cipher council. Shortlisted candidates will be contacted by the Cipher council.
              <span className="text-emerald-700 dark:text-[#00ff66] font-bold ml-1">All backgrounds welcome.</span>
            </div>
            <JoinForm />
          </div>
        ) : (
          <div className="space-y-4">
            {/* How messages are handled: they go straight to the council's admin panel, no club email */}
            <div className="border border-gray-200 dark:border-[#00ff66]/20 rounded-2xl p-5 bg-white dark:bg-[#040c06]/60 flex items-center justify-between gap-4 shadow-sm dark:shadow-none">
              <div>
                <div className="text-[11px] font-semibold text-gray-500 dark:text-[#88aa90] tracking-wider uppercase mb-1">Direct to the Council</div>
                <p className="text-gray-800 dark:text-[#d0e8d6] font-medium text-sm sm:text-base">
                  Your message goes straight to the Cipher council. We&apos;ll get back to you using the details you share below.
                </p>
              </div>
              <div className="text-gray-500 dark:text-[#88aa90] text-xs text-right">
                Replies within<br /><span className="text-gray-900 dark:text-white font-bold">24-48 hrs</span>
              </div>
            </div>
            <ContactForm />
          </div>
        )}
      </div>
    </main>
  );
};
