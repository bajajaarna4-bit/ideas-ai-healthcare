import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  PhoneCall,
  Clock,
  HelpCircle,
  RefreshCw,
  Info,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHealthData } from '../contexts/HealthDataContext';
import { api } from '../services/api';
import { ChatMessage, SupportedLanguage } from '../types';
import { LANGUAGE_OPTIONS } from '../i18n';

export const ChatAssistant: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { setEmergencyModalOpen, systemHealth } = useHealthData();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // The 4 core prompt examples requested + localized equivalents
  const exampleQuestions = [
    {
      en: "What does high blood pressure mean?",
      hi: "हाई ब्लड प्रेशर का क्या मतलब है?",
      mr: "हाय ब्लड प्रेशर म्हणजे काय?"
    },
    {
      en: "Explain dehydration in simple words.",
      hi: "डिहाइड्रेशन को सरल शब्दों में समझाएं।",
      mr: "डिहायड्रेशन सोप्या शब्दांत समजावून सांगा."
    },
    {
      en: "What is the difference between a viral infection and a bacterial infection?",
      hi: "वायरल और बैक्टीरियल इन्फेक्शन में क्या अंतर है?",
      mr: "व्हायरल व बॅक्टेरियल संसर्गामध्ये काय फरक आहे?"
    },
    {
      en: "How can I prepare for a routine health check-up?",
      hi: "रूटीन हेल्थ चेक-अप की तैयारी कैसे करें?",
      mr: "रूटीन आरोग्य तपासणीसाठी कशी तयारी करावी?"
    }
  ];

  // Load chat history or initial welcome greeting on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await api.getChatHistory();
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          // Default welcoming greeting in active language
          const defaultGreeting: ChatMessage = {
            role: 'assistant',
            content: language === 'hi'
              ? 'नमस्ते! मैं हेल्थसाथी एआई हूँ, आपका बहुभाषी स्वास्थ्य साथी। आप मुझसे आम बीमारियों के लक्षणों, स्वस्थ जीवनशैली या मेडिकल शब्दों के बारे में पूछ सकते हैं।'
              : language === 'mr'
              ? 'नमस्कार! मी हेल्थसाथी एआई आहे, तुमचा बहुभाषिक आरोग्य सोबती. आरोग्याविषयीच्या संकल्पना किंवा लक्षणांबद्दल तुम्ही मला विचारू शकता.'
              : 'Hello! I am HealthSathi AI, your multilingual health companion. Feel free to ask about symptoms, medical concepts, healthy habits, or questions for your doctor.',
            language: language,
            created_at: new Date().toISOString()
          };
          setMessages([defaultGreeting]);
        }
      } catch (err) {
        console.warn("Could not fetch remote chat history:", err);
      }
    };
    loadHistory();
  }, [language]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || inputText).trim();
    if (!msg || isLoading) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      role: 'user',
      content: msg,
      language: language,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(msg, language);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        language: response.language,
        red_flag_alert: response.red_flag_alert,
        emergency_number: response.emergency_number,
        suggested_followups: response.suggested_followups,
        disclaimer: response.disclaimer,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setErrorMessage(
        err.message || (language === 'hi' ? 'उत्तर प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।' : 'Failed to connect to health assistant service. Please try again.')
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClearChat = async () => {
    try {
      await api.clearChatHistory();
      setMessages([
        {
          role: 'assistant',
          content: language === 'hi'
            ? 'चैट इतिहास मिटा दिया गया है। आज मैं आपकी क्या सहायता कर सकता हूँ?'
            : language === 'mr'
            ? 'संभाषण इतिहास पुसला गेला आहे. मी तुम्हाला कशी मदत करू?'
            : 'Chat history cleared. How can I assist your health queries today?',
          language: language,
          created_at: new Date().toISOString()
        }
      ]);
      setShowClearConfirm(false);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto p-2 sm:p-4 md:p-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-health-slate-200 mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-health-teal-600 to-health-navy-700 flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-health-navy-900">
                {t.chat.title}
              </h1>
              {systemHealth?.gemini_configured ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                  Gemini Live
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200" title="Add GEMINI_API_KEY in backend/.env">
                  <ShieldCheck className="w-3 h-3 mr-1 text-amber-600" />
                  Safe Demo Mode
                </span>
              )}
            </div>
            <p className="text-xs text-health-slate-500">
              {t.chat.subtitle}
            </p>
          </div>
        </div>

        {/* Language switcher & Clear chat actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Quick language toggle */}
          <div className="flex bg-health-slate-100 rounded-lg p-0.5 border border-health-slate-200">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLanguage(opt.code)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === opt.code
                    ? 'bg-white text-health-teal-700 shadow-sm font-bold'
                    : 'text-health-slate-600 hover:text-health-slate-900'
                }`}
              >
                {opt.nativeLabel}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-health-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-health-slate-200 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.chat.clearHistory}</span>
          </button>
        </div>
      </div>

      {/* Demo Mode notification banner if Gemini key is missing */}
      {!systemHealth?.gemini_configured && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 mb-3 text-xs text-sky-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-sky-950">Safe Demo Mode Active:</span>{' '}
            Responses are served from HealthSathi's local, verified multilingual medical knowledge base.
            To connect live Gemini AI generation, add your <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-800 font-mono">GEMINI_API_KEY</code> into <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-800 font-mono">backend/.env</code>.
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl p-4 shadow-sm border border-health-slate-200 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-health-teal-100 border border-health-teal-300 flex items-center justify-center text-health-teal-800 flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-health-teal-600 to-health-navy-700 text-white rounded-tr-none'
                    : 'bg-health-slate-50 border border-health-slate-200/80 text-health-slate-900 rounded-tl-none'
                }`}
              >
                {/* Emergency Alert Tag if assistant identifies red flag */}
                {!isUser && msg.red_flag_alert && (
                  <div className="mb-2 p-2.5 bg-red-100 border-l-4 border-red-600 rounded text-red-950 text-xs font-semibold flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>Acute Emergency Warning Signs Detected</span>
                    </div>
                    <button
                      onClick={() => setEmergencyModalOpen(true)}
                      className="px-2 py-0.5 bg-red-600 text-white rounded text-[11px] font-bold hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      Call 112/108
                    </button>
                  </div>
                )}

                {/* Message Content */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </div>

                {/* Suggested follow-up prompt chips */}
                {!isUser && msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-health-slate-200/70">
                    <p className="text-[11px] font-semibold text-health-slate-500 mb-1.5 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-health-teal-600" />
                      {language === 'hi' ? 'संभावित प्रश्न:' : (language === 'mr' ? 'सुचवलेले प्रश्न:' : 'Suggested follow-ups:')}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggested_followups.map((followup, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSendMessage(followup)}
                          className="text-xs px-2.5 py-1 bg-white hover:bg-health-teal-50 hover:text-health-teal-800 text-health-slate-700 rounded-full border border-health-slate-300 transition-colors shadow-2xs text-left"
                        >
                          {followup}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer footnote on assistant messages */}
                {!isUser && msg.disclaimer && (
                  <div className="mt-2.5 pt-2 border-t border-health-slate-200/50 text-[10px] text-health-slate-400 italic">
                    {msg.disclaimer}
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                    isUser ? 'text-white/80 justify-end' : 'text-health-slate-400 justify-start'
                  }`}
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatTimestamp(msg.created_at)}</span>
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-health-navy-100 border border-health-navy-300 flex items-center justify-center text-health-navy-800 flex-shrink-0 mt-1 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-full bg-health-teal-100 border border-health-teal-300 flex items-center justify-center text-health-teal-800 flex-shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-health-slate-50 border border-health-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2 text-xs text-health-slate-600">
              <RefreshCw className="w-3.5 h-3.5 text-health-teal-600 animate-spin" />
              <span>{t.chat.thinking}</span>
              <span className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-health-teal-600 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-health-teal-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-health-teal-600 animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-800 font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Example Prompt Chips Area */}
      <div className="my-2.5">
        <div className="flex items-center gap-1.5 text-xs text-health-slate-500 mb-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-health-teal-600" />
          <span>{t.chat.suggestedPromptsTitle}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {exampleQuestions.map((q, idx) => {
            const queryText = q[language] || q.en;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(queryText)}
                className="whitespace-nowrap px-3 py-1.5 bg-white hover:bg-health-teal-50 hover:text-health-teal-700 hover:border-health-teal-300 text-health-slate-700 text-xs rounded-xl border border-health-slate-200/90 shadow-2xs transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <span>{queryText}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input box */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-md border border-health-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={t.chat.placeholder}
            className="flex-1 max-h-32 min-h-[44px] resize-none border-0 bg-transparent px-3 py-2 text-sm text-health-slate-900 placeholder:text-health-slate-400 focus:outline-none focus:ring-0"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`flex items-center justify-center p-3 rounded-xl transition-all shadow-sm ${
              inputText.trim() && !isLoading
                ? 'bg-gradient-to-r from-health-teal-600 to-health-navy-700 text-white hover:opacity-95 active:scale-95'
                : 'bg-health-slate-100 text-health-slate-400 cursor-not-allowed'
            }`}
            aria-label="Send health question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 pt-1 border-t border-health-slate-100 flex items-center justify-between text-[11px] text-health-slate-400">
          <span>{t.chat.safetyNotice}</span>
          <span className="hidden sm:inline font-mono">Press Enter to send</span>
        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-health-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-health-slate-900">
                {language === 'hi' ? 'चैट साफ़ करें?' : (language === 'mr' ? 'संभाषण पुसायचे?' : 'Clear Chat History?')}
              </h3>
            </div>
            <p className="text-xs text-health-slate-600">
              {language === 'hi'
                ? 'क्या आप वर्तमान चैट इतिहास को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'
                : language === 'mr'
                ? 'तुम्हाला संभाषण इतिहास हटवायचा आहे का? ही क्रिया पुन्हा पूर्ववत केली जाऊ शकत नाही.'
                : 'Are you sure you want to clear this conversation? Your current session chat history will be removed.'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-health-slate-700 bg-health-slate-100 hover:bg-health-slate-200 transition-colors"
              >
                {language === 'hi' ? 'रद्द करें' : (language === 'mr' ? 'रद्द करा' : 'Cancel')}
              </button>
              <button
                onClick={handleClearChat}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
              >
                {language === 'hi' ? 'हाँ, साफ़ करें' : (language === 'mr' ? 'होय, पुसा' : 'Yes, Clear Chat')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
