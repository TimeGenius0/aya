"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { ConsultationModal, type ClientWithAnimals, type ConsultationModalState } from "./ConsultationModal";

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time, no timezone suffix.
function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CalendarView({
  clients,
  initialAnimalId,
}: {
  clients: ClientWithAnimals[];
  initialAnimalId?: string;
}) {
  const calendarRef = useRef<FullCalendar>(null);
  const [modalState, setModalState] = useState<ConsultationModalState | null>(null);

  function refetch() {
    calendarRef.current?.getApi().refetchEvents();
  }

  function handleSelect(arg: DateSelectArg) {
    setModalState({
      scheduledAt: toLocalInputValue(arg.start),
      durationMinutes: Math.max(15, Math.round((arg.end.getTime() - arg.start.getTime()) / 60000)),
      animalId: initialAnimalId,
    });
  }

  function handleEventClick(arg: EventClickArg) {
    const ext = arg.event.extendedProps as { status?: string; reason?: string };
    // Find the underlying consultation's client/animal via a data attribute we stash on fetch.
    const clientId = arg.event.extendedProps.clientId as string | undefined;
    const animalId = arg.event.extendedProps.animalId as string | undefined;
    setModalState({
      consultationId: arg.event.id,
      scheduledAt: toLocalInputValue(arg.event.start!),
      durationMinutes: arg.event.end
        ? Math.round((arg.event.end.getTime() - arg.event.start!.getTime()) / 60000)
        : 30,
      clientId,
      animalId,
      reason: ext.reason ?? "",
      status: ext.status as ConsultationModalState["status"],
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setModalState({ scheduledAt: toLocalInputValue(new Date()), animalId: initialAnimalId })}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          Nouvelle consultation
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-2 sm:p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,dayGridMonth,listWeek",
          }}
          locale={frLocale}
          height="auto"
          selectable
          selectMirror
          select={handleSelect}
          eventClick={handleEventClick}
          eventClassNames={(arg) => [`status-${(arg.event.extendedProps as { status?: string }).status ?? "planifie"}`]}
          events={{ url: "/api/calendar/events" }}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          nowIndicator
        />
      </div>

      <ConsultationModal
        clients={clients}
        state={modalState}
        onClose={() => setModalState(null)}
        onSaved={() => {
          setModalState(null);
          refetch();
        }}
      />
    </div>
  );
}
