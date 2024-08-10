import { ConnectKitButton } from "connectkit";
import React from "react";
import { Button } from "./ui/button";
import { LoaderCircleIcon } from "lucide-react";

export default function Loading() {
  return (
    <main>
      <div className="w-[80vw] h-[80vh] px-4 py-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex flex-col space-y-2 justify-center items-center w-full h-full">
          <Button disabled>
            <LoaderCircleIcon className="animate-spin mr-2 h-4 w-4" />{" "}
            Cargando...
          </Button>
        </div>
      </div>
    </main>
  );
}
