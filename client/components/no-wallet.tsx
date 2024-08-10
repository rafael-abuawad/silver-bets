import { ConnectKitButton } from "connectkit";
import React from "react";

export default function NoWallet() {
  return (
    <main>
      <div className="w-[80vw] h-[80vh] px-4 py-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex flex-col space-y-2 justify-center items-center w-full h-full">
          <p>No conectaste tu cartera.</p>
          <ConnectKitButton />
        </div>
      </div>
    </main>
  );
}
