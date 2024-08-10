import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bet, Option } from "@/types/bet-information.type";
import { Input } from "@/components/ui/input";
import { InfoIcon, LoaderIcon } from "lucide-react";
import { useAccount, useReadContracts } from "wagmi";
import { silverBetsContractConfig } from "@/abi/contracts";
import { formatEther } from "viem";
import {
  Label as LabelChart,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "./ui/chart";
import { useEffect, useState } from "react";

interface CardBetProps extends React.HTMLAttributes<HTMLDivElement> {
  betId: number;
}

export function CardBet({ betId }: CardBetProps) {
  const { isConnected } = useAccount();
  const { data } = useReadContracts({
    contracts: [
      {
        ...silverBetsContractConfig,
        functionName: "getTitle",
        args: [BigInt(betId)],
      },
      {
        ...silverBetsContractConfig,
        functionName: "getDescription",
        args: [BigInt(betId)],
      },
      {
        ...silverBetsContractConfig,
        functionName: "getMinimumBet",
        args: [BigInt(betId)],
      },
      {
        ...silverBetsContractConfig,
        functionName: "getBalance",
        args: [BigInt(betId)],
      },
      {
        ...silverBetsContractConfig,
        functionName: "getIsBettingActive",
        args: [BigInt(betId)],
      },
      {
        ...silverBetsContractConfig,
        functionName: "getOptionList",
        args: [BigInt(betId)],
      },
      {
        ...silverBetsContractConfig,
        functionName: "getBetList",
        args: [BigInt(betId)],
      },
    ],
  });
  const [
    title,
    description,
    minimumBet,
    balance,
    isbettingActive,
    options,
    bets,
  ] = data || [];

  if (!title || !description || !minimumBet || !balance || !options || !bets) {
    return (
      <Card className="w-full flex justify-center items-center">
        <LoaderIcon className="animate-spin h-8 w-8 text-gray-500" />
      </Card>
    );
  }

  function sumOptions(option: Option): number {
    if (bets && bets.result) {
      return bets?.result.reduce((total: number, bet: Bet) => {
        if (bet.option === option) {
          total += 1;
        }
        return total;
      }, 0);
    }
    return 0;
  }

  const chartData = [
    {
      month: "january",
      desktop: sumOptions(Option.OPTION_1),
      mobile: sumOptions(Option.OPTION_2),
    },
  ];
  const chartConfig = {
    desktop: {
      label: options.result?.[0],
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: options.result?.[1],
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title?.result}</CardTitle>
        <CardDescription>{description?.result}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <LabelChart
                content={({ viewBox }: any) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {bets.result?.length}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Apuestas
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {formatEther(balance.result || BigInt(0))} AVAX
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="desktop"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-desktop)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="mobile"
              fill="var(--color-mobile)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>

        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Valor de la apuesta</Label>
              <Input
                id="name"
                type="number"
                placeholder={`${formatEther(minimumBet?.result!)} AVAX (Apuesta miníma)`}
              />
              <small className="text-xs text-muted-foreground">
                *Este valor tiene que estar en AVAX
              </small>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Opciones</Label>
              <Select>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {options?.result?.map((option, i) => (
                    <SelectItem value={option} key={i}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-row space-x-1">
        <Button
          variant="secondary"
          className="flex-grow"
          disabled={!isConnected || !isbettingActive}
        >
          Apostar
        </Button>
        <Button variant="outline" size="icon" disabled={!isConnected}>
          <InfoIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
