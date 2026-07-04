/** Calixo Platform — Asset Platform Mock Data (500+ assets, 100+ relationships, 50 collections, 200 versions) */
import type { AssetEntry, AssetRelationship, AssetCollection, AssetVersion } from "./types";

const TYPES: AssetEntry["type"][] = ["image","video","document","spreadsheet","presentation","pdf","content-doc","creative-doc","template","prompt","brand-asset","campaign-resource","font","code","archive"];
const NAMES = ["Q4 Campaign Hero","Brand Guidelines v2","Social Media Kit","Product Demo","Landing Page Mockup","SEO Report Oct","Email Template","Ad Creative Set","Content Calendar","Press Release Final","Whitepaper 2025","Case Study Draft","Analytics Dashboard","Team Photo","Event Banner","Podcast Episode","Webinar Recording","Infographic v3","Style Guide","Invoice Template","Proposal Deck","Contract Template","Onboarding Guide","API Documentation","Design System Components","Icon Set v2","Font Pack","Background Pattern","Logo Variations","Campaign Brief","Strategy Doc","Budget Sheet","Timeline Gantt","Roadmap 2026","Competitor Analysis","User Personas","Journey Map","Wireframe Set","Prototype Link","Test Results","Feedback Report","Release Notes","Changelog","License Key","Certificate","Badge Design","Newsletter Issue","Blog Header","Social Post Template","Ad Copy Library"];
const COLLECTIONS = ["Q4 Campaign","Brand Assets","Social Media","Product Launch","Sales Enablement","Marketing Collateral","Design System","Templates","Archives","Favorites","Recent Uploads","Shared with Team","Client Deliverables","Internal Docs","Training Materials"];
const USERS = ["Sarah Chen","Marcus Rivera","Emily Park","David Kim","Jessica Taylor","Ryan O'Brien","Priya Sharma","Alex Wong"];
const BRANDS = ["Calixo","RGU","Demo Enterprise"];

function genId(p: string, n: number): string { return `${p}-${String(n).padStart(4,'0')}`; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }
function randDate(start: string, end: string): string { const s=new Date(start).getTime(),e=new Date(end).getTime(); return new Date(s+Math.random()*(e-s)).toISOString(); }

export const MOCK_ASSETS: AssetEntry[] = Array.from({length:500},(_,i)=>({
  id: genId("ast",i+1), type: pick(TYPES), name: NAMES[i%NAMES.length]+(i>=NAMES.length?` (${Math.floor(i/NAMES.length)+1})`:""),
  description: `Enterprise asset for ${BRANDS[i%3]} campaign`, workspace: "Growth Engine", brand: BRANDS[i%3], campaign: `Q${(i%4)+1} Campaign`,
  owner: pick(USERS), createdBy: pick(USERS), updatedBy: pick(USERS), createdAt: randDate("2024-06-01","2025-07-04"), updatedAt: randDate("2025-06-01","2025-07-04"),
  tags: [pick(["marketing","sales","brand","product","internal"])], categories: [pick(["Campaign","Brand","Template","Reference"])], collectionIds: [genId("col",(i%50)+1)],
  currentVersion: Math.floor(Math.random()*5)+1, approvalStatus: pick(["draft","review","approved","approved","approved","rejected"]),
  permissions: [{userId: pick(USERS),role:"owner"},{userId: pick(USERS),role: pick(["editor","reviewer","viewer"])}],
  metadata: {source:"Generated",campaignName:`Q${(i%4)+1} Launch`}, preview:`https://picsum.photos/seed/asset${i}/400/300`, thumbnail:`https://picsum.photos/seed/asset${i}/100/100`,
  sourceProvider: pick(["mock-media","openai-image","manual"]), aiHistory: [], mimeType: pick(["image/png","image/jpeg","application/pdf","video/mp4"]), fileSize: Math.floor(Math.random()*25000000)+50000, fileUrl: `/assets/mock/asset-${i+1}`,
}));

export const MOCK_RELATIONSHIPS: AssetRelationship[] = Array.from({length:120},(_,i)=>({
  id: genId("rel",i+1), sourceId: genId("ast",(i%500)+1), targetId: genId("ast",((i+37)%500)+1),
  type: pick(["parent","child","reference","derived-from","variation","version-of","campaign-member","brand-resource","template-source"]), createdAt: randDate("2024-09-01","2025-07-01"),
  metadata: {note:"Auto-generated relationship"},
}));

export const MOCK_COLLECTIONS: AssetCollection[] = Array.from({length:50},(_,i)=>({
  id: genId("col",i+1), name: COLLECTIONS[i%COLLECTIONS.length]+(i>=COLLECTIONS.length?` ${Math.floor(i/COLLECTIONS.length)+1}`:""),
  type: pick(["folder","smart","campaign","brand","shared"]), assetIds: Array.from({length:5+Math.floor(Math.random()*15)},()=>genId("ast",Math.floor(Math.random()*500)+1)),
  parentId: i>5?genId("col",Math.floor(Math.random()*i)+1):undefined, createdBy: pick(USERS), createdAt: randDate("2024-08-01","2025-06-30"), isSystem: i<3,
}));

export const MOCK_VERSIONS: AssetVersion[] = Array.from({length:200},(_,i)=>({
  id: genId("ver",i+1), assetId: genId("ast",(i%500)+1), version:i%5+1, label:`v${i%5+1}.${i%3}`,
  notes: pick(["Initial upload","AI enhancement","Manual edit","Brand compliance update","Peer review changes"]),
  createdAt: randDate("2024-10-01","2025-07-03"), createdBy: pick(USERS),
  snapshot: {name:NAMES[(i+Math.floor(i/5))%NAMES.length]}, isCurrent:i%5===4,
}));