import { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Instagram, Mail, MessageCircle, Globe, Palette, Camera,
  Video, Code, Bot, TrendingUp, FileText, Edit3, RotateCcw,
  ArrowRight, Star, Zap, Users, Award, ChevronRight, Play, CheckCircle, AlertCircle, Clapperboard
} from 'lucide-react';
import ChatBot from './ChatBot';
import { sendContactEmails, type ContactFormData } from './emailService';

// ─── Cursor ───────────────────────────────────────────────────────────────────
const TRAIL_COUNT = 5;

function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Positions buffer for trail
  const pos     = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const ringPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const trail   = useRef(Array.from({ length: TRAIL_COUNT }, () => ({ x: pos.current.x, y: pos.current.y })));

  useEffect(() => {
    let raf: number;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };

      // Dot follows instantly via transform
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(calc(-50% + ${e.clientX}px), calc(-50% + ${e.clientY}px))`;
      }

      // Detect element type for state
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isClickable = el?.closest('a, button, [role="button"]');
      const isText = el?.closest('p, h1, h2, h3, h4, h5, h6, span, label');

      dotRef.current?.classList.toggle('hovering', !!isClickable);
      dotRef.current?.classList.toggle('on-text', !isClickable && !!isText);
      ringRef.current?.classList.toggle('hovering', !!isClickable);
      ringRef.current?.classList.toggle('on-text', !isClickable && !!isText);
    };

    const onDown = () => {
      dotRef.current?.classList.add('clicking');
      ringRef.current?.classList.add('clicking');
    };
    const onUp = () => {
      dotRef.current?.classList.remove('clicking');
      ringRef.current?.classList.remove('clicking');
    };

    // RAF loop — ring lags behind, trail lags more
    const tick = () => {
      // Ring easing
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(calc(-50% + ${ringPos.current.x}px), calc(-50% + ${ringPos.current.y}px))`;
      }

      // Trail cascade
      trail.current[0].x += (pos.current.x - trail.current[0].x) * 0.25;
      trail.current[0].y += (pos.current.y - trail.current[0].y) * 0.25;
      for (let i = 1; i < TRAIL_COUNT; i++) {
        trail.current[i].x += (trail.current[i - 1].x - trail.current[i].x) * 0.3;
        trail.current[i].y += (trail.current[i - 1].y - trail.current[i].y) * 0.3;
      }
      trailRefs.current.forEach((el, i) => {
        if (!el) return;
        const t = trail.current[i];
        const scale = 1 - i * 0.15;
        const opacity = (0.45 - i * 0.08).toFixed(2);
        el.style.transform = `translate(calc(-50% + ${t.x}px), calc(-50% + ${t.y}px)) scale(${scale})`;
        el.style.opacity = opacity;
      });

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Trail dots */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div key={i} ref={el => { trailRefs.current[i] = el; }} className="cursor-trail hidden md:block" />
      ))}
      {/* Ring */}
      <div ref={ringRef} className="cursor-ring hidden md:block" />
      {/* Main dot */}
      <div ref={dotRef}  className="cursor-dot  hidden md:block" />
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useReveal() {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.id]: true }));
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('[id]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return visible;
}

const CARD_COLORS = ['card-blue', 'card-violet', 'card-magenta'] as const;
const cardColor = (i: number) => CARD_COLORS[i % 3];

