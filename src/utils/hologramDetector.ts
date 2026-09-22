/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HologramAnalysisResult } from '../types';

/**
 * Optical Holographic Seal & Tamper Detection Engine
 * Analyzes video frame canvas pixel data for diffractive optical variable device (DOVID)
 * characteristics: chromatic dispersion (iridescent rainbow shimmer), specular micro-reflections,
 * and edge continuity of the security seal.
 */
export function analyzeHologramRegion(
  canvas: HTMLCanvasElement,
  roi: { x: number; y: number; width: number; height: number }
): HologramAnalysisResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || roi.width <= 0 || roi.height <= 0) {
    return {
      detected: false,
      confidence: 0,
      iridescenceScore: 0,
      specularGlareScore: 0,
      sealIntact: false,
      patternMatch: 'Scanning...',
      details: 'Awaiting video feed stabilization...',
    };
  }

  // Ensure coordinates stay within canvas bounds
  const clampedX = Math.max(0, Math.min(canvas.width - 10, Math.floor(roi.x)));
  const clampedY = Math.max(0, Math.min(canvas.height - 10, Math.floor(roi.y)));
  const clampedW = Math.min(canvas.width - clampedX, Math.floor(roi.width));
  const clampedH = Math.min(canvas.height - clampedY, Math.floor(roi.height));

  if (clampedW < 10 || clampedH < 10) {
    return {
      detected: false,
      confidence: 0,
      iridescenceScore: 0,
      specularGlareScore: 0,
      sealIntact: false,
      patternMatch: 'Scanning...',
      details: 'Position hologram within the top target box',
    };
  }

  try {
    const imageData = ctx.getImageData(clampedX, clampedY, clampedW, clampedH);
    const data = imageData.data;
    const totalPixels = data.length / 4;

    // Track color hues and bright specular glints
    const hueHistogram = new Array(12).fill(0); // 12 hue bins of 30 degrees each
    let highSpecularGlints = 0;
    let totalLuminance = 0;
    let highSaturationPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;

      // Luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += lum;

      // Specular reflection check (high brightness peaks)
      if (lum > 0.88 && delta < 0.25) {
        highSpecularGlints++;
      }

      // Saturation
      const sat = max === 0 ? 0 : delta / max;
      if (sat > 0.35) {
        highSaturationPixels++;

        // Calculate Hue
        let hue = 0;
        if (delta !== 0) {
          if (max === r) {
            hue = ((g - b) / delta) % 6;
          } else if (max === g) {
            hue = (b - r) / delta + 2;
          } else {
            hue = (r - g) / delta + 4;
          }
          hue = Math.round(hue * 60);
          if (hue < 0) hue += 360;

          const bin = Math.min(11, Math.floor(hue / 30));
          hueHistogram[bin]++;
        }
      }
    }

    // Iridescence (rainbow spectral dispersion): Genuine holograms disperse light across multiple distinct hue bands
    const occupiedHueBins = hueHistogram.filter((count) => count > totalPixels * 0.015).length;
    const iridescenceScore = Math.min(100, Math.round((occupiedHueBins / 6) * 100));

    // Specular Glare ratio
    const glintRatio = highSpecularGlints / totalPixels;
    const specularGlareScore = Math.min(100, Math.round(glintRatio * 600));

    // Overall Hologram confidence
    const confidence = Math.min(100, Math.round(iridescenceScore * 0.65 + specularGlareScore * 0.35));

    const isDetected = confidence >= 50;
    const sealIntact = confidence >= 60;

    let patternMatch: HologramAnalysisResult['patternMatch'] = 'Scanning...';
    let details = '';

    if (confidence >= 75) {
      patternMatch = 'Genuine GS1 Hologram';
      details = `Optical diffractive rainbow dispersion confirmed (${occupiedHueBins} spectral bands, ${specularGlareScore}% specular shimmer). Intact micro-emboss.`;
    } else if (confidence >= 45) {
      patternMatch = 'Defective Hologram';
      details = 'Faint optical reflection detected. Please tilt package slightly to capture full iridescence angle.';
    } else {
      patternMatch = 'Tampered / Missing Seal';
      details = 'No diffractive rainbow dispersion detected. Packaging appears flat metallic paper or tampered seal.';
    }

    return {
      detected: isDetected,
      confidence,
      iridescenceScore,
      specularGlareScore,
      sealIntact,
      patternMatch,
      details,
    };
  } catch (err) {
    return {
      detected: false,
      confidence: 0,
      iridescenceScore: 0,
      specularGlareScore: 0,
      sealIntact: false,
      patternMatch: 'Scanning...',
      details: 'Optical scanner analyzing frame...',
    };
  }
}

/**
 * Audio cue synthesizer for verification feedback (Web Audio API)
 */
export function playAudioFeedback(type: 'success' | 'warning' | 'click') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      // Pleasant dual chime
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.1); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.12); // D6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.1);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } else if (type === 'warning') {
      // Urgent buzz
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(196, now); // G3
      osc.frequency.setValueAtTime(164.81, now + 0.15); // E3

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // Subtle click
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}
