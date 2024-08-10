export enum Option {
  OPTION_1,
  OPTION_2,
}

export interface Bet {
  bettor: `0x${string}`;
  option: Option;
  amount: BigInt | number | string;
}

export interface Information {
  title: string;
  description: string;
  minimumBet: BigInt | number | string;
  startDate: BigInt | number | string;
  endDate: BigInt | number | string;
  balance: BigInt | number | string;
  address: `0x${string}`;
  bettingActive: boolean;
}

export interface NFTBet extends Information {
  bets: Bet[];
  options: string[];
}