const openWhatsApp = (msg = '') => {
  const text = msg || "Hi ARRISE DIGITAL, I'd like to discuss a project with you.";
  window.open(`https://wa.me/917305115192?text=${encodeURIComponent(text)}`, '_blank');
};

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ scrollTo }: { scrollTo: (id: string) => void }) {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${scrolled ? 'glass-nav shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg btn-primary flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-white">
            <span className="gradient-text">ARR</span>ISE DIGITAL
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {['About','Services','Team','Portfolio','Contact'].map(l => (
            <button key={l} onClick={() => scrollTo(l.toLowerCase())}
              className="text-white/50 hover:text-white text-sm font-medium transition-colors duration-200">
              {l}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => openWhatsApp()}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-2"
            style={{ color: '#25D366' }}>
            <MessageCircle size={15} style={{ color: '#25D366' }} /> WhatsApp
          </button>
          <button onClick={() => scrollTo('contact')}
            className="btn-primary px-5 py-2.5 rounded-xl text-white text-sm font-semibold">
            Get Started
          </button>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-white/80 p-1">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass-nav border-t border-white/10 px-6 py-4 space-y-1">
          {['About','Services','Team','Portfolio','Contact'].map(l => (
            <button key={l} onClick={() => { scrollTo(l.toLowerCase()); setOpen(false); }}
              className="block w-full text-left py-3 text-white/60 hover:text-white text-sm font-medium border-b border-white/5 transition-colors">
              {l}
            </button>
          ))}
          <button onClick={() => scrollTo('contact')}
            className="btn-primary w-full mt-3 py-3 rounded-xl text-white text-sm font-semibold">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ scrollTo }: { scrollTo: (id: string) => void }) {
  const words = ['Scale', 'Grow', 'Dominate'];
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < current.length) {
      // Typing
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 100);
    } else if (!deleting && displayed.length === current.length) {
      // Pause then start deleting
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      // Deleting
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 60);
    } else if (deleting && displayed.length === 0) {
      // Move to next word
      setDeleting(false);
      setWordIndex(p => (p + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-20 overflow-hidden"
      style={{ background: 'transparent' }}>

      {/* Radial glows */}
      <div className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle at 20% 30%, rgba(45,140,255,0.07), transparent 55%)' }} />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle at 80% 80%, rgba(217,30,155,0.06), transparent 55%)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(123,63,228,0.05), transparent 60%)' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(#6B7280 1px, transparent 1px), linear-gradient(90deg, #6B7280 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 shadow-sm rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/50 text-sm font-medium">Social Media Growth Agency · Madurai</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black text-white leading-[0.95] tracking-tight mb-6">
          We Don't Just<br />
          <span className="gradient-text">Grow Brands</span><br />
          <span>— We </span><span className="gradient-text typewriter-word">{displayed}</span><span> Them</span>
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Premium digital marketing, content creation, and tech solutions that transform brands into market leaders.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button onClick={() => scrollTo('contact')}
            className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 group animate-glow-pulse">
            Get Started Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => openWhatsApp()}
            className="btn-ghost px-8 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2">
            <Play size={15} className="fill-current" /> See Our Work
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: '20+', label: 'Clients Served' },
            { value: '2+',   label: 'Years Experience' },
            { value: '100+', label: 'Projects Done' },
            { value: '89%',  label: 'Satisfaction Rate' },
          ].map((s, i) => (
            <div key={i} className={`glass-card gradient-border ${cardColor(i)} rounded-2xl p-5`}>
              <div className="text-2xl md:text-3xl font-black gradient-text">{s.value}</div>
              <div className="text-white/40 text-xs mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function MarqueeBanner() {
  const items = ['Social Media Marketing','Content Creation','Video Editing','AI Automation','Web Development','Meta Ads','Graphic Design','Photography','Brand Strategy','AI Chatbot','Email Automation','Videography'];
  const doubled = [...items, ...items];
  return (
    <div className="py-4 border-y border-white/10 overflow-hidden bg-white/5">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-3 px-6 text-white/40 text-sm font-medium whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#2D8CFF,#D91E9B)' }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Services helpers ─────────────────────────────────────────────────────────

// Renders text with [[highlighted]] words in brand gradient
function GradientText({ text }: { text: string }) {
  const parts = text.split(/(\[\[.*?\]\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('[[') ? (
          <span key={i} className="gradient-text font-semibold">{p.slice(2, -2)}</span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// Typewriter hook
function useTypewriter(text: string, active: boolean, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setDisplayed(''); setDone(false); return; }
    setDisplayed(''); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, active]);
  return { displayed, done };
}

// Spotlight detail panel — shown inside the foreground featured card
function SpotlightDetail({ service, onClose }: {
  service: { title: string; color: string; detail: string; benefits: string[]; process: string[] };
  onClose: () => void;
}) {
  const { displayed, done } = useTypewriter(service.detail, true, 16);
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 120); return () => clearTimeout(t); }, []);

  return (
    <div className={`transition-all duration-500 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="h-px w-full mb-5 mt-1" style={{ background: `linear-gradient(90deg, ${service.color}50, transparent)` }} />
      <p className="text-white/75 text-sm md:text-base leading-relaxed mb-6 min-h-[56px]">
        <GradientText text={displayed} />
        {!done && (
          <span className="inline-block w-[2px] h-[15px] ml-[2px] align-middle rounded-full"
            style={{ background: service.color, animation: 'twBlink 0.65s step-end infinite' }} />
        )}
      </p>
      {service.benefits.length > 0 && (
        <div className="mb-5">
          <p className="text-white/25 text-[10px] font-bold tracking-[0.15em] uppercase mb-3">Key Outcomes</p>
          <div className="flex flex-wrap gap-2">
            {service.benefits.map((b, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: `${service.color}15`, border: `1px solid ${service.color}35`, color: service.color }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
      {service.process.length > 0 && (
        <div className="mb-6">
          <p className="text-white/25 text-[10px] font-bold tracking-[0.15em] uppercase mb-3">How It Works</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {service.process.map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                  style={{ background: `${service.color}20`, color: service.color }}>{i + 1}</span>
                <span className="text-white/45 text-xs leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={onClose}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
        style={{ background: `${service.color}15`, border: `1px solid ${service.color}30`, color: service.color }}>
        <X size={11} /> Back to Services
      </button>
    </div>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICE_DATA = [
    {
      icon: TrendingUp, title: 'Social Media Marketing', color: '#2D8CFF',
      desc: 'Strategic growth campaigns that build real audiences and drive engagement across all platforms.',
      detail: 'We craft [[data-driven social strategies]] that turn your brand into a community magnet. From content calendars to engagement tactics, every move is designed to [[grow your audience]] and convert followers into loyal customers.',
      benefits: ['120%+ Engagement Boost', 'Organic Reach Growth', 'Brand Authority', 'Lead Generation'],
      process: ['Brand audit & competitor analysis', 'Custom content strategy & calendar', 'Daily posting & community management', 'Monthly analytics & growth report'],
    },
    {
      icon: Edit3, title: 'Content Creation', color: '#7B3FE4',
      desc: 'Scroll-stopping content that tells your brand story and converts followers into customers.',
      detail: 'Every piece of content we create is built to [[stop the scroll]] and spark action. We blend [[storytelling with strategy]] — crafting captions, visuals, and copy that resonate deeply with your target audience.',
      benefits: ['Higher Engagement Rate', 'Brand Voice Consistency', 'Viral-Ready Formats', 'Conversion-Focused Copy'],
      process: ['Brand voice & tone definition', 'Content ideation & scripting', 'Visual design & production', 'Publish, test & optimise'],
    },
    {
      icon: Video, title: 'Video Editing', color: '#D91E9B',
      desc: 'Cinematic edits with smooth transitions, motion graphics, and professional color grading.',
      detail: 'We transform raw footage into [[cinematic masterpieces]]. Our editors bring your vision to life with precision color grading, dynamic motion graphics, and [[seamless transitions]] that keep viewers hooked till the last frame.',
      benefits: ['Cinematic Color Grade', 'Motion Graphics', 'Sound Design', 'Platform-Optimised Exports'],
      process: ['Footage review & storyboard', 'Rough cut & pacing', 'Color grade & VFX', 'Final delivery in all formats'],
    },
    {
      icon: Bot, title: 'AI Automation', color: '#2D8CFF',
      desc: 'Intelligent chatbots and automation workflows that work 24/7 to grow your business.',
      detail: 'We build [[intelligent automation systems]] that handle repetitive tasks, qualify leads, and nurture customers — all on autopilot. Your business keeps [[working while you sleep]], powered by cutting-edge AI workflows.',
      benefits: ['24/7 Lead Capture', 'Reduced Manual Work', 'Faster Response Time', 'Scalable Workflows'],
      process: ['Process audit & automation mapping', 'AI workflow design & build', 'Integration & testing', 'Monitor, optimise & scale'],
    },
    {
      icon: Code, title: 'Website Development', color: '#7B3FE4',
      desc: 'Fast, modern, conversion-optimized websites built with the latest tech stack.',
      detail: 'We engineer [[high-performance websites]] that don\'t just look stunning — they convert. Built with React, Next.js, and modern tooling, every site is [[blazing fast]], SEO-ready, and designed to turn visitors into customers.',
      benefits: ['Sub-2s Load Time', 'SEO Optimised', 'Mobile-First Design', 'Conversion-Focused UX'],
      process: ['Discovery & wireframing', 'UI/UX design in Figma', 'Development & CMS integration', 'Launch, SEO & ongoing support'],
    },
    {
      icon: Palette, title: 'Graphic Design', color: '#D91E9B',
      desc: 'Premium visual identity — logos, branding, packaging, and marketing collateral.',
      detail: 'Great brands are built on [[iconic visual identity]]. We design logos, brand systems, packaging, and marketing assets that communicate [[premium quality]] at a glance and make your brand unforgettable.',
      benefits: ['Iconic Logo Design', 'Full Brand System', 'Packaging Design', 'Marketing Collateral'],
      process: ['Brand discovery & moodboard', 'Logo concepts & refinement', 'Brand guidelines document', 'Asset delivery & handoff'],
    },
    {
      icon: Camera, title: 'Photography', color: '#2D8CFF',
      desc: 'Professional product and brand photography that elevates your visual presence.',
      detail: 'We capture your brand\'s essence through [[professional photography]] that commands attention. From product shoots to brand storytelling, every frame is crafted to [[elevate your visual identity]] and build instant trust.',
      benefits: ['Product Photography', 'Brand Storytelling', 'Social Media Ready', 'High-Res Delivery'],
      process: ['Creative brief & shot list', 'Studio or on-location shoot', 'Professional editing & retouching', 'Delivery in all required formats'],
    },
    {
      icon: Globe, title: 'Meta & Google Ads', color: '#7B3FE4',
      desc: 'Data-driven paid campaigns across Meta and Google with precise targeting for maximum ROI.',
      detail: 'We run [[ROI-obsessed paid campaigns]] across Meta and Google that put your brand in front of the exact right audience. Every rupee is tracked, tested, and optimised to [[maximise your return]] and scale what works.',
      benefits: ['Precise Audience Targeting', 'A/B Split Testing', 'Weekly ROI Reports', 'Retargeting Funnels'],
      process: ['Audience research & campaign strategy', 'Ad creative & copywriting', 'Campaign launch & pixel setup', 'Optimise, scale & report'],
    },
    {
      icon: FileText, title: 'Brand Strategy', color: '#D91E9B',
      desc: 'End-to-end brand positioning and digital strategy to dominate your market.',
      detail: 'We build [[comprehensive brand strategies]] that position you as the undisputed leader in your market. From positioning and messaging to digital roadmaps, we give your brand a [[clear path to dominance]].',
      benefits: ['Market Positioning', 'Competitor Analysis', 'Digital Roadmap', 'Messaging Framework'],
      process: ['Market & competitor research', 'Brand positioning workshop', 'Strategy document & roadmap', 'Execution support & review'],
    },
    {
      icon: Bot, title: 'AI Chatbot', color: '#2D8CFF',
      desc: 'Custom AI-powered chatbots that engage visitors, capture leads, and answer queries 24/7.',
      detail: 'Our [[custom AI chatbots]] are trained on your brand voice and business knowledge. They engage every visitor, capture qualified leads, and answer questions [[instantly around the clock]] — turning your website into a 24/7 sales machine.',
      benefits: ['24/7 Lead Capture', 'Instant Query Resolution', 'WhatsApp Integration', 'Custom Brand Voice'],
      process: ['Knowledge base & flow design', 'AI training & personality setup', 'Website & WhatsApp integration', 'Testing, launch & monitoring'],
    },
    {
      icon: Mail, title: 'Email Automation', color: '#7B3FE4',
      desc: 'Smart email workflows that nurture leads, send confirmations, and keep your audience engaged.',
      detail: 'We design [[intelligent email sequences]] that nurture your leads through every stage of the funnel. From welcome flows to re-engagement campaigns, your audience stays [[connected and converting]] on complete autopilot.',
      benefits: ['Automated Nurture Flows', 'High Open Rates', 'Lead Segmentation', 'Revenue on Autopilot'],
      process: ['Audience segmentation & mapping', 'Email sequence design & copy', 'Automation setup & testing', 'Monitor, A/B test & optimise'],
    },
    {
      icon: Clapperboard, title: 'Videography', color: '#D91E9B',
      desc: 'Professional video shoots, brand films, and cinematic production that tell your story with impact.',
      detail: 'We produce [[cinematic brand films]] and professional video content that tell your story with real emotional impact. From concept to final cut, every production is crafted to [[captivate your audience]] and elevate your brand.',
      benefits: ['Brand Films', 'Product Videos', 'Testimonial Shoots', 'Social Media Reels'],
      process: ['Concept development & scripting', 'Pre-production & location scouting', 'Professional shoot day', 'Post-production & delivery'],
    },
];

function Services({ visible }: { visible: Record<string, boolean> }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const openCard = (i: number) => {
    if (isTransitioning) return;
    if (activeIdx === i) { closeCard(); return; }
    setIsTransitioning(true);
    setActiveIdx(i);
    setTimeout(() => setIsTransitioning(false), 500);
    setTimeout(() => spotlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
  };

  const closeCard = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIdx(null);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const activeService = activeIdx !== null ? SERVICE_DATA[activeIdx] : null;

  return (
    <section id="services" className="py-28 px-6 relative overflow-hidden"
      style={{ background: 'rgba(6,6,10,0.6)' }}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle at 90% 10%, rgba(123,63,228,0.06), transparent 55%)' }} />
      {activeService && (
        <div className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{ background: `radial-gradient(ellipse at 50% 40%, ${activeService.color}07, transparent 65%)` }} />
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <div className={`text-center mb-16 section-reveal ${visible['services'] ? 'visible' : ''}`}>
          <span className="text-sm font-semibold tracking-widest uppercase gradient-text mb-3 block">What We Do</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Services That <span className="gradient-text">Scale</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Everything your brand needs to grow, all under one roof.</p>
        </div>

        {/* ── SPOTLIGHT MODE ── */}
        {activeService ? (
          <div className="flex flex-col lg:flex-row gap-6 items-start" style={{ animation: 'fadeIn 0.4s ease both' }}>

            {/* Foreground featured card */}
            <div ref={spotlightRef} className="w-full lg:w-[52%] flex-shrink-0 rounded-3xl p-7 md:p-9 relative overflow-hidden"
              style={{
                background: 'rgba(10,10,18,0.97)',
                border: `1.5px solid ${activeService.color}55`,
                boxShadow: `0 0 0 1px ${activeService.color}18, 0 32px 80px ${activeService.color}22, 0 8px 40px rgba(0,0,0,0.75)`,
                backdropFilter: 'blur(32px)',
                animation: 'spotlightIn 0.45s cubic-bezier(0.22,1,0.36,1) both',
              }}>
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle at 100% 0%, ${activeService.color}15, transparent 65%)` }} />

              {/* Header row */}
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${activeService.color}18`,
                      border: `1.5px solid ${activeService.color}45`,
                      boxShadow: `0 0 28px ${activeService.color}28`,
                    }}>
                    <activeService.icon size={26} style={{ color: activeService.color }} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.18em] uppercase block mb-0.5"
                      style={{ color: activeService.color }}>Featured Service</span>
                    <h3 className="text-white font-black text-xl md:text-2xl tracking-tight">{activeService.title}</h3>
                  </div>
                </div>
                <button onClick={closeCard} aria-label="Close"
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all hover:scale-110 hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)' }}>
                  <X size={14} />
                </button>
              </div>

              <SpotlightDetail service={activeService} onClose={closeCard} />
            </div>

            {/* Background cards */}
            <div className="w-full lg:flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {SERVICE_DATA.map((s, i) => {
                if (i === activeIdx) return null;
                return (
                  <button key={i} onClick={() => openCard(i)}
                    className="text-left rounded-2xl p-4 group outline-none focus-visible:ring-2 focus-visible:ring-violet-500 service-bg-card"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      backdropFilter: 'blur(12px)',
                      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.opacity = '1'; el.style.transform = 'scale(1.02)';
                      el.style.borderColor = `${s.color}45`;
                      el.style.boxShadow = `0 8px 28px ${s.color}18`;
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.opacity = '0.5'; el.style.transform = 'scale(0.97)';
                      el.style.borderColor = 'rgba(255,255,255,0.07)';
                      el.style.boxShadow = 'none';
                    }}
                    onFocus={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.opacity = '1'; el.style.transform = 'scale(1.02)';
                    }}
                    onBlur={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.opacity = '0.5'; el.style.transform = 'scale(0.97)';
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                      <s.icon size={15} style={{ color: s.color }} />
                    </div>
                    <p className="text-white/70 text-xs font-semibold leading-snug mb-1">{s.title}</p>
                    <p className="text-white/30 text-[10px] leading-relaxed line-clamp-2">{s.desc}</p>
                    <span className="mt-2 flex items-center gap-1 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: s.color }}>
                      Spotlight <ChevronRight size={10} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        ) : (
          /* ── DEFAULT GRID ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICE_DATA.map((s, i) => (
              <div key={i} tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && openCard(i)}
                className={`glass-card gradient-border ${cardColor(i)} card-hover rounded-2xl p-6 group cursor-pointer section-reveal ${visible['services'] ? 'visible' : ''} outline-none focus-visible:ring-2 focus-visible:ring-violet-500`}
                style={{ transitionDelay: `${i * 50}ms` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <h3 className="text-white font-bold text-base mb-2 tracking-tight">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                <button onClick={() => openCard(i)}
                  className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 hover:gap-2"
                  style={{ color: s.color }}>
                  Learn more <ChevronRight size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function About({ visible }: { visible: Record<string, boolean> }) {
  return (
    <section id="about" className="py-28 px-6 relative overflow-hidden"
      >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle at 10% 50%, rgba(45,140,255,0.06), transparent 55%)' }} />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
        <div className={`section-reveal ${visible['about'] ? 'visible' : ''}`}>
          <span className="text-sm font-semibold tracking-widest uppercase gradient-text mb-4 block">About Us</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
            A Team Built to<br /><span className="gradient-text">Scale Brands</span>
          </h2>
          <p className="text-white/50 text-lg leading-relaxed mb-8">
            ARRISE DIGITAL is a result-driven agency powered by 3 passionate specialists. We combine creative design, impactful content, smart marketing, and modern technology to transform brands into market leaders.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {['Creative Design','Growth Marketing','Tech Solutions','AI Automation'].map(tag => (
              <span key={tag} className="bg-white/5 border border-white/10 shadow-sm px-4 py-2 rounded-full text-white/50 text-sm font-medium">{tag}</span>
            ))}
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-4 section-reveal ${visible['about'] ? 'visible' : ''}`} style={{ transitionDelay: '180ms' }}>
          {[
            { icon: Users, value: '20+', label: 'Happy Clients',  color: '#2D8CFF' },
            { icon: Award, value: '2+',   label: 'Years Active',   color: '#7B3FE4' },
            { icon: Zap,   value: '100+', label: 'Projects Done',  color: '#D91E9B' },
            { icon: Star,  value: '89%',  label: 'Satisfaction',   color: '#2D8CFF' },
          ].map((item, i) => (
            <div key={i} className={`glass-card gradient-border ${cardColor(i)} card-hover rounded-2xl p-6 text-center`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${item.color}10` }}>
                <item.icon size={19} style={{ color: item.color }} />
              </div>
              <div className="text-3xl font-black gradient-text mb-1">{item.value}</div>
              <div className="text-white/40 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────
function Team({ visible }: { visible: Record<string, boolean> }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const members = [
    { name: 'M. RM. ANNAMALAI', role: 'Creative Lead', tag: 'SMM & Design', experience: '3+ years · 100+ clients', expertise: 'Social Media Marketing, Video Editing, Graphic Design, Logo, Branding, Packaging', education: 'B.Tech – AI & Data Science, Ramco Institute', image: '/images/annamalai-photo.jpg', color: '#2D8CFF' },
    { name: 'V. RAM VISWANATH',  role: 'Media Production', tag: 'Ads & Production', experience: '2+ years · 25+ clients', expertise: 'Videography, Video Editing, Photography, Poster Design, Meta Ads, Social Media', education: 'B.Tech – AI & Data Science, Ramco Institute', image: '/images/viswanath-photo.jpg', color: '#7B3FE4' },
    { name: 'V. RAM ROJITH',     role: 'Digital Strategist', tag: 'Tech Lead', experience: '3+ years · 25+ clients', expertise: 'Content Strategy, Meta Ads, Web Development, Landing Pages, AI Chatbot Development', education: 'B.Tech – AI & Data Science, Ramco Institute', image: '/images/rojith-photo.jpg', color: '#D91E9B' },
  ];

  return (
    <section id="team" className="py-28 px-6"
      style={{ background: 'rgba(6,6,10,0.65)' }}>
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-16 section-reveal ${visible['team'] ? 'visible' : ''}`}>
          <span className="text-sm font-semibold tracking-widest uppercase gradient-text mb-3 block">The Team</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Meet the <span className="gradient-text">Minds</span> Behind It
          </h2>
          <p className="text-white/40 text-lg">Click a card to see the face behind the work.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {members.map((m, i) => (
            <div key={i}
              className={`flip-card h-[400px] section-reveal ${visible['team'] ? 'visible' : ''} ${flipped[i] ? 'flipped' : ''}`}
              style={{ transitionDelay: `${i * 90}ms` }}
              onClick={() => setFlipped(p => ({ ...p, [i]: !p[i] }))}>
              <div className="flip-card-inner">
                {/* Front */}
                <div className={`flip-card-front glass-card gradient-border ${cardColor(i)} p-7 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: `${m.color}12`, color: m.color }}>{m.tag}</span>
                      <RotateCcw size={13} className="text-white/30" />
                    </div>
                    <h3 className="text-white font-black text-lg mb-1 tracking-tight">{m.name}</h3>
                    <p className="font-semibold mb-3 text-sm" style={{ color: m.color }}>{m.role}</p>
                    <p className="text-white/40 text-xs mb-3">{m.experience}</p>
                    <p className="text-white/50 text-xs leading-relaxed">
                      <span className="text-white/80 font-medium">Expertise: </span>{m.expertise}
                    </p>
                  </div>
                  <p className="text-white/40 text-xs mt-4">
                    <span className="text-white/60 font-medium">Education: </span>{m.education}
                  </p>
                </div>
                {/* Back */}
                <div className={`flip-card-back glass-card gradient-border ${cardColor(i)} p-7 flex flex-col items-center justify-center text-center`}>
                  <img src={m.image} alt={m.name} className="team-photo" />
                  <h3 className="text-white font-black text-lg mb-1">{m.name}</h3>
                  <p className="text-sm font-semibold mb-2" style={{ color: m.color }}>{m.role}</p>
                  <p className="text-white/40 text-xs mb-4">{m.experience}</p>
                  <div className="flex items-center gap-1 text-xs text-white/30">
                    <RotateCcw size={11} /> Click to flip back
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Portfolio ────────────────────────────────────────────────────────────────
function Portfolio({ visible }: { visible: Record<string, boolean> }) {
  const projects = [
    { title: 'Video Editing Portfolio', desc: 'Cinematic storytelling, smooth transitions, and engaging visual effects.', link: 'https://drive.google.com/drive/folders/15aYEnpyxbD5NR1BsDrjrPMb-iH77EBgM', tag: 'Video',       color: '#2D8CFF' },
    { title: 'Poster Design Portfolio', desc: 'Creative poster designs for events, marketing, and branding.',             link: 'https://drive.google.com/drive/folders/1WvQaUk6UPOWPuqs_KBV1LATtggz3tkq6', tag: 'Design',      color: '#7B3FE4' },
    { title: 'Vaigai Namma Taxi',       desc: 'Modern, responsive web application with clean design and smooth UX.',     link: 'https://vaigainammataxi.netlify.app',                                        tag: 'Website',     color: '#D91E9B' },
    { title: 'URS Choice – Landing',    desc: 'Real estate landing page optimized for inquiries and trust-building.',    link: 'https://urs-choice-landing-page.vercel.app',                                tag: 'Landing Page', color: '#2D8CFF' },
    { title: 'Lio Maxx – Ayurvedic',   desc: 'Wellness-focused landing page designed for credibility and conversions.', link: 'https://www.liomaxx.com/',                                                  tag: 'Website',     color: '#7B3FE4' },
  ];

  return (
    <section id="portfolio" className="py-28 px-6 relative overflow-hidden"
      >
      <div className="absolute right-0 bottom-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle at 90% 90%, rgba(217,30,155,0.05), transparent 55%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className={`text-center mb-16 section-reveal ${visible['portfolio'] ? 'visible' : ''}`}>
          <span className="text-sm font-semibold tracking-widest uppercase gradient-text mb-3 block">Our Work</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-white/40 text-lg">Real results for real brands.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <div key={i}
              className={`glass-card gradient-border ${cardColor(i)} card-hover rounded-2xl p-6 flex flex-col justify-between group section-reveal ${visible['portfolio'] ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 70}ms` }}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${p.color}12`, color: p.color }}>{p.tag}</span>
                  <ArrowRight size={15} className="text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
                <h3 className="text-white font-bold text-base mb-2 tracking-tight">{p.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{p.desc}</p>
              </div>
              <div className="flex gap-3 mt-6">
                <a href={p.link} target="_blank" rel="noopener noreferrer"
                  className="btn-primary flex-1 py-2.5 rounded-xl text-white text-sm font-semibold text-center block">
                  View Project
                </a>
                <button onClick={() => openWhatsApp(`Hi ARRISE DIGITAL, I'd like a project similar to ${p.title}.`)}
                  className="btn-ghost px-4 py-2.5 rounded-xl text-sm font-medium">
                  Discuss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials({ visible }: { visible: Record<string, boolean> }) {
  const reviews = [
    { name: 'Raanarajan',    role: 'Real Estate Developer', text: 'ARRISE DIGITAL transformed our social media presence completely. Our engagement went up 120% in just 45 days!', rating: 5 },
    { name: 'Priya Sharma',  role: 'E-commerce Founder', text: 'The website they built for us is stunning and converts really well. Professional team, premium results.',         rating: 5 },
    { name: 'Mohammed Ali',  role: 'Real Estate Agent',  text: 'Their Meta Ads campaigns brought us qualified leads consistently. Best investment we made for our business.',      rating: 5 },
    { name: 'Kavitha Nair',  role: 'Boutique Owner',     text: 'The content creation and video editing quality is top-notch. Our brand looks premium now.',                       rating: 5 },
  ];

  return (
    <section id="testimonials" className="py-28 px-6"
      style={{ background: 'rgba(6,6,10,0.6)' }}>
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-16 section-reveal ${visible['testimonials'] ? 'visible' : ''}`}>
          <span className="text-sm font-semibold tracking-widest uppercase gradient-text mb-3 block">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            What Clients <span className="gradient-text">Say</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((r, i) => (
            <div key={i}
              className={`glass-card gradient-border ${cardColor(i)} card-hover rounded-2xl p-7 section-reveal ${visible['testimonials'] ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-5">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full btn-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {r.name[0]}
                </div>
                <div>
                  <div className="text-white/90 font-semibold text-sm">{r.name}</div>
                  <div className="text-white/40 text-xs">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner({ scrollTo }: { scrollTo: (id: string) => void }) {
  return (
    <section className="py-20 px-6" >
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(45,140,255,0.06), rgba(123,63,228,0.08), rgba(217,30,155,0.06))', border: '1px solid rgba(123,63,228,0.12)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(123,63,228,0.06), transparent 65%)' }} />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Let's Build Your <span className="gradient-text">Brand</span>
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Ready to scale? Let's talk about your goals and build something remarkable together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => scrollTo('contact')}
                className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 group">
                Book a Free Call <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => openWhatsApp()}
                className="btn-ghost px-8 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2">
                <MessageCircle size={17} /> WhatsApp Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact({ visible }: { visible: Record<string, boolean> }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd   = new FormData(form);
    const data: ContactFormData = {
      name:         fd.get('name')         as string,
      email:        fd.get('email')        as string,
      services:     fd.get('services')     as string,
      budget:       fd.get('budget')       as string,
      requirements: fd.get('requirements') as string,
    };
    setStatus('sending');
    const result = await sendContactEmails(data);
    if (result.success) {
      setStatus('success');
      form.reset();
      const msg = `Hi ARRISE DIGITAL!\n\nName: ${data.name}\nEmail: ${data.email}\nServices: ${data.services}\nBudget: ${data.budget}\nRequirements:\n${data.requirements}`;
      setTimeout(() => openWhatsApp(msg), 800);
      setTimeout(() => setStatus('idle'), 5000);
    } else {
      setStatus('error');
      setErrMsg(result.error || 'Something went wrong. Please try WhatsApp instead.');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const inputCls = "w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/20 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm shadow-sm";

  return (
    <section id="contact" className="py-28 px-6"
      >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        {/* Left */}
        <div className={`section-reveal ${visible['contact'] ? 'visible' : ''}`}>
          <span className="text-sm font-semibold tracking-widest uppercase gradient-text mb-4 block">Contact</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            Let's Work <span className="gradient-text">Together</span>
          </h2>
          <p className="text-white/50 text-lg leading-relaxed mb-10">
            Tell us about your project and we'll get back to you within 24 hours.
          </p>
          <div className="space-y-4">
            {[
              { icon: MessageCircle, label: 'WhatsApp',  value: '+91 73051 15192',        action: () => openWhatsApp() },
              { icon: Mail,          label: 'Email',     value: 'arrisedigital@gmail.com', action: () => window.open('mailto:arrisedigital@gmail.com') },
              { icon: Instagram,     label: 'Instagram', value: '@arrisedigital',          action: () => window.open('https://www.instagram.com/arrisedigital','_blank') },
            ].map((c, i) => (
              <button key={i} onClick={c.action}
                className={`flex items-center gap-4 w-full glass-card gradient-border ${cardColor(i)} rounded-2xl p-4 hover:shadow-md transition-all group text-left`}>
                <div className="w-10 h-10 rounded-xl btn-primary flex items-center justify-center flex-shrink-0">
                  <c.icon size={17} className="text-white" />
                </div>
                <div>
                  <div className="text-white/40 text-xs">{c.label}</div>
                  <div className="text-white/90 font-medium text-sm">{c.value}</div>
                </div>
                <ArrowRight size={15} className="ml-auto text-white/20 group-hover:text-white/40 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className={`section-reveal ${visible['contact'] ? 'visible' : ''}`} style={{ transitionDelay: '180ms' }}>
          <div className="glass-card gradient-border card-blue rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block font-medium">Your Name</label>
                  <input type="text" name="name" required placeholder="John Doe" className={inputCls} />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block font-medium">Email Address</label>
                  <input type="email" name="email" required placeholder="you@email.com" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1.5 block font-medium">Services Needed</label>
                <input type="text" name="services" required placeholder="e.g., Web Dev, Social Media" className={inputCls} />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1.5 block font-medium">Budget Range</label>
                <select name="budget" required className={inputCls + ' cursor-pointer'}>
                  <option value="">Select budget</option>
                  <option value="Under ₹25,000">Under ₹25,000</option>
                  <option value="₹25,000 – ₹50,000">₹25,000 – ₹50,000</option>
                  <option value="₹50,000 – ₹1,00,000">₹50,000 – ₹1,00,000</option>
                  <option value="Above ₹1,00,000">Above ₹1,00,000</option>
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1.5 block font-medium">Project Requirements</label>
                <textarea name="requirements" required rows={4} placeholder="Tell us about your project..." className={inputCls + ' resize-none'} />
              </div>
              <button type="submit"
                disabled={status === 'sending'}
                className="btn-primary w-full py-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 group disabled:opacity-70">
                {status === 'sending' ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <>Send via WhatsApp <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
              {status === 'success' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
                  <CheckCircle size={16} /> Sent! Check your email for confirmation. Redirecting to WhatsApp...
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> {errMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ scrollTo }: { scrollTo: (id: string) => void }) {
  return (
    <footer className="border-t border-white/10 py-12 px-6" style={{ background: 'rgba(5,5,7,0.85)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg btn-primary flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <div>
              <div className="text-white font-black text-lg tracking-tight"><span className="gradient-text">ARR</span>ISE DIGITAL</div>
              <div className="text-white/40 text-xs">Social Media Growth Agency · Madurai</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {['About','Services','Portfolio','Contact'].map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase())}
                className="text-white/40 hover:text-white/80 text-sm transition-colors">{l}</button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {[
              { icon: Instagram, href: 'https://www.instagram.com/arrisedigital', label: 'Instagram' },
              { icon: Mail,      href: 'mailto:arrisedigital@gmail.com',          label: 'Email' },
              { icon: MessageCircle, href: '#', label: 'WhatsApp', onClick: (e: React.MouseEvent) => { e.preventDefault(); openWhatsApp(); } },
            ].map((s, i) => (
              <a key={i} href={s.href} target={s.href !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer" onClick={s.onClick}
                className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white/80 hover:border-white/20 transition-all hover:scale-110"
                aria-label={s.label}>
                <s.icon size={15} />
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-white/30 text-xs">© 2025 ARRISE DIGITAL. All rights reserved.</p>
          <p className="text-white/30 text-xs">+91 73051 15192 · +91 9363973591 · arrisedigital@gmail.com</p>
        </div>
      </div>
    </footer>
  );
}

// ─── WhatsApp FAB ─────────────────────────────────────────────────────────────
function WhatsAppFAB() {
  return (
    <button onClick={() => openWhatsApp()}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 group"
      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 8px 24px rgba(37,211,102,0.35)' }}
      title="Chat on WhatsApp" aria-label="Chat on WhatsApp">
      <MessageCircle size={24} className="text-white fill-white" />
      <span className="absolute right-16 bg-white text-white/80 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md border border-white/10">
        Chat with us
      </span>
    </button>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const visible = useReveal();
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen">
      <Nav scrollTo={scrollTo} />
      <main>
        <Hero scrollTo={scrollTo} />
        <MarqueeBanner />
        <Services visible={visible} />
        <About visible={visible} />
        <Team visible={visible} />
        <Portfolio visible={visible} />
        <Testimonials visible={visible} />
        <CTABanner scrollTo={scrollTo} />
        <Contact visible={visible} />
      </main>
      <Footer scrollTo={scrollTo} />
      <WhatsAppFAB />
      <ChatBot />
    </div>
  );
}





