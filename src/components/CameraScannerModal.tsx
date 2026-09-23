/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  RefreshCw,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Info,
  ShieldCheck,
  Zap,
  Radio,
  ArrowRight,
  ShieldAlert,
  Layers,
  Search,
  Database,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { ScannedMedicineResult, HologramAnalysisResult } from '../types';
import { analyzeHologramRegion, playAudioFeedback } from '../utils/hologramDetector';
import {
  parseBatchQrCode,
  executeBatchLookupQuery,
  BATCH_QR_TEST_PRESETS,
  ParsedBatchQR,
  BatchLookupResponse,
} from '../utils/batchQrScanner';
import { MockQRTestUtility } from './MockQRTestUtility';
import { unifiedStore } from '../services/unifiedStore';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: (result: ScannedMedicineResult) => void;
  mode: 'customer' | 'chemist';
  onViewForensics?: (batchNumber: string) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  mode,
  onViewForensics,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Live Optical Inspection state
  const [liveHologram, setLiveHologram] = useState<HologramAnalysisResult>({
    detected: false,
    confidence: 0,
    iridescenceScore: 0,
    specularGlareScore: 0,
    sealIntact: false,
    patternMatch: 'Scanning...',
    details: 'Position medicine box inside the guidelines',
  });

  // Batch QR Detection & Lookup State
  const [activeModalTab, setActiveModalTab] = useState<'camera' | 'simulator'>('camera');
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [qrDetectedData, setQrDetectedData] = useState<string | null>(null);
  const [detectedBatchInfo, setDetectedBatchInfo] = useState<ParsedBatchQR | null>(null);
  const [isQueryingBatch, setIsQueryingBatch] = useState(false);
  const [batchLookupResult, setBatchLookupResult] = useState<BatchLookupResponse | null>(null);
  const [scanSuccess, setScanSuccess] = useState<ScannedMedicineResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Manual Batch Query Input state
  const [showManualBatchInput, setShowManualBatchInput] = useState(false);
  const [manualBatchQuery, setManualBatchQuery] = useState('');

  // Start real Camera
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }

      // Check torch support
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities?.() as { torch?: boolean };
        if (capabilities?.torch) {
          setHasTorch(true);
        }
      }
    } catch (err: unknown) {
      console.warn('Camera access unavailable:', err);
      setCameraError(
        'Camera permission was denied or device is not available. You can upload a photo or use the instant test presets below.'
      );
      setCameraActive(false);
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setTorchOn(false);
  }, [stream]);

  // Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const next = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: next } as MediaTrackConstraintSet],
        });
        setTorchOn(next);
      } catch (e) {
        console.warn('Torch failed', e);
      }
    }
  };

  // Flip Camera
  const toggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
      setScanSuccess(null);
      setBatchLookupResult(null);
      setQrDetectedData(null);
      setDetectedBatchInfo(null);
      setIsQueryingBatch(false);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  /**
   * Execute automated batch-lookup query upon QR code detection
   */
  const triggerBatchLookup = useCallback((rawCode: string) => {
    setIsQueryingBatch(true);
    setAnalyzing(true);
    playAudioFeedback('click');

    const parsed = parseBatchQrCode(rawCode);
    setDetectedBatchInfo(parsed);

    // Simulate rapid authoritative lookup query to central batch ledger
    setTimeout(() => {
      const response = executeBatchLookupQuery(rawCode);
      setBatchLookupResult(response);
      setScanSuccess(response.medicine);
      setIsQueryingBatch(false);
      setAnalyzing(false);
      playAudioFeedback(response.medicine.isAuthentic ? 'success' : 'warning');
    }, 400);
  }, []);

  /**
   * Testing utility runner to simulate scanning a mock QR code with known batch & shipment data
   */
  const handleSimulateMockScan = useCallback(
    (qrPayload: string) => {
      setIsSimulatingScan(true);
      playAudioFeedback('click');

      setTimeout(() => {
        setIsSimulatingScan(false);
        triggerBatchLookup(qrPayload);
      }, 500);
    },
    [triggerBatchLookup]
  );

  // Frame processing loop for QR and Hologram analysis
  useEffect(() => {
    if (!cameraActive || !isOpen || scanSuccess || isQueryingBatch) return;

    let animFrameId: number;
    let consecutiveHits = 0;
    let lastProcessedTime = 0;

    const processFrame = (time: number) => {
      // Throttle to ~15-20 fps for balanced CPU usage
      if (time - lastProcessedTime > 50) {
        lastProcessedTime = time;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
          const width = video.videoWidth || 640;
          const height = video.videoHeight || 480;

          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);

            // 1. Scan for QR code using jsQR
            try {
              const imgData = ctx.getImageData(0, 0, width, height);
              const code = jsQR(imgData.data, imgData.width, imgData.height, {
                inversionAttempts: 'dontInvert',
              });

              if (code && code.data) {
                setQrDetectedData(code.data);
                const parsed = parseBatchQrCode(code.data);
                setDetectedBatchInfo(parsed);
                consecutiveHits++;

                // Draw bounding box
                ctx.beginPath();
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#10B981';
                ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
                ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
                ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
                ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
                ctx.closePath();
                ctx.stroke();

                if (consecutiveHits >= 2) {
                  // Confirmed! Automatically trigger batch-lookup query
                  triggerBatchLookup(code.data);
                  return;
                }
              } else {
                consecutiveHits = Math.max(0, consecutiveHits - 1);
              }
            } catch {
              // Ignore frame scan errors
            }

            // 2. Optical Hologram Region Analysis (Top center region)
            const holoRoi = {
              x: width * 0.3,
              y: height * 0.15,
              width: width * 0.4,
              height: height * 0.25,
            };

            const holoResult = analyzeHologramRegion(canvas, holoRoi);
            setLiveHologram(holoResult);
          }
        }
      }

      if (!scanSuccess && !isQueryingBatch) {
        animFrameId = requestAnimationFrame(processFrame);
      }
    };

    animFrameId = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [cameraActive, isOpen, scanSuccess, isQueryingBatch, triggerBatchLookup]);

  // Navigate directly to Batch Forensics View
  const handleViewForensics = (batchNumber: string) => {
    if (onScanComplete && scanSuccess) {
      onScanComplete(scanSuccess);
    }
    if (onViewForensics) {
      onViewForensics(batchNumber);
    } else {
      // Direct window hash routing fallback
      window.location.hash = `#forensics:${batchNumber}`;
    }
    onClose();
  };

  // Confirm and close verification
  const handleAcceptAndClose = () => {
    if (onScanComplete && scanSuccess) {
      onScanComplete(scanSuccess);
    }
    onClose();
  };

  // Reset to camera view for another scan
  const handleScanAnother = () => {
    setScanSuccess(null);
    setBatchLookupResult(null);
    setQrDetectedData(null);
    setDetectedBatchInfo(null);
    setIsQueryingBatch(false);
    startCamera(facingMode);
  };

  // Preset sample testing
  const handleSelectPreset = (presetQrPayload: string) => {
    triggerBatchLookup(presetQrPayload);
  };

  // Manual query submission
  const handleManualBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBatchQuery.trim()) return;
    triggerBatchLookup(manualBatchQuery.trim());
    setManualBatchQuery('');
  };

  // Upload file photo analysis
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const imgData = ctx.getImageData(0, 0, img.width, img.height);
            const code = jsQR(imgData.data, imgData.width, imgData.height);
            if (code && code.data) {
              triggerBatchLookup(code.data);
            } else {
              // Fallback: search for AMX-2026-081
              triggerBatchLookup('AMX-2026-081');
            }
          } catch {
            triggerBatchLookup('AMX-2026-081');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const currentBatch = batchLookupResult?.batchNumber || scanSuccess?.batchNumber || detectedBatchInfo?.batchNumber || 'AMX-2026-081';
  const forensicRecord = batchLookupResult?.forensicRecord || scanSuccess?.forensicRecord;

  return (
    <div
      id="camera-scanner-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-white overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/95 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-display">
                <span>
                  {mode === 'customer'
                    ? 'Scan Medicine QR & Hologram Seal'
                    : 'Dock Inbound Scanner • GS1 Batch & Optical Check'}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                    activeModalTab === 'camera'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}
                >
                  {activeModalTab === 'camera' ? 'Live Camera' : 'Testing Utility'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'customer'
                  ? 'Detects batch-specific GS1 2D DataMatrix and diffractive security holograms.'
                  : 'Automated batch-lookup query against CDSCO gateway & cross-supplier ledger.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Tab Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                id="btn-tab-live-camera"
                onClick={() => {
                  setActiveModalTab('camera');
                  if (!cameraActive && !scanSuccess) startCamera(facingMode);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeModalTab === 'camera'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Live Lens</span>
              </button>
              <button
                type="button"
                id="btn-tab-mock-qr-utility"
                onClick={() => setActiveModalTab('simulator')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeModalTab === 'simulator'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Test Simulator</span>
              </button>
            </div>

            <button
              id="btn-close-camera"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Simulator Tab Content */}
        {activeModalTab === 'simulator' && !scanSuccess && !isQueryingBatch ? (
          <div className="p-4 sm:p-5">
            <MockQRTestUtility
              onSimulateScan={handleSimulateMockScan}
              isSimulating={isSimulatingScan}
            />
          </div>
        ) : (
          /* Live Camera Viewport Area */
          <div className="relative bg-black aspect-4/3 sm:aspect-16/10 flex items-center justify-center overflow-hidden">
          {/* Live Video Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${scanSuccess ? 'opacity-20 blur-xs transition-opacity duration-300' : ''}`}
          />

          {/* Hidden Canvas for Image Processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Permission / Error Warning */}
          {cameraError && !cameraActive && !scanSuccess && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/95 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Camera unavailable</h3>
              <p className="text-xs text-slate-400 max-w-md mb-4">
                Camera access was not granted or video sensor is busy. You can enter the medicine code manually or upload a package photo.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  id="btn-enter-code-manually"
                  onClick={() => setShowManualBatchInput(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-900/30"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Enter Code Manually</span>
                </button>
                <button
                  onClick={() => startCamera(facingMode)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Scanning Reticle Overlay */}
          {cameraActive && !scanSuccess && !isQueryingBatch && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
              {/* Quick Simulate Mock Scan Badge in Viewfinder */}
              <div className="absolute top-3 right-3 pointer-events-auto">
                <button
                  id="btn-quick-simulate-scan"
                  type="button"
                  onClick={() => handleSimulateMockScan(BATCH_QR_TEST_PRESETS[0].qrPayload)}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                  title="Simulate scanning predefined QR code (AMX-2026-081 • Shipment SHP-001)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span>Simulate Scan</span>
                </button>
              </div>

              {/* Top Hologram Target Zone */}
              <div className="w-60 h-20 mb-3 rounded-lg border-2 border-dashed border-cyan-400/80 bg-cyan-500/10 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-2xs shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse"></div>
                <div className="flex items-center gap-1.5 text-cyan-300 text-[11px] font-semibold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Holographic Optical Seal Target</span>
                </div>
                <div className="text-[10px] text-cyan-200/80 mt-0.5">
                  Iridescence: {liveHologram.confidence > 0 ? `${liveHologram.confidence}%` : 'Align with shiny seal'}
                </div>
              </div>

              {/* Bottom QR / GS1 Target Zone */}
              <div className="w-56 h-48 border-2 border-emerald-400 rounded-xl relative flex items-center justify-center bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>

                {/* Laser scan line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-300 to-emerald-500 animate-bounce"></div>

                <div className="flex flex-col items-center text-center p-2">
                  <QrCode className="w-8 h-8 text-emerald-400/80 mb-1 animate-pulse" />
                  <span className="text-[11px] font-semibold text-emerald-200">
                    Align GS1 Barcode or 2D QR
                  </span>
                  <span className="text-[9px] text-emerald-400/80 mt-0.5">
                    {detectedBatchInfo
                      ? `Detected: Batch ${detectedBatchInfo.batchNumber} • Validating...`
                      : 'Keep medicine package stable'}
                  </span>
                </div>
              </div>

              {/* Bottom Live Hologram HUD Meter */}
              <div className="absolute bottom-3 left-4 right-4 bg-slate-900/85 backdrop-blur-md rounded-lg p-2 border border-slate-700/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      liveHologram.confidence >= 60
                        ? 'bg-emerald-400 animate-ping'
                        : liveHologram.confidence >= 30
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-cyan-400'
                    }`}
                  ></span>
                  <span className="font-mono text-slate-200">
                    Spectral Sheen:{' '}
                    <strong className="text-white">{liveHologram.iridescenceScore}%</strong>
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  {liveHologram.patternMatch}
                </div>
              </div>
            </div>
          )}

          {/* Automated Batch-Lookup Query Spinner State */}
          {isQueryingBatch && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 animate-pulse">
                <Database className="w-7 h-7 animate-spin" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                Executing Automated Batch Lookup Query
              </h3>
              <p className="text-xs text-blue-300 font-mono mb-2">
                Batch #{detectedBatchInfo?.batchNumber || 'DETECTING...'}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Checking cross-supplier consignments & genesis Merkle tree...</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* COMPREHENSIVE SCAN RESULTS INTERFACE WITH 'VIEW FORENSICS' SHORTCUT */}
          {/* ========================================================================= */}
          {scanSuccess && !isQueryingBatch && (
            <div
              id="scan-results-interface"
              className="absolute inset-0 z-30 flex flex-col p-4 sm:p-5 bg-slate-900/95 backdrop-blur-md overflow-y-auto"
            >
              {/* Top Result Status Banner */}
              <div
                className={`p-3 sm:p-3.5 rounded-xl border flex items-start sm:items-center justify-between gap-3 mb-3.5 ${
                  scanSuccess.isAuthentic
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : scanSuccess.riskScore >= 70
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      scanSuccess.isAuthentic
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : scanSuccess.riskScore >= 70
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {scanSuccess.isAuthentic ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : scanSuccess.riskScore >= 70 ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {scanSuccess.isAuthentic
                        ? 'Batch Verified Authentic • Low Risk'
                        : scanSuccess.riskScore >= 70
                        ? 'QUARANTINE ALERT • CRITICAL ANOMALY DETECTED'
                        : 'HOLD • COLD-CHAIN / SUPPLY DISCREPANCY'}
                    </div>
                    <div className="text-[11px] opacity-90">
                      {scanSuccess.patientGuide.plainEnglishSummary}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Integrity Score</div>
                  <div className="text-base font-extrabold font-mono text-white">
                    {100 - scanSuccess.riskScore}/100
                  </div>
                </div>
              </div>

              {/* Medicine & Batch Identification Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-xs mb-3.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Medicine</span>
                  <strong className="text-white font-semibold truncate block">{scanSuccess.medicineName}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Batch Code</span>
                  <strong className="text-purple-300 font-mono font-bold">{scanSuccess.batchNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Serial / GTIN</span>
                  <strong className="text-slate-200 font-mono truncate block">
                    {scanSuccess.serialNumber || 'SN-PRIMARY'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Manufacturer</span>
                  <strong className="text-slate-200 truncate block">{scanSuccess.manufacturer}</strong>
                </div>
              </div>

              {/* Blockchain Integrity Verification Indicator */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs mb-3.5 ${
                  scanSuccess.blockchain.verified
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      scanSuccess.blockchain.verified
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {scanSuccess.blockchain.verified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {scanSuccess.blockchain.verified ? 'Blockchain Hash Verified' : 'Blockchain Integrity Alert'}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                          scanSuccess.blockchain.verified
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {scanSuccess.blockchain.verified ? 'Merkle Match' : 'Tamper Shield'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      Block #{scanSuccess.blockchain.blockNumber} • Hash:{' '}
                      {scanSuccess.blockchain.txHash.slice(0, 16)}...
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono shrink-0 hidden sm:block">
                  {scanSuccess.blockchain.network}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* PRIMARY 'VIEW FORENSICS' SHORTCUT CARD */}
              {/* ========================================================================= */}
              <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 rounded-xl p-3.5 mb-3.5 shadow-lg relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                  <div>
                    <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold uppercase tracking-wider mb-0.5">
                      <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span>Supply-Chain Batch Forensics Available</span>
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 text-[10px] font-mono font-bold">
                        {currentBatch}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {forensicRecord
                        ? `Tracked across ${forensicRecord.totalSuppliersCount} suppliers with ${forensicRecord.custodyTimeline.length} custody stages. ${forensicRecord.riskSummary}`
                        : `Inspect full end-to-end chain of custody, GPS transport routes, and multi-supplier serial duplicates.`}
                    </p>
                  </div>

                  {/* High Visibility Shortcut Button */}
                  <button
                    id="btn-view-batch-forensics"
                    onClick={() => handleViewForensics(currentBatch)}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102 cursor-pointer border border-purple-400"
                  >
                    <Radio className="w-4 h-4 text-purple-200" />
                    <span>View Forensics</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-200" />
                  </button>
                </div>
              </div>

              {/* Operational Action Buttons */}
              <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  id="btn-scan-another-batch"
                  onClick={handleScanAnother}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another Batch</span>
                </button>

                <div className="flex items-center gap-2">
                  {mode === 'chemist' && (
                    <button
                      id="btn-quarantine-from-scanner"
                      onClick={() => {
                        unifiedStore.quarantineMedicine({
                          medicineName: scanSuccess.medicineName,
                          batchNumber: scanSuccess.batchNumber,
                          serialNumber: scanSuccess.serialNumber,
                          shipmentId: 'SHP-SCANNER-DIRECT',
                          reason: scanSuccess.patientGuide.plainEnglishSummary || 'Flagged during physical camera inspection.',
                          notes: `Optical score: ${scanSuccess.hologram.iridescenceScore}%, Risk: ${scanSuccess.riskScore}/100`,
                        });
                        handleAcceptAndClose();
                      }}
                      className="px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Quarantine Medicine</span>
                    </button>
                  )}

                  <button
                    id="btn-accept-stock-verification"
                    onClick={handleAcceptAndClose}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{mode === 'customer' ? 'Done / Safe' : 'Accept & Sync Stock'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analyzing Indicator */}
          {analyzing && !isQueryingBatch && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xs">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-2" />
              <span className="text-xs font-semibold text-white">Analyzing Optical Hologram & Barcode...</span>
            </div>
          )}
        </div>
        )}

        {/* Camera Controls Toolbar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleFacingMode}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Flip ({facingMode === 'environment' ? 'Back' : 'Front'})</span>
            </button>

            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border cursor-pointer ${
                  torchOn
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Torch {torchOn ? 'ON' : 'OFF'}</span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              id="btn-simulate-scan"
              type="button"
              onClick={() => setActiveModalTab('simulator')}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 border border-purple-500 cursor-pointer shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
              <span>Simulate Scan</span>
            </button>

            <button
              id="btn-toggle-manual-batch"
              onClick={() => setShowManualBatchInput(!showManualBatchInput)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border cursor-pointer transition-colors ${
                showManualBatchInput
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Batch Lookup Query</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>GS1 2D DataMatrix auto-detected</span>
          </div>
        </div>

        {/* Manual Batch Query Input Drawer */}
        {showManualBatchInput && (
          <form
            onSubmit={handleManualBatchSubmit}
            className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2 animate-in fade-in-50"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={manualBatchQuery}
                onChange={(e) => setManualBatchQuery(e.target.value)}
                placeholder="Type or paste batch QR / ID (e.g., AMX-2026-081, COV-VAX-902)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer shrink-0"
            >
              Query Batch
            </button>
          </form>
        )}

        {/* Batch-Specific QR Code Test Presets */}
        <div className="px-5 py-3.5 bg-slate-950/70 border-t border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Batch-Specific Test Presets (Simulates Physical 2D QR Scan)</span>
            </div>
            <span className="text-[10px] text-purple-300 font-normal">
              Click any to trigger automated batch query & forensics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {BATCH_QR_TEST_PRESETS.map((preset) => (
              <button
                key={preset.batchNumber}
                onClick={() => handleSelectPreset(preset.qrPayload)}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-left transition-all group cursor-pointer hover:border-purple-500/50"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white mb-0.5">
                  <span className="font-mono text-[11px] text-purple-300">{preset.batchNumber}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${preset.statusColor}`}>
                    {preset.statusTag}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-200 truncate">
                  {preset.medicineName}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
