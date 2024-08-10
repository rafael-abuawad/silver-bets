import React from "react";

export default function AnnouncementBanner() {
  return (
    <div className="bg-gradient-to-r from-[#DA22FF] to-[#9733EE]">
      <div className="max-w-[85rem] px-4 py-4 sm:px-6 lg:px-8 mx-auto">
        <div className="grid md:grid-cols-2 justify-between md:items-center gap-2">
          <div className="text-start">
            <p className="text-xs font-bold text-white/80 uppercase tracking-wider">
              Silver Bets!
            </p>
            <p className="mt-1 text-white font-medium">
              Únicamente disponible en Avalanche
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
