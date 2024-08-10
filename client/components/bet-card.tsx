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
import { NFTBet } from "@/types/bet-information.type";
import { Input } from "@/components/ui/input";
import { InfoIcon } from "lucide-react";
import { useAccount } from "wagmi";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { Label as ChartLabel, Pie, PieChart } from "recharts";

interface BetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  bet: NFTBet;
}

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];
const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function BetCard({ bet }: BetCardProps) {
  const { isConnected } = useAccount();
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>{bet.title}</CardTitle>
        <CardDescription>{bet.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <ChartLabel
                content={({ viewBox }: any) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Valor de la apuesta</Label>
              <Input
                id="name"
                type="number"
                placeholder="0.005 AVAX (Apuesta miníma)"
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
                  {bet.options.map((option, i) => (
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
          disabled={!isConnected}
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
