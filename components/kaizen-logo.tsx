// TEMPORARY: Kaizen logo for demo (2026-01-14)
// REVERT TO AudienceOS LOGO AFTER DEMO - see RUNBOOK.md
// Also delete public/kaizen-logo.png when reverting

import Image from "next/image"

export function KaizenLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/kaizen-logo.png"
        alt="Kaizen"
        width={160}
        height={40}
        priority
      />
    </div>
  );
}

// ORIGINAL AUDIENCEOS LOGO - RESTORE AFTER DEMO:
// function AudienceOSLogo({ className = "" }: { className?: string }) {
//   return (
//     <div className={`flex items-center justify-center gap-0 ${className}`} style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
//       <span className="text-3xl font-semibold tracking-tight text-white">audience</span>
//       <span
//         className="text-3xl font-light tracking-tight"
//         style={{
//           background: "linear-gradient(90deg, #a855f7 0%, #ec4899 50%, #06b6d4 100%)",
//           WebkitBackgroundClip: "text",
//           WebkitTextFillColor: "transparent",
//           backgroundClip: "text",
//         }}
//       >
//         OS
//       </span>
//     </div>
//   )
// }
