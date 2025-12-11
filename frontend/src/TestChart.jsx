import { LineChart, Line } from "recharts";

export default function TestChart() {
  return (
    <LineChart width={300} height={150} data={[{ x:1, y:2 }]}>
      <Line dataKey="y" />
    </LineChart>
  );
}
