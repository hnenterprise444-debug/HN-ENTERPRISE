import React, { useState, useEffect, useRef } from "react";
import { teamService } from "../../../services/team/teamService";

export default function TeamSection() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const marqueeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTeam = async () => {
      try {
        const liveMembers = await teamService.getActiveTeamMembers();
        if (isMounted) {
          setMembers(Array.isArray(liveMembers) ? liveMembers : []);
        }
      } catch (err) {
        console.warn("Could not fetch team members:", err);
        if (isMounted) setMembers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTeam();
    return () => {
      isMounted = false;
    };
  }, []);

  const shouldMove = members.length >= 4;

  if (loading || members.length === 0) return null;

  return (
    <section className="w-full bg-[#090909] text-white py-12 sm:py-16 lg:py-20 border-t border-b border-[#C9A227]/20 transition-colors overflow-hidden">
      {/* Dynamic Keyframes for smooth infinite marquee (only used when >= 4 members) */}
      {shouldMove && (
        <style>
          {`
          @keyframes teamMarquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-100% - 1.5rem));
            }
          }
          .animate-team-marquee {
            animation: teamMarquee 35s linear infinite;
          }
          .team-marquee-container:hover .animate-team-marquee {
            animation-play-state: paused;
          }
          `}
        </style>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <p className="text-[#C9A227] text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase select-none">
            OUR DEDICATED TEAM
          </p>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F1E5B8] tracking-tight font-heading">
            Meet Our Team
          </h2>

          <p className="text-[#B9A66A] text-xs sm:text-sm leading-relaxed font-normal">
            A dedicated collective of professionals committed to elevating customer satisfaction and excellence.
          </p>
        </div>
      </div>

      {/* Render based on team size */}
      {shouldMove ? (
        /* Infinite Horizontal Marquee for >= 4 members */
        <div
          className="team-marquee-container group relative flex overflow-hidden py-3"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          }}
        >
          {/* Set 1: Original */}
          <div className="flex shrink-0 gap-6 animate-team-marquee mr-6">
            {members.map((member, idx) => (
              <TeamMemberCard key={`orig-${member.id || idx}-${idx}`} member={member} />
            ))}
          </div>

          {/* Set 2: Duplicate for seamless loop */}
          <div className="flex shrink-0 gap-6 animate-team-marquee mr-6" aria-hidden="true">
            {members.map((member, idx) => (
              <TeamMemberCard key={`dup-${member.id || idx}-${idx}`} member={member} />
            ))}
          </div>
        </div>
      ) : (
        /* Static, perfectly centered layout for 1, 2, or 3 members (no replication, no moving) */
        <div className="flex flex-wrap justify-center items-center gap-6 py-3 px-4 max-w-7xl mx-auto">
          {members.map((member, idx) => (
            <TeamMemberCard key={`static-${member.id || idx}`} member={member} />
          ))}
        </div>
      )}

      {/* Subtle bottom note for scrolling marquee */}
      {shouldMove && (
        <div className="text-center pt-6">
          <p className="text-[11px] font-semibold text-[#B9A66A]/70 uppercase tracking-widest">
            Hover over any member card to pause &amp; connect directly
          </p>
        </div>
      )}
    </section>
  );
}

/**
 * Individual Team Member Card
 * Based on the reference image: Large vertical portrait with a clean bottom details plate
 */
function TeamMemberCard({ member }) {
  return (
    <div className="group/card relative w-[230px] sm:w-[250px] md:w-[260px] shrink-0 rounded-3xl bg-[#181818] border border-[#C9A227]/25 hover:border-[#C9A227] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-md hover:shadow-xl hover:shadow-black/70 flex flex-col">
      {/* Portrait Photo Container (Reduced Height) */}
      <div className="relative h-44 sm:h-48 md:h-52 w-full overflow-hidden bg-[#090909]">
        <img
          src={member.photo}
          alt={member.name}
          className="w-full h-full object-cover object-top grayscale-[15%] contrast-[1.05] group-hover/card:grayscale-0 group-hover/card:scale-105 transition-all duration-700 ease-out"
          loading="lazy"
        />

        {/* Leadership or Specialist badge */}
        {member.isLeadership && (
          <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-[#090909]/85 backdrop-blur-md text-[#C9A227] border border-[#C9A227]/30 shadow-xs">
            Leadership
          </div>
        )}

        {/* Ambient bottom gradient blend */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#181818] to-transparent pointer-events-none" />
      </div>

      {/* Details Box (Plate) */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-[#181818] space-y-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#F1E5B8] tracking-tight group-hover/card:text-white transition-colors truncate">
            {member.name}
          </h3>
          <p className="text-xs font-semibold text-[#C9A227] truncate mt-0.5">
            {member.designation}
          </p>
        </div>

        {/* Phone Number (Plain text) */}
        {member.phone && (
          <p className="text-xs font-medium text-[#B9A66A]">
            {member.phone}
          </p>
        )}
      </div>
    </div>
  );
}
