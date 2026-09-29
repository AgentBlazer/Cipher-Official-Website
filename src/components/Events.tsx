import { API_BASE } from "../lib/api.ts";
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useScrambleText } from '../hooks/useScrambleText.ts';
import { EventData, EventModal } from './EventModal.tsx';

const DEFAULT_EVENTS: EventData[] = [
  {
    id: 'lumiere',
    tag: 'BRANCH GALA',
    dateTag: '29 OCT 2025',
    title: 'Lumière — The Gala',
    subTitle: '29 OCTOBER 2025 · KALAM AUDITORIUM',
    slug: 'LUMIERE_GALA',
    cardSub: 'CSE Branch Entry · Kalam Auditorium',
    description:
      'The CSE branch entry programme at Kalam Auditorium, themed “Where Glam Meets Glow.” Organised by the Cipher Association with coordinated red, gold and black décor, it welcomed students into the department and reinforced a shared sense of collective identity.',
    fullDescription: [
      'The Department of Computer Science and Engineering (CSE) held its branch entry programme, “Lumière – The Gala,” on 29 October 2025 at the Kalam Auditorium. Organised by the Cipher Association, the event welcomed students into the department through a formal gathering centred on the theme “Where Glam Meets Glow.” The venue featured coordinated red, gold and black décor, floral arrangements, illuminated panels and a central Lumière backdrop.',
      'The programme gave students an opportunity to interact with peers and take part in a shared departmental event beyond academics, highlighting the role of the Cipher Association in organising student-led activities. It concluded as a formal branch entry that marked the students’ transition into the department and reinforced a sense of collective identity.'
    ],
    slides: [
      '/assets/lumiere/slide_01.jpg',
      '/assets/lumiere/slide_02.jpg',
      '/assets/lumiere/slide_03.jpg',
      '/assets/lumiere/slide_04.jpg',
      '/assets/lumiere/slide_05.jpg',
      '/assets/lumiere/slide_06.jpg',
    ]
  },
  {
    id: 'promptops',
    tag: 'COMPETITION',
    dateTag: '25 MAR 2026',
    title: 'PROMPT OPS-2K26',
    subTitle: '25 MARCH 2026 · PROMPT ENGINEERING COMPETITION',
    slug: 'PROMPT_OPS',
    cardSub: 'AgentBlazer Club × Cipher',
    description:
      'A technical competition on prompt engineering and AI tools by the AgentBlazer Club and Cipher. Track 1 (1st Year) covered invitation, logo and image recreation; Track 2 (2nd Year) tested JSON conversion, Python debugging and a Gemini AI security prompt challenge.',
    fullDescription: [
      'Organized by the AgentBlazer Club and Cipher under the guidance of Ms. Nisha J Roche, Ms. Jaishma K, and HOD Dr. Melwyn D’Souza, this technical competition focused on prompt engineering and AI tools (mapped to PO4, PO5, PO8, PO11).',
      'Track 1 (1st Year) featured invitation generation, logo recreation, and image recreation rounds, with Chinmayee, Chris Royston Monteiro, and Deeksha Ravi Moger taking top honors.',
      'Track 2 (2nd Year) tested students in JSON conversion, Python code debugging, and a Gemini AI security prompt extraction challenge, with Harimurali KS, Venus Suhani D’Lima, and Venisha Snehal D’Souza securing top positions.'
    ],
    slides: [
      '/assets/promptops/slide_01.jpg',
      '/assets/promptops/slide_02.jpg',
      '/assets/promptops/slide_03.jpg',
      '/assets/promptops/slide_04.jpg',
      '/assets/promptops/slide_05.jpg',
      '/assets/promptops/slide_06.jpg',
      '/assets/promptops/slide_07.jpg',
    ]
  }
];

export const Events: React.FC = () => {
  const { displayText, ref } = useScrambleText("Events & Workshops");
  const [events, setEvents] = useState<EventData[]>(DEFAULT_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`${API_BASE}/api/public/events`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: EventData[] = json.data.map((ev: any) => {
              let fullDesc = [ev.shortDesc];
              if (ev.fullDescription) {
                try {
                  const parsed = JSON.parse(ev.fullDescription);
                  if (Array.isArray(parsed)) fullDesc = parsed;
                } catch {
                  fullDesc = ev.fullDescription.split('\n\n');
                }
              }

              const slidesList = Array.isArray(ev.slides) && ev.slides.length > 0
                ? ev.slides.map((s: any) => s.imageUrl)
                : [];

              return {
                id: ev.id,
                tag: ev.tag,
                dateTag: ev.dateTag,
                title: ev.title,
                subTitle: ev.subTitle || `${ev.dateTag} · ${ev.venue || 'SJEC'}`,
                slug: ev.slug || ev.title.replace(/\s+/g, '_').toUpperCase(),
                cardSub: ev.cardSub || ev.category,
                description: ev.shortDesc,
                fullDescription: fullDesc,
                slides: slidesList.length > 0 ? slidesList : ['/assets/logo.png'],
              };
            });
            setEvents(mapped);
          }
        }
      } catch {
        // Fall back to DEFAULT_EVENTS
      }
    }
    fetchEvents();
  }, []);

  return (
    <section id="events" className="relative py-8 sm:py-12 md:py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="mb-14">
          <div className="font-mono text-sm tracking-widest text-[#00ff66] mb-3">
            // ACTIVITIES
          </div>
          <h2
            ref={ref}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white text-glow"
          >
            {displayText}
          </h2>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="clickable-card group relative rounded-xl p-8 sm:p-10 bg-[#061209]/80 backdrop-blur-md border border-[#00ff66]/20 hover:border-[#00ff66] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,102,0.25)] hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                {/* Meta Tag & Date */}
                <div className="flex items-center justify-between font-mono text-xs text-[#00ff66] mb-6">
                  <span className="flex items-center gap-1.5 font-semibold tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.tag}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#00ff66]/10 border border-[#00ff66]/25 tracking-wider">
                    {event.dateTag}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 group-hover:text-[#00ff66] transition-colors">
                  {event.title}
                </h3>

                {/* Summary */}
                <p className="font-mono text-sm sm:text-base text-[#a0c0a8] leading-relaxed mb-8">
                  {event.description}
                </p>
              </div>

              {/* View Details Prompt */}
              <div className="font-mono text-xs tracking-widest text-[#00ff66] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                <span>VIEW EVENT GALLERY &amp; DETAILS</span>
                <span>&rarr;</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Detail Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  );
};