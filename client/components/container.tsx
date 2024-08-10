import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

function Container({ children }: ContainerProps) {
  return (
    <main>
      <div className="max-w-[85rem] px-4 py-4 sm:px-6 lg:px-8 mx-auto">
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </main>
  );
}

export default Container;
