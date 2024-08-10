"use client";
import { silverBetsContractConfig } from "@/abi/contracts";
import { CardBet } from "@/components/card-bet";
import Container from "@/components/container";
import Loading from "@/components/loading";
import NoWallet from "@/components/no-wallet";
import { NFTBet, Option } from "@/types/bet-information.type";
import React from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

const testNFTBets: NFTBet[] = [
  {
    title: "Championship Final",
    description: "Bet on who will win the final match.",
    minimumBet: BigInt(100),
    startDate: BigInt(Date.now() - 86400000), // Un día antes de la fecha actual
    endDate: BigInt(Date.now() + 86400000), // Un día después de la fecha actual
    balance: BigInt(5000),
    address: "0x1234567890abcdef1234567890abcdef12345678",
    bettingActive: true,
    bets: [
      {
        bettor: "0xabcdefabcdefabcdefabcdefabcdefabcdef",
        option: Option.OPTION_1,
        amount: BigInt(200),
      },
      {
        bettor: "0xabcdefabcdefabcdefabcdefabcdefabcdef",
        option: Option.OPTION_2,
        amount: "300",
      },
    ],
    options: ["Team A", "Team B"],
  },
  {
    title: "Presidential Election",
    description: "Bet on the next president.",
    minimumBet: "50",
    startDate: BigInt(Date.now() - 604800000), // Una semana antes de la fecha actual
    endDate: BigInt(Date.now() + 604800000), // Una semana después de la fecha actual
    balance: 12000,
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    bettingActive: false,
    bets: [
      {
        bettor: "0x1234567890abcdef1234567890abcdef12345678",
        option: Option.OPTION_2,
        amount: 100,
      },
      {
        bettor: "0xabcdefabcdefabcdefabcdefabcdefabcdef",
        option: Option.OPTION_1,
        amount: BigInt(250),
      },
    ],
    options: ["Candidate A", "Candidate B"],
  },
];

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
