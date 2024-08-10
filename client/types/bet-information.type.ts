export enum Option {
  OPTION_1,
  OPTION_2,
}

export interface Bet {
  bettor: `0x${string}`;
  option: Option | number;
  amount: BigInt;
}

export interface Information {
  title: string;
  description: string;
  minimumBet: BigInt;
  startDate: BigInt;
  endDate: BigInt;
  balance: BigInt;
  address: `0x${string}`;
  bettingActive: boolean;
}

export interface NFTBet extends Information {
  bets: Bet[];
  options: string[];
}
