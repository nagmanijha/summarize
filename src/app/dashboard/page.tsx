"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";

// Types
interface PageData {
    pageNumber: number;
    text: string;
    confidence: number;
}

interface ProcessingResult {
    rawText: string;
    cleanExtract: string;
    pages: PageData[];
    wordCount: number;
    confidence: number;
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
}

type AppState = "upload" | "processing" | "results";
type ResultTab = "summary" | "clean" | "raw";

interface ProcessingStep {
    label: string;
    description: string;
    status: "pending" | "processing" | "completed" | "error";
}

export default function DashboardPage() {
    const [appState, setAppState] = useState<AppState>("upload");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ProcessingResult | null>(null);
    const [activeTab, setActiveTab] = useState<ResultTab>("summary");
    const [progress, setProgress] = useState(0);
    const [steps, setSteps] = useState<ProcessingStep[]>([
        { label: "Uploading Document", description: "Preparing file for processing", status: "pending" },
        { label: "OCR Processing", description: "Extracting text from handwriting", status: "pending" },
        { label: "Cleaning Text", description: "Removing noise and formatting artifacts", status: "pending" },
        { label: "Generating Summary", description: "Creating concise bullet points via Gemini", status: "pending" },
    ]);
    const [showConfidence, setShowConfidence] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // File handling
    const handleFileSelect = useCallback((file: File) => {
        setError(null);
        if (file.type !== "application/pdf") {
            setError("Only PDF files are accepted");
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setError("File size exceeds 20MB limit");
            return;
        }
        setSelectedFile(file);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
        },
        [handleFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const removeFile = () => {
        setSelectedFile(null);
        setError(null);
    };

    const updateStep = (index: number, status: ProcessingStep["status"], description?: string) => {
        setSteps((prev) =>
            prev.map((s, i) =>
                i === index ? { ...s, status, description: description || s.description } : s
            )
        );
    };

    // Process document
    const processDocument = async () => {
        if (!selectedFile) return;

        setAppState("processing");
        setProgress(0);
        setSteps([
            { label: "Uploading Document", description: "Preparing file for processing", status: "pending" },
            { label: "OCR Processing", description: "Extracting text from handwriting", status: "pending" },
            { label: "Cleaning Text", description: "Removing noise and formatting artifacts", status: "pending" },
            { label: "Generating Summary", description: "Creating concise bullet points via Gemini", status: "pending" },
        ]);

        try {
            // Step 1: Upload
            updateStep(0, "processing", "Uploading file...");
            setProgress(10);

            const formData = new FormData();
            formData.append("file", selectedFile);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                throw new Error(err.error || "Upload failed");
            }

            const uploadData = await uploadRes.json();
            updateStep(0, "completed", `File uploaded successfully (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)`);
            setProgress(25);

            // Step 2: Process (OCR + Clean + Summarize)
            updateStep(1, "processing", "Sending to Document AI...");
            setProgress(35);

            const processRes = await fetch("/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filePath: uploadData.filePath }),
            });

            // Simulate intermediate steps for UX
            updateStep(1, "completed", `Text extracted with ${uploadData.confidence || 95}% confidence`);
            setProgress(55);
            updateStep(2, "processing", "Removing noise and formatting artifacts");
            setProgress(65);

            if (!processRes.ok) {
                const err = await processRes.json();
                throw new Error(err.error || "Processing failed");
            }

            const processData: ProcessingResult = await processRes.json();

            updateStep(2, "completed", "Text cleaned and formatted");
            setProgress(80);
            updateStep(3, "processing", "Generating AI summary...");
            setProgress(90);

            // Small delay for UX
            await new Promise((r) => setTimeout(r, 500));

            updateStep(3, "completed", "Summary generated successfully");
            setProgress(100);

            await new Promise((r) => setTimeout(r, 300));

            setResult(processData);
            setAppState("results");
        } catch (err) {
            const message = err instanceof Error ? err.message : "An error occurred";
            setError(message);
            // Mark current processing step as error
            setSteps((prev) =>
                prev.map((s) => (s.status === "processing" ? { ...s, status: "error" } : s))
            );
        }
    };

    const cancelProcessing = () => {
        setAppState("upload");
        setProgress(0);
        setError(null);
    };

    const startNewUpload = () => {
        setAppState("upload");
        setSelectedFile(null);
        setResult(null);
        setError(null);
        setProgress(0);
        setActiveTab("summary");
    };

    // Download handlers
    const downloadTxt = () => {
        if (!result) return;
        const content = `SCRIBEAI - Document Summary\n${"=".repeat(40)}\n\nEXECUTIVE SUMMARY\n${result.summary.executiveSummary}\n\nKEY POINTS\n${result.summary.bulletPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\nKEY TOPICS\n${result.summary.keyTopics.join(", ")}\n\nCLEAN EXTRACT\n${result.cleanExtract}`;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "scribeai-summary.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = () => {
        if (!result) return;
        const content = `${result.summary.executiveSummary}\n\n${result.summary.bulletPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}`;
        navigator.clipboard.writeText(content);
    };

    const getConfidenceLabel = (conf: number) => {
        if (conf >= 0.9) return { label: "High", color: "text-green-600 bg-green-50 border-green-200" };
        if (conf >= 0.7) return { label: "Medium", color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
        return { label: "Low", color: "text-red-600 bg-red-50 border-red-200" };
    };

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="min-h-screen bg-[#f6f6f8] font-[var(--font-inter)]">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200 h-14 flex items-center px-6 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-[#4361ee]/10 p-1 rounded-lg">
                        <span className="material-icons text-[#4361ee] text-lg">description</span>
                    </div>
                    <span className="font-bold text-base tracking-tight text-gray-900">ScribeAI</span>
                </Link>
                {appState === "results" && result && (
                    <div className="ml-4 flex items-center gap-2 text-sm text-gray-500">
                        <span>›</span>
                        <span className="text-gray-700 font-medium">{selectedFile?.name}</span>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Processed</span>
                    </div>
                )}
                <div className="ml-auto flex items-center gap-3">
                    {appState === "results" && (
                        <>
                            <button onClick={copyToClipboard} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <span className="material-icons text-base">content_copy</span> Copy All
                            </button>
                            <button onClick={downloadTxt} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <span className="material-icons text-base">description</span> TXT
                            </button>
                            <button onClick={downloadTxt} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#4361ee] text-white rounded-lg text-sm font-medium hover:bg-[#3651d4] transition-colors">
                                <span className="material-icons text-base">download</span> Download PDF
                            </button>
                        </>
                    )}
                    <button className="text-gray-400 hover:text-gray-600">
                        <span className="material-icons">help_outline</span>
                    </button>
                </div>
            </nav>

            {/* UPLOAD STATE */}
            {appState === "upload" && (
                <div className="flex items-center justify-center min-h-[calc(100vh-56px)] p-6">
                    <div className="w-full max-w-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Convert Handwriting to Text</h1>
                            <p className="text-gray-500 text-lg">Upload your PDF to generate an AI summary using Gemini.</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            {/* Step indicator */}
                            <div className="flex mb-6">
                                <div className="flex-1 h-1 bg-[#4361ee] rounded-l-full"></div>
                                <div className={`flex-1 h-1 ${selectedFile ? "bg-[#4361ee]" : "bg-gray-200"} rounded-r-full`}></div>
                            </div>

                            {/* Drop Zone */}
                            <div
                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${isDragging
                                        ? "border-[#4361ee] bg-[#4361ee]/5"
                                        : "border-gray-300 hover:border-[#4361ee]/50"
                                    }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileSelect(file);
                                    }}
                                />
                                <div className="w-14 h-14 bg-[#4361ee]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-icons text-[#4361ee] text-3xl">cloud_upload</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Drag & drop your handwritten PDF</h3>
                                <p className="text-sm text-gray-500 mb-1">
                                    or <span className="text-[#4361ee] font-medium cursor-pointer">click to browse</span>
                                </p>
                                <p className="text-xs text-gray-400 font-medium tracking-wider mt-2">MAX 20MB • PDF ONLY</p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                                    <span className="material-icons text-base">error</span>
                                    {error}
                                </div>
                            )}

                            {/* Selected File */}
                            {selectedFile && (
                                <>
                                    <div className="mt-6 border-t border-gray-100 pt-4">
                                        <p className="text-xs text-gray-400 text-center tracking-widest mb-3">FILE SELECTED</p>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="material-icons text-red-500 text-xl">picture_as_pdf</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate">{selectedFile.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {formatSize(selectedFile.size)} • <span className="text-green-600 font-medium">Ready to process</span>
                                                </p>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); removeFile(); }} className="text-gray-400 hover:text-gray-600">
                                                <span className="material-icons text-xl">delete_outline</span>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={processDocument}
                                        className="mt-6 w-full flex items-center justify-center gap-2 bg-[#4361ee] hover:bg-[#3651d4] text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-[#4361ee]/25 hover:-translate-y-0.5"
                                    >
                                        <span className="material-icons text-xl">auto_awesome</span>
                                        Process Document
                                    </button>
                                </>
                            )}

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                                <span className="material-icons text-sm">lock</span>
                                Files are encrypted and auto-deleted after processing.
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
                            <a href="#" className="hover:text-[#4361ee]">Documentation</a>
                            <a href="#" className="hover:text-[#4361ee]">Privacy Policy</a>
                            <a href="#" className="hover:text-[#4361ee]">Help Center</a>
                        </div>
                    </div>
                </div>
            )}

            {/* PROCESSING STATE */}
            {appState === "processing" && (
                <div className="flex items-center justify-center min-h-[calc(100vh-56px)] p-6">
                    <div className="w-full max-w-xl">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
                            {/* Animated icon */}
                            <div className="w-20 h-20 bg-[#4361ee]/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                <div className="absolute inset-0 rounded-full border-2 border-[#4361ee]/20 animate-spin-slow" style={{ borderTopColor: "#4361ee" }}></div>
                                <span className="material-icons text-[#4361ee] text-3xl">document_scanner</span>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Document</h2>
                            <p className="text-gray-500 text-sm mb-8">
                                <span className="text-[#4361ee]">Processing</span> {selectedFile?.name}
                            </p>

                            {/* Steps */}
                            <div className="space-y-4 text-left mb-8">
                                {steps.map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 flex-shrink-0">
                                            {step.status === "completed" && (
                                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="material-icons text-green-600 text-base">check</span>
                                                </div>
                                            )}
                                            {step.status === "processing" && (
                                                <div className="w-6 h-6 border-2 border-[#4361ee] rounded-full flex items-center justify-center animate-pulse">
                                                    <div className="w-2 h-2 bg-[#4361ee] rounded-full"></div>
                                                </div>
                                            )}
                                            {step.status === "pending" && (
                                                <div className="w-6 h-6 border-2 border-gray-200 rounded-full"></div>
                                            )}
                                            {step.status === "error" && (
                                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                                    <span className="material-icons text-red-600 text-base">close</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className={`font-medium text-sm ${step.status === "pending" ? "text-gray-400" : step.status === "error" ? "text-red-600" : step.status === "processing" ? "text-[#4361ee]" : "text-gray-900"}`}>
                                                    {step.label}
                                                </p>
                                                <span className={`text-xs font-medium ${step.status === "completed" ? "text-green-600" : step.status === "processing" ? "text-[#4361ee]" : step.status === "error" ? "text-red-600" : "text-gray-400"}`}>
                                                    {step.status === "completed" ? "Completed" : step.status === "processing" ? "Processing..." : step.status === "error" ? "Failed" : "Pending"}
                                                </span>
                                            </div>
                                            <p className={`text-xs mt-0.5 ${step.status === "pending" ? "text-gray-300" : "text-gray-500"}`}>
                                                {step.description}
                                            </p>
                                            {step.status === "processing" && (
                                                <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#4361ee] rounded-full progress-striped transition-all duration-500" style={{ width: "60%" }}></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    <span className="material-icons text-base mr-1 align-middle">error</span>
                                    {error}
                                </div>
                            )}

                            {/* Total Progress */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-500 tracking-wider">TOTAL PROGRESS</span>
                                    <span className="text-lg font-bold text-[#4361ee]">{progress}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#4361ee] rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <span className="material-icons text-xs">schedule</span>
                                    Estimated time remaining: {Math.max(0, Math.round((100 - progress) / 8))} seconds
                                </p>
                            </div>

                            <button
                                onClick={cancelProcessing}
                                className="mt-6 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                            >
                                Cancel Processing
                            </button>
                        </div>

                        {/* Fun fact */}
                        <div className="mt-6 bg-white rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                            <span className="material-icons text-yellow-500 text-xl flex-shrink-0 mt-0.5">lightbulb</span>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Did you know?</p>
                                <p className="text-sm text-gray-500">Our AI can recognize handwriting in over 30 languages and automatically translates mixed-language documents.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* RESULTS STATE */}
            {appState === "results" && result && (
                <div className="flex min-h-[calc(100vh-56px)]">
                    {/* Sidebar */}
                    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                        <div className="p-4 border-b border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">CURRENT PROJECT</p>
                            <div className="space-y-0.5">
                                <button
                                    onClick={() => setActiveTab("summary")}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "summary" ? "bg-[#4361ee]/10 text-[#4361ee] border-l-2 border-[#4361ee]" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <span className="material-icons text-base">auto_awesome</span>
                                    AI Summary
                                </button>
                                <button
                                    onClick={() => setActiveTab("clean")}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "clean" ? "bg-[#4361ee]/10 text-[#4361ee] border-l-2 border-[#4361ee]" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <span className="material-icons text-base">article</span>
                                    Clean Extract
                                </button>
                                <button
                                    onClick={() => setActiveTab("raw")}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "raw" ? "bg-[#4361ee]/10 text-[#4361ee] border-l-2 border-[#4361ee]" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <span className="material-icons text-base">data_object</span>
                                    Raw OCR Data
                                </button>
                            </div>
                        </div>

                        <div className="p-4 border-b border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">HISTORY</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                                    <span className="text-gray-600 truncate">{selectedFile?.name || "Document.pdf"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-4">
                            <button
                                onClick={startNewUpload}
                                className="w-full flex items-center justify-center gap-2 bg-[#4361ee] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3651d4] transition-colors"
                            >
                                <span className="material-icons text-base">add</span>
                                Upload New
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                        {/* AI Summary Tab */}
                        {activeTab === "summary" && (
                            <div className="max-w-4xl animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">AI Summary</h1>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Generated • {Math.round(result.confidence * 100)}% Confidence Score
                                        </p>
                                    </div>
                                </div>

                                {/* Executive Summary */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-icons text-[#4361ee] text-xl">auto_awesome</span>
                                        <h2 className="text-lg font-bold text-gray-900">Executive Summary</h2>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{result.summary.executiveSummary}</p>
                                </div>

                                <div className="grid lg:grid-cols-5 gap-6">
                                    {/* Key Points */}
                                    <div className="lg:col-span-3">
                                        <h3 className="text-xs font-semibold text-gray-400 tracking-widest mb-3">KEY POINTS & ACTION ITEMS</h3>
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <div className="space-y-4">
                                                {result.summary.bulletPoints.map((point, i) => (
                                                    <div key={i} className="flex items-start gap-3">
                                                        <span className="flex-shrink-0 w-6 h-6 bg-[#4361ee]/10 text-[#4361ee] rounded-md flex items-center justify-center text-xs font-bold mt-0.5">
                                                            {i + 1}
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{point.split(".")[0]}{point.includes(".") ? "." : ""}</p>
                                                            {point.includes(".") && point.split(".").length > 1 && (
                                                                <p className="text-sm text-gray-500 mt-0.5">{point.split(".").slice(1).join(".").trim()}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right column: Topics + Entities */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Key Topics */}
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-400 tracking-widest mb-3">IDENTIFIED TOPICS</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {result.summary.keyTopics.map((topic, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#4361ee]/50 hover:text-[#4361ee] transition-colors cursor-default"
                                                    >
                                                        #{topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Entities */}
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-400 tracking-widest mb-3">ENTITIES DETECTED</h3>
                                            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                                                {result.summary.entities.dates.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="material-icons text-gray-400 text-base mt-0.5">calendar_today</span>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500">Dates</p>
                                                            <p className="text-sm text-gray-700">{result.summary.entities.dates.join(", ")}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {result.summary.entities.amounts.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="material-icons text-gray-400 text-base mt-0.5">attach_money</span>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500">Money</p>
                                                            <p className="text-sm text-gray-700">{result.summary.entities.amounts.join(", ")}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {result.summary.entities.organizations.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="material-icons text-gray-400 text-base mt-0.5">business</span>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500">Orgs</p>
                                                            <p className="text-sm text-gray-700">{result.summary.entities.organizations.join(", ")}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {result.summary.entities.people.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="material-icons text-gray-400 text-base mt-0.5">person</span>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500">People</p>
                                                            <p className="text-sm text-gray-700">{result.summary.entities.people.join(", ")}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Clean Extract Tab */}
                        {activeTab === "clean" && (
                            <div className="max-w-4xl animate-fade-in">
                                {/* File info bar */}
                                <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 mb-6">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="material-icons text-red-500">picture_as_pdf</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-sm">{selectedFile?.name || "Document.pdf"}</p>
                                        <p className="text-xs text-gray-500">{result.pages.length} Pages • {selectedFile ? formatSize(selectedFile.size) : ""} • Processed</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-[#4361ee]">{Math.round(result.confidence * 100)}%<span className="text-xs font-normal text-gray-400 ml-1">Confidence</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">{result.wordCount.toLocaleString()}<span className="text-xs font-normal text-gray-400 ml-1">Words</span></p>
                                    </div>
                                </div>

                                {/* Pages */}
                                {result.pages.map((page) => {
                                    const conf = getConfidenceLabel(page.confidence);
                                    return (
                                        <div key={page.pageNumber} className="mb-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-[#4361ee] tracking-wider">PAGE {page.pageNumber}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${conf.color}`}>
                                                    Confidence: {conf.label}
                                                </span>
                                            </div>
                                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                    {page.text}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Raw OCR Tab */}
                        {activeTab === "raw" && (
                            <div className="max-w-4xl animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">Processing Results</h1>
                                        <div className="flex items-center gap-4 mt-1 text-sm">
                                            <button
                                                onClick={() => setActiveTab("summary")}
                                                className="text-gray-500 hover:text-[#4361ee] font-medium"
                                            >
                                                AI Summary
                                            </button>
                                            <button className="text-[#4361ee] font-semibold border-b-2 border-[#4361ee] pb-0.5">
                                                Raw OCR
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning banner */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                                    <span className="material-icons text-amber-500 text-xl flex-shrink-0">warning</span>
                                    <div>
                                        <p className="font-semibold text-amber-700 text-sm">Low confidence segments detected</p>
                                        <p className="text-xs text-amber-600 mt-0.5">
                                            The AI flagged some segments with low confidence. Please review highlighted areas.
                                        </p>
                                    </div>
                                    <button className="ml-auto text-amber-400 hover:text-amber-600 flex-shrink-0">
                                        <span className="material-icons text-lg">close</span>
                                    </button>
                                </div>

                                {/* Toolbar */}
                                <div className="flex items-center gap-4 bg-white rounded-t-xl border border-gray-200 border-b-0 px-4 py-2.5">
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <div
                                            onClick={() => setShowConfidence(!showConfidence)}
                                            className={`w-9 h-5 rounded-full cursor-pointer transition-colors ${showConfidence ? "bg-[#4361ee]" : "bg-gray-300"}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${showConfidence ? "translate-x-4.5 ml-0.5" : "translate-x-0.5"}`}></div>
                                        </div>
                                        Show confidence markers
                                    </label>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-200"></span> Caution</span>
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200"></span> Critical</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <div className="relative">
                                            <span className="material-icons text-gray-400 text-base absolute left-2 top-1/2 -translate-y-1/2">search</span>
                                            <input
                                                type="text"
                                                placeholder="Find in text..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-40 focus:outline-none focus:border-[#4361ee]"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(result.rawText);
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <span className="material-icons text-lg">content_copy</span>
                                        </button>
                                    </div>
                                </div>

                                {/* JSON View */}
                                <div className="bg-white rounded-b-xl border border-gray-200 overflow-hidden">
                                    <div className="json-viewer p-6 overflow-x-auto max-h-[600px] overflow-y-auto bg-gray-50">
                                        <pre className="text-sm leading-relaxed">
                                            {JSON.stringify(
                                                {
                                                    document_type: "handwritten_notes",
                                                    processed_at: new Date().toISOString(),
                                                    total_pages: result.pages.length,
                                                    confidence: result.confidence,
                                                    content_blocks: result.pages.map((p) => ({
                                                        page: p.pageNumber,
                                                        confidence: p.confidence,
                                                        text: p.text,
                                                    })),
                                                },
                                                null,
                                                2
                                            )}
                                        </pre>
                                    </div>
                                    <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between text-xs text-gray-400 bg-white">
                                        <span>UTF-8 • JSON</span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Document AI Status: Processed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            )}
        </div>
    );
}
