"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { DashboardData } from "@/types/dashboard"

export const description = "Separate charts for teachers and students"

const teacherChartConfig = {
  teacher: {
    label: "Teachers",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const studentChartConfig = {
  student: {
    label: "Students", 
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface ChartAreaInteractiveProps {
  data: DashboardData;
}

// Transform API data to chart format for teachers
function transformTeacherChartData(chartData: DashboardData['Chart'], period: 'oneYear' | 'fiveYear') {
  const teacherData = chartData.teacher[period];
  
  if (period === 'oneYear') {
    const months = [
      { key: '1', name: 'Jan' },
      { key: '2', name: 'Feb' },
      { key: '3', name: 'Mar' },
      { key: '4', name: 'Apr' },
      { key: '5', name: 'May' },
      { key: '6', name: 'Jun' },
      { key: '7', name: 'Jul' },
      { key: '8', name: 'Aug' },
      { key: '9', name: 'Sep' },
      { key: '10', name: 'Oct' },
      { key: '11', name: 'Nov' },
      { key: '12', name: 'Dec' }
    ];
    
    return months.map(month => ({
      period: month.name,
      teacher: teacherData[month.key] || 0,
    }));
  } else {
    const periods = Object.keys(teacherData).sort((a, b) => parseInt(a) - parseInt(b));
    return periods.map(key => ({
      period: key,
      teacher: teacherData[key] || 0,
    }));
  }
}

// Transform API data to chart format for students
function transformStudentChartData(chartData: DashboardData['Chart'], period: 'oneYear' | 'fiveYear') {
  const studentData = chartData.student[period];
  
  if (period === 'oneYear') {
    const months = [
      { key: '1', name: 'Jan' },
      { key: '2', name: 'Feb' },
      { key: '3', name: 'Mar' },
      { key: '4', name: 'Apr' },
      { key: '5', name: 'May' },
      { key: '6', name: 'Jun' },
      { key: '7', name: 'Jul' },
      { key: '8', name: 'Aug' },
      { key: '9', name: 'Sep' },
      { key: '10', name: 'Oct' },
      { key: '11', name: 'Nov' },
      { key: '12', name: 'Dec' }
    ];
    
    return months.map(month => ({
      period: month.name,
      student: studentData[month.key] || 0,
    }));
  } else {
    const periods = Object.keys(studentData).sort((a, b) => parseInt(a) - parseInt(b));
    return periods.map(key => ({
      period: key,
      student: studentData[key] || 0,
    }));
  }
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState<'oneYear' | 'fiveYear'>('oneYear')

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('oneYear')
    }
  }, [isMobile])

  const teacherChartData = React.useMemo(() => {
    return transformTeacherChartData(data.Chart, timeRange);
  }, [data.Chart, timeRange])

  const studentChartData = React.useMemo(() => {
    return transformStudentChartData(data.Chart, timeRange);
  }, [data.Chart, timeRange])

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as 'oneYear' | 'fiveYear');
  };

  return (
    <div className="grid gap-4 grid-cols-1">
      {/* Teacher Registration Chart */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Teacher Registrations</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Teacher registration trends over time
            </span>
            <span className="@[540px]/card:hidden">Teacher trends</span>
          </CardDescription>
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={handleTimeRangeChange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="oneYear">This Year</ToggleGroupItem>
              <ToggleGroupItem value="fiveYear">5 Years</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="Select a value"
              >
                <SelectValue placeholder="This Year" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="oneYear" className="rounded-lg">
                  This Year
                </SelectItem>
                <SelectItem value="fiveYear" className="rounded-lg">
                  5 Years
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={teacherChartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={teacherChartData}>
              <defs>
                <linearGradient id="fillTeacher" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="teacher"
                type="natural"
                fill="url(#fillTeacher)"
                stroke="var(--primary)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Student Registration Chart */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Student Registrations</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Student registration trends over time
            </span>
            <span className="@[540px]/card:hidden">Student trends</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={studentChartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={studentChartData}>
              <defs>
                <linearGradient id="fillStudent" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="student"
                type="natural"
                fill="url(#fillStudent)"
                stroke="var(--primary)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
