"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, Calendar, Camera, Check, X, Clock } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export default function RequestPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    orderNumber: "",
    objectName: "",
    objectAddress: "",
    deliveryDate: null as Date | null,
    deliveryTime: "",
    materials: "",
    photos: [] as string[]
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const steps = [
    { number: 1, title: "Введите номер наряд-заказа", placeholder: "НЗ 545/204", field: "orderNumber" },
    { number: 2, title: "Введите наименование объекта", placeholder: "Университетский лицей", field: "objectName" },
    { number: 3, title: "Введите адрес объекта", placeholder: "наб. Варкауса, 15", field: "objectAddress" },
    { number: 4, title: "Введите дату поставки", placeholder: "10.12.2024 16:10", field: "deliveryDate" },
    { number: 5, title: "Необходимые материалы", placeholder: "1. Страховочная привязь – 2 шт;\n2. Страховочный ус – 2 шт;\n3. Жилетка – 2 шт;\n4. Перчатки х/б – 20 пар;\n5. Перчатки зимние – 4 пары;\n6. Перчатки прорезиненные – 10 пар;", field: "materials" },
    { number: 6, title: "Отправьте фото", placeholder: "Добавьте фотографии", field: "photos" }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowConfirmation(true)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }))
    }
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      photos: prev.photos.filter((_, i) => i !== index) 
    }))
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && currentStep < 6) {
      nextStep()
    }
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background border-b border-border px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-3" onClick={() => setShowConfirmation(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Подтверждение заявки</h1>
              <p className="text-sm text-muted-foreground">Проверьте данные перед отправкой</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Данные заявки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Номер наряд-заказа</Label>
                <p className="text-base">{formData.orderNumber || "Не указано"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Наименование объекта</Label>
                <p className="text-base">{formData.objectName || "Не указано"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Адрес объекта</Label>
                <p className="text-base">{formData.objectAddress || "Не указано"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Дата поставки</Label>
                <p className="text-base">
                  {formData.deliveryDate 
                    ? `${format(formData.deliveryDate, "dd.MM.yyyy", { locale: ru })}${formData.deliveryTime ? ` ${formData.deliveryTime}` : ''}`
                    : "Не указано"
                  }
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Материалы</Label>
                <p className="text-base">{formData.materials || "Не указано"}</p>
              </div>
              {formData.photos.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Фотографии</Label>
                  <div className="flex gap-2 mt-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={photo}
                          alt={`Фото ${index + 1}`}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3 pb-6">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setShowConfirmation(false)}>
              Редактировать
            </Button>
            <Button className="flex-1 h-12">
              <Check className="h-4 w-4 mr-2" />
              Отправить заявку
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentStepData = steps[currentStep - 1]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-4">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Новая заявка</h1>
            <p className="text-sm text-muted-foreground">Шаг {currentStep}/6</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="px-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              [{currentStep}/6] {currentStepData.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentStep === 6 
                ? "Можно пропустить шаг, нажав на кнопку \"Завершить\""
                : currentStep === 5
                ? "Укажите необходимые материалы списком"
                : `Например, "${currentStepData.placeholder}"`
              }
            </p>
          </CardHeader>
          <CardContent>
            {currentStep === 4 ? (
              <div className="space-y-4 min-h-[200px] flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
                  <Label className="text-sm font-medium mb-2 block">Выберите дату</Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal flex-1"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.deliveryDate ? (
                          format(formData.deliveryDate, "dd.MM.yyyy", { locale: ru })
                        ) : (
                          <span>Выберите дату</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.deliveryDate || undefined}
                        onSelect={(date) => {
                          setFormData(prev => ({ ...prev, deliveryDate: date || null }))
                          setCalendarOpen(false)
                        }}
                        initialFocus
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
            </div>
            <div className="flex-1 flex flex-col justify-center">
                  <Label className="text-sm font-medium mb-2 block">Время (необязательно)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                      type="time"
                      placeholder="16:10"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-12"
              />
            </div>
            </div>
            </div>
            ) : currentStep === 5 ? (
              <div className="min-h-[200px] flex flex-col">
              <Textarea 
                  placeholder={currentStepData.placeholder}
                  value={formData.materials}
                  onChange={(e) => handleInputChange('materials', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-h-32"
              />
            </div>
            ) : currentStep === 6 ? (
              <div className="space-y-4 min-h-[200px]">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Добавьте фотографии</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button asChild>
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      Выбрать фото
                    </label>
                    </Button>
                </div>
                
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={photo}
                          alt={`Фото ${index + 1}`}
                          width={100}
                          height={100}
                          className="rounded-lg object-cover"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="min-h-[200px] flex flex-col">
                <Input
                  placeholder={currentStepData.placeholder}
                  value={formData[currentStepData.field as keyof typeof formData] as string}
                  onChange={(e) => handleInputChange(currentStepData.field, e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3 mt-6 pb-6">
          {currentStep > 1 && (
            <Button variant="outline" className="flex-1 h-12" onClick={prevStep}>
              Назад
          </Button>
          )}
          <Button className="flex-1 h-12" onClick={nextStep}>
            {currentStep === 6 ? "Завершить" : "Далее"}
          </Button>
        </div>
      </div>
    </div>
  )
}
