"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, Label, Pie, PieChart, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "Январь", created: 12, completed: 8 },
  { month: "Февраль", created: 18, completed: 15 },
  { month: "Март", created: 25, completed: 20 },
  { month: "Апрель", created: 22, completed: 18 },
  { month: "Май", created: 30, completed: 25 },
  { month: "Июнь", created: 28, completed: 22 },
]

const pieChartData = [
  { browser: "Создана", visitors: 45, fill: "var(--color-chrome)" },
  { browser: "В работе", visitors: 28, fill: "var(--color-safari)" },
  { browser: "Готова", visitors: 108, fill: "var(--color-firefox)" },
]

const chartConfig = {
  created: {
    label: "Создано",
    color: "var(--chart-1)",
  },
  completed: {
    label: "Завершено",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
  visitors: {
    label: "Заявки",
  },
  chrome: {
    label: "Создана",
    color: "var(--chart-1)",
  },
  safari: {
    label: "В работе",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Готова",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

// Типы для данных от n8n
interface AnalyticsData {
  success: boolean;
  barChartData: Array<{
    month: number;
    year: number;
    created: number;
    completed: number;
  }>;
  pieChartData: Array<{
    browser: string;
    count: number;
    visitors?: number;
    fill?: string;
  }>;
  analytics: {
    growthPercentage: number;
    periodDescription: string;
    totalRequests: number;
    currentMonthRequests: number;
    previousMonthRequests: number;
  };
}

export default function AnalyticsPage() {
  // Состояние для данных от n8n
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Функция для преобразования данных от n8n в формат для графика
  const transformBarChartData = (data: AnalyticsData['barChartData']) => {
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    return data.map(item => ({
      month: monthNames[item.month - 1] || `Месяц ${item.month}`,
      created: item.created,
      completed: item.completed
    }));
  };

  // Функция для вычисления периода
  const getPeriodDescription = (data: AnalyticsData['barChartData']) => {
    if (!data || data.length === 0) return "Январь - Июнь 2024";
    
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    const firstMonth = monthNames[data[0].month - 1] || `Месяц ${data[0].month}`;
    const lastMonth = monthNames[data[data.length - 1].month - 1] || `Месяц ${data[data.length - 1].month}`;
    const year = data[0].year;
    
    return `${firstMonth} - ${lastMonth} ${year}`;
  };

  // Функция для добавления цветов к данным круговой диаграммы
  const addColorsToPieData = (data: AnalyticsData['pieChartData']) => {
    const colors = {
      "Создана": "var(--color-firefox)", // Зеленый для "Создана"
      "В работе": "var(--color-safari)", // Оранжевый для "В работе"
      "Готова": "var(--color-chrome)"    // Синий для "Готова"
    };
    
    return data.map(item => ({
      ...item,
      fill: colors[item.browser as keyof typeof colors] || "var(--color-chrome)"
    }));
  };

  // Используем реальные данные или fallback на моковые
  const currentBarChartData = analyticsData?.barChartData 
    ? transformBarChartData(analyticsData.barChartData) 
    : chartData;
  const currentPieChartData = analyticsData?.pieChartData 
    ? addColorsToPieData(analyticsData.pieChartData)
    : pieChartData;
  const currentAnalytics = analyticsData?.analytics || { 
    growthPercentage: 5.2, 
    periodDescription: "Общие данные за 6 месяцев" 
  };
  const periodDescription = analyticsData?.barChartData 
    ? getPeriodDescription(analyticsData.barChartData)
    : "Январь - Июнь 2024";

  const totalVisitors = React.useMemo(() => {
    return currentPieChartData.reduce((acc, curr) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (curr as any).visitors || (curr as any).count || 0;
      return acc + value;
    }, 0)
  }, [currentPieChartData])

  // Принудительное разворачивание на фулскрин
  React.useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.MainButton.hide();
      window.Telegram.WebApp.enableClosingConfirmation();
    }
  }, []);

  // Отправка webhook при загрузке страницы
  React.useEffect(() => {
    const sendWebhook = async () => {
      try {
        console.log('🚀 Начинаем отправку webhook для аналитики...');
        console.log('🔍 window.Telegram:', window.Telegram);
        console.log('🔍 window.Telegram?.WebApp:', window.Telegram?.WebApp);
        
        const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        const initData = window.Telegram?.WebApp?.initData;
        const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        console.log('📱 telegramId:', telegramId);
        console.log('📱 initData:', initData);
        console.log('📱 telegramUser:', telegramUser);
        
        if (!telegramId) {
          console.log('⚠️ Telegram WebApp не обнаружен, webhook не отправляется');
          return;
        }

        const requestData = {
          page: "analytics",
          mode: "allorder",
          telegram_id: telegramId,
          initData: initData,
          telegram_user: telegramUser ? {
            id: telegramUser.id,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            language_code: telegramUser.language_code,
            is_premium: telegramUser.is_premium,
            photo_url: telegramUser.photo_url
          } : null,
          timestamp: new Date().toISOString()
        };

        console.log('📤 Отправляем запрос на загрузку аналитики:', requestData);

        const response = await fetch("https://n8nunit.miaai.ru/webhook/f760ae2e-d95f-4f48-9134-c60aa408372b", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Получены данные аналитики:', data);
        
        // Сохраняем данные от n8n
        if (data.success) {
          setAnalyticsData(data);
        } else {
          console.error('❌ Ошибка получения данных:', data.error);
        }
      } catch (error) {
        console.error('❌ Ошибка отправки webhook:', error);
      } finally {
        setIsLoading(false);
      }
    };

    sendWebhook();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-1">
        <div className="text-center pt-safe pt-12">
          <h1 className="text-lg font-semibold">Аналитика</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full mb-3"></div>
            <p className="text-sm text-muted-foreground">Загрузка аналитики...</p>
          </div>
        ) : (
        <div className="space-y-6">
          {/* Chart Card */}
          <div className="rounded-2xl p-4" style={{backgroundColor: '#f8f9fa'}}>
            <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle>Статистика заявок</CardTitle>
              <CardDescription>{periodDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={currentBarChartData}
                  margin={{
                    top: 20,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="created" fill="var(--color-created)" radius={8}>
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 leading-none font-medium">
                Рост на {currentAnalytics.growthPercentage}% в этом месяце <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground leading-none">
                {currentAnalytics.periodDescription}
              </div>
            </CardFooter>
            </Card>
          </div>

          {/* Pie Chart */}
          <div className="rounded-2xl p-4" style={{backgroundColor: '#f8f9fa'}}>
            <Card className="bg-transparent border-0 shadow-none flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>Распределение заявок</CardTitle>
                <CardDescription>{periodDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
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
                      data={currentPieChartData}
                      dataKey={currentPieChartData[0]?.visitors ? "visitors" : "count"}
                      nameKey="browser"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      <Label
                        content={({ viewBox }) => {
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
                                  Заявок
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={24}
                      wrapperStyle={{
                        paddingTop: '10px',
                        fontSize: '12px'
                      }}
                      content={() => (
                        <div className="flex items-center justify-center gap-1 pt-2">
                          {currentPieChartData.map((item) => (
                            <div
                              key={item.browser}
                              className="flex items-center gap-1.5 text-xs px-1 py-1 rounded-md"
                            >
                              <div
                                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                style={{ backgroundColor: item.fill }}
                              />
                              <span className="text-xs">{item.browser}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                  Рост на {currentAnalytics.growthPercentage}% в этом месяце <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  {currentAnalytics.periodDescription}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
