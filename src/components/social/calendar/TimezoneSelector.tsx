"use client";
const zones=["Asia/Kolkata","UTC","America/New_York","America/Los_Angeles","Europe/London","Europe/Berlin","Asia/Singapore","Australia/Sydney"];
export function TimezoneSelector({value,onChange}:{value:string;onChange:(value:string)=>void}){return<label className="block text-xs text-slate-500">Timezone<select value={value} onChange={event=>onChange(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none">{zones.map(zone=><option key={zone}>{zone}</option>)}</select></label>}
