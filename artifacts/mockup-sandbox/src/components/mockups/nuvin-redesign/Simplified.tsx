import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Heart,
  House,
  LockKeyhole,
  Mail,
  MessageCircle,
  Mic,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  Volume2,
  X,
} from "lucide-react";

type Screen = "home" | "profile" | "auth" | "onboarding";
type AuthMode = "signin" | "signup";
type ConversationMode = "chat" | "voice";

function NuvinMark({ small = false }: { small?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={small ? "nuvin-mark nuvin-mark-small" : "nuvin-mark"}
      viewBox="0 0 48 48"
      fill="none"
    >
      <path
        d="M24 4.8c8.9 0 16.1 7.2 16.1 16.1S32.9 37 24 37 7.9 29.8 7.9 20.9"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M24 11.1c-5.4 0-9.8 4.4-9.8 9.8v14.3c0 3 2.4 5.4 5.4 5.4h8.8c3 0 5.4-2.4 5.4-5.4"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M24 17.3v11.8"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="32.8" r="2.2" fill="currentColor" />
    </svg>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup${compact ? " brand-lockup-compact" : ""}`}>
      <span className="brand-icon"><NuvinMark small={compact} /></span>
      <span className="brand-word">nuvin</span>
    </div>
  );
}

export function Simplified() {
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<ConversationMode>("chat");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [age, setAge] = useState("");
  const [medicineDone, setMedicineDone] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [notice, setNotice] = useState("");

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  const handleAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    showNotice("Design preview only. No account was created and nothing was sent or saved.");
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!chatMessage.trim()) return;
    setChatMessage("");
    setChatReply("I’m here with you. Want to tell me a little more?");
  };

  const finishOnboarding = () => {
    setScreen("home");
    setOnboardingStep(0);
    showNotice("Your preferences are ready for this preview.");
  };

  const goToAuth = (nextMode: AuthMode) => {
    setAuthMode(nextMode);
    setScreen("auth");
  };

  return (
    <div className="nuvin-stage">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');
        .nuvin-stage {
          --paper: #f5f4ec;
          --paper-deep: #eceee3;
          --card: #fffef9;
          --ink: #203c39;
          --ink-soft: #647570;
          --line: #e4e8dc;
          --teal: #276a61;
          --teal-deep: #1d514a;
          --mint: #dcebe0;
          --mint-light: #edf5eb;
          --coral: #c77762;
          --coral-wash: #f4e5da;
          --sun: #e5c878;
          min-height: 100dvh;
          display: flex;
          justify-content: center;
          align-items: stretch;
          color: var(--ink);
          background:
            radial-gradient(ellipse at 8% 9%, rgba(220,235,224,.9), transparent 32%),
            radial-gradient(ellipse at 92% 92%, rgba(244,229,218,.6), transparent 30%),
            #e9ede4;
          font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .nuvin-stage * { box-sizing: border-box; }
        .phone {
          position: relative;
          width: min(100%, 420px);
          min-height: 100dvh;
          overflow: hidden;
          background: var(--paper);
          box-shadow: 0 22px 80px rgba(38,61,52,.14);
          display: flex;
          flex-direction: column;
        }
        .screen-scroll {
          flex: 1;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 21px 23px 112px;
          scrollbar-width: none;
          animation: appear .28s ease both;
        }
        .screen-scroll::-webkit-scrollbar { display: none; }
        @keyframes appear { from { opacity: .35; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 27px;
        }
        .brand-lockup { display: flex; align-items: center; gap: 9px; }
        .brand-icon {
          width: 39px; height: 39px; display: grid; place-items: center;
          border-radius: 14px; color: var(--teal-deep); background: var(--mint);
        }
        .nuvin-mark { width: 32px; height: 32px; }
        .nuvin-mark-small { width: 24px; height: 24px; }
        .brand-word {
          color: var(--ink); font-size: 23px; line-height: 1;
          letter-spacing: -.075em; font-weight: 700;
        }
        .brand-lockup-compact .brand-icon { width: 34px; height: 34px; border-radius: 12px; }
        .brand-lockup-compact .brand-word { font-size: 20px; }
        .top-actions { display: flex; gap: 8px; }
        .icon-button {
          width: 42px; height: 42px; border: 1px solid var(--line); border-radius: 15px;
          display: grid; place-items: center; color: var(--teal-deep); background: rgba(255,254,249,.75);
          cursor: pointer; transition: transform .16s ease, background .16s ease;
        }
        button { font: inherit; }
        button:focus-visible, input:focus-visible, textarea:focus-visible {
          outline: 3px solid rgba(39,106,97,.32); outline-offset: 2px;
        }
        .tap:active, .icon-button:active, .primary-button:active, .nav-item:active { transform: scale(.97); }
        .preview-banner {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 9px; margin-bottom: 16px; border-radius: 8px;
          color: #765744; background: #f3e8d7; font-size: 10px;
          text-transform: uppercase; letter-spacing: .105em; font-weight: 700;
        }
        .hello-kicker {
          margin: 0 0 7px; color: var(--teal); font-size: 11px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
        }
        .hello-title {
          margin: 0; color: var(--ink); font-family: 'Fraunces', Georgia, serif;
          font-weight: 500; letter-spacing: -.04em; font-size: clamp(31px, 8vw, 38px);
          line-height: 1.08;
        }
        .hello-subtitle { margin: 9px 0 0; color: var(--ink-soft); font-size: 14px; line-height: 1.5; }
        .mode-wrap {
          margin: 22px 0 19px; padding: 5px; display: grid; grid-template-columns: 1fr 1fr;
          border: 1px solid #e2e7dc; border-radius: 16px; background: #e9ede4;
        }
        .mode-button {
          min-height: 45px; border: 0; border-radius: 12px; cursor: pointer;
          display: inline-flex; justify-content: center; align-items: center; gap: 8px;
          color: #6f7f78; background: transparent; font-size: 13px; font-weight: 600;
          transition: background .2s ease, color .2s ease, box-shadow .2s ease, transform .15s ease;
        }
        .mode-button.active { color: var(--teal-deep); background: var(--card); box-shadow: 0 2px 8px rgba(47,69,57,.08); }
        .mode-panel {
          min-height: 155px; padding: 19px 18px 17px; position: relative; overflow: hidden;
          border-radius: 20px; background: #dcebe0;
        }
        .mode-panel:after {
          content: ""; position: absolute; width: 156px; height: 156px; right: -40px; top: 20px;
          border: 1px solid rgba(39,106,97,.12); border-radius: 50%;
          box-shadow: 0 0 0 15px rgba(39,106,97,.035), 0 0 0 31px rgba(39,106,97,.025);
          pointer-events: none;
        }
        .mode-panel-head { display: flex; align-items: flex-start; gap: 12px; position: relative; z-index: 1; }
        .mode-symbol {
          width: 42px; height: 42px; flex: 0 0 auto; display: grid; place-items: center;
          border-radius: 15px; color: #fffdf6; background: var(--teal);
        }
        .mode-copy { min-width: 0; padding-top: 1px; }
        .mode-copy h2 { margin: 0; font-size: 15px; line-height: 1.3; font-weight: 700; }
        .mode-copy p { max-width: 230px; margin: 4px 0 0; color: #57706a; font-size: 12px; line-height: 1.45; }
        .mode-action {
          position: relative; z-index: 1; margin: 13px 0 0 54px; padding: 0; border: 0;
          color: var(--teal-deep); display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 700; background: none; cursor: pointer;
        }
        .preview-note {
          margin: 10px 2px 0; color: #8a7566; font-size: 10px; line-height: 1.4;
        }
        .section-row { display: flex; align-items: center; justify-content: space-between; margin: 25px 0 10px; }
        .section-title { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: -.02em; }
        .eyebrow { color: #85918a; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
        .medicine-card {
          position: relative; overflow: hidden; padding: 17px 16px 15px; border: 1px solid #e7e5d8;
          border-radius: 18px; background: var(--card); box-shadow: 0 6px 18px rgba(43,68,55,.045);
        }
        .medicine-card:before { content: ""; position: absolute; left: 0; top: 16px; bottom: 16px; width: 3px; border-radius: 0 3px 3px 0; background: var(--coral); }
        .medicine-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .medicine-name { margin: 0; font-size: 14px; font-weight: 700; }
        .medicine-meta { margin: 5px 0 0; color: var(--ink-soft); font-size: 12px; line-height: 1.4; }
        .time-tag {
          flex: 0 0 auto; display: inline-flex; align-items: center; gap: 5px; border-radius: 9px;
          padding: 6px 8px; color: #8a5b43; background: var(--coral-wash); font-size: 10px; font-weight: 700;
        }
        .medicine-controls { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
        .taken-button {
          min-height: 38px; padding: 0 13px; display: inline-flex; align-items: center; gap: 6px;
          border: 0; border-radius: 11px; color: white; background: var(--teal);
          font-size: 12px; font-weight: 700; cursor: pointer; transition: transform .15s ease, background .2s;
        }
        .taken-button.done { color: var(--teal-deep); background: var(--mint); }
        .quiet-button { min-height: 38px; padding: 0 10px; border: 0; color: #77847d; background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; }
        .little-help {
          margin-top: 18px; padding: 14px 15px; display: flex; align-items: center; gap: 12px;
          border: 1px solid #e5e8dd; border-radius: 16px; background: rgba(255,254,249,.66);
          text-align: left; width: 100%; cursor: pointer; color: inherit;
          transition: transform .16s ease, background .16s ease;
        }
        .help-icon {
          width: 37px; height: 37px; flex: 0 0 auto; display: grid; place-items: center;
          color: #87644b; background: #f2e6d9; border-radius: 13px;
        }
        .help-copy { flex: 1; }
        .help-copy strong { display: block; font-size: 12px; }
        .help-copy span { display: block; margin-top: 3px; color: var(--ink-soft); font-size: 11px; }
        .bottom-nav {
          position: absolute; z-index: 3; left: 0; right: 0; bottom: 0;
          display: flex; justify-content: space-around; align-items: center;
          min-height: 74px; padding: 8px 20px max(10px, env(safe-area-inset-bottom));
          border-top: 1px solid rgba(224,228,218,.92); background: rgba(250,249,242,.96);
          backdrop-filter: blur(14px);
        }
        .nav-item {
          width: 82px; height: 52px; border: 0; border-radius: 14px; color: #85918a;
          background: transparent; display: flex; flex-direction: column; gap: 4px;
          align-items: center; justify-content: center; font-size: 10px; font-weight: 600;
          cursor: pointer; transition: transform .15s ease, color .18s ease, background .18s ease;
        }
        .nav-item.selected { color: var(--teal-deep); background: #eaf1e7; }
        .inner-header { display: flex; align-items: center; gap: 12px; margin: 1px 0 25px; }
        .back-button {
          width: 40px; height: 40px; display: grid; place-items: center; border: 1px solid var(--line);
          border-radius: 14px; color: var(--ink); background: var(--card); cursor: pointer;
        }
        .inner-heading { font-family: 'Fraunces', Georgia, serif; font-size: 28px; font-weight: 500; letter-spacing: -.04em; }
        .profile-hero {
          padding: 20px; border-radius: 21px; background: var(--mint-light); border: 1px solid #e1eadd;
        }
        .profile-avatar {
          width: 58px; height: 58px; display: grid; place-items: center; margin-bottom: 13px;
          border-radius: 20px; color: var(--teal-deep); background: #d7e8d9;
        }
        .profile-hero h2 { margin: 0; font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 23px; letter-spacing: -.025em; }
        .profile-hero p { margin: 5px 0 0; color: var(--ink-soft); font-size: 12px; line-height: 1.45; }
        .profile-group { margin-top: 22px; }
        .profile-label { margin: 0 0 9px 2px; color: #81908a; font-size: 10px; letter-spacing: .12em; font-weight: 700; text-transform: uppercase; }
        .settings-list { overflow: hidden; border: 1px solid var(--line); border-radius: 16px; background: var(--card); }
        .setting-row {
          width: 100%; min-height: 58px; padding: 0 14px; display: flex; align-items: center;
          gap: 11px; border: 0; border-bottom: 1px solid #edf0e9; color: var(--ink);
          text-align: left; background: transparent; cursor: pointer;
        }
        .setting-row:last-child { border-bottom: 0; }
        .setting-icon { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 10px; color: var(--teal); background: #edf4eb; }
        .setting-row span:nth-child(2) { flex: 1; font-size: 12px; font-weight: 600; }
        .setting-note { display: block; padding: 12px 14px; color: var(--ink-soft); font-size: 11px; line-height: 1.5; background: #fbfbf5; }
        .auth-prompt { margin: 9px 0 0; color: var(--ink-soft); font-size: 12px; line-height: 1.5; }
        .auth-form { margin-top: 27px; }
        .field-label { display: block; margin: 0 0 7px 2px; font-size: 11px; font-weight: 700; color: #52645d; }
        .field-wrap {
          display: flex; align-items: center; gap: 10px; min-height: 50px; padding: 0 14px;
          margin-bottom: 16px; border: 1px solid #dfe5da; border-radius: 13px; background: var(--card); color: #81908a;
        }
        .field-wrap input { width: 100%; min-width: 0; border: 0; outline: 0; color: var(--ink); background: transparent; font: inherit; font-size: 13px; }
        .field-wrap input::placeholder { color: #9ca7a0; }
        .primary-button {
          width: 100%; min-height: 50px; display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 8px; border: 0; border-radius: 14px; color: #fffdf7; background: var(--teal);
          font-weight: 700; font-size: 13px; cursor: pointer; transition: transform .15s ease, background .2s;
        }
        .auth-switch { text-align: center; margin-top: 17px; color: var(--ink-soft); font-size: 12px; }
        .text-action { padding: 5px; border: 0; color: var(--teal); background: transparent; font-size: inherit; font-weight: 700; cursor: pointer; }
        .privacy-card { display: flex; gap: 10px; margin-top: 23px; padding: 13px; border-radius: 14px; background: #edf2e8; color: #60756b; font-size: 11px; line-height: 1.45; }
        .steps-indicator { display: flex; gap: 6px; margin: 0 0 23px; }
        .step-dot { height: 4px; flex: 1; border-radius: 4px; background: #dfe6da; }
        .step-dot.active { background: var(--teal); }
        .onboarding-art {
          min-height: 185px; display: grid; place-items: center; margin: 0 0 24px;
          overflow: hidden; border-radius: 22px; background:
            radial-gradient(circle at 50% 48%, #f9f5e7 0 24%, transparent 24.5%),
            radial-gradient(circle at 50% 48%, rgba(197,221,197,.55) 0 38%, transparent 38.5%),
            #e8eee2;
        }
        .onboarding-art .brand-icon { width: 82px; height: 82px; border-radius: 28px; }
        .onboarding-art .nuvin-mark { width: 62px; height: 62px; }
        .onboarding-copy { margin: 0 0 20px; color: var(--ink-soft); font-size: 13px; line-height: 1.6; }
        .age-field { display: flex; gap: 10px; align-items: center; margin: 19px 0; }
        .age-field input {
          width: 100%; min-height: 50px; padding: 0 14px; border: 1px solid #dfe5da;
          border-radius: 13px; background: var(--card); color: var(--ink); font: inherit;
        }
        .skip-button { width: 100%; min-height: 42px; margin-top: 8px; border: 0; color: #66766e; background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; }
        .chat-head { display: flex; align-items: center; gap: 11px; padding: 13px 15px; margin: -5px -4px 20px; border: 1px solid var(--line); border-radius: 17px; background: var(--card); }
        .chat-head .brand-icon { width: 36px; height: 36px; border-radius: 13px; }
        .chat-head-title { flex: 1; font-size: 13px; font-weight: 700; }
        .chat-head-title small { display: block; margin-top: 3px; color: var(--ink-soft); font-weight: 500; font-size: 10px; }
        .chat-date { margin: 0 0 18px; text-align: center; color: #94a099; font-size: 10px; }
        .chat-bubble { max-width: 88%; padding: 13px 14px; margin-bottom: 12px; border-radius: 5px 16px 16px 16px; background: #e7eee3; color: var(--ink); font-size: 13px; line-height: 1.5; }
        .chat-bubble.user { margin-left: auto; border-radius: 16px 5px 16px 16px; color: #fffdf7; background: var(--teal); }
        .chat-preview-label { margin: 21px 0 11px; color: #9a8271; text-align: center; font-size: 10px; line-height: 1.4; }
        .chat-composer { position: sticky; bottom: 0; display: flex; align-items: center; gap: 8px; padding: 12px 0 2px; background: linear-gradient(transparent, var(--paper) 18%); }
        .chat-composer input { height: 46px; flex: 1; min-width: 0; padding: 0 15px; border: 1px solid #dfe5da; border-radius: 14px; background: var(--card); font: inherit; font-size: 12px; }
        .chat-send { width: 44px; height: 44px; display: grid; place-items: center; border: 0; border-radius: 14px; color: white; background: var(--teal); cursor: pointer; }
        .voice-preview {
          display: flex; flex-direction: column; align-items: center; text-align: center; padding: 21px 15px 20px;
          border-radius: 20px; background: #e6efe5; border: 1px solid #dfe9dd;
        }
        .voice-orb {
          width: 112px; height: 112px; display: grid; place-items: center; margin: 11px 0 17px;
          border: 1px solid rgba(39,106,97,.18); border-radius: 50%; color: #fffdf7;
          background: radial-gradient(circle at 32% 27%, #6e9e84, #276a61 68%, #20594f);
          box-shadow: 0 0 0 11px rgba(39,106,97,.055), 0 10px 26px rgba(39,106,97,.17);
          animation: breathe 3.2s ease-in-out infinite;
        }
        @keyframes breathe { 50% { transform: scale(1.035); } }
        .voice-preview h2 { margin: 0; font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 22px; }
        .voice-preview p { max-width: 270px; margin: 7px 0 0; color: var(--ink-soft); font-size: 12px; line-height: 1.5; }
        .voice-preview .preview-note { margin-top: 15px; }
        .modal-backdrop {
          position: absolute; z-index: 8; inset: 0; display: flex; align-items: flex-end; justify-content: center;
          padding: 16px; background: rgba(33,54,47,.3); animation: fade .18s ease both;
        }
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
        .sheet {
          width: 100%; max-width: 390px; padding: 17px 19px 21px; border-radius: 23px;
          background: var(--paper); box-shadow: 0 18px 50px rgba(32,60,57,.2);
          animation: lift .22s ease both;
        }
        @keyframes lift { from { transform: translateY(16px); opacity: .75; } to { transform: translateY(0); opacity: 1; } }
        .sheet-grip { width: 34px; height: 4px; margin: 0 auto 18px; border-radius: 3px; background: #d7ded4; }
        .sheet-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .sheet-top h2 { margin: 0; font-family: 'Fraunces', Georgia, serif; font-size: 22px; font-weight: 500; }
        .close-button { width: 34px; height: 34px; display: grid; place-items: center; border: 0; border-radius: 11px; color: #66766e; background: #e9eee5; cursor: pointer; }
        .vault-entry { display: flex; gap: 11px; padding: 13px 0; border-bottom: 1px solid var(--line); }
        .vault-entry:last-of-type { border: 0; }
        .vault-entry p { margin: 0; font-size: 12px; line-height: 1.45; }
        .vault-entry small { display: block; margin-top: 4px; color: #829089; font-size: 10px; }
        .preview-disclaimer { padding: 10px 11px; margin-top: 10px; border-radius: 12px; color: #8a7566; background: #f1e8da; font-size: 10px; line-height: 1.45; }
        .helpline-row { display: flex; gap: 9px; margin-top: 12px; }
        .helpline {
          flex: 1; min-height: 52px; display: flex; align-items: center; justify-content: center; gap: 7px;
          border: 1px solid #dce6d9; border-radius: 13px; color: var(--teal-deep); background: var(--mint-light);
          font-size: 11px; font-weight: 700; text-decoration: none;
        }
        .toast {
          position: absolute; z-index: 12; left: 17px; right: 17px; bottom: 86px;
          padding: 12px 14px; border-radius: 13px; color: #fffdf7; background: #304c45;
          font-size: 11px; line-height: 1.45; box-shadow: 0 8px 25px rgba(31,60,52,.18);
          animation: toast-in .2s ease both;
        }
        @keyframes toast-in { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
        @media (min-width: 520px) {
          .phone { min-height: min(900px, 100dvh); border-radius: 28px; margin: auto; }
          .nuvin-stage { padding: 18px; }
        }
        @media (max-height: 740px) {
          .screen-scroll { padding-top: 15px; }
          .topbar { margin-bottom: 19px; }
          .mode-wrap { margin-top: 17px; }
          .mode-panel { min-height: 142px; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *:before, *:after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
        }
      `}</style>

      <main className="phone" aria-label="Nuvin design preview">
        {screen === "home" && (
          <div className="screen-scroll" key="home">
            <header className="topbar">
              <Brand />
              <div className="top-actions">
                <button className="icon-button tap" aria-label="Open Memory Vault" onClick={() => setShowVault(true)}><Bookmark size={18} /></button>
                <button className="icon-button tap" aria-label="Open profile" onClick={() => setScreen("profile")}><UserRound size={18} /></button>
              </div>
            </header>
            <div className="preview-banner"><Sparkles size={12} /> Design preview</div>
            <p className="hello-kicker">A little space for you</p>
            <h1 className="hello-title">Take a breath.</h1>
            <p className="hello-subtitle">Good afternoon, Maya. We can take today one small thing at a time.</p>

            <div className="mode-wrap" role="tablist" aria-label="Choose how to connect">
              <button className={`mode-button${mode === "chat" ? " active" : ""}`} role="tab" aria-selected={mode === "chat"} onClick={() => setMode("chat")}><MessageCircle size={16} /> Chat</button>
              <button className={`mode-button${mode === "voice" ? " active" : ""}`} role="tab" aria-selected={mode === "voice"} onClick={() => setMode("voice")}><Volume2 size={16} /> Voice</button>
            </div>

            {mode === "chat" ? (
              <section className="mode-panel" aria-label="Chat preview">
                <div className="mode-panel-head">
                  <span className="mode-symbol"><MessageCircle size={19} /></span>
                  <div className="mode-copy"><h2>Here for a quiet moment</h2><p>Share what’s on your mind, or simply say hello.</p></div>
                </div>
                <button className="mode-action" onClick={() => setScreen("chat" as Screen)}>Open a conversation <ArrowRight size={14} /></button>
              </section>
            ) : (
              <section className="voice-preview" aria-label="Voice mode preview">
                <div className="voice-orb"><Mic size={29} strokeWidth={1.7} /></div>
                <h2>Speak when you’re ready</h2>
                <p>A familiar voice can make a quiet moment feel a little less quiet.</p>
                <div className="preview-note">Microphone is not active in this design preview.</div>
              </section>
            )}

            <div className="section-row">
              <h2 className="section-title">A gentle reminder</h2>
              <span className="eyebrow">Today</span>
            </div>
            <article className="medicine-card">
              <div className="medicine-head">
                <div>
                  <h3 className="medicine-name">Afternoon blood pressure medicine</h3>
                  <p className="medicine-meta">Amlodipine 5mg · with warm water</p>
                </div>
                <span className="time-tag"><Clock3 size={12} /> 2:30 pm</span>
              </div>
              <div className="medicine-controls">
                <button className={`taken-button${medicineDone ? " done" : ""}`} onClick={() => { setMedicineDone((value) => !value); showNotice(medicineDone ? "Reminder marked as due again." : "Marked as taken in this preview."); }}>
                  <Check size={14} /> {medicineDone ? "Taken" : "I’ve taken it"}
                </button>
                {!medicineDone && <button className="quiet-button" onClick={() => showNotice("A 15-minute snooze is previewed here.")}>Remind me later</button>}
              </div>
            </article>

            <button className="little-help tap" onClick={() => setShowHelp(true)}>
              <span className="help-icon"><Heart size={17} /></span>
              <span className="help-copy"><strong>Need a person?</strong><span>Find trusted support and helplines</span></span>
              <ChevronRight size={17} color="#81908a" />
            </button>
          </div>
        )}

        {screen === "chat" && (
          <div className="screen-scroll" key="chat">
            <header className="inner-header">
              <button className="back-button" aria-label="Back to home" onClick={() => setScreen("home")}><ArrowLeft size={18} /></button>
              <div className="chat-head" style={{ flex: 1, margin: 0 }}>
                <span className="brand-icon"><NuvinMark small /></span>
                <span className="chat-head-title">A moment together<small>Here with you</small></span>
              </div>
              <button className="icon-button" aria-label="Switch to voice" onClick={() => { setScreen("home"); setMode("voice"); }}><Volume2 size={17} /></button>
            </header>
            <p className="chat-date">TODAY · A QUIET MOMENT</p>
            <div className="chat-bubble">Good afternoon, Maya. I’m here if you need a reminder or a quiet moment.</div>
            <div className="chat-bubble user">I’ve been thinking about my grandson’s birthday.</div>
            <div className="chat-bubble">That sounds like a lovely thing to look forward to. Would you like to tell me about it?</div>
            {chatReply && <><div className="chat-bubble user">I just wanted to say hello.</div><div className="chat-bubble">{chatReply}</div></>}
            <div className="chat-preview-label">Sample AI replies · preview only, no AI service is connected</div>
            <form className="chat-composer" onSubmit={sendMessage}>
              <input aria-label="Write a message" placeholder="Write a message…" value={chatMessage} onChange={(event) => setChatMessage(event.target.value)} />
              <button className="chat-send" type="submit" aria-label="Send preview message"><ArrowRight size={18} /></button>
            </form>
          </div>
        )}

        {screen === "profile" && (
          <div className="screen-scroll" key="profile">
            <header className="inner-header">
              <button className="back-button" aria-label="Back to home" onClick={() => setScreen("home")}><ArrowLeft size={18} /></button>
              <h1 className="inner-heading">Your profile</h1>
            </header>
            <div className="preview-banner"><Sparkles size={12} /> Design preview</div>
            <section className="profile-hero">
              <div className="profile-avatar"><UserRound size={27} /></div>
              <h2>Maya’s space</h2>
              <p>A private place for reminders, memories, and a little company.</p>
            </section>
            <section className="profile-group">
              <h3 className="profile-label">Your Nuvin</h3>
              <div className="settings-list">
                <button className="setting-row" onClick={() => setShowVault(true)}><span className="setting-icon"><Bookmark size={16} /></span><span>Memory Vault</span><ChevronRight size={16} color="#84918b" /></button>
                <button className="setting-row" onClick={() => setShowHelp(true)}><span className="setting-icon"><Heart size={16} /></span><span>Trusted support</span><ChevronRight size={16} color="#84918b" /></button>
                <div className="setting-note">Age is optional and is only asked during setup. Nuvin can quietly adapt text size and pacing automatically — no persona choices.</div>
              </div>
            </section>
            <section className="profile-group">
              <h3 className="profile-label">Account</h3>
              <div className="settings-list">
                <button className="setting-row" onClick={() => goToAuth("signin")}><span className="setting-icon"><LockKeyhole size={16} /></span><span>Sign in</span><ChevronRight size={16} color="#84918b" /></button>
                <button className="setting-row" onClick={() => goToAuth("signup")}><span className="setting-icon"><ArrowRight size={16} /></span><span>Create an account</span><ChevronRight size={16} color="#84918b" /></button>
              </div>
            </section>
            <button className="little-help tap" onClick={() => { setOnboardingStep(0); setScreen("onboarding"); }}>
              <span className="help-icon"><Sparkles size={17} /></span>
              <span className="help-copy"><strong>Set up your space</strong><span>Choose the things Nuvin can help with</span></span>
              <ChevronRight size={17} color="#81908a" />
            </button>
            <div className="privacy-card"><ShieldCheck size={16} /><span>This is a visual prototype. Account details are never sent or saved.</span></div>
          </div>
        )}

        {screen === "auth" && (
          <div className="screen-scroll" key="auth">
            <header className="inner-header">
              <button className="back-button" aria-label="Back to profile" onClick={() => setScreen("profile")}><ArrowLeft size={18} /></button>
              <Brand compact />
            </header>
            <div className="preview-banner"><Sparkles size={12} /> Design preview · no real account</div>
            <h1 className="hello-title" style={{ fontSize: 34 }}>{authMode === "signin" ? "Welcome back." : "Make room for care."}</h1>
            <p className="auth-prompt">{authMode === "signin" ? "Sign in to return to your personal space." : "Create a Nuvin account to keep your space close."}</p>
            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === "signup" && <><label className="field-label" htmlFor="display-name">Your name</label><div className="field-wrap"><UserRound size={16} /><input id="display-name" name="displayName" autoComplete="name" placeholder="What should we call you?" /></div></>}
              <label className="field-label" htmlFor="email">Email address</label>
              <div className="field-wrap"><Mail size={16} /><input id="email" type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></div>
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-wrap"><LockKeyhole size={16} /><input id="password" type="password" name="password" autoComplete={authMode === "signin" ? "current-password" : "new-password"} placeholder="Enter a password" required /></div>
              <button className="primary-button tap" type="submit">{authMode === "signin" ? "Sign in" : "Create account"} <ArrowRight size={16} /></button>
            </form>
            <p className="auth-switch">{authMode === "signin" ? "New to Nuvin?" : "Already have an account?"} <button className="text-action" onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}>{authMode === "signin" ? "Create an account" : "Sign in"}</button></p>
            <div className="privacy-card"><ShieldCheck size={16} /><span>Preview only. Form entries are not transmitted or stored; submitting clears the fields.</span></div>
          </div>
        )}

        {screen === "onboarding" && (
          <div className="screen-scroll" key="onboarding">
            <header className="inner-header">
              <button className="back-button" aria-label="Back" onClick={() => onboardingStep > 0 ? setOnboardingStep((step) => step - 1) : setScreen("profile")}><ArrowLeft size={18} /></button>
              <Brand compact />
            </header>
            <div className="preview-banner"><Sparkles size={12} /> A short setup · preview only</div>
            <div className="steps-indicator" aria-label={`Step ${onboardingStep + 1} of 3`}>{[0, 1, 2].map((step) => <span key={step} className={`step-dot${step <= onboardingStep ? " active" : ""}`} />)}</div>
            {onboardingStep === 0 && (
              <>
                <div className="onboarding-art"><Brand /></div>
                <h1 className="hello-title" style={{ fontSize: 32 }}>A little more like you.</h1>
                <p className="onboarding-copy">Nuvin can help with the things that make a day feel easier. You can change your mind at any time.</p>
                <button className="primary-button tap" onClick={() => setOnboardingStep(1)}>Let’s begin <ArrowRight size={16} /></button>
              </>
            )}
            {onboardingStep === 1 && (
              <>
                <h1 className="hello-title" style={{ fontSize: 32 }}>What would feel helpful?</h1>
                <p className="onboarding-copy">Choose a starting point. This is just a preview, so you can simply continue.</p>
                <div className="settings-list">
                  <div className="setting-row"><span className="setting-icon"><Clock3 size={16} /></span><span>Gentle medicine reminders</span><Check size={16} color="#276a61" /></div>
                  <div className="setting-row"><span className="setting-icon"><MessageCircle size={16} /></span><span>Someone to talk things through</span><Check size={16} color="#276a61" /></div>
                  <div className="setting-row"><span className="setting-icon"><Bookmark size={16} /></span><span>Remembering little things</span><Check size={16} color="#276a61" /></div>
                </div>
                <button className="primary-button tap" onClick={() => setOnboardingStep(2)}>Continue <ArrowRight size={16} /></button>
              </>
            )}
            {onboardingStep === 2 && (
              <>
                <h1 className="hello-title" style={{ fontSize: 32 }}>One optional detail.</h1>
                <p className="onboarding-copy">Your age can help Nuvin automatically adjust text size and pacing. It’s completely optional and only asked here during setup.</p>
                <label className="field-label" htmlFor="optional-age">Your age <span style={{ color: "#89948d", fontWeight: 500 }}>· optional</span></label>
                <div className="age-field"><input id="optional-age" type="number" inputMode="numeric" min="13" max="120" placeholder="You can leave this blank" value={age} onChange={(event) => setAge(event.target.value)} /></div>
                <div className="privacy-card"><LockKeyhole size={16} /><span>No persona names or choices. Nuvin adapts quietly, and you can skip this completely.</span></div>
                <button className="primary-button tap" onClick={finishOnboarding}>Finish setup <Check size={16} /></button>
                <button className="skip-button" onClick={finishOnboarding}>Skip age and finish</button>
              </>
            )}
          </div>
        )}

        {screen !== "auth" && screen !== "onboarding" && (
          <nav className="bottom-nav" aria-label="Main navigation">
            <button className={`nav-item${screen === "home" ? " selected" : ""}`} aria-current={screen === "home" ? "page" : undefined} onClick={() => setScreen("home")}><House size={18} /><span>Home</span></button>
            <button className={`nav-item${screen === "profile" ? " selected" : ""}`} aria-current={screen === "profile" ? "page" : undefined} onClick={() => setScreen("profile")}><UserRound size={18} /><span>Profile</span></button>
          </nav>
        )}

        {showVault && (
          <div className="modal-backdrop" role="presentation" onClick={() => setShowVault(false)}>
            <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="vault-title" onClick={(event) => event.stopPropagation()}>
              <div className="sheet-grip" />
              <div className="sheet-top"><h2 id="vault-title">Memory Vault</h2><button className="close-button" aria-label="Close Memory Vault" onClick={() => setShowVault(false)}><X size={17} /></button></div>
              <div className="vault-entry"><span className="setting-icon"><Heart size={16} /></span><p>Aarav’s birthday is coming up on October 24.<small>Family · saved today</small></p></div>
              <div className="vault-entry"><span className="setting-icon"><Clock3 size={16} /></span><p>Amlodipine 5mg, with warm water in the afternoon.<small>Health · saved yesterday</small></p></div>
              <div className="vault-entry"><span className="setting-icon"><Bookmark size={16} /></span><p>You like a quiet cup of chai after your evening walk.<small>Daily routine · saved Monday</small></p></div>
              <div className="preview-disclaimer">Memory Vault is shown as a design preview. No personal details are saved.</div>
            </section>
          </div>
        )}

        {showHelp && (
          <div className="modal-backdrop" role="presentation" onClick={() => setShowHelp(false)}>
            <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}>
              <div className="sheet-grip" />
              <div className="sheet-top"><h2 id="help-title">A person is here</h2><button className="close-button" aria-label="Close support options" onClick={() => setShowHelp(false)}><X size={17} /></button></div>
              <p className="onboarding-copy" style={{ marginBottom: 12 }}>If you’d like to speak with someone, these support lines are here for you.</p>
              <div className="helpline-row">
                <a className="helpline" href="tel:14416"><Phone size={15} /> Tele-MANAS · 14416</a>
                <a className="helpline" href="tel:18005990019"><Phone size={15} /> KIRAN</a>
              </div>
              <div className="preview-disclaimer">Helpline links are a visual preview and won’t place a call here. In an emergency, contact your local emergency number.</div>
            </section>
          </div>
        )}

        {notice && <div className="toast" role="status">{notice}</div>}
      </main>
    </div>
  );
}
