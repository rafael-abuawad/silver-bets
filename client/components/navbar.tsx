"use client";

import { ConnectKitButton } from "connectkit";
import { ModeToggle } from "./mode-toggle";
import React from "react";

function Navbar() {
  return (
    <>
      <header className="flex flex-nowrap w-full border-b md:justify-start">
        <nav className="relative max-w-[85rem] w-full mx-auto flex md:items-center justify-between md:gap-3 py-2 px-4 sm:px-6 lg:px-8">
          <div className="font-bold flex items-center">
            <h2>Silver Bets</h2>
          </div>
          <div className="flex flex-row space-x-3">
            <ConnectKitButton></ConnectKitButton>
            <ModeToggle></ModeToggle>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Navbar;
