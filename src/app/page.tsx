import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  Scale,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import PollStatsWarmup from "@/components/PollStatsWarmup";
import ResponseCounters from "@/components/ResponseCounters";

// Static HTML keeps the landing page fast. Aggregate data loads separately.
export const revalidate = 300;

export const metadata = {
  title: "Fairness-Aware AI Routine Generator · Research Project",
  description:
    "Take part in our university scheduling research. Open the student and teacher survey or the time-slot rating survey—no account needed.",
};

export default function Home() {
  return (
    <div className="research-site">
      <PollStatsWarmup />
      <a href="#surveys" className="research-skip-link">Skip to surveys</a>

      <header className="research-header">
        <div className="research-container research-header-inner">
          <Link href="/" className="research-brand" aria-label="Fairness-Aware AI Routine Generator — home">
            <span className="research-brand-icon"><Layers3 size={23} strokeWidth={1.8} /></span>
            <span>
              <span className="research-brand-name">Fairness-Aware AI Routine Generator</span>
              <span className="research-brand-caption">Research Project</span>
            </span>
          </Link>
          <nav className="research-navigation" aria-label="Main navigation">
            <a href="#about" className="research-nav-about">About the research</a>
            <Link href="/results/form1" className="research-results-link">
              <BarChart3 size={16} /> <span>Live results</span> <ArrowUpRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="research-intro research-container" aria-labelledby="research-heading">
          <div className="research-eyebrow"><span /> University of Asia Pacific · Research study</div>
          <h1 id="research-heading">Better schedules.<br className="mobile-break" /> <span>Fairer opportunities.</span></h1>
          <p className="research-intro-text">Your experience can help shape a more balanced university routine.<br className="desktop-break" /> Choose a short survey below. Start with either one.</p>
          <p lang="bn" className="research-intro-bn">আপনার মতামত গুরুত্বপূর্ণ। নিচের যেকোনো জরিপ দিয়ে শুরু করুন।</p>
        </section>

        <section id="surveys" className="research-container research-surveys" aria-labelledby="survey-heading">
          <div className="research-section-label">
            <h2 id="survey-heading"><UsersRound size={16} /> Participate in our research</h2>
            <span><Clock3 size={14} /> Just a few minutes</span>
          </div>

          <div className="research-survey-grid">
            <article className="research-survey-card survey-purple">
              <div className="research-card-top">
                <span className="research-survey-icon"><GraduationCap size={27} strokeWidth={1.6} /></span>
                <span className="research-form-label">Form 01</span>
                <span className="research-time"><Clock3 size={14} /> 2–3 min</span>
              </div>
              <h3>Student &amp; Teacher Survey</h3>
              <p lang="bn" className="research-card-bn">শিক্ষার্থী ও শিক্ষক জরিপ</p>
              <p className="research-card-description">Tell us what a better class routine looks like for you—from daily timing and breaks to a fair teaching workload.</p>
              <div className="research-card-tags"><span><UsersRound size={13} /> Students &amp; teachers</span><span>Bangla + English</span></div>

              <div className="research-card-action">
                <Link href="/form1" className="research-open-button" aria-label="Open Form 1 — Student and Teacher Survey">
                  <span>Open Form 1</span><ArrowRight size={19} />
                </Link>
                <span className="research-card-note"><ShieldCheck size={13} /> No account needed</span>
              </div>
            </article>

            <article className="research-survey-card survey-teal">
              <div className="research-card-top">
                <span className="research-survey-icon"><CalendarDays size={27} strokeWidth={1.6} /></span>
                <span className="research-form-label">Form 02</span>
                <span className="research-time"><Clock3 size={14} /> 2 min</span>
              </div>
              <h3>Time-Slot Rating Survey</h3>
              <p lang="bn" className="research-card-bn">সময়ের পছন্দ রেটিং জরিপ</p>
              <p className="research-card-description">Rate seven daily class slots and share your views on long campus gaps and fairness from one semester to the next.</p>
              <div className="research-card-tags"><span><Clock3 size={13} /> 7 time slots</span><span>1–5 rating scale</span></div>

              <div className="research-card-action">
                <Link href="/form2" className="research-open-button" aria-label="Open Form 2 — Time-Slot Rating Survey">
                  <span>Open Form 2</span><ArrowRight size={19} />
                </Link>
                <span className="research-card-note"><ShieldCheck size={13} /> No account needed</span>
              </div>
            </article>
          </div>

          <div className="research-trust-strip">
            <span><ShieldCheck size={15} /> No name or email collected</span>
            <span><CheckCircle2 size={15} /> One response per browser</span>
            <span><BarChart3 size={15} /> Results after your selection</span>
          </div>
        </section>

        <section id="about" className="research-container research-about" aria-labelledby="about-heading">
          <div className="research-about-main">
            <div className="research-eyebrow"><Sparkles size={14} /> The research behind the surveys</div>
            <h2 id="about-heading">Fairness-Aware AI<br />Routine Generator</h2>
            <p>We&apos;re exploring how an AI-assisted timetable can balance student preferences, faculty workloads and practical scheduling constraints—without leaving the same people with inconvenient slots every semester.</p>
            <span className="research-stage"><span /> Research &amp; data collection phase</span>
          </div>
          <div className="research-principles">
            <div><span className="research-principle-icon purple"><GraduationCap size={20} /></span><span><h3>Student preferences</h3><p>Learning time, travel, breaks and lab intensity.</p></span></div>
            <div><span className="research-principle-icon teal"><CalendarDays size={20} /></span><span><h3>Balanced teaching</h3><p>Space for teaching, consultation and research.</p></span></div>
            <div><span className="research-principle-icon amber"><Scale size={20} /></span><span><h3>Fairness over time</h3><p>More equitable opportunities across semesters.</p></span></div>
          </div>
        </section>

        <section className="research-container research-community" aria-labelledby="community-heading">
          <div className="research-section-label">
            <h2 id="community-heading"><BarChart3 size={16} /> Community participation</h2>
            <span>Aggregate responses only</span>
          </div>
          <ResponseCounters />
        </section>

        <div className="research-container research-privacy-note"><Check size={15} /><p>Choosing an option reveals that question&apos;s results. Your answers are recorded only when you press <strong>Submit</strong>. This project is a research study, not a live timetable generator.</p></div>
      </main>

      <footer className="research-footer">
        <div className="research-container research-footer-inner">
          <span><Layers3 size={17} /> Fairness-Aware AI Routine Generator</span>
          <span>Research Project · University of Asia Pacific</span>
        </div>
      </footer>
    </div>
  );
}
