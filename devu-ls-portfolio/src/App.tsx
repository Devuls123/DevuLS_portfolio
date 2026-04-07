/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, 
  Github, 
  Linkedin, 
  Menu, 
  X, 
  ChevronRight, 
  MapPin, 
  Code, 
  Cpu, 
  Brain, 
  Database,
  ExternalLink,
  ArrowUpRight
} from "lucide-react";
import { useState, useEffect, ReactNode, FormEvent } from "react";
import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp, getDocFromServer, doc } from "firebase/firestore";

// --- Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

const GlassPanel = ({ children, className = "", delay = 0 }: { children: ReactNode, className?: string, delay?: number, key?: string | number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className={`glass-panel rounded-lg ${className}`}
  >
    {children}
  </motion.div>
);

const ThermalButton = ({ children, className = "", href, primary = true }: { children: ReactNode, className?: string, href?: string, primary?: boolean }) => {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        px-8 py-4 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300
        ${primary 
          ? "thermal-gradient text-white thermal-shadow uppercase tracking-widest" 
          : "bg-surface-container text-white border border-white/10 hover:bg-white/10"
        }
        ${className}
      `}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{content}</a>;
  }
  return <button>{content}</button>;
};

const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-24 text-center md:text-left">
    <motion.h2 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <p className="text-on-surface-variant uppercase tracking-[0.4em] text-[0.65rem] font-black mb-4">
        {subtitle}
      </p>
    )}
    <motion.div 
      initial={{ width: 0 }}
      whileInView={{ width: "8rem" }}
      viewport={{ once: true }}
      className="h-1 thermal-gradient rounded-full mx-auto md:mx-0"
    />
  </div>
);

// --- Sections ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Works", href: "#work" },
    { name: "Experience", href: "#experience" },
    { name: "Stack", href: "#stack" },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-black/80 backdrop-blur-xl py-4" : "bg-transparent py-8"}`}>
      <nav className="flex justify-between items-center w-full px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <span className="text-xl font-black text-white uppercase">DEVU L S</span>
        </motion.div>

        <div className="hidden md:flex gap-10 items-center">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href} 
              className="text-on-surface-variant hover:text-white transition-colors text-sm uppercase tracking-widest font-medium"
            >
              {link.name}
            </a>
          ))}
          <a href="#contact" className="text-primary font-black text-sm uppercase tracking-widest hover:text-primary-container transition-colors">
            Contact
          </a>
        </div>

        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-container-low border-b border-white/5 overflow-hidden"
          >
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="text-lg font-bold text-white uppercase tracking-widest"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a 
                href="#contact" 
                className="text-lg font-black text-primary uppercase tracking-widest"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const CurrentlyCard = () => {
  const titles = [
    "Creative Problem Solver",
    "AI and Automation Developer",
    "Frontend Developer",
    "Data Analyst"
  ];
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % titles.length);
  };

  useEffect(() => {
    const timer = setInterval(handleNext, 3000);
    return () => clearInterval(timer);
  }, [index]); // Re-run effect when index changes to reset the 3s timer

  return (
    <GlassPanel className="p-10 flex flex-col justify-between relative overflow-hidden group min-h-[240px]" delay={0.2}>
      <div>
        <p className="text-[0.7rem] font-bold tracking-[0.3em] text-on-surface-variant mb-10 uppercase">Currently</p>
        <div className="h-24 flex items-center">
          <AnimatePresence mode="wait">
            <motion.h3 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-white leading-tight"
            >
              {titles[index]}
            </motion.h3>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center justify-between mt-8">
        <div className="flex gap-2">
          {titles.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-8 bg-primary" : "w-2 bg-white/10"}`}
            ></div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          className="group/btn"
        >
          <ChevronRight className="text-5xl text-white/10 group-hover/btn:text-primary transition-colors duration-500 cursor-pointer" size={48} />
        </motion.button>
      </div>
    </GlassPanel>
  );
};

const Hero = () => (
  <section className="min-h-screen pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col justify-center">
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
      {/* Hero Info Card */}
      <GlassPanel className="p-10 md:p-14 flex flex-col justify-between">
        <div>
          <p className="text-[0.7rem] font-bold tracking-[0.3em] text-on-surface-variant mb-10 uppercase">Portfolio · 2026</p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-none mb-12"
          >
            DEVU<br/>L S
          </motion.h1>
          <p className="text-on-surface-variant text-lg max-w-md leading-relaxed mb-12">
            Software Engineer specializing in AI-driven solutions, automation, and community building. Carving digital experiences from the void.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <ThermalButton href="mailto:lsdevu3@gmail.com">
            <Mail size={16} /> Email me
          </ThermalButton>
          <ThermalButton primary={false} href="https://github.com/Devuls123">
            <Github size={16} /> GitHub
          </ThermalButton>
          <ThermalButton primary={false} href="https://in.linkedin.com/in/devu-l-s">
            <Linkedin size={16} /> LinkedIn
          </ThermalButton>
        </div>
      </GlassPanel>

      <div className="flex flex-col gap-6">
        {/* Currently Card */}
        <CurrentlyCard />

        {/* Location Card */}
        <GlassPanel className="p-10 flex flex-col justify-between" delay={0.4}>
          <div className="flex gap-5 items-start">
            <div className="w-14 h-14 rounded-lg bg-surface-container border border-white/10 flex items-center justify-center">
              <MapPin className="text-primary" size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-1">Kerala, India</h4>
              <p className="text-sm text-on-surface-variant">UTC +5:30</p>
            </div>
          </div>
          <div className="mt-10">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Available for work</span>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  </section>
);

