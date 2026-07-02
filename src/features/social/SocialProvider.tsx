"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";
import { initialSocialState } from "./mock-data";
import type { SocialPlatform, SocialPost, SocialState } from "./types";

const STORAGE_KEY = "calixo-social-state-v1";
interface SocialContextValue extends SocialState { hydrated:boolean; refreshAll:()=>void; exportReport:()=>void; toggleAccount:(id:string)=>void; syncAccount:(id:string)=>void; createDraft:()=>void; schedulePost:()=>void; generateAiPost:()=>void; publishComposedPost:(platforms:SocialPlatform[],content:string,status:SocialPost["status"],publishedAt:string)=>void; updatePostStatus:(id:string,status:SocialPost["status"])=>void; deletePost:(id:string)=>void; applyRecommendation:(id:string)=>void; dismissRecommendation:(id:string)=>void; showToast:(message:string)=>void; }
const SocialContext = createContext<SocialContextValue | null>(null);
const newId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `social-${Date.now()}`;

export function SocialProvider({ children }: { children: ReactNode }) {
  const [state,setState] = useState<SocialState>(initialSocialState); const [hydrated,setHydrated] = useState(false); const [toast,setToast] = useState("");
  useEffect(()=>{ let active=true; queueMicrotask(()=>{ if(!active)return; try { const stored=localStorage.getItem(STORAGE_KEY); if(stored)setState(JSON.parse(stored) as SocialState); } catch { localStorage.removeItem(STORAGE_KEY); } setHydrated(true); }); return()=>{active=false}; },[]);
  useEffect(()=>{ if(hydrated)localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); },[state,hydrated]);
  useEffect(()=>{ if(!toast)return; const timer=window.setTimeout(()=>setToast(""),3200); return()=>window.clearTimeout(timer); },[toast]);
  const showToast=useCallback((message:string)=>setToast(message),[]);
  const refreshAll=useCallback(()=>{setState(current=>({...current,accounts:current.accounts.map(account=>({...account,lastSync:"Just now"}))}));showToast("All social accounts refreshed.");},[showToast]);
  const exportReport=useCallback(()=>{const rows=state.posts.map(post=>[post.platform,post.status,post.content,post.likes,post.comments,post.shares,post.reach]);const csv=[["Platform","Status","Content","Likes","Comments","Shares","Reach"],...rows].map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(",")).join("\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));const link=document.createElement("a");link.href=url;link.download="calixo-social-report.csv";link.click();URL.revokeObjectURL(url);showToast("Social report exported.");},[state.posts,showToast]);
  const toggleAccount=useCallback((id:string)=>{setState(current=>({...current,accounts:current.accounts.map(account=>account.id===id?{...account,status:account.status==="Connected"?"Disconnected":"Connected",lastSync:account.status==="Connected"?account.lastSync:"Just now"}:account)}));showToast("Account connection updated.");},[showToast]);
  const syncAccount=useCallback((id:string)=>{setState(current=>({...current,accounts:current.accounts.map(account=>account.id===id?{...account,lastSync:"Just now",status:"Connected"}:account)}));showToast("Account synchronized.");},[showToast]);
  const addPost=useCallback((status:SocialPost["status"],content:string)=>{setState(current=>({...current,posts:[{id:newId(),platform:"Instagram",accountId:"instagram",content,status,publishedAt:status==="Scheduled"?"Tomorrow, 10:00 AM":"Not scheduled",likes:0,comments:0,shares:0,reach:0},...current.posts]}));},[]);
  const createDraft=useCallback(()=>{addPost("Draft","New social campaign draft — ready for your message.");showToast("Draft created.");},[addPost,showToast]);
  const schedulePost=useCallback(()=>{addPost("Scheduled","Scheduled update from the Calixo social workspace.");showToast("Post scheduled for tomorrow.");},[addPost,showToast]);
  const generateAiPost=useCallback(()=>{addPost("Draft","AI-powered teams move faster when insight, content, and execution share one workspace.");showToast("AI post generated.");},[addPost,showToast]);
  const publishComposedPost=useCallback((platforms:SocialPlatform[],content:string,status:SocialPost["status"],publishedAt:string)=>{setState(current=>({...current,posts:[...platforms.map(platform=>{const accountPlatform=platform==="YouTube Community"?"YouTube":platform;const account=current.accounts.find(item=>item.platform===accountPlatform);return{id:newId(),platform,accountId:account?.id??platform.toLowerCase().replaceAll(" ","-"),content,status,publishedAt,likes:0,comments:0,shares:0,reach:0}}),...current.posts]}));},[]);
  const updatePostStatus=useCallback((id:string,status:SocialPost["status"])=>{setState(current=>({...current,posts:current.posts.map(post=>post.id===id?{...post,status,publishedAt:status==="Published"?"Just now":status==="Scheduled"?"Tomorrow, 10:00 AM":"Not scheduled"}:post)}));showToast(`Post marked ${status.toLowerCase()}.`);},[showToast]);
  const deletePost=useCallback((id:string)=>{setState(current=>({...current,posts:current.posts.filter(post=>post.id!==id)}));showToast("Post deleted.");},[showToast]);
  const applyRecommendation=useCallback((id:string)=>{setState(current=>({...current,recommendations:current.recommendations.map(item=>item.id===id?{...item,applied:true}:item)}));showToast("Recommendation applied.");},[showToast]);
  const dismissRecommendation=useCallback((id:string)=>{setState(current=>({...current,recommendations:current.recommendations.filter(item=>item.id!==id)}));showToast("Recommendation dismissed.");},[showToast]);
  const value=useMemo(()=>({...state,hydrated,refreshAll,exportReport,toggleAccount,syncAccount,createDraft,schedulePost,generateAiPost,publishComposedPost,updatePostStatus,deletePost,applyRecommendation,dismissRecommendation,showToast}),[state,hydrated,refreshAll,exportReport,toggleAccount,syncAccount,createDraft,schedulePost,generateAiPost,publishComposedPost,updatePostStatus,deletePost,applyRecommendation,dismissRecommendation,showToast]);
  return <SocialContext.Provider value={value}>{children}{toast&&<div role="status" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl"><CheckCircle2 size={18} className="text-emerald-400"/><span>{toast}</span><button onClick={()=>setToast("")} className="text-slate-500 hover:text-white"><X size={15}/></button></div>}</SocialContext.Provider>;
}
export function useSocial(){const context=useContext(SocialContext);if(!context)throw new Error("useSocial must be used within SocialProvider");return context;}
