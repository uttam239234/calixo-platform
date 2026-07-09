import type { ComposerPlatform } from "../composer-types";
export type CalendarView="day"|"week"|"month"|"agenda";
export type CalendarEventStatus="Draft"|"Scheduled"|"Publishing"|"Published"|"Failed"|"Cancelled";
export type RecurrenceType="None"|"Daily"|"Weekly"|"Monthly"|"Custom";
export interface RecurrenceRule{type:RecurrenceType;interval:number;customDays:number[];endDate:string;}
export interface CalendarPostEvent{id:string;title:string;content:string;platform:ComposerPlatform;status:CalendarEventStatus;campaign:string;tags:string[];author:string;start:string;timezone:string;recurrence:RecurrenceRule;
  /** Set once a real Workflow Platform approval entry exists for this post (Workstream C7) — an additive approval axis, separate from `status`'s publishing axis. */
  workflowEntryId?:string;}
export type CalendarEventInput=Omit<CalendarPostEvent,"id">;
export interface CalendarFilterState{platform:string;status:string;campaign:string;tag:string;author:string;date:string;}
