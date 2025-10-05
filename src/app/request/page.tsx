"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, MapPin, Building, Package, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function RequestPage() {
  const [materials, setMaterials] = useState([
    { id: 1, name: "", quantity: "", unit: "" }
  ])

  const addMaterial = () => {
    setMaterials([...materials, { 
      id: materials.length + 1, 
      name: "", 
      quantity: "", 
      unit: "" 
    }])
  }

  const removeMaterial = (id: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter(m => m.id !== id))
    }
  }

  const updateMaterial = (id: number, field: string, value: string) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

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
            <p className="text-sm text-muted-foreground">Отдел снабжения</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Дата поставки */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Дата поставки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input 
              type="date" 
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Адрес поставки */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Адрес поставки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="address">Адрес</Label>
              <Input 
                id="address"
                placeholder="Введите адрес поставки"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact">Контактное лицо</Label>
              <Input 
                id="contact"
                placeholder="ФИО ответственного"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input 
                id="phone"
                placeholder="+7 (___) ___-__-__"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Объект */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Объект
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="object">Название объекта</Label>
              <Input 
                id="object"
                placeholder="Например: ЖК 'Солнечный'"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="object-type">Тип объекта</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Выберите тип объекта" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Жилой комплекс</SelectItem>
                  <SelectItem value="commercial">Коммерческий объект</SelectItem>
                  <SelectItem value="industrial">Промышленный объект</SelectItem>
                  <SelectItem value="social">Социальный объект</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="object-description">Описание</Label>
              <Textarea 
                id="object-description"
                placeholder="Дополнительная информация об объекте"
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Материалы */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Материалы
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addMaterial}
              >
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {materials.map((material, index) => (
              <div key={material.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Материал {index + 1}
                  </span>
                  {materials.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeMaterial(material.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label>Название материала</Label>
                    <Input 
                      placeholder="Например: Цемент М400"
                      value={material.name}
                      onChange={(e) => updateMaterial(material.id, 'name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Количество</Label>
                      <Input 
                        placeholder="0"
                        type="number"
                        value={material.quantity}
                        onChange={(e) => updateMaterial(material.id, 'quantity', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Единица измерения</Label>
                      <Select 
                        value={material.unit}
                        onValueChange={(value) => updateMaterial(material.id, 'unit', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">кг</SelectItem>
                          <SelectItem value="ton">т</SelectItem>
                          <SelectItem value="m3">м³</SelectItem>
                          <SelectItem value="m2">м²</SelectItem>
                          <SelectItem value="pcs">шт</SelectItem>
                          <SelectItem value="m">м</SelectItem>
                          <SelectItem value="l">л</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Примечание</Label>
                    <Textarea 
                      placeholder="Дополнительная информация о материале"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Кнопки действий */}
        <div className="flex gap-3 pb-6">
          <Button variant="outline" className="flex-1">
            Сохранить черновик
          </Button>
          <Button className="flex-1">
            Отправить заявку
          </Button>
        </div>
      </div>
    </div>
  )
}
