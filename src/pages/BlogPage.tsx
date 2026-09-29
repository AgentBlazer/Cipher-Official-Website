import { API_BASE } from "../lib/api.ts";
import React, { useState, useEffect } from "react";
import {
  BookOpen, Clock, Tag, User, Search, ArrowRight, X,
  Terminal, ChevronRight, Rss, TrendingUp,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  authorRole: string;
  summary: string;
  content: string[];
  coverImage?: string;
  displayOrder?: number;
}

const SAMPLE_POSTS: BlogPost[] = [
  {
    id: "prompt-ops-retrospective",
    title: "Inside PROMPT OPS-2K26: How We Built an Adversarial Gemini AI Prompt Challenge",
    slug: "inside-prompt-ops-2k26",
    category: "AI & PROMPTS",
    readTime: "4 MIN READ",
    date: "26 MAR 2026",
    author: "Technical Committee",
    authorRole: "Cipher Core",
    coverImage: "/assets/promptops/slide_01.jpg",
    summary:
      "A deep dive into how Cipher and AgentBlazer created real-world prompt extraction testbeds, JSON transformation challenges, and Python debugging rounds for CSE students.",
    content: [
      "On March 25, 2026, Kalam Auditorium saw over 120 students compete in PROMPT OPS-2K26. Rather than conventional coding rounds, this competition treated language models as runtime environments requiring adversarial testing, structured output extraction, and guardrail navigation.",
      "Track 1 tested foundational image and visual generation prompting. Participants were provided intricate technical diagrams and had to reconstruct high-fidelity vectors and banners through iterative prompt refinement.",
      "Track 2 introduced system-prompt extraction and JSON normalization under constraint. Contestants were presented with hardened LLM endpoints and had to extract secret keys while verifying schema compliance through automated Python unit tests.",
      "The competition demonstrated that prompt engineering in 2026 is no longer about guessing adjectives—it is about deterministic structured input/output design, API schema adherence, and security awareness.",
    ],
  },
  {
    id: "getting-started-with-blockchain",
    title: "From Zero to Solidity: What We Covered in the Smart Contract Workshop",
    slug: "from-zero-to-solidity-workshop",
    category: "BLOCKCHAIN",
    readTime: "5 MIN READ",
    date: "14 FEB 2026",
    author: "Domain Leads",
    authorRole: "Technical Domain",
    coverImage: "/assets/lumiere/slide_01.jpg",
    summary:
      "Key takeaways from our hands-on Solidity workshop: EVM architecture, gas optimization, smart contract state variables, and deploying on Sepolia testnets.",
    content: [
      "Decentralized systems remain one of the most intellectually rewarding paradigms for software engineers. In Session 14 of Cipher's Technical Domain track, we hosted an intensive Solidity and Web3 developer crash course.",
      "We started with the Ethereum Virtual Machine (EVM) stack model, memory vs storage vs calldata, and why gas optimization matters when deploying production code.",
      "Students created their own ERC-20 token contract, wrote automated test suites with Hardhat, and successfully broadcasted deployment transactions to the Sepolia testnet.",
      "Code repositories and deployment guides are available on the Cipher GitHub organization for all club members.",
    ],
  },
  {
    id: "navigating-tech-placements",
    title: "Cracking Technical Interviews: Lessons from the UDAAN Mock Drives",
    slug: "cracking-technical-interviews-udaan",
    category: "CAREERS",
    readTime: "6 MIN READ",
    date: "05 JAN 2026",
    author: "Senior Council",
    authorRole: "Cipher Alumni",
    summary:
      "Insights from senior CSE students and alumni on data structures, system design fundamentals, resume curation, and navigating high-pressure technical interviews.",
    content: [
      "The UDAAN Mock Interview initiative was established to simulate real-world campus recruitment and off-campus tech evaluations.",
      "Through three rigorous rounds—DSA problem solving, system architecture discussions, and HR behavioral screenings—candidates received real-time constructive feedback from seniors placed in top product companies.",
      "Key takeaway 1: Communicate thought processes before writing code. Interviewers prioritize how you formulate constraints and edge cases.",
      "Key takeaway 2: Deep fundamentals in operating systems, DBMS indexing, and networking protocols matter far more than buzzwords on resumes.",
    ],
  },
  {
    id: "generative-ai-research-tools",
    title: "Modern Research Tooling: Accelerating Academic Paper Reviews with AI",
    slug: "modern-research-tooling-ai",
    category: "RESEARCH",
    readTime: "3 MIN READ",
    date: "18 DEC 2025",
    author: "Faculty Advisory",
    authorRole: "CSE Department",
    summary:
      "How CSE undergraduate researchers can leverage LaTeX, citation graphing, and semantic search tools to organize literature reviews without sacrificing academic integrity.",
    content: [
      "Academic publishing demands rigorous synthesis of related work. During Session 13, the department reviewed modern literature review tools and reproducible experimentation pipelines.",
      "We highlighted the proper usage of LaTeX for IEEE format typesetting, reference indexing with BibTeX, and semantic paper clustering.",
      "Advisory reminder: AI assistants are aids for summarizing and formatting, but empirical validation and peer review standards remain paramount.",
    ],
  },
  {
    id: "open-source-contributions",
    title: "Your First Pull Request: Navigating Open Source as a CSE Undergrad",
    slug: "first-pull-request-open-source",
    category: "OPEN SOURCE",
    readTime: "5 MIN READ",
    date: "10 NOV 2025",
    author: "Melroy Almeida",
    authorRole: "Technical Lead, Cipher",
    summary:
      "A practical guide to making your first meaningful contribution to open-source projects — from choosing the right repo to getting your PR merged.",
    content: [
      "Open-source contributions are one of the highest-signal items on a junior developer's resume. But knowing where to start is the hardest part.",
      "Step 1: Choose a project you actually use. Tools you depend on daily have documentation bugs, test coverage gaps, and good-first-issue labels waiting for you.",
      "Step 2: Read the contribution guide, clone the repo, and run the test suite before touching a single line of code.",
      "The Cipher GitHub organization maintains several open repositories where club members can start contributing without external barriers.",
    ],
  },
  {
    id: "system-design-basics",
    title: "System Design for Students: Thinking at Scale from Day One",
    slug: "system-design-for-students",
    category: "SYSTEM DESIGN",
    readTime: "7 MIN READ",
    date: "02 OCT 2025",
    author: "Technical Committee",
    authorRole: "Cipher Core",
    summary:
      "A primer on system design thinking for undergraduates: load balancers, caching layers, CAP theorem, and how to communicate trade-offs clearly in interviews.",
    content: [
      "System design interviews terrify most undergraduates — not because the questions are impossibly hard, but because no one teaches the vocabulary and mental models needed to approach them.",
      "Start with the requirements: functional (what the system does) and non-functional (scale, latency, availability). Most candidates skip this and jump straight to drawing boxes.",
      "The CAP theorem forces you to choose between Consistency and Availability under a network Partition. Understanding this trade-off is the foundation of every distributed system decision.",
      "Practice drawing URL shorteners, chat apps, and feed ranking systems. The patterns repeat across interviews more than you'd expect.",
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "AI & PROMPTS": "text-[#00ff66] bg-[#00ff66]/10 border-[#00ff66]/30",
  BLOCKCHAIN: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  CAREERS: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  RESEARCH: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  "OPEN SOURCE": "text-pink-400 bg-pink-400/10 border-pink-400/30",
  "SYSTEM DESIGN": "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  GENERAL: "text-[#88aa90] bg-[#88aa90]/10 border-[#88aa90]/30",
};
const catColor = (cat: string) => CATEGORY_COLORS[cat] || CATEGORY_COLORS["GENERAL"];

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>(SAMPLE_POSTS);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`${API_BASE}/api/public/blog`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            setPosts(
              json.data.map((p: any) => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                category: p.category,
                readTime: p.readTime,
                date: new Date(p.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
                author: p.author,
                authorRole: p.authorRole,
                summary: p.summary,
                content: (() => {
                  try { return JSON.parse(p.content); } catch { return [p.content]; }
                })(),
                coverImage: p.coverImage || undefined,
                displayOrder: p.displayOrder,
              }))
            );
          }
        }
      } catch {
        // use fallback
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const allCategories = Array.from(new Set(posts.map((p) => p.category)));
  const categories = ["ALL", ...allCategories];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === "ALL" || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [featuredPost, ...gridPosts] = filteredPosts;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center font-mono text-[#88aa90] text-xs space-y-3">
          <div className="w-8 h-8 border-2 border-[#00ff66]/30 border-t-[#00ff66] rounded-full animate-spin mx-auto" />
          <p>Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-14 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] font-mono text-xs tracking-wider uppercase mb-5">
          <Terminal className="w-3.5 h-3.5" />
          <span>Cipher Club Articles & Insights</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-mono font-bold text-white mb-4 tracking-tight">
          Tech{" "}
          <span className="text-[#00ff66]" style={{ textShadow: "0 0 20px rgba(0,255,102,0.5)" }}>
            Blog
          </span>
        </h1>
        <p className="font-mono text-sm text-[#88aa90] leading-relaxed">
          Technical deep dives, hackathon postmortems, workshop recaps, and career advice written by Cipher members and faculty mentors.
        </p>

        <div className="flex items-center justify-center gap-8 mt-8">
          {[
            { label: "Articles", value: posts.length },
            { label: "Categories", value: allCategories.length },
            { label: "Authors", value: Array.from(new Set(posts.map((p) => p.author))).length },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-mono text-2xl font-bold text-[#00ff66]">{s.value}</p>
              <p className="font-mono text-xs text-[#88aa90] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category Tabs & Search ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 pb-6 border-b border-[#00ff66]/15">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs tracking-wider transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-[#00ff66] text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.4)]"
                  : "bg-[#041006] text-[#88aa90] hover:text-[#00ff66] border border-[#00ff66]/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#88aa90] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 py-2 bg-[#041006] border border-[#00ff66]/25 rounded-xl font-mono text-xs text-white placeholder-[#88aa90]/60 focus:outline-none focus:border-[#00ff66] transition-colors"
          />
        </div>
      </div>

      {/* ── Featured Post ────────────────────────────────────────── */}
      {featuredPost && (
        <div
          onClick={() => setSelectedPost(featuredPost)}
          className="group relative rounded-2xl bg-[#040e06] border border-[#00ff66]/20 hover:border-[#00ff66] transition-all duration-300 cursor-pointer hover:shadow-[0_0_40px_rgba(0,255,102,0.2)] mb-10 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Cover image */}
            {featuredPost.coverImage && (
              <div className="relative md:w-96 h-56 md:h-auto overflow-hidden bg-[#020703] flex-shrink-0">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#040e06] hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040e06] to-transparent md:hidden" />
              </div>
            )}

            {/* Content */}
            <div className="p-7 md:p-10 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border font-mono text-[10px] font-semibold tracking-wider ${catColor(featuredPost.category)}`}>
                    <Tag className="w-3 h-3" /> {featuredPost.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-[#88aa90]">
                    <TrendingUp className="w-3 h-3 text-[#00ff66]" /> FEATURED
                  </span>
                  <span className="ml-auto text-[#88aa90] flex items-center gap-1 text-[11px] font-mono">
                    <Clock className="w-3 h-3 text-[#00ff66]" /> {featuredPost.readTime}
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-mono font-bold text-white group-hover:text-[#00ff66] transition-colors leading-snug mb-3">
                  {featuredPost.title}
                </h2>
                <p className="font-mono text-sm text-[#88aa90] leading-relaxed line-clamp-3">
                  {featuredPost.summary}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#00ff66]/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs font-mono">
                  <div className="w-7 h-7 rounded-full bg-[#00ff66]/15 border border-[#00ff66]/30 flex items-center justify-center text-[#00ff66]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{featuredPost.author}</p>
                    <p className="text-[10px] text-[#88aa90]/70">{featuredPost.date}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#00ff66] px-4 py-2 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/30 group-hover:bg-[#00ff66] group-hover:text-black transition-all">
                  <Rss className="w-3.5 h-3.5" /> Read Story
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Posts Grid ───────────────────────────────────────────── */}
      {gridPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {gridPosts.map((post) => (
            <BlogCard key={post.id} post={post} catColor={catColor} onSelect={setSelectedPost} />
          ))}
        </div>
      )}

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 font-mono">
          <p className="text-4xl mb-4">📄</p>
          <p className="text-[#88aa90] text-sm">No articles found.</p>
          <button onClick={() => { setSearchQuery(""); setActiveCategory("ALL"); }} className="mt-4 text-[#00ff66] text-xs underline">
            Clear filters
          </button>
        </div>
      )}

      {/* ── Article Reader Modal ─────────────────────────────────── */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[#030905] border border-[#00ff66]/40 shadow-[0_0_60px_rgba(0,255,102,0.25)] scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cover image banner */}
            {selectedPost.coverImage && (
              <div className="relative h-48 overflow-hidden rounded-t-2xl">
                <img
                  src={selectedPost.coverImage}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030905] to-transparent" />
              </div>
            )}

            <div className="p-6 md:p-10">
              {/* Close */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-5 right-5 p-2 rounded-lg bg-[#041006] text-[#88aa90] hover:text-[#00ff66] border border-[#00ff66]/20 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Meta */}
              <div className="flex items-center flex-wrap gap-2 text-xs font-mono mb-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border font-semibold ${catColor(selectedPost.category)}`}>
                  <Tag className="w-3 h-3" /> {selectedPost.category}
                </span>
                <span className="text-[#88aa90]">•</span>
                <span className="text-[#88aa90]">{selectedPost.date}</span>
                <span className="text-[#88aa90]">•</span>
                <span className="flex items-center gap-1 text-[#88aa90]">
                  <Clock className="w-3 h-3 text-[#00ff66]" /> {selectedPost.readTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-mono font-bold text-white mb-6 leading-snug">
                {selectedPost.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#051408] border border-[#00ff66]/20 mb-8">
                <div className="w-9 h-9 rounded-full bg-[#00ff66]/20 border border-[#00ff66]/40 flex items-center justify-center text-[#00ff66]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-white">{selectedPost.author}</p>
                  <p className="font-mono text-[11px] text-[#88aa90]">{selectedPost.authorRole} · Department of CSE</p>
                </div>
              </div>

              {/* Summary highlight */}
              <div className="p-4 rounded-xl border border-[#00ff66]/20 bg-[#00ff66]/5 mb-6">
                <p className="font-mono text-xs text-[#a0c0a8] leading-relaxed italic">
                  {selectedPost.summary}
                </p>
              </div>

              {/* Content paragraphs */}
              <div className="space-y-4 font-mono text-xs md:text-sm text-[#a0c0a8] leading-relaxed">
                {selectedPost.content.map((paragraph, idx) => (
                  <p key={idx} className="bg-[#040e06]/50 p-4 rounded-lg border border-[#00ff66]/10 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-[#00ff66]/20 flex justify-end">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="font-mono text-xs px-6 py-2.5 rounded-lg bg-[#00ff66] text-black font-bold hover:bg-[#00ff66]/90 transition-colors shadow-[0_0_15px_rgba(0,255,102,0.4)]"
                >
                  Done Reading
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Blog Card ─────────────────────────────────────────────────────────────
interface BlogCardProps {
  post: BlogPost;
  catColor: (cat: string) => string;
  onSelect: (p: BlogPost) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, catColor, onSelect }) => (
  <article
    onClick={() => onSelect(post)}
    className="group relative rounded-2xl bg-[#040e06] border border-[#00ff66]/20 hover:border-[#00ff66] transition-all duration-300 cursor-pointer hover:shadow-[0_0_25px_rgba(0,255,102,0.2)] hover:-translate-y-1.5 flex flex-col overflow-hidden"
  >
    {/* Cover */}
    {post.coverImage && (
      <div className="relative h-40 overflow-hidden bg-[#020703]">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040e06] via-transparent to-transparent opacity-60" />
      </div>
    )}

    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-center justify-between gap-2 text-xs font-mono mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border font-semibold tracking-wider ${catColor(post.category)}`}>
          <Tag className="w-3 h-3" /> {post.category}
        </span>
        <span className="text-[#88aa90] flex items-center gap-1 text-[11px]">
          <Clock className="w-3 h-3 text-[#00ff66]" /> {post.readTime}
        </span>
      </div>

      <h2 className="text-base font-mono font-bold text-white group-hover:text-[#00ff66] transition-colors leading-snug mb-2 line-clamp-2">
        {post.title}
      </h2>
      <p className="font-mono text-[11px] text-[#88aa90] leading-relaxed line-clamp-3 flex-1">
        {post.summary}
      </p>

      <div className="pt-4 mt-4 border-t border-[#00ff66]/15 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-[#88aa90]">
          <div className="w-5 h-5 rounded-full bg-[#00ff66]/15 border border-[#00ff66]/30 flex items-center justify-center text-[#00ff66]">
            <User className="w-3 h-3" />
          </div>
          <div>
            <p className="font-bold text-white text-[11px]">{post.author}</p>
            <p className="text-[10px] text-[#88aa90]/70">{post.date}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#00ff66] group-hover:translate-x-0.5 transition-transform">
          Read <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  </article>
);
