"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENABLING_STAGES = exports.DISABLING_STAGES = exports.MAX_DAILY_EMAILS = exports.WARMUP_DURATION_DAYS = void 0;
exports.WARMUP_DURATION_DAYS = 30;
exports.MAX_DAILY_EMAILS = 80;
/*
day 24-26: n emails
day 26-28: n emails
day 28-30: n emails
day 30-31: n emails
*/
exports.DISABLING_STAGES = [
    { phase: 'disabling-1/4', factor: 0.75, durationDays: 2 },
    { phase: 'disabling-2/4', factor: 0.5, durationDays: 2 },
    { phase: 'disabling-3/4', factor: 0.25, durationDays: 2 },
    { phase: 'disabled', factor: 0, durationDays: 1 }
];
/*
day 0-3: n emails
day 3-8: n emails
day 8-12: n emails
day 12-24: n emails
*/
exports.ENABLING_STAGES = [
    { phase: 'enabling-1/4', factor: 0.25, durationDays: 3 },
    { phase: 'enabling-2/4', factor: 0.5, durationDays: 4 },
    { phase: 'enabling-3/4', factor: 0.75, durationDays: 5 },
    { phase: 'enabled', factor: 1, durationDays: 12 }
];
// DeekThink ChatGPT
// export const WARMUP_DURATION_DAYS: number = 90; // ~90 days (3 months) warm-up for a new domain:contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}; ensure SPF/DKIM/DMARC/MX are configured:contentReference[oaicite:2]{index=2}.
// export const MAX_DAILY_EMAILS: number = 1000; // Final daily cap (e.g. ~1000/day). Guides often reach ~500/day by 4wks:contentReference[oaicite:3]{index=3}; 1000 is a conservative upper limit (below aggressive plans:contentReference[oaicite:4]{index=4}).
// export const ENABLING_STAGES: { phase: string; factor: number; durationDays: number }[] = [
//   { phase: 'enabling-1/4', factor: 0.25, durationDays: 15 }, // stage1: 25% (~250/day) to build sender reputation (start very low):contentReference[oaicite:5]{index=5}:contentReference[oaicite:6]{index=6}.
//   { phase: 'enabling-2/4', factor: 0.5,  durationDays: 20 }, // stage2: 50% (~500/day) if engagement is good (initial doubling):contentReference[oaicite:7]{index=7}:contentReference[oaicite:8]{index=8}.
//   { phase: 'enabling-3/4', factor: 0.75, durationDays: 25 }, // stage3: 75% (~750/day); continue gradual growth (≤50% increase each step):contentReference[oaicite:9]{index=9}.
//   { phase: 'enabling-4/4', factor: 1.0,  durationDays: 30 }, // stage4: 100% (1000/day) full warm-up volume:contentReference[oaicite:10]{index=10}.
// ];
// export const DISABLING_STAGES: { phase: string; factor: number; durationDays: number }[] = [
//   { phase: 'disabling-1/4', factor: 1.0,  durationDays: 30 }, // stage1: 100% volume initially, then begin gentle ramp-down if needed:contentReference[oaicite:11]{index=11}.
//   { phase: 'disabling-2/4', factor: 0.75, durationDays: 25 }, // stage2: 75% (~750/day), i.e. ~25% reduction as recommended:contentReference[oaicite:12]{index=12}.
//   { phase: 'disabling-3/4', factor: 0.5,  durationDays: 20 }, // stage3: 50% (~500/day), continued gradual wind-down.
//   { phase: 'disabling-4/4', factor: 0.25, durationDays: 15 }, // stage4: 25% (~250/day), minimal sending to complete cooldown:contentReference[oaicite:13]{index=13}.
// ];
