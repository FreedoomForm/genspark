// Seed script for questions and lessons
// Run: npm run db:seed

import { PrismaClient } from '@prisma/client';
import { QUESTIONS } from '../lib/questions';

const prisma = new PrismaClient();

const lessons = [
  // === ГЛАВНАЯ (1-5) ===
  { category: 'cabinet', ruName: 'Главная', uzName: 'Bosh sahifa', ruDescription: 'Главная страница с обзором всех функций', uzDescription: 'Barcha funksiyalar sharhi bilan bosh sahifa', ruFunctionality: 'Открывает дашборд с быстрым доступом к основным разделам', uzFunctionality: 'Asosiy bo\'limlarga tez kirish bilan dashbordni ochadi', uiLocation: 'Боковое меню → Главная', order: 1 },
  { category: 'cabinet', ruName: 'Баланс', uzName: 'Balans', ruDescription: 'Отображение текущего баланса счёта', uzDescription: 'Hisobning joriy balansini ko\'rsatish', ruFunctionality: 'Показывает баланс в верхней части меню, при клике открывает детали', uzFunctionality: 'Menyu yuqori qismida balansni ko\'rsatadi, bosilganda tafsilotlarni ochadi', uiLocation: 'Верхняя панель → Баланс', order: 2 },
  { category: 'cabinet', ruName: 'Пополнение', uzName: 'To\'ldirish', ruDescription: 'Кнопка пополнения баланса', uzDescription: 'Balansni to\'ldirish tugmasi', ruFunctionality: 'Открывает форму пополнения баланса через платёжные системы', uzFunctionality: 'To\'lov tizimlari orqali balansni to\'ldirish formasini ochadi', uiLocation: 'Верхняя панель → Пополнение', order: 3 },
  { category: 'cabinet', ruName: 'Профиль пользователя', uzName: 'Foydalanuvchi profili', ruDescription: 'Открытие профиля текущего пользователя', uzDescription: 'Joriy foydalanuvchi profilini ochish', ruFunctionality: 'При клике на имя пользователя открывается меню с настройками профиля', uzFunctionality: 'Foydalanuvchi ismi bosilganda profil sozlamalari bilan menyu ochiladi', uiLocation: 'Верхняя панель → Имя пользователя', order: 4 },
  { category: 'cabinet', ruName: 'Выход', uzName: 'Chiqish', ruDescription: 'Кнопка выхода из системы', uzDescription: 'Tizimdan chiqish tugmasi', ruFunctionality: 'Завершает сессию и перенаправляет на страницу входа', uzFunctionality: 'Sessiyani tugatib, kirish sahifasiga yo\'naltiradi', uiLocation: 'Боковое меню → Кабинет → Выход', order: 5 },

  // === СКЛАД: ТОВАРЫ (6-20) ===
  { category: 'warehouse', ruName: 'Товары', uzName: 'Tovarlar', ruDescription: 'Раздел управления товарами', uzDescription: 'Tovarlarni boshqarish bo\'limi', ruFunctionality: 'Открывает список всех товаров с поиском и фильтрами', uzFunctionality: 'Qidiruv va filtrlar bilan barcha tovarlar ro\'yxatini ochadi', uiLocation: 'Боковое меню → Складские операции → Товары', order: 6 },
  { category: 'warehouse', ruName: 'Добавить товар', uzName: 'Tovar qo\'shish', ruDescription: 'Кнопка создания нового товара', uzDescription: 'Yangi tovar yaratish tugmasi', ruFunctionality: 'Открывает форму для добавления нового товара в базу', uzFunctionality: 'Bazaga yangi tovar qo\'shish uchun formani ochadi', uiLocation: 'Товары → Кнопка "Добавить"', order: 7 },
  { category: 'warehouse', ruName: 'Поиск товаров', uzName: 'Tovarlarni qidirish', ruDescription: 'Поле поиска по товарам', uzDescription: 'Tovarlar bo\'yicha qidiruv maydoni', ruFunctionality: 'Позволяет искать товары по названию, артикулу или штрих-коду', uzFunctionality: 'Tovarlarni nom, artikul yoki shtrix-kod bo\'yicha qidirishga imkon beradi', uiLocation: 'Товары → Поле поиска', order: 8 },
  { category: 'warehouse', ruName: 'Фильтр по категории', uzName: 'Kategoriya bo\'yicha filtr', ruDescription: 'Фильтрация товаров по категориям', uzDescription: 'Tovarlarni kategoriyalar bo\'yicha filtrlash', ruFunctionality: 'Позволяет отфильтровать список товаров по выбранной категории', uzFunctionality: 'Tanlangan kategoriya bo\'yicha tovarlar ro\'yxatini filtrlashga imkon beradi', uiLocation: 'Товары → Фильтры → Категория', order: 9 },
  { category: 'warehouse', ruName: 'Фильтр по складу', uzName: 'Ombor bo\'yicha filtr', ruDescription: 'Фильтрация товаров по складам', uzDescription: 'Tovarlarni omborlar bo\'yicha filtrlash', ruFunctionality: 'Показывает товары конкретного склада или торговой точки', uzFunctionality: 'Ma\'lum ombor yoki savdo nuqtasining tovarlarini ko\'rsatadi', uiLocation: 'Товары → Фильтры → Склад', order: 10 },
  { category: 'warehouse', ruName: 'Редактировать товар', uzName: 'Tovarni tahrirlash', ruDescription: 'Кнопка редактирования товара', uzDescription: 'Tovarni tahrirlash tugmasi', ruFunctionality: 'Открывает форму редактирования выбранного товара', uzFunctionality: 'Tanlangan tovarni tahrirlash formasini ochadi', uiLocation: 'Товары → Иконка карандаша', order: 11 },
  { category: 'warehouse', ruName: 'Удалить товар', uzName: 'Tovarni o\'chirish', ruDescription: 'Кнопка удаления товара', uzDescription: 'Tovarni o\'chirish tugmasi', ruFunctionality: 'Удаляет выбранный товар из базы после подтверждения', uzFunctionality: 'Tasdiqlangandan so\'ng tanlangan tovarni bazadan o\'chiradi', uiLocation: 'Товары → Иконка корзины', order: 12 },
  { category: 'warehouse', ruName: 'Экспорт товаров', uzName: 'Tovarlarni eksport', ruDescription: 'Экспорт списка товаров в файл', uzDescription: 'Tovarlar ro\'yxatini faylga eksport qilish', ruFunctionality: 'Позволяет выгрузить список товаров в Excel или CSV', uzFunctionality: 'Tovarlar ro\'yxatini Excel yoki CSV ga yuklab olish imkonini beradi', uiLocation: 'Товары → Кнопка "Экспорт"', order: 13 },
  { category: 'warehouse', ruName: 'Карточка товара', uzName: 'Tovar kartochkasi', ruDescription: 'Открытие детальной карточки товара', uzDescription: 'Tovarning batafsil kartochkasini ochish', ruFunctionality: 'Показывает полную информацию о товаре: остатки, цены, движение', uzFunctionality: 'Tovar haqida to\'liq ma\'lumotni ko\'rsatadi: qoldiqlar, narxlar, harakat', uiLocation: 'Товары → Клик на название товара', order: 14 },
  { category: 'warehouse', ruName: 'Добавить в избранное', uzName: 'Sevimlilarga qo\'shish', ruDescription: 'Добавление товара в избранное', uzDescription: 'Tovarni sevimlilarga qo\'shish', ruFunctionality: 'Сохраняет товар в списке избранных для быстрого доступа', uzFunctionality: 'Tovarni tez kirish uchun sevimlilar ro\'yxatida saqlaydi', uiLocation: 'Товары → Иконка звезды', order: 15 },
  { category: 'warehouse', ruName: 'Массовое редактирование', uzName: 'Ommaviy tahrirlash', ruDescription: 'Редактирование нескольких товаров', uzDescription: 'Bir nechta tovarlarni tahrirlash', ruFunctionality: 'Позволяет изменить цену или категорию для выбранных товаров', uzFunctionality: 'Tanlangan tovarlar uchun narx yoki kategoriyani o\'zgartirishga imkon beradi', uiLocation: 'Товары → Чекбоксы → Массовые действия', order: 16 },
  { category: 'warehouse', ruName: 'Печать ценника', uzName: 'Narx yorlig\'ini chop etish', ruDescription: 'Печать ценника для товара', uzDescription: 'Tovar uchun narx yorlig\'ini chop etish', ruFunctionality: 'Формирует и печатает ценник для выбранного товара', uzFunctionality: 'Tanlangan tovar uchun narx yorlig\'ini shakllantirib chop etadi', uiLocation: 'Товары → Кнопка "Печать ценника"', order: 17 },
  { category: 'warehouse', ruName: 'Копировать товар', uzName: 'Tovarni nusxalash', ruDescription: 'Создание копии товара', uzDescription: 'Tovar nusxasini yaratish', ruFunctionality: 'Создаёт дубликат товара с теми же характеристиками', uzFunctionality: 'Xuddi shu xususiyatlarga ega tovar dublikatini yaratadi', uiLocation: 'Товары → Кнопка "Копировать"', order: 18 },
  { category: 'warehouse', ruName: 'История изменений', uzName: 'O\'zgarishlar tarixi', ruDescription: 'Просмотр истории изменений товара', uzDescription: 'Tovar o\'zgarishlari tarixini ko\'rish', ruFunctionality: 'Показывает все изменения цены, остатков и других данных товара', uzFunctionality: 'Narx, qoldiqlar va boshqa tovar ma\'lumotlarning barcha o\'zgarishlarini ko\'rsatadi', uiLocation: 'Товары → Карточка товара → История', order: 19 },
  { category: 'warehouse', ruName: 'Штрих-код товара', uzName: 'Tovar shtrix-kodi', ruDescription: 'Просмотр и печать штрих-кода', uzDescription: 'Shtrix-kodni ko\'rish va chop etish', ruFunctionality: 'Показывает штрих-код товара с возможностью печати', uzFunctionality: 'Chop etish imkoniyati bilan tovar shtrix-kodini ko\'rsatadi', uiLocation: 'Товары → Карточка товара → Штрих-код', order: 20 },
  // Note: Add remaining lessons (21-200) as needed
];

async function main() {
  console.log('Starting seed...');

  // Seed Questions
  console.log('Seeding questions...');
  await prisma.question.deleteMany({});
  
  for (const q of QUESTIONS) {
    await prisma.question.create({
      data: {
        id: q.id,
        category: q.cat,
        screenshot: q.shot,
        ruQuestion: q.ru.q,
        ruOptions: q.ru.opts,
        uzQuestion: q.uz.q,
        uzOptions: q.uz.opts,
        correct: q.correct,
      },
    });
  }
  console.log(`Inserted ${QUESTIONS.length} questions`);

  // Seed Lessons
  console.log('Seeding lessons...');
  await prisma.lesson.deleteMany({});
  
  for (const lesson of lessons) {
    await prisma.lesson.create({ data: lesson });
  }
  console.log(`Inserted ${lessons.length} lessons`);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
