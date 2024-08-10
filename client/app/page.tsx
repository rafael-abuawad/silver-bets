"use client";
import { BetCard } from "@/components/bet-card";
import Container from "@/components/container";
import { NFTBet, Option } from "@/types/bet-information.type";
import React from "react";

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
  return (
    <>
      <Container>
        {testNFTBets.map((nftBet, i) => (
          <BetCard bet={nftBet} key={i} />
        ))}
      </Container>
    </>
  );
}
