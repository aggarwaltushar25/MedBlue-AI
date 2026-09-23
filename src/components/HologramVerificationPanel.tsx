/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Camera,
  Upload,
  RotateCcw,
  X,
  FileText,
  Lock,
  CheckCircle2,
  Scan,
  RefreshCw,
  Eye,
  Info,
} from 'lucide-react';
import { unifiedStore } from '../services/unifiedStore';
import { HologramReference, HologramCheck, UserRole } from '../types';

interface HologramVerificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  medicineName: string;
  batchNumber: string;
  shipmentId?: string;
  manufacturerName?: string;
  currentLocation?: string;
  role: UserRole;
  actorName: string;
  onVerificationComplete?: (result: 'PASS' | 'FLAGGED' | 'UNABLE_TO_VERIFY', check: HologramCheck) => void;
  onActionHold?: () => void;
  onActionQuarantine?: (notes: string, evidenceUrl?: string) => void;
}

export const HologramVerificationPanel: React.FC<HologramVerificationPanelProps> = ({
  isOpen,
  onClose,
  medicineName,
  batchNumber,
  shipmentId = 'SHP-LIVE',
  manufacturerName = 'Authorized Manufacturer',
  currentLocation = 'Current Facility',
  role,
  actorName,
  onVerificationComplete,
  onActionHold,
  onActionQuarantine,
}) => {
  const [reference, setReference] = useState<HologramReference | null>(null);
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<'PASS' | 'FLAGGED' | 'UNABLE_TO_VERIFY' | null>(null);
  const [resultLabel, setResultLabel] = useState<string>('');
  const [resultDetail, setResultDetail] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [quarantineNotes, setQuarantineNotes] = useState<string>('');
  const [showQuarantineForm, setShowQuarantineForm] = useState<boolean>(false);
  const [history, setHistory] = useState<HologramCheck[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch reference and checks on load
  useEffect(() => {
    if (isOpen && batchNumber) {
      const ref = unifiedStore.getHologramReference(batchNumber);
      setReference(ref);

      const checks = unifiedStore.getHologramChecks(batchNumber);
      setHistory(checks);

      // Reset local state
      setCapturedImage(null);
      setVerificationResult(null);
      setResultLabel('');
      setResultDetail('');
      setShowQuarantineForm(false);
      setQuarantineNotes('');
    }
  }, [isOpen, batchNumber]);

  // Handle Camera Stream lifecycle
  useEffect(() => {
    if (isOpen && captureMode === 'camera' && !capturedImage) {
      let isMounted = true;
      setCameraError(null);

      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (!isMounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn('Camera access error:', err);
          setCameraError('Camera access unavailable or permission denied. Switch to image upload mode.');
          setCaptureMode('upload');
        });

      return () => {
        isMounted = false;
        if (cameraStream) {
          cameraStream.getTracks().forEach((t) => t.stop());
        }
      };
    } else if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  }, [isOpen, captureMode, capturedImage]);

  if (!isOpen) return null;

  // Snap photo from video stream
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
    }
  };

  // Handle Image File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setCapturedImage(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Execute Hologram Check (Deterministic Demo Mode)
  const handleRunVerification = () => {
    if (!capturedImage) return;

    setIsScanning(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsScanning(false);

      // Deterministic evaluation based on batch number / known status
      let res: 'PASS' | 'FLAGGED' | 'UNABLE_TO_VERIFY' = 'PASS';
      let label = 'PASS — Pattern appears consistent';
      let detail = 'Microtext alignment, GS1 diffractive grid, and seal integrity reflect authentic manufacturer specifications.';

      // Check if reference is missing
      if (!reference) {
        res = 'UNABLE_TO_VERIFY';
        label = 'UNABLE TO VERIFY — Reference missing';
        detail = 'Unable to reliably verify this hologram because no reference hologram was uploaded by the manufacturer for this batch. Please scan the QR barcode or enter batch identifier manually.';
      } else {
        // Evaluate batch risk from store
        const shipment = unifiedStore.getShipments().find((s) => s.batchNumber === batchNumber);
        const inventoryItem = unifiedStore.getInventory().find((i) => i.batchNumber === batchNumber);

        const isKnownRisk =
          batchNumber.includes('AMX') ||
          batchNumber.includes('PAR') ||
          shipment?.status === 'Quarantined' ||
          shipment?.status === 'Hold' ||
          shipment?.isFlagged ||
          inventoryItem?.verificationStatus === 'Quarantined' ||
          inventoryItem?.isDuplicate;

        if (isKnownRisk) {
          res = 'FLAGGED';
          label = 'FLAGGED — Hologram requires verification';
          detail = 'Diffractive reflectance anomaly detected. Iridescence pattern density and micro-engraving do not match the official manufacturer reference sample.';
        }
      }

      setVerificationResult(res);
      setResultLabel(label);
      setResultDetail(detail);

      // Save record in store
      const checkRecord: HologramCheck = {
        id: `HOL-CHK-${Date.now()}`,
        medicineId: `MED-${batchNumber}`,
        medicineName,
        batchId: `BATCH-${batchNumber}`,
        batchNumber,
        shipmentId,
        actor: actorName,
        actorRole:
          role === 'wholesaler'
            ? 'Wholesaler'
            : role === 'pharmacist'
            ? 'Pharmacist'
            : role === 'chemist'
            ? 'Chemist'
            : role === 'manufacturer'
            ? 'Manufacturer'
            : role === 'regulatory'
            ? 'Regulator'
            : 'Admin',
        organization: currentLocation,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST',
        location: currentLocation,
        result: res,
        resultLabel: label,
        capturedImageUrl: capturedImage,
        referenceImageUrl: reference?.referenceImageUrl,
        notes: detail,
      };

      const savedCheck = unifiedStore.recordHologramCheck(checkRecord);
      setHistory(unifiedStore.getHologramChecks(batchNumber));

      if (onVerificationComplete) {
        onVerificationComplete(res, savedCheck);
      }
    }, 1500);
  };

  const handleConfirmQuarantine = () => {
    if (onActionQuarantine) {
      onActionQuarantine(quarantineNotes || 'Hologram diffractive reflectance mismatch detected during dock inspection.', capturedImage || undefined);
    }
    setShowQuarantineForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-tight">Hologram Verification System</h3>
                <span className="px-2 py-0.5 text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  Demo Verification — Controlled Test Dataset
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {medicineName} <span className="text-slate-600">·</span> Batch <span className="font-mono text-slate-300">{batchNumber}</span> <span className="text-slate-600">·</span> {shipmentId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT SCROLLABLE AREA */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* DUAL COMPARISON GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT: REFERENCE HOLOGRAM */}
            <div className="p-5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Reference Hologram
                    </span>
                  </div>
                  {reference ? (
                    <span className="px-2 py-0.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      Official Batch Sample Available
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[11px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full">
                      Reference Missing
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  Official high-resolution diffractive reference sample uploaded by manufacturer during batch genesis.
                </p>

                {/* REFERENCE IMAGE DISPLAY */}
                <div className="relative aspect-video w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center group">
                  {reference?.referenceImageUrl ? (
                    <img
                      src={reference.referenceImageUrl}
                      alt="Official Reference Hologram"
                      className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
                      <p className="text-xs font-medium text-slate-300">No Reference Hologram Available</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Manufacturer has not uploaded a reference sample for batch {batchNumber}.
                      </p>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-md border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                    <span>Reference Hologram — Official Batch Sample</span>
                    <span className="text-emerald-400">GS1 Verified</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Manufacturer: <strong className="text-slate-200">{reference?.manufacturerName || manufacturerName}</strong></span>
                <span>Location: <strong className="text-slate-200">{reference?.location || 'Genesis Hub'}</strong></span>
              </div>
            </div>

            {/* RIGHT: CAPTURED HOLOGRAM */}
            <div className="p-5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Captured Hologram
                    </span>
                  </div>

                  {/* CAPTURE MODE TOGGLE */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
                    <button
                      onClick={() => { setCaptureMode('camera'); setCapturedImage(null); }}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                        captureMode === 'camera' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Camera className="w-3 h-3" />
                      Camera
                    </button>
                    <button
                      onClick={() => { setCaptureMode('upload'); setCapturedImage(null); }}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                        captureMode === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      Upload
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  Capture physical hologram from batch packaging using device camera or file upload.
                </p>

                {/* VIEWPORT / CAMERA / UPLOAD DISPLAY */}
                <div className="relative aspect-video w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                  
                  {/* SCANNING OVERLAY ANIMATION */}
                  {isScanning && (
                    <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                      <div className="relative w-16 h-16 mb-3">
                        <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <Scan className="w-8 h-8 text-blue-400 absolute inset-0 m-auto" />
                      </div>
                      <p className="text-xs font-semibold text-blue-300 tracking-wide uppercase">Analyzing Diffractive Pattern...</p>
                      <p className="text-[11px] text-slate-400 mt-1">Comparing against official reference sample</p>
                    </div>
                  )}

                  {/* PREVIEW OF CAPTURED IMAGE */}
                  {capturedImage ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                      <img src={capturedImage} alt="Captured Hologram" className="w-full h-full object-contain p-2" />
                      <button
                        onClick={() => setCapturedImage(null)}
                        className="absolute top-2 right-2 px-2.5 py-1 bg-slate-900/90 text-slate-300 hover:text-white text-xs rounded-md border border-slate-700 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Retake
                      </button>
                    </div>
                  ) : captureMode === 'camera' ? (
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                      
                      {/* RETICLE OVERLAY */}
                      <div className="absolute inset-6 border-2 border-dashed border-blue-400/60 rounded-lg pointer-events-none flex items-center justify-center">
                        <span className="text-[11px] font-mono text-blue-300 bg-slate-950/80 px-2 py-0.5 rounded">
                          Align Hologram in Box
                        </span>
                      </div>

                      <button
                        onClick={handleSnapPhoto}
                        className="absolute bottom-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Capture Frame
                      </button>
                    </div>
                  ) : (
                    /* UPLOAD MODE */
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-800 hover:border-slate-700 transition-colors">
                      <Upload className="w-8 h-8 text-slate-500 mb-2" />
                      <p className="text-xs font-medium text-slate-300">Upload Captured Hologram Photo</p>
                      <p className="text-[11px] text-slate-500 mt-1 mb-3">PNG, JPG, or WEBP up to 10MB</p>
                      <label className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg cursor-pointer transition-colors border border-slate-700">
                        Browse Image File
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {cameraError && (
                <p className="text-[11px] text-amber-400 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" />
                  {cameraError}
                </p>
              )}

              {/* ACTION BUTTON TO RUN CHECK */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Inspector: <strong className="text-slate-200">{actorName}</strong>
                </span>

                <button
                  onClick={handleRunVerification}
                  disabled={!capturedImage || isScanning}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
                    capturedImage && !isScanning
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Scan className="w-4 h-4" />
                  Run Hologram Check
                </button>
              </div>
            </div>

          </div>

          {/* VERIFICATION RESULT DISPLAY */}
          {verificationResult && (
            <div className={`p-5 rounded-xl border animate-in fade-in duration-200 ${
              verificationResult === 'PASS'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                : verificationResult === 'FLAGGED'
                ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {verificationResult === 'PASS' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : verificationResult === 'FLAGGED' ? (
                    <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  )}

                  <div>
                    <h4 className="text-sm font-semibold tracking-tight">{resultLabel}</h4>
                    <p className="text-xs mt-1 opacity-90 leading-relaxed">{resultDetail}</p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] opacity-75 font-mono">
                      <span>Batch: {batchNumber}</span>
                      <span>Location: {currentLocation}</span>
                      <span>Evaluated: {new Date().toLocaleTimeString()} IST</span>
                    </div>
                  </div>
                </div>

                {/* ACTION OPTIONS BASED ON RESULT */}
                <div className="shrink-0 flex flex-col sm:flex-row gap-2">
                  {verificationResult === 'FLAGGED' && (
                    <>
                      <button
                        onClick={() => {
                          if (onActionHold) onActionHold();
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 rounded-lg transition-colors"
                      >
                        Hold Shipment
                      </button>
                      <button
                        onClick={() => setShowQuarantineForm(true)}
                        className="px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow-sm"
                      >
                        Quarantine & Report
                      </button>
                    </>
                  )}

                  {verificationResult === 'PASS' && (
                    <button
                      onClick={onClose}
                      className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
                    >
                      Confirm Verification
                    </button>
                  )}
                </div>
              </div>

              {/* QUARANTINE MODAL FORM */}
              {showQuarantineForm && (
                <div className="mt-4 pt-4 border-t border-rose-500/30 space-y-3">
                  <h5 className="text-xs font-semibold text-rose-300">Create Regulatory Incident & Attach Hologram Evidence</h5>
                  <textarea
                    value={quarantineNotes}
                    onChange={(e) => setQuarantineNotes(e.target.value)}
                    placeholder="Enter observation notes for regulatory inspection team..."
                    className="w-full p-2.5 bg-slate-950 border border-rose-500/40 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowQuarantineForm(false)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmQuarantine}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg"
                    >
                      Confirm Quarantine & Attach Evidence
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VERIFICATION HISTORY TIMELINE */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Hologram Audit Log for Batch {batchNumber}
              </h4>

              <div className="space-y-2">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        h.result === 'PASS' ? 'bg-emerald-400' : h.result === 'FLAGGED' ? 'bg-rose-400' : 'bg-amber-400'
                      }`} />
                      <div>
                        <div className="font-medium text-slate-200">{h.actorRole} · {h.actor}</div>
                        <div className="text-[11px] text-slate-500">{h.location} · {h.timestamp}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 text-[11px] font-mono rounded ${
                        h.result === 'PASS'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : h.result === 'FLAGGED'
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}>
                        {h.resultLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