const Works = () => {
  const projects = [
    {
      title: "Smart Hospital",
      category: "AI & Healthcare",
      description: "AI-Powered Queue Management and Live Tracking system for streamlined patient flow.",
      tags: ["Python", "FastAPI"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9jE9BkqZ_DhhKShVcn7_DfeFLtMSSJyrWhRNF9v6kEX7l-MOZL52IawFSD19X0nFJXYp6jgFHSAdESCTla7yhk8gfX6atD1iJ0jMUVI-Q1sxg5v1RtNHzjvgHFLMVGul4F9k7JKewHAvaBEEp_pvJiPZdBwFodrm7xNetAQMB16jm45UB5c5qCR30iPGvOdfpaY-bvm1OGcLRdcXvPiaoqEbXVcfC9B358IqDrrf5uvHZu3ZdyEokmbmtJYFZ_D9iuIBMtiilUuwu"
    },
    {
      title: "Certificate Generator",
      category: "Automation Tool",
      description: "Mass production system with dynamic customization for event-scale certification.",
      tags: ["NodeJS", "Canvas API"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWvTS6_BQXN47xw1gX8PMZ4qtjBRapl62imdpMDEy3T0aAP28Z9-U4-lPSwEKexI5htOinKNl-0O4fFsF8WvwhRtaaigUvA_MV_1sDed9Z3nBTNW9m7URbw8rxjD3rVJtIeQOAaRI-F9_Bz-caZDjEjsfsFJyeYSe8OgNHD8ekvknYyObiPqa1bqB0xH7k_mBtThFMYmtH-wcoVeVPdtFbOumSw0GpDoy4X01mxr4Fnupt7R0geJLknee739-WFjzFz5tg-HEl3XAy"
    },
    {
      title: "Connecting Skies",
      category: "Multimedia Experience",
      description: "Multimedia integration platform for creating shared, immersive digital experiences.",
      tags: ["WebSockets", "Three.js"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCs0xNOsAbBkcDNnsVzp0zdOYDziGQoWZviBMRjyLwoqzwvE_rWwpof5dFtaDD0S3ixEcoBSq5Va6nV4r6byA_6H7ujDm77RdgY3gn4dRqzO5WcfD61hVgfqtV1WckoD-K39ToiLgoQZq-sYu2cTFyLA8ilGRb1gKnPoVX5x5AgxJgiarZAMIovXhCS9YnHvbH5_-j4vMvnzRzKUuvs9z2_E5RNXiaaX9x_TU9LyuGMpfBoxdSQXpuVUYcNquvXaHfYRfyOK8Zm54Pe"
    }
  ];

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto" id="work">
      <SectionHeader title="Works" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {projects.map((project, idx) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: idx * 0.2 }}
            className="group relative glass-panel rounded-lg overflow-hidden transition-all duration-700 hover:border-primary/30"
          >
            <div className="aspect-[4/3] w-full relative overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-12 h-12 rounded-full thermal-gradient flex items-center justify-center">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>
            <div className="p-10">
              <span className="text-[0.65rem] uppercase tracking-[0.3em] text-primary font-black mb-4 block">{project.category}</span>
              <h3 className="text-2xl font-bold text-white mb-4">{project.title}</h3>
              <p className="text-on-surface-variant mb-8 leading-relaxed">{project.description}</p>
              <div className="flex flex-wrap gap-3">
                {project.tags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-surface-container-highest rounded-full text-[0.7rem] font-bold text-on-surface uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Experience = () => {
  const experiences = [
    {
      role: "Discord Moderator",
      company: "Mulearn LBSITW",
      period: "Present",
      description: "Fostering community growth, managing technical discourse, and organizing digital learning environments for aspiring engineers."
    },
    {
      role: "Membership Development Lead",
      company: "Capture Crew",
      period: "Present",
      description: "Strategizing growth initiatives and managing member onboarding for the premier creative community."
    },
    {
      role: "Core Member",
      company: "Robotics Club & TinkerHub LBSITW",
      period: "Active Roles",
      description: "Actively contributing to open-source projects, hardware-software integration, and technical workshops."
    }
  ];

  return (
    <section className="py-32 bg-surface-container-lowest relative" id="experience">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeader title="Experience" subtitle="Navigating the digital frontier" />
        
        <div className="relative border-l border-white/10 ml-4 md:ml-0">
          {experiences.map((exp, idx) => (
            <motion.div 
              key={exp.role}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              className="mb-20 relative pl-12"
            >
              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_20px_rgba(255,77,0,0.8)]"></div>
              <span className="text-xs font-black text-primary mb-3 block uppercase tracking-widest">{exp.period}</span>
              <h3 className="text-3xl font-bold text-white mb-2">{exp.role}</h3>
              <p className="text-xl text-on-surface-variant mb-5 font-medium">{exp.company}</p>
              <p className="text-on-surface-variant/70 leading-relaxed text-lg">{exp.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TechStack = () => {
  const skills = [
    { name: "JavaScript", icon: <Code />, desc: "Full-stack development & interactivity" },
    { name: "Python", icon: <Code />, desc: "Automation, AI & backend logic" },
    { name: "C++", icon: <Cpu />, desc: "Systems programming & Robotics" },
    { name: "AI & ML", icon: <Brain />, desc: "Neural networks and predictive analytics" }
  ];

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto" id="stack">
      <SectionHeader title="Tech Stack" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skills.map((skill, idx) => (
          <GlassPanel 
            key={skill.name} 
            className={`p-10 flex flex-col justify-between hover:bg-surface-container-high transition-colors duration-500 ${idx === 3 ? 'border-primary/20 bg-primary/5' : ''}`}
            delay={idx * 0.1}
          >
            <div className="text-primary">
              {skill.icon}
            </div>
            <div className="mt-12">
              <h4 className="text-2xl font-bold text-white">{skill.name}</h4>
              <p className="text-sm text-on-surface-variant mt-2">{skill.desc}</p>
            </div>
          </GlassPanel>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-6 mt-6">
        <GlassPanel className="p-8 flex items-center justify-center text-xl font-bold uppercase tracking-[0.2em]" delay={0.4}>
          NodeJS
        </GlassPanel>
        <GlassPanel className="p-8 flex items-center justify-center text-xl font-bold uppercase tracking-[0.2em]" delay={0.5}>
          MySQL
        </GlassPanel>
      </div>
    </section>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const path = 'contacts';
    try {
      await addDoc(collection(db, path), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setSubmitStatus({ type: 'success', message: 'Message sent successfully! I will get back to you soon.' });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Failed to send message. Please try again later.' });
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-32 px-6 bg-black border-t border-white/5" id="contact">
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="Get in Touch" />
        
        <GlassPanel className="p-10 md:p-16">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[0.65rem] font-black text-primary uppercase tracking-[0.2em] ml-1" htmlFor="name">Name</label>
                <input 
                  className="w-full px-6 py-5 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary focus:ring-0 outline-none transition-all duration-300 placeholder:text-on-surface-variant/30" 
                  id="name" 
                  placeholder="John Doe" 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[0.65rem] font-black text-primary uppercase tracking-[0.2em] ml-1" htmlFor="email">Email</label>
                <input 
                  className="w-full px-6 py-5 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary focus:ring-0 outline-none transition-all duration-300 placeholder:text-on-surface-variant/30" 
                  id="email" 
                  placeholder="john@example.com" 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[0.65rem] font-black text-primary uppercase tracking-[0.2em] ml-1" htmlFor="message">Message</label>
              <textarea 
                className="w-full px-6 py-5 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary focus:ring-0 outline-none transition-all duration-300 min-h-[200px] resize-none placeholder:text-on-surface-variant/30" 
                id="message" 
                placeholder="How can I help you?"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>
            {submitStatus && (
              <div className={`p-4 rounded-lg text-sm font-bold ${submitStatus.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {submitStatus.message}
              </div>
            )}
            <div className="pt-6">
              <button 
                disabled={isSubmitting}
                className="w-full thermal-gradient text-white py-6 rounded-full font-black text-xl hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-primary/20 uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </GlassPanel>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-black w-full py-20 px-12 border-t border-white/5">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
      <div className="flex flex-col items-center md:items-start gap-4">
        <span className="text-white font-black text-2xl">DEVU L S</span>
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-on-surface-variant/50">© 2026 DEVU L S. CARVED FROM THE VOID.</p>
      </div>
      <div className="flex gap-12">
        <a className="text-on-surface-variant/70 hover:text-primary transition-colors text-[0.65rem] font-black uppercase tracking-[0.3em]" href="https://github.com/Devuls123" target="_blank">GitHub</a>
        <a className="text-on-surface-variant/70 hover:text-primary transition-colors text-[0.65rem] font-black uppercase tracking-[0.3em]" href="https://in.linkedin.com/in/devu-l-s" target="_blank">LinkedIn</a>
        <a className="text-on-surface-variant/70 hover:text-primary transition-colors text-[0.65rem] font-black uppercase tracking-[0.3em]" href="mailto:lsdevu3@gmail.com">Email</a>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="relative">
      <Navbar />
      <Hero />
      <Works />
      <Experience />
      <TechStack />
      <Contact />
      <Footer />
    </div>
  );
}
