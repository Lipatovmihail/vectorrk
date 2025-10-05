"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Package, Clock, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("Все")
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 mr-3">
        <Image
                src="/logo.jpg" 
                alt="Вектор РК" 
                width={48} 
                height={48} 
                className="rounded-lg object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Вектор РК</h1>
          </div>
          <p className="text-muted-foreground text-sm">Отдел снабжения</p>
        </div>
      </div>

      {/* News Stories */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* News Story 1 */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://picsum.photos/80/80?random=1" 
                alt="Новости"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Новости
              </div>
            </div>
          </div>

          {/* News Story 2 */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://picsum.photos/80/80?random=2" 
                alt="Объявления"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Объявления
              </div>
            </div>
          </div>

          {/* News Story 3 */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://picsum.photos/80/80?random=3" 
                alt="Достижения"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Достижения
              </div>
            </div>
          </div>

          {/* News Story 4 */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://picsum.photos/80/80?random=4" 
                alt="Команда"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Команда
              </div>
            </div>
          </div>

          {/* News Story 5 */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://picsum.photos/80/80?random=5" 
                alt="Рост"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Рост
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Action Buttons */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Left column - 2 buttons */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full h-16 text-base font-medium bg-white border border-gray-200 hover:bg-gray-50 shadow-sm relative">
              Все заявки
              <div className="absolute top-2 right-2 w-6 h-6 bg-gray-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                12
              </div>
            </Button>
            <Button variant="outline" className="w-full h-16 text-base font-medium bg-white border border-gray-200 hover:bg-gray-50 shadow-sm relative">
              Черновики
              <div className="absolute top-2 right-2 w-6 h-6 bg-gray-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                3
              </div>
            </Button>
          </div>
          
          {/* Right column - Add button */}
          <div>
            <Link href="/request">
              <Button className="w-full h-full bg-black hover:bg-gray-800 text-white text-base font-semibold relative p-6">
                <div className="absolute top-4 left-4 text-left">
                  <div className="text-lg font-bold leading-tight">Добавить</div>
                  <div className="text-lg font-bold leading-tight">заявку</div>
                </div>
                <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-black stroke-[3]" />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="px-4 py-2">
        <h2 className="text-lg font-semibold text-foreground mb-3">Последние заявки</h2>
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-3 text-xs font-medium flex items-center gap-1 ${
                activeFilter === "Все" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveFilter("Все")}
            >
              Все
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-3 text-xs font-medium flex items-center gap-1 ${
                activeFilter === "В работе" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveFilter("В работе")}
            >
              В работе
              <div className="w-4 h-4 bg-gray-300 text-gray-700 text-[10px] font-bold rounded-full flex items-center justify-center">
                5
              </div>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-3 text-xs font-medium flex items-center gap-1 ${
                activeFilter === "Выполнено" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveFilter("Выполнено")}
            >
              Выполнено
              <div className="w-4 h-4 bg-gray-300 text-gray-700 text-[10px] font-bold rounded-full flex items-center justify-center">
                2
              </div>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-3 text-xs font-medium flex items-center gap-1 ${
                activeFilter === "Отправлено" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveFilter("Отправлено")}
            >
              Отправлено
              <div className="w-4 h-4 bg-gray-300 text-gray-700 text-[10px] font-bold rounded-full flex items-center justify-center">
                1
              </div>
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Цемент М400</div>
                    <div className="text-sm text-muted-foreground">Объект: ЖК &quot;Солнечный&quot;</div>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Clock className="h-3 w-3 mr-1" />
                  В работе
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Арматура А500С</div>
                    <div className="text-sm text-muted-foreground">Объект: Офисный центр</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Выполнено
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Кирпич керамический</div>
                    <div className="text-sm text-muted-foreground">Объект: Школа №15</div>
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Отправлена
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Bottom padding for mobile */}
      <div className="h-6"></div>
    </div>
  );
}
