import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Edit3,
  Sparkles,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Plus,
  Trash2,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  BookmarkPlus,
  ArrowRight,
  Info
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import {
  ReportSimplifierResponse,
  ManualLabTestEntry,
  LabFinding
} from '../types';

type InputTab = 'pdf' | 'manual' | 'paste';

const DEFAULT_MANUAL_TESTS: ManualLabTestEntry[] = [
  { test_name: 'Hemoglobin', value: '11.2', unit: 'g/dL', reference_interval: '13.5 - 17.5' },
  { test_name: 'Fasting Blood Sugar', value: '126', unit: 'mg/dL', reference_interval: '70 - 99' },
  { test_name: 'HbA1c', value: '6.2', unit: '%', reference_interval: '4.0 - 5.6' }
];

export const ReportSimplifier: React.FC = () => {
  const { language, t, format } = useLanguage();

  // Tab & Input state
  const [activeTab, setActiveTab] = useState<InputTab>('pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [manualTests, setManualTests] = useState<ManualLabTestEntry[]>(DEFAULT_MANUAL_TESTS);
  const [rawText, setRawText] = useState('');

  // AI & Privacy consent
  const [userConsentedAi, setUserConsentedAi] = useState(false);

  // Status & Results
  const [isLoading, setIsLoading] = useState(false);
  const [reportResult, setReportResult] = useState<ReportSimplifierResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScannedPdfError, setIsScannedPdfError] = useState(false);

  // Handle PDF file selection
  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please select a valid PDF (.pdf) document.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }
    setSelectedFile(file);
    setError(null);
    setIsScannedPdfError(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Add / Remove Manual Test Rows
  const handleAddManualRow = () => {
    setManualTests((prev) => [
      ...prev,
      { test_name: '', value: '', unit: '', reference_interval: '' }
    ]);
  };

  const handleRemoveManualRow = (index: number) => {
    setManualTests((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleManualTestChange = (
    index: number,
    field: keyof ManualLabTestEntry,
    val: string
  ) => {
    setManualTests((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  // Load Built-in Synthetic Sample
  const handleLoadSample = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsScannedPdfError(false);
      const sample = await api.getSampleReport();
      setRawText(sample.text);
      if (sample.manual_tests && sample.manual_tests.length > 0) {
        setManualTests(sample.manual_tests);
      }
    } catch (err: any) {
      console.error('Failed to load sample report:', err);
      // Fallback sample text if backend unreachable
      setRawText(
        'Hemoglobin: 11.2 g/dL (Reference: 13.5 - 17.5 g/dL)\nFasting Blood Sugar: 126 mg/dL (Reference: 70 - 99 mg/dL)\nHbA1c: 6.2 % (Reference: 4.0 - 5.6 %)\nTotal Cholesterol: 228 mg/dL (Reference: < 200 mg/dL)'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Submission handler
  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setIsScannedPdfError(false);
    setReportResult(null);

    try {
      let result: ReportSimplifierResponse;

      if (activeTab === 'pdf') {
        if (!selectedFile) {
          throw new Error('Please select a PDF file to analyze.');
        }
        result = await api.uploadReportPdf(selectedFile, language, userConsentedAi);
      } else if (activeTab === 'manual') {
        const validTests = manualTests.filter(
          (t) => t.test_name.trim().length > 0 && t.value.trim().length > 0
        );
        if (validTests.length === 0) {
          throw new Error('Please enter at least one test with a name and reported value.');
        }
        result = await api.simplifyManualTests({
          tests: validTests,
          language,
          user_consented_ai: userConsentedAi
        });
      } else {
        if (!rawText.trim()) {
          throw new Error('Please enter or paste report text to simplify.');
        }
        result = await api.simplifyReport({
          raw_text: rawText.trim(),
          language,
          user_consented_ai: userConsentedAi
        });
      }

      setReportResult(result);
    } catch (err: any) {
      console.error('Report simplification error:', err);
      const msg = err.message || 'Failed to simplify lab report.';
      setError(msg);
      if (msg.toLowerCase().includes('scanned image') || msg.toLowerCase().includes('photograph pdf')) {
        setIsScannedPdfError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for Status Badges
  const renderStatusBadge = (finding: LabFinding) => {
    const s = finding.status;
    if (finding.is_ambiguous || s === 'ambiguous_comparison') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
          <HelpCircle className="w-3 h-3 text-purple-600" />
          <span>{t.reports.statusAmbiguous}</span>
        </span>
      );
    }
    if (s === 'above_interval' || s === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>{t.reports.statusAbove}</span>
        </span>
      );
    }
    if (s === 'below_interval' || s === 'low') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          <span>{t.reports.statusBelow}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        <span>{t.reports.statusWithin}</span>
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-2 rounded-xl bg-health-teal-100 text-health-teal-800">
            <FileText className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-health-navy-900">
            {t.reports.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-health-slate-600">
          {t.reports.subtitle}
        </p>
      </div>

      {/* Synthetic Demo Banner */}
      <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 flex items-start gap-2.5 text-xs text-teal-900">
        <ShieldCheck className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold">{t.reports.syntheticBanner}</span>
          <p className="text-[11px] text-teal-700 mt-0.5">{t.reports.privacyNote}</p>
        </div>
      </div>

      {/* Input Mode Selector Tabs */}
      <div className="bg-white rounded-2xl border border-health-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-3 border-b border-health-slate-200 bg-health-slate-50/50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pdf');
              setError(null);
            }}
            className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'pdf'
                ? 'border-health-teal-600 text-health-teal-800 bg-white'
                : 'border-transparent text-health-slate-600 hover:text-health-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t.reports.tabPdf}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              setError(null);
            }}
            className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'manual'
                ? 'border-health-teal-600 text-health-teal-800 bg-white'
                : 'border-transparent text-health-slate-600 hover:text-health-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{t.reports.tabManual}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('paste');
              setError(null);
            }}
            className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'paste'
                ? 'border-health-teal-600 text-health-teal-800 bg-white'
                : 'border-transparent text-health-slate-600 hover:text-health-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.reports.tabPaste}</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* TAB 1: PDF Upload */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-health-navy-900">
                  {t.reports.pdfUploadTitle}
                </h3>
                <p className="text-xs text-health-slate-500 mt-0.5">
                  {t.reports.pdfUploadDesc}
                </p>
              </div>

              {/* Drag and Drop Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-health-teal-500 bg-health-teal-50/50'
                    : selectedFile
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-health-slate-300 hover:border-health-teal-400 bg-health-slate-50/40'
                }`}
                onClick={() => document.getElementById('pdf-file-input')?.click()}
              >
                <input
                  id="pdf-file-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />

                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-3 rounded-full bg-health-teal-100 text-health-teal-700">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>{t.reports.pdfFileSelected} {selectedFile.name}</span>
                      </p>
                      <p className="text-[11px] text-health-slate-500 mt-0.5">
                        ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-health-slate-700">
                        {t.reports.pdfDropzone}
                      </p>
                      <p className="text-[11px] text-health-slate-400 mt-0.5">
                        PDF up to 10 MB (in-memory extraction, zero persistence)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Scanned PDF Notice */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px]">{t.reports.pdfScannedNotice}</p>
              </div>
            </div>
          )}

          {/* TAB 2: Manual Lab Test Entry */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-health-navy-900">
                    {t.reports.manualTitle}
                  </h3>
                  <p className="text-xs text-health-slate-500 mt-0.5">
                    {t.reports.manualDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs font-bold text-health-teal-700 bg-health-teal-50 hover:bg-health-teal-100 border border-health-teal-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-health-teal-600" />
                  <span>{t.reports.loadSampleManualBtn}</span>
                </button>
              </div>

              {/* Responsive Test Rows Table */}
              <div className="space-y-2.5">
                <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-bold text-health-slate-600 uppercase tracking-wider px-2">
                  <div className="col-span-4">{t.reports.colTestName} *</div>
                  <div className="col-span-3">{t.reports.colValue} *</div>
                  <div className="col-span-2">{t.reports.colUnit}</div>
                  <div className="col-span-2">{t.reports.colReference}</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {manualTests.map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-2 rounded-xl bg-health-slate-50/70 border border-health-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                  >
                    <div className="sm:col-span-4">
                      <label className="sm:hidden text-[11px] font-bold text-health-slate-600 mb-0.5 block">
                        {t.reports.colTestName} *
                      </label>
                      <input
                        type="text"
                        value={row.test_name}
                        onChange={(e) => handleManualTestChange(idx, 'test_name', e.target.value)}
                        placeholder={t.reports.testNamePlaceholder}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-health-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="sm:hidden text-[11px] font-bold text-health-slate-600 mb-0.5 block">
                        {t.reports.colValue} *
                      </label>
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => handleManualTestChange(idx, 'value', e.target.value)}
                        placeholder={t.reports.valuePlaceholder}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-health-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="sm:hidden text-[11px] font-bold text-health-slate-600 mb-0.5 block">
                        {t.reports.colUnit}
                      </label>
                      <input
                        type="text"
                        value={row.unit || ''}
                        onChange={(e) => handleManualTestChange(idx, 'unit', e.target.value)}
                        placeholder={t.reports.unitPlaceholder}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-health-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="sm:hidden text-[11px] font-bold text-health-slate-600 mb-0.5 block">
                        {t.reports.colReference}
                      </label>
                      <input
                        type="text"
                        value={row.reference_interval || ''}
                        onChange={(e) => handleManualTestChange(idx, 'reference_interval', e.target.value)}
                        placeholder={t.reports.referencePlaceholder}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-health-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end sm:justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveManualRow(idx)}
                        disabled={manualTests.length <= 1}
                        title={t.reports.removeTestBtn}
                        className={`p-1.5 rounded-lg transition-colors ${
                          manualTests.length > 1
                            ? 'text-rose-600 hover:bg-rose-100/70'
                            : 'text-health-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddManualRow}
                  className="text-xs font-bold text-health-teal-700 hover:text-health-teal-800 flex items-center gap-1.5 py-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.reports.addTestBtn}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Paste Text or Load Sample */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-health-navy-900">
                  {t.reports.inputLabel}
                </label>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs font-semibold text-health-teal-600 hover:text-health-teal-700 underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.reports.loadSampleBtn}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={t.reports.inputPlaceholder}
                className="w-full rounded-xl border border-health-slate-300 p-3 text-xs sm:text-sm font-mono text-health-slate-800 placeholder:text-health-slate-400 focus:outline-none focus:ring-2 focus:ring-health-teal-500/20 focus:border-health-teal-600 bg-white"
              />
            </div>
          )}

          {/* AI Disclosure & User Consent Checkbox */}
          <div className="pt-3 border-t border-health-slate-200/80">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={userConsentedAi}
                onChange={(e) => setUserConsentedAi(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-health-teal-600 focus:ring-health-teal-500 border-health-slate-300"
              />
              <div className="text-xs">
                <span className="font-bold text-health-navy-900">
                  {t.reports.aiConsentTitle}
                </span>
                <p className="text-[11px] text-health-slate-500 mt-0.5">
                  {t.reports.aiConsentDesc}
                </p>
              </div>
            </label>
          </div>

          {/* Scanned PDF Specific Error Callout */}
          {isScannedPdfError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
              <div className="flex items-start gap-2 font-bold text-rose-950">
                <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                <span>Unsupported File: Scanned or Image PDF</span>
              </div>
              <p className="text-[11px] text-rose-800">
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('manual');
                  setIsScannedPdfError(false);
                  setError(null);
                }}
                className="mt-1 px-3 py-1.5 rounded-lg bg-health-navy-800 hover:bg-health-navy-900 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Switch to Manual Test Entry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Generic Error Notice */}
          {error && !isScannedPdfError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || (activeTab === 'pdf' && !selectedFile)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm transition-all flex items-center gap-2 ${
                !isLoading && (activeTab !== 'pdf' || selectedFile)
                  ? 'bg-gradient-to-r from-health-teal-600 to-health-navy-700 hover:opacity-95'
                  : 'bg-health-slate-200 text-health-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.reports.processing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {activeTab === 'pdf'
                      ? t.reports.pdfUploadBtn
                      : activeTab === 'manual'
                      ? t.reports.manualAnalyzeBtn
                      : t.reports.simplifyBtn}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      {reportResult && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-health-slate-200 shadow-md space-y-6 animate-in fade-in">
          {/* Summary Banner */}
          <div className="p-4 rounded-xl bg-health-navy-50/70 border border-health-navy-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-health-teal-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-health-navy-950">
                  {reportResult.title}
                </h3>
              </div>

              {/* AI vs Local Engine Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                reportResult.used_ai_simplification
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {reportResult.used_ai_simplification
                  ? '✨ Gemini AI Terminology'
                  : '🛡️ 100% Deterministic Local Engine'}
              </span>
            </div>

            <p className="text-xs text-health-slate-700 leading-relaxed">
              {reportResult.summary}
            </p>

            {/* Counts Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {reportResult.abnormal_count > 0 ? (
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{format(t.reports.abnormalCountBadge, { count: reportResult.abnormal_count })}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.reports.allNormalBadge}</span>
                </span>
              )}

              {reportResult.ambiguous_count && reportResult.ambiguous_count > 0 ? (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>{format(t.reports.ambiguousCountBadge, { count: reportResult.ambiguous_count })}</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* CRITICAL CLINICAL NUANCE CALLOUT REGARDING REFERENCE INTERVALS */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <h4>{t.reports.referenceNuanceTitle}</h4>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              {reportResult.reference_interval_explanation || t.reports.referenceNuanceText}
            </p>
          </div>

          {/* Findings Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-health-slate-600 uppercase tracking-wider">
              {t.reports.findingsTitle} ({reportResult.findings.length})
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {reportResult.findings.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    item.status === 'above_interval' || item.status === 'high'
                      ? 'bg-rose-50/30 border-rose-200'
                      : item.status === 'below_interval' || item.status === 'low'
                      ? 'bg-amber-50/30 border-amber-200'
                      : item.is_ambiguous || item.status === 'ambiguous_comparison'
                      ? 'bg-purple-50/30 border-purple-200'
                      : 'bg-white border-health-slate-200'
                  }`}
                >
                  {/* Top Bar: Name, Status, Value, Unit, Reference Interval */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-health-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-health-navy-900">
                        {item.test_name}
                      </h4>
                      {renderStatusBadge(item)}
                    </div>
                    <div className="text-xs text-health-slate-700 font-mono">
                      <span className="font-bold text-health-slate-900">
                        {item.value} {item.unit || ''}
                      </span>
                      <span className="text-health-slate-500 ml-1.5">
                        ({t.reports.referenceRange}: {item.normal_range || 'Not specified'})
                      </span>
                    </div>
                  </div>

                  {/* Ambiguity Warning if present */}
                  {item.is_ambiguous && item.ambiguity_note && (
                    <div className="p-2 mb-2 rounded-lg bg-purple-50 border border-purple-200 text-[11px] text-purple-900 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      <span>{item.ambiguity_note}</span>
                    </div>
                  )}

                  {/* Plain Language Meaning */}
                  <p className="text-xs text-health-slate-700 mb-2 leading-relaxed">
                    <strong className="text-health-navy-900">{t.reports.explanation}: </strong>
                    {item.plain_explanation}
                  </p>

                  {/* Clinical Context */}
                  <div className="text-xs text-health-slate-700 bg-health-slate-50 p-2.5 rounded-lg border border-health-slate-200/70">
                    <strong className="text-health-navy-900">{t.reports.clinicalNote}: </strong>
                    <span>{item.clinical_significance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Questions for Clinician & Lifestyle Considerations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Questions to Ask Doctor */}
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2.5">
              <h3 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                <span>{t.reports.questionsForDoctor}</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-sky-900">
                {reportResult.questions_for_doctor.map((q, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-sky-600 font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence-Based Lifestyle Considerations */}
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2.5">
              <h3 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                <BookmarkPlus className="w-4 h-4 text-teal-600" />
                <span>{t.reports.lifestyleTips}</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-teal-900">
                {reportResult.lifestyle_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Privacy & Medical Disclaimer */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <p className="font-bold">{t.disclaimerShort}</p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {reportResult.disclaimer || t.reports.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
