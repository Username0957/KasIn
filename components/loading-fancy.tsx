import Image from "next/image";

export default function LoadingFancy() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#00B894] to-[#1B2B44]">
      <div className="animate-spin-slow mb-6">
        <Image src="/logo.svg" alt="Logo" width={80} height={80} />
      </div>
      <h2 className="text-2xl font-bold text-white animate-pulse mb-2">
        KasIn
      </h2>
      <p className="text-white/80 text-lg tracking-wide animate-fade-in">
        Memuat data, mohon tunggu...
      </p>
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-fade-in {
          animation: fadeIn 2s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}