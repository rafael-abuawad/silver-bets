"use client";
import { silverBetsContractConfig } from "@/abi/contracts";
import { CardBet } from "@/components/card-bet";
import Container from "@/components/container";
import Loading from "@/components/loading";
import NoWallet from "@/components/no-wallet";
import React from "react";
import { useAccount, useReadContract } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  const { data: totalSupply, isPending } = useReadContract({
    ...silverBetsContractConfig,
    functionName: "totalSupply",
  });

  if (!isConnected) {
    return <NoWallet />;
  }

  if (isPending) {
    return <Loading />;
  }

  return (
    <>
      <Container>
        {[...Array(Number(totalSupply)).keys()].map((i) => (
          <CardBet betId={i} key={i} />
        ))}
      </Container>
    </>
  );
}
