"use client";
import type{DragEvent,ReactNode}from"react";
export function CalendarEvent({id,children}:{id:string;children:ReactNode}){const start=(event:DragEvent<HTMLDivElement>)=>{event.dataTransfer.effectAllowed="copyMove";event.dataTransfer.setData("text/calendar-event",id);event.dataTransfer.setData("text/calendar-duplicate",String(event.ctrlKey||event.metaKey||event.altKey))};return<div draggable onDragStart={start}>{children}</div>}
