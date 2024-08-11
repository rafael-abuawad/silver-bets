"use client";

import { silverBetsContractConfig } from "@/abi/contracts";
import NoWallet from "@/components/no-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export default function Create() {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [minimumBet, setMinimumBet] = useState<string>("");
  const [option1, setOption1] = useState<string>("");
  const [option2, setOption2] = useState<string>("");
  const { isConnected } = useAccount();
  const { data: hash, writeContract } = useWriteContract();
  const { data: fee } = useReadContract({
    ...silverBetsContractConfig,
    functionName: "fee",
  });
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    writeContract({
      ...silverBetsContractConfig,
      functionName: "createBet",
      value: fee,
      args: [name, description, parseEther(minimumBet), [option1, option2]],
    });
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed && !isConfirming) {
      router.push("/");
    }
  }, [isConfirmed, isConfirming, router]);

  if (!isConnected) {
    return <NoWallet />;
  }

  return (
    <>
      <main>
        <div className="max-w-[85rem] flex flex-col space-y-8 px-4 py-4 sm:px-6 lg:px-8 mx-auto">
          <hgroup className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight">
              Crear una apuesta
            </h1>
            <h2 className="text-muted-foreground">
              Añade una descripcion, un precio minimo de apuesta, tus dos
              opciones y todo estara listo!
            </h2>
          </hgroup>

          <Separator />

          <section>
            <form onSubmit={submit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Nombre de tu apuesta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    placeholder="Descripción de tu apuesta"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="minimumBet">Apuesta mínima</Label>
                  <Input
                    id="minimumBet"
                    type="number"
                    placeholder="0.025 AVAX"
                    value={minimumBet}
                    onChange={(e) => setMinimumBet(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="option1">Opciones</Label>
                  <Input
                    id="option1"
                    placeholder="Opción 1"
                    value={option1}
                    onChange={(e) => setOption1(e.target.value)}
                  />
                  <Input
                    id="option2"
                    placeholder="Opción 2"
                    value={option2}
                    onChange={(e) => setOption2(e.target.value)}
                  />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <Button type="submit">Crear</Button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
