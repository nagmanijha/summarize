"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

// Types
type Step = "upload" | "processing" | "results";
type Provider = "gemini" | "documentai";

interface DocAiConfig {
    projectId: string;
    location: string;
    processorId: string;
}

interface AnalysisResult {
    summary: {
        executiveSummary: string;
        bulletPoints: string[];
        keyTopics: string[];
        entities: {
            dates: string[];
            people: string[];
            organizations: string[];
            amounts: string[];
        };
    };
    confidence: number;
    wordCount: number;
    pages: { pageNumber: number; text: string; confidence: number }[];
    rawText: string;
    cleanExtract: string;
}

export default function Dashboard() {
    const [step, setStep] = useState<Step>("upload");
    const [processingStep, setProcessingStep] = useState(0); // 0: Uploading, 1: OCR, 2: Cleaning, 3: Summarizing
    const [file, setFile] = useState<File | null>(null);
    const [ocrProvider, setOcrProvider] = useState<Provider>("gemini");
    const [docAiConfig, setDocAiConfig] = useState<DocAiConfig>({
        projectId: "",
        location: "us",
        processorId: "",
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"summary" | "clean">("summary");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Handlers ---

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (e.dataTransfer.files[0].type === "application/pdf") {
                setFile(e.dataTransfer.files[0]);
                setError(null);
            } else {
                setError("Please upload a PDF file.");
            }
        }
    };

    const startProcessing = async () => {
        if (!file) return;

        setStep("processing");
        setProcessingStep(0); // Uploading
        setError(null);

        try {
            // 1. Upload
            const formData = new FormData();
            formData.append("file", file);

            // Simulate a small delay for the "Uploading" step visual
            await new Promise(r => setTimeout(r, 800));

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");
            const uploadData = await uploadRes.json();

            setProcessingStep(1); // OCR

            // 2. Process
            const processPromise = fetch("/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filePath: uploadData.filePath,
                    ocrProvider,
                    docAiCreds: ocrProvider === "documentai" ? docAiConfig : undefined,
                }),
            });

            // Simulate progress for generic steps if the API is fast, or just to show the user what's happening
            const timer1 = setTimeout(() => setProcessingStep(2), 2500); // Cleaning
            const timer2 = setTimeout(() => setProcessingStep(3), 4500); // Summarizing

            const processRes = await processPromise;
            clearTimeout(timer1);
            clearTimeout(timer2);

            if (!processRes.ok) {
                const errData = await processRes.json();
                throw new Error(errData.error || "Processing failed");
            }

            const processData = await processRes.json();
            // Ensure we show the final step for a moment before switching
            setProcessingStep(3);
            await new Promise(r => setTimeout(r, 600));

            setResult(processData);
            setStep("results");
        } catch (err: any) {
            setError(err.message);
            setStep("upload");
        }
    };

    // --- Components ---

    const ConfidenceBadge = ({ confidence }: { confidence: number }) => {
        const isHigh = confidence > 0.85;
        const colorClass = isHigh ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200";
        const icon = isHigh ? "verified" : "warning";
        const label = isHigh ? "High Confidence" : "Needs Review";

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                <span className="material-icons text-[14px] mr-1">{icon}</span>
                {label} ({confidence})
            </span>
        );
    };

    const IntelligenceSection = ({ title, items, icon }: { title: string, items: string[], icon: string }) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-2 text-gray-500 font-medium text-xs uppercase tracking-wider">
                    <span className="material-icons text-sm">{icon}</span>
                    {title}
                </div>
                <div className="flex flex-wrap gap-2">
                    {items.map((item, idx) => (
                        <span key={idx} className="bg-gray-50 text-gray-700 border border-gray-200 px-2 py-1 rounded text-sm hover:bg-white hover:border-gray-300 transition-colors cursor-default">
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-slate-900 text-gray-100 font-sans overflow-hidden font-inter selection:bg-blue-500/30">
            {/* Slim Navigation Rail */}
            <aside className="w-16 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-6 z-20 hidden md:flex shrink-0">
                <Link href="/" className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20 mb-8 hover:bg-blue-500 transition-colors">
                    <span className="material-icons text-xl">auto_fix_high</span>
                </Link>

                <nav className="flex-1 space-y-4 w-full flex flex-col items-center">
                    <button
                        onClick={() => { setStep('upload'); setFile(null); setResult(null); }}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${step === 'upload' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
                        title="Upload"
                    >
                        <span className="material-icons">dashboard</span>
                    </button>
                    {step === 'results' && (
                        <button
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all bg-slate-800 text-blue-400 cursor-default`}
                            title="Results"
                        >
                            <span className="material-icons">article</span>
                        </button>
                    )}
                </nav>

                <div className="flex flex-col gap-4 mb-6">
                    <form action={async () => {
                        // In a real app we'd use a server action or the signOut function from next-auth/react
                        // For this client component we can just redirect to /api/auth/signout
                        window.location.href = "/api/auth/signout";
                    }}>
                        <button
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-all"
                            title="Sign Out"
                        >
                            <span className="material-icons">logout</span>
                        </button>
                    </form>

                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-all"
                        title="Settings"
                    >
                        <span className="material-icons">settings</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold text-slate-200 tracking-tight">
                            {step === 'upload' && 'New Project'}
                            {step === 'processing' && 'Analyzing...'}
                            {step === 'results' && (
                                <span className="flex items-center gap-2">
                                    <span className="text-slate-500 font-normal">Document /</span>
                                    {file?.name}
                                </span>
                            )}
                        </h1>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scrollbar-hide">

                    {/* Error Banner */}
                    {error && (
                        <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-200 flex items-center gap-3">
                            <span className="material-icons text-red-500">error</span>
                            {error}
                        </div>
                    )}

                    {/* VIEW: UPLOAD (Dark Mode) */}
                    {step === "upload" && (
                        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-10 w-full text-center hover:border-blue-500/30 transition-colors">
                                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <span className="material-icons text-3xl text-blue-500">upload_file</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2 font-display">Upload Document</h2>
                                <p className="text-slate-400 mb-8">Drag and drop your PDF here to extract insights.</p>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 mx-auto"
                                >
                                    <span className="material-icons text-sm">add</span>
                                    Select File
                                </button>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className="absolute inset-0 z-0 pointer-events-none"
                            />

                            {file && (
                                <div className="w-full mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-between shadow-lg animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-900/20 rounded-lg flex items-center justify-center text-red-400">
                                            <span className="material-icons">picture_as_pdf</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{file.name}</p>
                                            <p className="text-xs text-slate-500">Ready to process</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startProcessing}
                                        className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Start Analysis &rarr;
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VIEW: PROCESSING */}
                    {step === "processing" && (
                        <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                            {/* ... kept similar but dark themed ... */}
                            <div className="w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 md:p-10 relative z-10">
                                <div className="text-center mb-10">
                                    <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-blue-500/10 text-blue-500 relative">
                                        <span className="material-icons text-3xl animate-spin">smart_toy</span>
                                    </div>
                                    <h1 className="text-2xl font-bold mb-2 text-white">Analyzing Document</h1>
                                    <p className="text-slate-400 text-sm">Processing {file?.name}</p>
                                </div>

                                <div className="space-y-6 relative">
                                    <div className="absolute left-[1.15rem] top-3 bottom-6 w-0.5 bg-slate-700 -z-10"></div>
                                    {[
                                        { label: "Uploading Document", icon: "cloud_upload" },
                                        { label: "OCR Processing", icon: "document_scanner" },
                                        { label: "Cleaning Text", icon: "cleaning_services" },
                                        { label: "Generating Summary", icon: "summarize" }
                                    ].map((s, i) => (
                                        <div key={i} className={`flex items-start ${processingStep < i ? 'opacity-40' : ''}`}>
                                            <div className="flex-shrink-0 relative">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-sm z-10 transition-colors duration-500 ${processingStep > i ? 'bg-emerald-500 text-white' :
                                                    processingStep === i ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-700 text-slate-400'
                                                    }`}>
                                                    <span className="material-icons text-lg">
                                                        {processingStep > i ? 'check' : s.icon}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-grow pt-2">
                                                <h3 className={`text-sm font-semibold transition-colors duration-300 ${processingStep === i ? 'text-blue-400' : 'text-slate-200'}`}>{s.label}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEW: RESULTS (Paper Aesthetic) */}
                    {step === "results" && result && (
                        <div className="max-w-[1600px] mx-auto h-full flex flex-col lg:flex-row gap-6">

                            {/* Left: Document Intelligence Panel */}
                            <div className="w-full lg:w-80 shrink-0 space-y-6 order-2 lg:order-1">
                                <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Document Intelligence</h3>

                                    <IntelligenceSection
                                        title="People"
                                        icon="person"
                                        items={result.summary.entities.people}
                                    />
                                    <IntelligenceSection
                                        title="Dates"
                                        icon="calendar_today"
                                        items={result.summary.entities.dates}
                                    />
                                    <IntelligenceSection
                                        title="Organizations"
                                        icon="business"
                                        items={result.summary.entities.organizations}
                                    />

                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-500">Confidence Score</span>
                                            <ConfidenceBadge confidence={result.confidence} />
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${result.confidence * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: The Paper */}
                            <div className="flex-1 order-1 lg:order-2">
                                <div className="bg-white text-gray-900 rounded-xl shadow-2xl shadow-black/50 overflow-hidden min-h-[800px] max-w-4xl mx-auto border border-gray-300/50 relative">

                                    {/* Paper Header / Tabs */}
                                    <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                                        <div className="flex gap-6">
                                            <button
                                                onClick={() => setActiveTab('summary')}
                                                className={`text-sm font-serif font-bold tracking-wide transition-colors ${activeTab === 'summary' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                Executive Summary
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('clean')}
                                                className={`text-sm font-serif font-bold tracking-wide transition-colors ${activeTab === 'clean' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                Clean Extract
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <span className="text-xs font-mono text-gray-400">AI-GENERATED</span>
                                        </div>
                                    </div>

                                    <div className="p-12 md:p-16">
                                        {activeTab === 'summary' ? (
                                            <div className="animate-fade-in space-y-10">
                                                <div>
                                                    <h1 className="font-playfair text-4xl font-bold mb-6 text-gray-900 leading-tight">
                                                        Executive Summary
                                                    </h1>
                                                    <p className="font-playfair text-xl leading-relaxed text-gray-700">
                                                        {result.summary.executiveSummary}
                                                    </p>
                                                </div>

                                                <div className="border-t border-gray-100 pt-10">
                                                    <h3 className="font-sans text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Key Insights</h3>
                                                    <ul className="space-y-4">
                                                        {result.summary.bulletPoints.map((point, i) => (
                                                            <li key={i} className="flex gap-4 items-baseline group">
                                                                <span className="text-blue-500 font-serif font-bold italic opacity-50 group-hover:opacity-100 transition-opacity">
                                                                    {i + 1}.
                                                                </span>
                                                                <p className="font-playfair text-lg text-gray-800 leading-relaxed">
                                                                    {point}
                                                                </p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="animate-fade-in space-y-12">
                                                {result.pages.map((page, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <div className="absolute -left-10 top-0 text-xs font-mono text-gray-300">
                                                            P.{page.pageNumber || idx + 1}
                                                        </div>
                                                        <div className="font-playfair text-lg leading-loose text-gray-800 whitespace-pre-wrap">
                                                            {page.text}
                                                        </div>
                                                        {page.confidence < 0.8 && (
                                                            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2 text-amber-800 text-sm">
                                                                <span className="material-icons text-sm">warning_amber</span>
                                                                Low confidence detection on this page. Verify against original.
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings Modal (Dark Mode) */}
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
                        <div className="w-full max-w-md bg-slate-900 shadow-2xl h-full p-6 flex flex-col animate-slide-in-right border-l border-slate-800">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-white">Settings</h2>
                                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-slate-300">
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <div className="space-y-6 flex-1 text-slate-300">
                                <div>
                                    <label className="block text-sm font-medium mb-2">OCR Provider</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setOcrProvider('gemini')}
                                            className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${ocrProvider === 'gemini' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-slate-700 hover:bg-slate-800'}`}
                                        >
                                            Gemini (Free)
                                        </button>
                                        <button
                                            onClick={() => setOcrProvider('documentai')}
                                            className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${ocrProvider === 'documentai' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-slate-700 hover:bg-slate-800'}`}
                                        >
                                            Document AI
                                        </button>
                                    </div>
                                </div>
                                {/* ... Document AI inputs would be styled similarly ... */}
                            </div>

                            <div className="pt-6 border-t border-slate-800">
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}