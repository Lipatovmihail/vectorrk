"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Package, Clock, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("Все")
  
  // Проверяем URL параметры для показа toast уведомлений
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Небольшая задержка для корректного отображения toast
      setTimeout(() => {
        toast.success('Заявка успешно отправлена!');
      }, 100);
      // Очищаем URL от параметра
      window.history.replaceState({}, '', '/');
    }
  }, []);
  
  // Данные заявок
  const requests = [
    { id: 1, title: "Цемент М400", object: "ЖК \"Солнечный\"", status: "В процессе", icon: "Package" },
    { id: 2, title: "Арматура А500С", object: "Офисный центр", status: "Готова", icon: "Building" },
    { id: 3, title: "Кирпич керамический", object: "Школа №15", status: "Создана", icon: "Package" },
    { id: 4, title: "Бетон М300", object: "Торговый центр", status: "В процессе", icon: "Building" },
    { id: 5, title: "Песок речной", object: "ЖК \"Райский\"", status: "Готова", icon: "Package" },
    { id: 6, title: "Щебень гранитный", object: "Спорткомплекс", status: "В процессе", icon: "Building" },
    { id: 7, title: "Гипсокартон", object: "Офисное здание", status: "Создана", icon: "Package" },
    { id: 8, title: "Утеплитель", object: "Жилой дом", status: "Готова", icon: "Building" }
  ]
  
  // Фильтрация заявок по статусу
  const filteredRequests = activeFilter === "Все" 
    ? requests 
    : requests.filter(request => {
        if (activeFilter === "Создана") return request.status === "Создана"
        if (activeFilter === "В процессе") return request.status === "В процессе"
        if (activeFilter === "Готова") return request.status === "Готова"
        return true
      })
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-1">
        <div className="text-center pt-safe pt-12">
          <div className="flex items-center justify-center">
            <div className="w-40 h-10 flex items-end justify-center">
        <Image
                src="/logo.png" 
                alt="Вектор РК" 
                width={120} 
                height={40} 
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* News Stories */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* News Story 1 */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=center" 
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
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop&crop=center" 
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
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=80&h=80&fit=crop&crop=center" 
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
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=80&h=80&fit=crop&crop=center" 
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
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=80&fit=crop&crop=center" 
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

          {/* News Story 6 - Строительство */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=80&h=80&fit=crop&crop=center" 
                alt="Строительство"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Строительство
              </div>
            </div>
          </div>

          {/* News Story 7 - Оборудование */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=80&h=80&fit=crop&crop=center" 
                alt="Оборудование"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Оборудование
              </div>
            </div>
          </div>

          {/* News Story 8 - Безопасность */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?w=80&h=80&fit=crop&crop=center" 
                alt="Безопасность"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Безопасность
              </div>
            </div>
          </div>

          {/* News Story 9 - Логистика */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=80&h=80&fit=crop&crop=center" 
                alt="Логистика"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Логистика
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
            <Button variant="outline" className="w-full h-24 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm relative rounded-2xl p-3">
              <div className="flex flex-col items-start justify-start w-full h-full">
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900">Все заявки</div>
                  <div className="text-sm text-gray-500 mt-1">Посмотреть статистику</div>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="w-full h-24 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm relative rounded-2xl p-3">
              <div className="flex flex-col items-start justify-start w-full h-full">
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900">Править</div>
                  <div className="text-sm text-gray-500 mt-1">Внести изменения</div>
                </div>
                <div className="absolute top-2 right-2 w-6 h-6 bg-gray-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </div>
              </div>
            </Button>
          </div>
          
          {/* Right column - Add button */}
          <div>
            <Link href="/request">
              <Button className="w-full h-full bg-black hover:bg-gray-800 text-white text-base font-semibold relative p-6 rounded-2xl min-h-24">
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
        <div className="bg-gray-50 rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-foreground mb-1">Последние заявки</h2>
          <p className="text-xs text-muted-foreground mb-3 leading-tight">
            Отслеживайте статус<br />ваших заявок
          </p>
        <div className="mb-4">
          <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-lg p-1 w-fit mx-auto">
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
                activeFilter === "Создана" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveFilter("Создана")}
            >
              Создана
              <div className="w-4 h-4 bg-gray-300 text-gray-700 text-[10px] font-bold rounded-full flex items-center justify-center">
                {requests.filter(r => r.status === "Создана").length}
              </div>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-3 text-xs font-medium flex items-center gap-1 ${
                activeFilter === "В процессе" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveFilter("В процессе")}
            >
              В процессе
              <div className="w-4 h-4 bg-gray-300 text-gray-700 text-[10px] font-bold rounded-full flex items-center justify-center">
                {requests.filter(r => r.status === "В процессе").length}
              </div>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-3 text-xs font-medium flex items-center gap-1 ${
                activeFilter === "Готова" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveFilter("Готова")}
            >
              Готова
              <div className="w-4 h-4 bg-gray-300 text-gray-700 text-[10px] font-bold rounded-full flex items-center justify-center">
                {requests.filter(r => r.status === "Готова").length}
              </div>
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 bg-muted rounded-md flex items-center justify-center">
                      {request.icon === "Package" ? (
                        <Package className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Building className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{request.title}</div>
                      <div className="text-xs text-muted-foreground">Объект: {request.object}</div>
                    </div>
                  </div>
                  <Badge className={`text-xs px-2 py-0.5 ${
                    request.status === "В процессе" 
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : request.status === "Готова"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}>
                    {request.status === "В процессе" ? (
                      <Clock className="h-2.5 w-2.5 mr-1" />
                    ) : request.status === "Готова" ? (
                      <CheckCircle className="h-2.5 w-2.5 mr-1" />
                    ) : (
                      <Clock className="h-2.5 w-2.5 mr-1" />
                    )}
                    {request.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>


      {/* Bottom padding for mobile */}
      <div className="h-6"></div>
    </div>
  );
}
