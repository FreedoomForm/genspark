// 200 questions about admin.lume.uz (LUME Admin System).
// Each question has bilingual text (RU/UZ), 3-4 answer options, the index of
// the correct option, and a screenshot path (under /public/screenshots).
//
// Questions focus on practical usage and functionality of Lume system.

export type Question = {
  id: number;
  cat: string;
  shot?: string;
  ru: { q: string; opts: string[] };
  uz: { q: string; opts: string[] };
  correct: number;
};

const q = (
  id: number,
  cat: string,
  shot: string | undefined,
  ru: { q: string; opts: string[] },
  uz: { q: string; opts: string[] },
  correct: number,
): Question => ({ id, cat, shot, ru, uz, correct });

export const QUESTIONS: Question[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // СКЛАДСКИЕ ОПЕРАЦИИ - 40 вопросов
  // ═══════════════════════════════════════════════════════════════════════════
  q(1, 'warehouse', 'screenshots/products.png',
    { q: 'Как добавить новый товар в систему Lume?', opts: ['Нажать кнопку "Добавить товар" в разделе Товары', 'Только через импорт CSV', 'Через API интеграцию', 'Это невозможно сделать вручную'] },
    { q: 'Lume tizimiga yangi tovarni qanday qo\'shish mumkin?', opts: ['Tovarlar bo\'limida "Tovar qo\'shish" tugmasini bosing', 'Faqat CSV import orqali', 'API integratsiya orqali', 'Buni qo\'lda qilish mumkin emas'] }, 0),

  q(2, 'warehouse', 'screenshots/products.png',
    { q: 'Для чего нужен раздел "Товары"?', opts: ['Для добавления, редактирования и поиска товаров', 'Для печати чеков', 'Для расчета зарплаты', 'Для отправки SMS'] },
    { q: '"Tovarlar" bo\'limi nimaga kerak?', opts: ['Tovarlarni qo\'shish, tahrirlash va qidirish uchun', 'Chek chop etish uchun', 'Ish haqi hisoblash uchun', 'SMS yuborish uchun'] }, 0),

  q(3, 'warehouse', 'screenshots/receipt.png',
    { q: 'Что такое "Приход" в системе Lume?', opts: ['Оформление поступления товаров от поставщиков', 'Продажа товаров клиентам', 'Возврат товаров', 'Списание товаров'] },
    { q: 'Lume tizimida "Приход" nima?', opts: ['Yetkazib beruvchilardan tovar qabul qilishni rasmiylashtirish', 'Mijozlarga tovar sotish', 'Tovarlarni qaytarish', 'Tovarlarni yozib chiqarish'] }, 0),

  q(4, 'warehouse', 'screenshots/receipt.png',
    { q: 'Какие статусы могут быть у документа "Приход"?', opts: ['Оформленные, Отправленные, Черновик', 'Только Завершён', 'Активен, Неактивен', 'Новый, Старый'] },
    { q: '"Приход" hujjatining qanday holatlari bo\'lishi mumkin?', opts: ['Rasmiylashtirilgan, Yuborilgan, Qoralama', 'Faqat Tugallangan', 'Faol, Faol emas', 'Yangi, Eski'] }, 0),

  q(5, 'warehouse', 'screenshots/receipt_return.png',
    { q: 'Для чего используется "Возврат прихода"?', opts: ['Для возврата товаров поставщикам', 'Для возврата товаров от клиентов', 'Для отмены чека', 'Для удаления товара'] },
    { q: '"Возврат прихода" nimaga ishlatiladi?', opts: ['Tovarlarni yetkazib beruvchilarga qaytarish uchun', 'Mijozlardan tovarlarni qaytarish uchun', 'Chekni bekor qilish uchun', 'Tovarni o\'chirish uchun'] }, 0),

  q(6, 'warehouse', 'screenshots/transfer.png',
    { q: 'Что такое "Трансфер" в Lume?', opts: ['Перемещение товаров между складами и торговыми точками', 'Перевод денег между счетами', 'Передача прав доступа', 'Экспорт данных'] },
    { q: 'Lumedagi "Transfer" nima?', opts: ['Tovarlarni omborlar va savdo nuqtalari orasida ko\'chirish', 'Hisoblar orasida pul o\'tkazish', 'Kirish huquqlarini berish', 'Ma\'lumotlarni eksport qilish'] }, 0),

  q(7, 'warehouse', 'screenshots/transfer.png',
    { q: 'Какие статусы есть у трансфера?', opts: ['Все, Отправленные, Полученные', 'Только Отправлен', 'Активен, Неактивен', 'Новый, Старый'] },
    { q: 'Transferning qanday holatlari bor?', opts: ['Barchasi, Yuborilgan, Qabul qilingan', 'Faqat Yuborilgan', 'Faol, Faol emas', 'Yangi, Eski'] }, 0),

  q(8, 'warehouse', 'screenshots/realization.png',
    { q: 'Для чего нужен раздел "Реализация"?', opts: ['Для отгрузки и продажи товаров', 'Для возврата товаров', 'Для инвентаризации', 'Для печати ценников'] },
    { q: '"Realizatsiya" bo\'limi nimaga kerak?', opts: ['Tovarlarni jo\'natish va sotish uchun', 'Tovarlarni qaytarish uchun', 'Inventarizatsiya uchun', 'Narx yorliqlarini chop etish uchun'] }, 0),

  q(9, 'warehouse', 'screenshots/reprice.png',
    { q: 'Что делает "Переоценка"?', opts: ['Массовое изменение цен на товары', 'Проверку качества товаров', 'Расчет себестоимости', 'Печать ценников'] },
    { q: '"Переоценка" nima qiladi?', opts: ['Tovarlar narxlarini ommaviy o\'zgartirish', 'Tovarlar sifatini tekshirish', 'Tannarxni hisoblash', 'Narx yorliqlarini chop etish'] }, 0),

  q(10, 'warehouse', 'screenshots/reprice.png',
    { q: 'Как создать новую переоценку?', opts: ['Нажать кнопку "Создать переоценку"', 'Через раздел Товары', 'Это невозможно', 'Только через API'] },
    { q: 'Yangi переоценка qanday yaratish mumkin?', opts: ['"Переоценка yaratish" tugmasini bosing', 'Tovarlar bo\'limi orqali', 'Buni qilish mumkin emas', 'Faqat API orqali'] }, 0),

  q(11, 'warehouse', 'screenshots/inventory.png',
    { q: 'Что такое "Инвентаризация"?', opts: ['Сверка фактического наличия с учётными данными', 'Подсчёт выручки', 'Расчёт зарплаты', 'Печать отчётов'] },
    { q: '"Inventarizatsiya" nima?', opts: ['Haqiqiy mavjudlikni hisob ma\'lumotlari bilan solishtirish', 'Tushumni hisoblash', 'Ish haqini hisoblash', 'Hisobotlarni chop etish'] }, 0),

  q(12, 'warehouse', 'screenshots/inventory.png',
    { q: 'Какие типы инвентаризации есть в системе?', opts: ['Полная и Частичная', 'Только Полная', 'Только Частичная', 'Суточная и Недельная'] },
    { q: 'Tizimda qanday inventarizatsiya turlari bor?', opts: ['To\'liq va Qisman', 'Faqat To\'liq', 'Faqat Qisman', 'Kunlik va Haftalik'] }, 0),

  q(13, 'warehouse', 'screenshots/writeoff.png',
    { q: 'Для чего используется "Списание"?', opts: ['Для удаления испорченных или списанных товаров', 'Для добавления новых товаров', 'Для перемещения товаров', 'Для возврата поставщику'] },
    { q: '"Списание" nimaga ishlatiladi?', opts: ['Buzilgan yoki yozib chiqarilgan tovarlarni o\'chirish uchun', 'Yangi tovarlar qo\'shish uchun', 'Tovarlarni ko\'chirish uchun', 'Yetkazib beruvchiga qaytarish uchun'] }, 0),

  q(14, 'warehouse', 'screenshots/writeoff.png',
    { q: 'Какие данные указываются при списании?', opts: ['Сумма, Причина, Работник, Дата, Статус', 'Только сумма', 'Только дата', 'Только причина'] },
    { q: 'Yozib chiqarishda qanday ma\'lumotlar ko\'rsatiladi?', opts: ['Summa, Sabab, Xodim, Sana, Holat', 'Faqat summa', 'Faqat sana', 'Faqat sabab'] }, 0),

  q(15, 'warehouse', 'screenshots/grouping.png',
    { q: 'Что такое "Группировка" товаров?', opts: ['Объединение позиций для упрощения анализа', 'Создание категорий товаров', 'Удаление товаров', 'Печать каталога'] },
    { q: 'Tovarlarni "Guruhlash" nima?', opts: ['Tahlilni soddalashtirish uchun pozitsiyalarni birlashtirish', 'Tovar kategoriyalarini yaratish', 'Tovarlarni o\'chirish', 'Katalogni chop etish'] }, 0),

  q(16, 'warehouse', 'screenshots/weighted_products.png',
    { q: 'Для чего нужны "Весовые товары"?', opts: ['Для учёта и продажи товаров по весу', 'Для тяжелых товаров', 'Для крупногабаритных товаров', 'Для импортных товаров'] },
    { q: '"Og\'irlikli tovarlar" nimaga kerak?', opts: ['Og\'irlik bo\'yicha tovarlarni hisobga olish va sotish uchun', 'Og\'ir tovarlar uchun', 'Katta o\'lchamli tovarlar uchun', 'Import tovarlari uchun'] }, 0),

  q(17, 'warehouse', 'screenshots/import_products.png',
    { q: 'Как импортировать товары в систему?', opts: ['Через раздел "Импорт товаров" загрузкой файла', 'Только вручную', 'Это невозможно', 'Только через API'] },
    { q: 'Tovarlarni tizimga qanday import qilish mumkin?', opts: ['"Tovarlarni import qilish" bo\'limi orqali fayl yuklash', 'Faqat qo\'lda', 'Buni qilish mumkin emas', 'Faqat API orqali'] }, 0),

  q(18, 'warehouse', 'screenshots/tech_cards.png',
    { q: 'Что такое "Техкарты"?', opts: ['Состав рецептур и калькуляция себестоимости', 'Технические паспорта товаров', 'Гарантийные талоны', 'Инструкции по эксплуатации'] },
    { q: '"Tex-kartalar" nima?', opts: ['Retsepturalar tarkibi va tannarx kalkulyatsiyasi', 'Tovarlarning texnik pasportlari', 'Kafolat talonlari', 'Foydalanish yo\'riqnomalari'] }, 0),

  q(19, 'warehouse', 'screenshots/manufacturing_act.png',
    { q: 'Для чего нужен "Акт изготовления"?', opts: ['Для фиксации выпуска готовой продукции', 'Для возврата брака', 'Для списания материалов', 'Для инвентаризации'] },
    { q: '"Ishlab chiqarish akri" nimaga kerak?', opts: ['Tayyor mahsulot ishlab chiqarilishini qayd etish uchun', 'Brakni qaytarish uchun', 'Materiallarni yozib chiqarish uchun', 'Inventarizatsiya uchun'] }, 0),

  q(20, 'warehouse', 'screenshots/favorite_products.png',
    { q: 'Как сохранить товары для быстрого доступа?', opts: ['Добавить в "Избранные товары"', 'Создать отдельный склад', 'Использовать теги', 'Это невозможно'] },
    { q: 'Tovarlarni tez kirish uchun qanday saqlash mumkin?', opts: ['"Sevimli tovarlar"ga qo\'shish', 'Alohida ombor yaratish', 'Teglardan foydalanish', 'Buni qilish mumkin emas'] }, 0),

  q(21, 'warehouse', 'screenshots/products.png',
    { q: 'Как отредактировать товар?', opts: ['Нажать иконку редактирования в строке товара', 'Только через импорт', 'Удалить и создать заново', 'Это невозможно'] },
    { q: 'Tovarni qanday tahrirlash mumkin?', opts: ['Tovar qatoridagi tahrirlash belgisini bosish', 'Faqat import orqali', 'O\'chirib qayta yaratish', 'Buni qilish mumkin emas'] }, 0),

  q(22, 'warehouse', 'screenshots/products.png',
    { q: 'Как найти товар в системе?', opts: ['Использовать поле поиска с названием или артикулом', 'Только прокруткой списка', 'Это невозможно', 'Только через фильтры'] },
    { q: 'Tovarni tizimda qanday topish mumkin?', opts: ['Nom yoki artikul bilan qidiruv maydonidan foydalanish', 'Faqat ro\'yxatni aylantirish', 'Buni qilish mumkin emas', 'Faqat filtrlar orqali'] }, 0),

  q(23, 'warehouse', 'screenshots/receipt.png',
    { q: 'Какая информация отображается в приходе?', opts: ['Контрагент, дата, сумма, статус', 'Только дата', 'Только сумма', 'Только контрагент'] },
    { q: '"Приход"da qanday ma\'lumotlar ko\'rsatiladi?', opts: ['Kontragent, sana, summa, holat', 'Faqat sana', 'Faqat summa', 'Faqat kontragent'] }, 0),

  q(24, 'warehouse', 'screenshots/transfer.png',
    { q: 'Как создать новый трансфер?', opts: ['Нажать кнопку "Добавить" в разделе Трансфер', 'Через раздел Товары', 'Это невозможно', 'Только через API'] },
    { q: 'Yangi transfer qanday yaratish mumkin?', opts: ['Transfer bo\'limida "Qo\'shish" tugmasini bosing', 'Tovarlar bo\'limi orqali', 'Buni qilish mumkin emas', 'Faqat API orqali'] }, 0),

  q(25, 'warehouse', 'screenshots/realization.png',
    { q: 'Как отфильтровать реализации по статусу?', opts: ['Использовать вкладки: Оформленные, Отправленные, Черновик', 'Это невозможно', 'Только через поиск', 'Через настройки'] },
    { q: 'Realizatsiyalarni holat bo\'yicha qanday filtrlash mumkin?', opts: ['Varaqalardan foydalanish: Rasmiylashtirilgan, Yuborilgan, Qoralama', 'Buni qilish mumkin emas', 'Faqat qidiruv orqali', 'Sozlamalar orqali'] }, 0),

  q(26, 'warehouse', 'screenshots/inventory.png',
    { q: 'Как создать новую инвентаризацию?', opts: ['Нажать "Новая инвентаризация"', 'Через раздел Товары', 'Это невозможно', 'Автоматически'] },
    { q: 'Yangi inventarizatsiya qanday yaratish mumkin?', opts: ['"Yangi inventarizatsiya" tugmasini bosing', 'Tovarlar bo\'limi orqali', 'Buni qilish mumkin emas', 'Avtomatik ravishda'] }, 0),

  q(27, 'warehouse', 'screenshots/writeoff.png',
    { q: 'Как создать новое списание?', opts: ['Нажать "Новое списание" в разделе Списание', 'Через раздел Товары', 'Автоматически при продаже', 'Это невозможно'] },
    { q: 'Yangi yozib chiqarish qanday yaratish mumkin?', opts: ['Yozib chiqarish bo\'limida "Yangi yozib chiqarish" tugmasini bosing', 'Tovarlar bo\'limi orqali', 'Sotuvda avtomatik', 'Buni qilish mumkin emas'] }, 0),

  q(28, 'warehouse', 'screenshots/grouping.png',
    { q: 'Для чего используется группировка товаров?', opts: ['Для упрощения анализа объединённых позиций', 'Для удаления товаров', 'Для создания скидок', 'Для печати отчётов'] },
    { q: 'Tovarlarni guruhlash nimaga ishlatiladi?', opts: ['Birlashtirilgan pozitsiyalar tahlilini soddalashtirish uchun', 'Tovarlarni o\'chirish uchun', 'Chegirmalar yaratish uchun', 'Hisobotlarni chop etish uchun'] }, 0),

  q(29, 'warehouse', 'screenshots/weighted_products.png',
    { q: 'Какие товары считаются весовыми?', opts: ['Товары, реализуемые по весу', 'Тяжёлые товары', 'Крупногабаритные товары', 'Дорогие товары'] },
    { q: 'Qaysi tovarlar og\'irlikli hisoblanadi?', opts: ['Og\'irlik bo\'yicha sotiladigan tovarlar', 'Og\'ir tovarlar', 'Katta o\'lchamli tovarlar', 'Qimmat tovarlar'] }, 0),

  q(30, 'warehouse', 'screenshots/import_products.png',
    { q: 'Какие форматы файлов можно импортировать?', opts: ['Excel, CSV и другие табличные форматы', 'Только PDF', 'Только изображения', 'Только текстовые файлы'] },
    { q: 'Qaysi fayl formatlarini import qilish mumkin?', opts: ['Excel, CSV va boshqa jadval formatlari', 'Faqat PDF', 'Faqat rasmlar', 'Faqat matn fayllari'] }, 0),

  q(31, 'warehouse', 'screenshots/tech_cards.png',
    { q: 'Для чего нужны техкарты в производстве?', opts: ['Для расчета себестоимости готовой продукции', 'Для хранения документов', 'Для печати чеков', 'Для учёта клиентов'] },
    { q: 'Ishlab chiqarishda tex-kartalar nimaga kerak?', opts: ['Tayyor mahsulot tannarxini hisoblash uchun', 'Hujjatlarni saqlash uchun', 'Cheklarni chop etish uchun', 'Mijozlarni hisobga olish uchun'] }, 0),

  q(32, 'warehouse', 'screenshots/manufacturing_act.png',
    { q: 'Что происходит при создании акта изготовления?', opts: ['Фиксируется выпуск готовой продукции', 'Списываются материалы', 'Создаётся приход', 'Формируется чек'] },
    { q: 'Ishlab chiqarish akri yaratilganda nima sodir bo\'ladi?', opts: ['Tayyor mahsulot ishlab chiqarilishi qayd etiladi', 'Materiallar yozib chiqariladi', 'Kirim yaratiladi', 'Chek shakllanadi'] }, 0),

  q(33, 'warehouse', 'screenshots/favorite_products.png',
    { q: 'Как добавить товар в избранное?', opts: ['Нажать на звёздочку в карточке товара', 'Через настройки', 'Это невозможно', 'Только при создании товара'] },
    { q: 'Tovarni sevimlilarga qanday qo\'shish mumkin?', opts: ['Tovar kartochkasidagi yulduzchani bosish', 'Sozlamalar orqali', 'Buni qilish mumkin emas', 'Faqat tovar yaratishda'] }, 0),

  q(34, 'warehouse', 'screenshots/products.png',
    { q: 'Какая информация отображается в списке товаров?', opts: ['Название, остаток, себестоимость, цена продажи', 'Только название', 'Только цена', 'Только остаток'] },
    { q: 'Tovarlar ro\'yxatida qanday ma\'lumotlar ko\'rsatiladi?', opts: ['Nom, qoldiq, tannarx, sotuv narxi', 'Faqat nom', 'Faqat narx', 'Faqat qoldiq'] }, 0),

  q(35, 'warehouse', 'screenshots/receipt.png',
    { q: 'Как оформить новый приход?', opts: ['Нажать "Создать приход" и заполнить данные', 'Через раздел Товары', 'Автоматически', 'Это невозможно'] },
    { q: 'Yangi kirimni qanday rasmiylashtirish mumkin?', opts: ['"Kirim yaratish" tugmasini bosing va ma\'lumotlarni to\'ldiring', 'Tovarlar bo\'limi orqali', 'Avtomatik ravishda', 'Buni qilish mumkin emas'] }, 0),

  q(36, 'warehouse', 'screenshots/receipt_return.png',
    { q: 'Какие данные нужны для возврата прихода?', opts: ['Номер прихода, причина возврата, товары', 'Только номер прихода', 'Только причина', 'Только товары'] },
    { q: 'Kirimni qaytarish uchun qanday ma\'lumotlar kerak?', opts: ['Kirim raqami, qaytarish sababi, tovarlar', 'Faqat kirim raqami', 'Faqat sabab', 'Faqat tovarlar'] }, 0),

  q(37, 'warehouse', 'screenshots/transfer.png',
    { q: 'Как принять трансфер?', opts: ['Перейти в полученные трансферы и подтвердить', 'Автоматически', 'Это невозможно', 'Через раздел Товары'] },
    { q: 'Transferni qandai qabul qilish mumkin?', opts: ['Qabul qilingan transferlarga o\'tish va tasdiqlash', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Tovarlar bo\'limi orqali'] }, 0),

  q(38, 'warehouse', 'screenshots/realization.png',
    { q: 'Как создать новую реализацию?', opts: ['Нажать "Новая реализация" и выбрать контрагента', 'Автоматически при продаже', 'Через раздел Товары', 'Это невозможно'] },
    { q: 'Yangi realizatsiya qanday yaratish mumkin?', opts: ['"Yangi realizatsiya" tugmasini bosing va kontragentni tanlang', 'Sotuvda avtomatik', 'Tovarlar bo\'limi orqali', 'Buni qilish mumkin emas'] }, 0),

  q(39, 'warehouse', 'screenshots/reprice.png',
    { q: 'Какие товары можно выбрать для переоценки?', opts: ['Любые товары из каталога', 'Только новые товары', 'Только товары с остатком', 'Только дорогие товары'] },
    { q: 'Переоценка uchun qaysi tovarlarni tanlash mumkin?', opts: ['Katalogdagi istalgan tovarlar', 'Faqat yangi tovarlar', 'Faqat qoldiqli tovarlar', 'Faqat qimmat tovarlar'] }, 0),

  q(40, 'warehouse', 'screenshots/inventory.png',
    { q: 'Что показывает статус "ПРИНЯТ" у инвентаризации?', opts: ['Инвентаризация успешно завершена', 'Инвентаризация отменена', 'Инвентаризация в процессе', 'Черновик'] },
    { q: 'Inventarizatsiyadagi "QABUL QILINGAN" holati nimani ko\'rsatadi?', opts: ['Inventarizatsiya muvaffaqiyatli tugallangan', 'Inventarizatsiya bekor qilingan', 'Inventarizatsiya jarayonda', 'Qoralama'] }, 0),

  // ═══════════════════════════════════════════════════════════════════════════
  // СПРАВОЧНИК - 35 вопросов
  // ═══════════════════════════════════════════════════════════════════════════
  q(41, 'reference', 'screenshots/personnel.png',
    { q: 'Для чего нужен раздел "Персонал"?', opts: ['Для эффективного управления сотрудниками', 'Для учёта товаров', 'Для печати чеков', 'Для отправки SMS'] },
    { q: '"Personal" bo\'limi nimaga kerak?', opts: ['Xodimlarni samarali boshqarish uchun', 'Tovarlarni hisobga olish uchun', 'Cheklarni chop etish uchun', 'SMS yuborish uchun'] }, 0),

  q(42, 'reference', 'screenshots/personnel.png',
    { q: 'Как добавить нового сотрудника?', opts: ['Нажать кнопку "Добавить" в разделе Персонал', 'Через импорт', 'Это невозможно', 'Автоматически'] },
    { q: 'Yangi xodimni qanday qo\'shish mumkin?', opts: ['Personal bo\'limida "Qo\'shish" tugmasini bosing', 'Import orqali', 'Buni qilish mumkin emas', 'Avtomatik ravishda'] }, 0),

  q(43, 'reference', 'screenshots/drivers.png',
    { q: 'Для чего нужен раздел "Водители"?', opts: ['Для учёта водителей и их данных', 'Для управления транспортом', 'Для расчёта доставки', 'Для печати путевых листов'] },
    { q: '"Haydovchilar" bo\'limi nimaga kerak?', opts: ['Haydovchilar va ularning ma\'lumotlarini hisobga olish uchun', 'Transportni boshqarish uchun', 'Yetkazib berishni hisoblash uchun', 'Yo\'l varaqalarini chop etish uchun'] }, 0),

  q(44, 'reference', 'screenshots/drivers.png',
    { q: 'Какие данные хранятся о водителях?', opts: ['ФИО, контакт, логин', 'Только ФИО', 'Только контакт', 'Только логин'] },
    { q: 'Haydovchilar haqida qanday ma\'lumotlar saqlanadi?', opts: ['FIO, kontakt, login', 'Faqat FIO', 'Faqat kontakt', 'Faqat login'] }, 0),

  q(45, 'reference', 'screenshots/shifts.png',
    { q: 'Для чего нужен раздел "Смены"?', opts: ['Для контроля и ведения рабочих смен', 'Для расчёта зарплаты', 'Для печати чеков', 'Для учёта товаров'] },
    { q: '"Smenalar" bo\'limi nimaga kerak?', opts: ['Ish smenalarini nazorat qilish va yuritish uchun', 'Ish haqini hisoblash uchun', 'Cheklarni chop etish uchun', 'Tovarlarni hisobga olish uchun'] }, 0),

  q(46, 'reference', 'screenshots/shifts.png',
    { q: 'Как отфильтровать смены?', opts: ['По кассе и дате', 'Только по дате', 'Только по кассе', 'Это невозможно'] },
    { q: 'Smenalarni qanday filtrlash mumkin?', opts: ['Kassa va sana bo\'yicha', 'Faqat sana bo\'yicha', 'Faqat kassa bo\'yicha', 'Buni qilish mumkin emas'] }, 0),

  q(47, 'reference', 'screenshots/z_reports.png',
    { q: 'Что такое Z-отчёты?', opts: ['Информация о всех отчётах, отправленных в ОФД', 'Отчёты о зарплате', 'Отчёты о складе', 'Отчёты о клиентах'] },
    { q: 'Z-hisobotlar nima?', opts: ['OFD ga yuborilgan barcha hisobotlar haqida ma\'lumot', 'Ish haqi hisobotlari', 'Ombor hisobotlari', 'Mijoz hisobotlari'] }, 0),

  q(48, 'reference', 'screenshots/z_reports.png',
    { q: 'Где можно посмотреть Z-отчёты?', opts: ['В разделе "Справочник" → "Z-отчёты"', 'В разделе "Отчёты"', 'В разделе "Настройки"', 'В разделе "Кабинет"'] },
    { q: 'Z-hisobotlarni qayerda ko\'rish mumkin?', opts: ['"Ma\'lumotnoma" → "Z-hisobotlar" bo\'limida', '"Hisobotlar" bo\'limida', '"Sozlamalar" bo\'limida', '"Kabinet" bo\'limida'] }, 0),

  q(49, 'reference', 'screenshots/print_pricetags.png',
    { q: 'Для чего нужна "Печать ценников"?', opts: ['Для быстрой генерации и печати ценников', 'Для изменения цен', 'Для создания товаров', 'Для учёта остатков'] },
    { q: '"Narx yorliqlarini chop etish" nimaga kerak?', opts: ['Narx yorliqlarini tezkor yaratish va chop etish uchun', 'Narlarni o\'zgartirish uchun', 'Tovarlar yaratish uchun', 'Qoldiqlarni hisobga olish uchun'] }, 0),

  q(50, 'reference', 'screenshots/print_pricetags.png',
    { q: 'Как распечатать ценники?', opts: ['Выбрать товары и нажать "Печать"', 'Автоматически', 'Это невозможно', 'Через раздел Товары'] },
    { q: 'Narx yorliqlarini qanday chop etish mumkin?', opts: ['Tovarlarni tanlash va "Chop etish" tugmasini bosish', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Tovarlar bo\'limi orqali'] }, 0),

  q(51, 'reference', 'screenshots/clients.png',
    { q: 'Для чего нужен раздел "Клиенты"?', opts: ['Для управления клиентской базой и данными', 'Для учёта товаров', 'Для печати чеков', 'Для расчёта зарплаты'] },
    { q: '"Mijozlar" bo\'limi nimaga kerak?', opts: ['Mijozlar bazasini va ma\'lumotlarni boshqarish uchun', 'Tovarlarni hisobga olish uchun', 'Cheklarni chop etish uchun', 'Ish haqini hisoblash uchun'] }, 0),

  q(52, 'reference', 'screenshots/clients.png',
    { q: 'Как добавить нового клиента?', opts: ['Нажать "Добавить" в разделе Клиенты', 'Автоматически при покупке', 'Это невозможно', 'Через импорт'] },
    { q: 'Yangi mijozni qanday qo\'shish mumkin?', opts: ['Mijozlar bo\'limida "Qo\'shish" tugmasini bosing', 'Xarid qilishda avtomatik', 'Buni qilish mumkin emas', 'Import orqali'] }, 0),

  q(53, 'reference', 'screenshots/clients.png',
    { q: 'Какие данные хранятся о клиентах?', opts: ['Имя, телефон, покупки, долг, дата регистрации', 'Только имя', 'Только телефон', 'Только долг'] },
    { q: 'Mijozlar haqida qanday ma\'lumotlar saqlanadi?', opts: ['Ism, telefon, xaridlar, qarz, ro\'yxatdan o\'tgan sana', 'Faqat ism', 'Faqat telefon', 'Faqat qarz'] }, 0),

  q(54, 'reference', 'screenshots/loyalty.png',
    { q: 'Для чего нужна "Лояльность"?', opts: ['Для настройки программ поощрения постоянных клиентов', 'Для рассылки SMS', 'Для расчёта скидок', 'Для печати карт'] },
    { q: '"Sodiqlik" nimaga kerak?', opts: ['Doimiy mijozlarni rag\'batlantirish dasturlarini sozlash uchun', 'SMS tarqatish uchun', 'Chegirmalarni hisoblash uchun', 'Kartalarni chop etish uchun'] }, 0),

  q(55, 'reference', 'screenshots/loyalty.png',
    { q: 'Какие типы программ лояльности есть в Lume?', opts: ['Накопление баллов и другие', 'Только скидки', 'Только кэшбэк', 'Только бонусы'] },
    { q: 'Lumeda qanday sodiqlik dasturlari turlari bor?', opts: ['Ball to\'plash va boshqalar', 'Faqat chegirmalar', 'Faqat keshbek', 'Faqat bonuslar'] }, 0),

  q(56, 'reference', 'screenshots/contractors.png',
    { q: 'Кого можно добавить в "Контрагенты"?', opts: ['Поставщиков, партнёров и организации', 'Только клиентов', 'Только сотрудников', 'Только водителей'] },
    { q: '"Kontragentlar"ga kimlarni qo\'shish mumkin?', opts: ['Yetkazib beruvchilar, hamkorlar va tashkilotlar', 'Faqat mijozlar', 'Faqat xodimlar', 'Faqat haydovchilar'] }, 0),

  q(57, 'reference', 'screenshots/contractors.png',
    { q: 'Как добавить нового контрагента?', opts: ['Нажать "Добавить контрагента" в разделе', 'Автоматически', 'Это невозможно', 'Через импорт'] },
    { q: 'Yangi kontragentni qanday qo\'shish mumkin?', opts: ['Bo\'limda "Kontragent qo\'shish" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Import orqali'] }, 0),

  q(58, 'reference', 'screenshots/sms_blast.png',
    { q: 'Для чего нужна "СМС рассылка"?', opts: ['Для массовой отправки смс-сообщений клиентам', 'Для печати чеков', 'Для учёта товаров', 'Для расчёта зарплаты'] },
    { q: '"SMS tarqatish" nimaga kerak?', opts: ['Mijozlarga ommaviy SMS xabarlar yuborish uchun', 'Cheklarni chop etish uchun', 'Tovarlarni hisobga olish uchun', 'Ish haqini hisoblash uchun'] }, 0),

  q(59, 'reference', 'screenshots/sms_blast.png',
    { q: 'Как отправить SMS-рассылку?', opts: ['Выбрать клиентов и написать сообщение', 'Автоматически', 'Это невозможно', 'Через сторонний сервис'] },
    { q: 'SMS tarqatishni qanday yuborish mumkin?', opts: ['Mijozlarni tanlash va xabar yozish', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Tashqi xizmat orqali'] }, 0),

  q(60, 'reference', 'screenshots/sms_templates.png',
    { q: 'Для чего нужны "Шаблоны СМС"?', opts: ['Для создания и хранения шаблонов сообщений', 'Для отправки SMS', 'Для хранения контактов', 'Для печати документов'] },
    { q: '"SMS shablonlari" nimaga kerak?', opts: ['Xabar shablonlarini yaratish va saqlash uchun', 'SMS yuborish uchun', 'Kontaktlarni saqlash uchun', 'Hujjatlarni chop etish uchun'] }, 0),

  q(61, 'reference', 'screenshots/sms_templates.png',
    { q: 'Как создать шаблон SMS?', opts: ['Нажать "Создать шаблон" и написать текст', 'Автоматически', 'Это невозможно', 'Импортировать'] },
    { q: 'SMS shablonini qanday yaratish mumkin?', opts: ['"Shablon yaratish" tugmasini bosing va matn yozing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Import qilish'] }, 0),

  q(62, 'reference', 'screenshots/marking_audit.png',
    { q: 'Для чего нужен "Аудит маркировок"?', opts: ['Для проверки точности и корректности маркировок', 'Для создания маркировок', 'Для печати этикеток', 'Для учёта товаров'] },
    { q: '"Markirovka auditi" nimaga kerak?', opts: ['Markirovkalarning aniqligi va to\'g\'riligini tekshirish uchun', 'Markirovkalar yaratish uchun', 'Yorliqlarni chop etish uchun', 'Tovarlarni hisobga olish uchun'] }, 0),

  q(63, 'reference', 'screenshots/marking_audit.png',
    { q: 'Какие товары проверяются в аудите маркировок?', opts: ['Товары с кодами маркировки', 'Все товары', 'Только проданные', 'Только новые'] },
    { q: 'Markirovka auditida qaysi tovarlar tekshiriladi?', opts: ['Markirovka kodli tovarlar', 'Barcha tovarlar', 'Faqat sotilganlar', 'Faqat yangilar'] }, 0),

  q(64, 'reference', 'screenshots/edo.png',
    { q: 'Что такое "ЭДО"?', opts: ['Электронный документооборот', 'Электронная доставка', 'Электронные деньги', 'Электронная декларация'] },
    { q: '"ЭДО" nima?', opts: ['Elektron hujjat aylanmasi', 'Elektron yetkazib berish', 'Elektron pul', 'Elektron deklaratsiya'] }, 0),

  q(65, 'reference', 'screenshots/edo.png',
    { q: 'Для чего используется ЭДО?', opts: ['Для обмена документами в электронном виде', 'Для отправки SMS', 'Для расчёта зарплаты', 'Для печати чеков'] },
    { q: 'ЭДО nimaga ishlatiladi?', opts: ['Hujjatlarni elektron ko\'rinishda almashinish uchun', 'SMS yuborish uchun', 'Ish haqini hisoblash uchun', 'Cheklarni chop etish uchun'] }, 0),

  q(66, 'reference', 'screenshots/promotions.png',
    { q: 'Для чего нужны "Акции"?', opts: ['Для создания скидочных кампаний и акций', 'Для учёта товаров', 'Для печати документов', 'Для расчёта зарплаты'] },
    { q: '"Aksiyalar" nimaga kerak?', opts: ['Chegirma kampaniyalari va aksiyalar yaratish uchun', 'Tovarlarni hisobga olish uchun', 'Hujjatlarni chop etish uchun', 'Ish haqini hisoblash uchun'] }, 0),

  q(67, 'reference', 'screenshots/promotions.png',
    { q: 'Как создать новую акцию?', opts: ['Нажать "Новая акция" в разделе Акции', 'Автоматически', 'Это невозможно', 'Через раздел Товары'] },
    { q: 'Yangi aksiyani qanday yaratish mumkin?', opts: ['Aksiyalar bo\'limida "Yangi aksiya" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Tovarlar bo\'limi orqali'] }, 0),

  q(68, 'reference', 'screenshots/promotions.png',
    { q: 'Какие статусы могут быть у акции?', opts: ['Активна, Приостановлена, Завершена', 'Только Активна', 'Только Завершена', 'Новая, Старая'] },
    { q: 'Aksiyaning qanday holatlari bo\'lishi mumkin?', opts: ['Faol, To\'xtatilgan, Tugallangan', 'Faqat Faol', 'Faqat Tugallangan', 'Yangi, Eski'] }, 0),

  q(69, 'reference', 'screenshots/documents.png',
    { q: 'Для чего нужен раздел "Документы"?', opts: ['Для хранения и работы с документами', 'Для печати чеков', 'Для учёта товаров', 'Для расчёта зарплаты'] },
    { q: '"Hujjatlar" bo\'limi nimaga kerak?', opts: ['Hujjatlarni saqlash va ular bilan ishlash uchun', 'Cheklarni chop etish uchun', 'Tovarlarni hisobga olish uchun', 'Ish haqini hisoblash uchun'] }, 0),

  q(70, 'reference', 'screenshots/documents.png',
    { q: 'Какие документы можно загрузить?', opts: ['Любые документы в электронном формате', 'Только PDF', 'Только изображения', 'Только текстовые файлы'] },
    { q: 'Qanday hujjatlarni yuklash mumkin?', opts: ['Elektron formatdagi istalgan hujjatlar', 'Faqat PDF', 'Faqat rasmlar', 'Faqat matn fayllari'] }, 0),

  q(71, 'reference', 'screenshots/personnel.png',
    { q: 'Какие данные хранятся о сотрудниках?', opts: ['Имя, должность, контакт, логин', 'Только имя', 'Только должность', 'Только контакт'] },
    { q: 'Xodimlar haqida qanday ma\'lumotlar saqlanadi?', opts: ['Ism, lavozim, kontakt, login', 'Faqat ism', 'Faqat lavozim', 'Faqat kontakt'] }, 0),

  q(72, 'reference', 'screenshots/drivers.png',
    { q: 'Как добавить нового водителя?', opts: ['Нажать "Добавить" в разделе Водители', 'Автоматически', 'Это невозможно', 'Через импорт'] },
    { q: 'Yangi haydovchini qanday qo\'shish mumkin?', opts: ['Haydovchilar bo\'limida "Qo\'shish" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Import orqali'] }, 0),

  q(73, 'reference', 'screenshots/clients.png',
    { q: 'Как найти клиента в системе?', opts: ['Использовать поиск по имени или телефону', 'Пролистать весь список', 'Это невозможно', 'Только через фильтры'] },
    { q: 'Mijozni tizimda qanday topish mumkin?', opts: ['Ism yoki telefon bo\'yicha qidiruvdan foydalanish', 'Butun ro\'yxatni aylantirish', 'Buni qilish mumkin emas', 'Faqat filtrlar orqali'] }, 0),

  q(74, 'reference', 'screenshots/loyalty.png',
    { q: 'Как настроить программу лояльности?', opts: ['Через раздел "Лояльность" с настройкой параметров', 'Автоматически', 'Это невозможно', 'Через раздел Клиенты'] },
    { q: 'Sodiqlik dasturini qanday sozlash mumkin?', opts: ['"Sodiqlik" bo\'limi orqali parametrlarni sozlash', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Mijozlar bo\'limi orqali'] }, 0),

  q(75, 'reference', 'screenshots/contractors.png',
    { q: 'Какие данные хранятся о контрагентах?', opts: ['Название, ответственное лицо, контакты', 'Только название', 'Только контакты', 'Только ответственное лицо'] },
    { q: 'Kontragentlar haqida qanday ma\'lumotlar saqlanadi?', opts: ['Nom, mas\'ul shaxs, kontaktlar', 'Faqat nom', 'Faqat kontaktlar', 'Faqat mas\'ul shaxs'] }, 0),

  // ═══════════════════════════════════════════════════════════════════════════
  // ФИНАНСОВЫЕ ОПЕРАЦИИ - 35 вопросов
  // ═══════════════════════════════════════════════════════════════════════════
  q(76, 'finance', 'screenshots/sold_checks.png',
    { q: 'Что показывает раздел "Проданные чеки"?', opts: ['Список всех завершённых продаж', 'Список товаров', 'Список клиентов', 'Список сотрудников'] },
    { q: '"Sotilgan cheklar" bo\'limi nimani ko\'rsatadi?', opts: ['Barcha tugallangan sotuvlar ro\'yxati', 'Tovarlar ro\'yxati', 'Mijozlar ro\'yxati', 'Xodimlar ro\'yxati'] }, 0),

  q(77, 'finance', 'screenshots/sold_checks.png',
    { q: 'Как отфильтровать чеки по дате?', opts: ['Использовать поле выбора периода', 'Это невозможно', 'Только по сотруднику', 'Через настройки'] },
    { q: 'Cheklarni sana bo\'yicha qanday filtrlash mumkin?', opts: ['Davrni tanlash maydonidan foydalanish', 'Buni qilish mumkin emas', 'Faqat xodim bo\'yicha', 'Sozlamalar orqali'] }, 0),

  q(78, 'finance', 'screenshots/check_returns.png',
    { q: 'Для чего нужен раздел "Возвраты чеков"?', opts: ['Для учёта и обработки возвратных чеков', 'Для создания чеков', 'Для печати чеков', 'Для удаления чеков'] },
    { q: '"Chek qaytarish" bo\'limi nimaga kerak?', opts: ['Qaytarilgan cheklarni hisobga olish va qayta ishlash uchun', 'Cheklar yaratish uchun', 'Cheklarni chop etish uchun', 'Cheklarni o\'chirish uchun'] }, 0),

  q(79, 'finance', 'screenshots/check_returns.png',
    { q: 'Как оформить возврат чека?', opts: ['Найти чек и нажать "Возврат"', 'Удалить чек', 'Создать новый чек', 'Это невозможно'] },
    { q: 'Chekni qaytarishni qanday rasmiylashtirish mumkin?', opts: ['Chekni topish va "Qaytarish" tugmasini bosish', 'Chekni o\'chirish', 'Yangi chek yaratish', 'Buni qilish mumkin emas'] }, 0),

  q(80, 'finance', 'screenshots/deleted_checks.png',
    { q: 'Что такое "Удалённые чеки"?', opts: ['Чеки, в которых имеются удалённые товары', 'Архив чеков', 'Заблокированные чеки', 'Возвращённые чеки'] },
    { q: '"O\'chirilgan cheklar" nima?', opts: ['O\'chirilgan tovarlar bo\'lgan cheklar', 'Cheklar arxivi', 'Bloklangan cheklar', 'Qaytarilgan cheklar'] }, 0),

  q(81, 'finance', 'screenshots/deleted_checks.png',
    { q: 'Как посмотреть удалённые чеки?', opts: ['Через раздел "Удалённые чеки"', 'Это невозможно', 'Через архив', 'Через настройки'] },
    { q: 'O\'chirilgan cheklarni qanday ko\'rish mumkin?', opts: ['"O\'chirilgan cheklar" bo\'limi orqali', 'Buni qilish mumkin emas', 'Arxiv orqali', 'Sozlamalar orqali'] }, 0),

  q(82, 'finance', 'screenshots/pending_checks.png',
    { q: 'Что такое "Отложенные чеки"?', opts: ['Сохранённые чеки, которые не прошли оплату', 'Архивные чеки', 'Возвращённые чеки', 'Удалённые чеки'] },
    { q: '"Kechiktirilgan cheklar" nima?', opts: ['Saqlangan, to\'lanmagan cheklar', 'Arxiv cheklari', 'Qaytarilgan cheklar', 'O\'chirilgan cheklar'] }, 0),

  q(83, 'finance', 'screenshots/pending_checks.png',
    { q: 'Как отложить чек?', opts: ['Сохранить чек без завершения оплаты', 'Удалить чек', 'Это невозможно', 'Автоматически'] },
    { q: 'Chekni qanday kechiktirish mumkin?', opts: ['Chekni to\'lovsiz saqlash', 'Chekni o\'chirish', 'Buni qilish mumkin emas', 'Avtomatik ravishda'] }, 0),

  q(84, 'finance', 'screenshots/mutual_settlements.png',
    { q: 'Для чего нужен "Взаиморасчёт"?', opts: ['Для контроля взаимных задолженностей и платежей', 'Для расчёта зарплаты', 'Для печати чеков', 'Для учёта товаров'] },
    { q: '"O\'zaro hisob-kitob" nimaga kerak?', opts: ['O\'zaro qarzlar va to\'lovlarni nazorat qilish uchun', 'Ish haqini hisoblash uchun', 'Cheklarni chop etish uchun', 'Tovarlarni hisobga olish uchun'] }, 0),

  q(85, 'finance', 'screenshots/mutual_settlements.png',
    { q: 'Какие данные показывает взаиморасчёт?', opts: ['Начальный остаток, кредит, дебет, конечный итог', 'Только кредит', 'Только дебет', 'Только итог'] },
    { q: 'O\'zaro hisob-kitob qanday ma\'lumotlarni ko\'rsatadi?', opts: ['Boshlang\'ich qoldiq, kredit, debit, yakuniy natija', 'Faqat kredit', 'Faqat debit', 'Faqat yakuniy natija'] }, 0),

  q(86, 'finance', 'screenshots/accounts.png',
    { q: 'Для чего нужен раздел "Счета"?', opts: ['Для создания, ведения и оплаты счетов', 'Для учёта товаров', 'Для печати чеков', 'Для расчёта зарплаты'] },
    { q: '"Hisoblar" bo\'limi nimaga kerak?', opts: ['Hisoblarni yaratish, yuritish va to\'lash uchun', 'Tovarlarni hisobga olish uchun', 'Cheklarni chop etish uchun', 'Ish haqini hisoblash uchun'] }, 0),

  q(87, 'finance', 'screenshots/accounts.png',
    { q: 'Как создать новый счёт?', opts: ['Нажать "Создать счёт" в разделе Счета', 'Автоматически', 'Это невозможно', 'Через раздел Клиенты'] },
    { q: 'Yangi hisob qanday yaratish mumkin?', opts: ['Hisoblar bo\'limida "Hisob yaratish" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Mijozlar bo\'limi orqali'] }, 0),

  q(88, 'finance', 'screenshots/salary.png',
    { q: 'Для чего нужен раздел "Зарплата"?', opts: ['Для расчёта и управления выплатой зарплат', 'Для учёта товаров', 'Для печати чеков', 'Для отправки SMS'] },
    { q: '"Ish haqi" bo\'limi nimaga kerak?', opts: ['Ish haqini hisoblash va to\'lashni boshqarish uchun', 'Tovarlarni hisobga olish uchun', 'Cheklarni chop etish uchun', 'SMS yuborish uchun'] }, 0),

  q(89, 'finance', 'screenshots/salary.png',
    { q: 'Какие данные отображаются в разделе "Зарплата"?', opts: ['Количество смен, заказы, общая зарплата', 'Только сумма зарплаты', 'Только количество смен', 'Только имя сотрудника'] },
    { q: '"Ish haqi" bo\'limida qanday ma\'lumotlar ko\'rsatiladi?', opts: ['Smenalar soni, buyurtmalar, umumiy ish haqi', 'Faqat ish haqi summasi', 'Faqat smenalar soni', 'Faqat xodim ismi'] }, 0),

  q(90, 'finance', 'screenshots/sold_checks.png',
    { q: 'Как посмотреть детали проданного чека?', opts: ['Нажать на номер чека в списке', 'Это невозможно', 'Через настройки', 'Через отчёты'] },
    { q: 'Sotilgan chek tafsilotlarini qanday ko\'rish mumkin?', opts: ['Ro\'yxatdagi chek raqamini bosish', 'Buni qilish mumkin emas', 'Sozlamalar orqali', 'Hisobotlar orqali'] }, 0),

  q(91, 'finance', 'screenshots/check_returns.png',
    { q: 'Какие данные отображаются при возврате чека?', opts: ['Номер чека, сумма, дата, причина', 'Только номер', 'Только сумма', 'Только дата'] },
    { q: 'Chek qaytarishda qanday ma\'lumotlar ko\'rsatiladi?', opts: ['Chek raqami, summa, sana, sabab', 'Faqat raqam', 'Faqat summa', 'Faqat sana'] }, 0),

  q(92, 'finance', 'screenshots/deleted_checks.png',
    { q: 'Можно ли восстановить удалённый чек?', opts: ['Нет, удалённые чеки нельзя восстановить', 'Да, через настройки', 'Да, через архив', 'Да, автоматически'] },
    { q: 'O\'chirilgan chekni qaytarish mumkinmi?', opts: ['Yo\'q, o\'chirilgan cheklarni qaytarib bo\'lmaydi', 'Ha, sozlamalar orqali', 'Ha, arxiv orqali', 'Ha, avtomatik'] }, 0),

  q(93, 'finance', 'screenshots/pending_checks.png',
    { q: 'Как завершить отложенный чек?', opts: ['Открыть чек и завершить оплату', 'Удалить чек', 'Это невозможно', 'Автоматически'] },
    { q: 'Kechiktirilgan chekni qanday tugallash mumkin?', opts: ['Chekni ochish va to\'lovni tugallash', 'Chekni o\'chirish', 'Buni qilish mumkin emas', 'Avtomatik ravishda'] }, 0),

  q(94, 'finance', 'screenshots/mutual_settlements.png',
    { q: 'Как отфильтровать взаиморасчёты?', opts: ['По контрагенту и дате', 'Только по дате', 'Только по контрагенту', 'Это невозможно'] },
    { q: 'O\'zaro hisob-kitoblarni qanday filtrlash mumkin?', opts: ['Kontragent va sana bo\'yicha', 'Faqat sana bo\'yicha', 'Faqat kontragent bo\'yicha', 'Buni qilish mumkin emas'] }, 0),

  q(95, 'finance', 'screenshots/accounts.png',
    { q: 'Какие статусы могут быть у счетов?', opts: ['Оформленные, Отправленные, Черновик', 'Только Оплачен', 'Только Не оплачен', 'Новый, Старый'] },
    { q: 'Hisoblarning qanday holatlari bo\'lishi mumkin?', opts: ['Rasmiylashtirilgan, Yuborilgan, Qoralama', 'Faqat To\'langan', 'Faqat To\'lanmagan', 'Yangi, Eski'] }, 0),

  q(96, 'finance', 'screenshots/salary.png',
    { q: 'Как рассчитывается зарплата?', opts: ['На основе смен и заказов сотрудника', 'Фиксированная сумма', 'Автоматически', 'Вручную'] },
    { q: 'Ish haqi qanday hisoblanadi?', opts: ['Xodimning smenalari va buyurtmalari asosida', 'Belgilangan summa', 'Avtomatik ravishda', 'Qo\'lda'] }, 0),

  q(97, 'finance', 'screenshots/sold_checks.png',
    { q: 'Какие KPI отображаются в проданных чеках?', opts: ['Количество, себестоимость, цена продажи, выручка', 'Только количество', 'Только выручка', 'Только цена'] },
    { q: 'Sotilgan cheklarda qanday KPI lar ko\'rsatiladi?', opts: ['Miqdor, tannarx, sotuv narxi, tushum', 'Faqat miqdor', 'Faqat tushum', 'Faqat narx'] }, 0),

  q(98, 'finance', 'screenshots/check_returns.png',
    { q: 'Можно ли отменить возврат чека?', opts: ['Нет, возврат чека нельзя отменить', 'Да, через настройки', 'Да, в тот же день', 'Да, автоматически'] },
    { q: 'Chek qaytarishni bekor qilish mumkinmi?', opts: ['Yo\'q, chek qaytarishni bekor qilib bo\'lmaydi', 'Ha, sozlamalar orqali', 'Ha, o\'sha kuni', 'Ha, avtomatik'] }, 0),

  q(99, 'finance', 'screenshots/accounts.png',
    { q: 'Как оплатить счёт?', opts: ['Открыть счёт и нажать "Оплатить"', 'Автоматически', 'Это невозможно', 'Через раздел Клиенты'] },
    { q: 'Hisobni qanday to\'lash mumkin?', opts: ['Hisobni ochish va "To\'lash" tugmasini bosish', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Mijozlar bo\'limi orqali'] }, 0),

  q(100, 'finance', 'screenshots/salary.png',
    { q: 'Как отсортировать данные по зарплате?', opts: ['Нажать "Сортировать по зарплате"', 'Автоматически', 'Это невозможно', 'Через настройки'] },
    { q: 'Ish haqi bo\'yicha ma\'lumotlarni qanday saralash mumkin?', opts: ['"Ish haqi bo\'yicha saralash" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Sozlamalar orqali'] }, 0),

  q(101, 'finance', 'screenshots/sold_checks.png',
    { q: 'Как распечатать проданный чек?', opts: ['Открыть чек и нажать "Печать"', 'Автоматически', 'Это невозможно', 'Через настройки'] },
    { q: 'Sotilgan chekni qanday chop etish mumkin?', opts: ['Chekni ochish va "Chop etish" tugmasini bosish', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Sozlamalar orqali'] }, 0),

  q(102, 'finance', 'screenshots/mutual_settlements.png',
    { q: 'Как оформить взаиморасчёт?', opts: ['Нажать "Оформить" в разделе', 'Автоматически', 'Это невозможно', 'Через раздел Счета'] },
    { q: 'O\'zaro hisob-kitobni qanday rasmiylashtirish mumkin?', opts: ['Bo\'limda "Rasmiylashtirish" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Hisoblar bo\'limi orqali'] }, 0),

  q(103, 'finance', 'screenshots/pending_checks.png',
    { q: 'Сколько времени хранятся отложенные чеки?', opts: ['До завершения или удаления', '1 день', '1 неделю', '1 месяц'] },
    { q: 'Kechiktirilgan cheklar qancha vaqt saqlanadi?', opts: ['Tugallangunicha yoki o\'chirilgunicha', '1 kun', '1 hafta', '1 oy'] }, 0),

  q(104, 'finance', 'screenshots/deleted_checks.png',
    { q: 'Почему чек попадает в удалённые?', opts: ['Если в нём есть удалённые товары', 'При возврате', 'При отмене', 'Автоматически'] },
    { q: 'Chek nega o\'chirilganlarga tushadi?', opts: ['Agar unda o\'chirilgan tovarlar bo\'lsa', 'Qaytarishda', 'Bekor qilishda', 'Avtomatik ravishda'] }, 0),

  q(105, 'finance', 'screenshots/accounts.png',
    { q: 'Как отправить счёт контрагенту?', opts: ['Нажать "Отправить" в счёте', 'Автоматически', 'Это невозможно', 'Через email'] },
    { q: 'Hisobni kontragentga qanday yuborish mumkin?', opts: ['Hisobdagi "Yuborish" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Email orqali'] }, 0),

  q(106, 'finance', 'screenshots/salary.png',
    { q: 'Как экспортировать данные о зарплате?', opts: ['Через кнопку экспорта в разделе', 'Это невозможно', 'Через отчёты', 'Автоматически'] },
    { q: 'Ish haqi ma\'lumotlarini qanday eksport qilish mumkin?', opts: ['Bo\'limdagi eksport tugmasi orqali', 'Buni qilish mumkin emas', 'Hisobotlar orqali', 'Avtomatik ravishda'] }, 0),

  q(107, 'finance', 'screenshots/sold_checks.png',
    { q: 'Как отфильтровать чеки по сотруднику?', opts: ['Использовать выпадающий список сотрудников', 'Это невозможно', 'Через настройки', 'Автоматически'] },
    { q: 'Cheklarni xodim bo\'yicha qanday filtrlash mumkin?', opts: ['Xodimlarning ochiluvchi ro\'yxatidan foydalanish', 'Buni qilish mumkin emas', 'Sozlamalar orqali', 'Avtomatik ravishda'] }, 0),

  q(108, 'finance', 'screenshots/check_returns.png',
    { q: 'Какие документы создаются при возврате?', opts: ['Документ возврата с указанием причины', 'Новый чек', 'Кредитное авизо', 'Ничего не создаётся'] },
    { q: 'Qaytarishda qanday hujjatlar yaratiladi?', opts: ['Sababi ko\'rsatilgan qaytarish hujjati', 'Yangi chek', 'Kredit avizo', 'Hech narsa yaratilmaydi'] }, 0),

  q(109, 'finance', 'screenshots/mutual_settlements.png',
    { q: 'Что показывает дебет во взаиморасчётах?', opts: ['Сумму, которую должны нам', 'Сумму, которую должны мы', 'Общую сумму', 'Ничего'] },
    { q: 'O\'zaro hisob-kitobdagi debit nimani ko\'rsatadi?', opts: ['Bizga qarzdor summa', 'Biz qarzdor bo\'lgan summa', 'Umumiy summa', 'Hech narsa'] }, 0),

  q(110, 'finance', 'screenshots/mutual_settlements.png',
    { q: 'Что показывает кредит во взаиморасчётах?', opts: ['Сумму, которую должны мы', 'Сумму, которую должны нам', 'Общую сумму', 'Ничего'] },
    { q: 'O\'zaro hisob-kitobdagi kredit nimani ko\'rsatadi?', opts: ['Biz qarzdor bo\'lgan summa', 'Bizga qarzdor summa', 'Umumiy summa', 'Hech narsa'] }, 0),

  // ═══════════════════════════════════════════════════════════════════════════
  // ОТЧЁТЫ - 40 вопросов
  // ═══════════════════════════════════════════════════════════════════════════
  q(111, 'reports', 'screenshots/sales_report.png',
    { q: 'Для чего нужен "Отчёт о продаже"?', opts: ['Для формирования аналитических отчётов о продажах', 'Для печати чеков', 'Для учёта товаров', 'Для расчёта зарплаты'] },
    { q: '"Sotuv hisoboti" nimaga kerak?', opts: ['Sotuvlar bo\'yicha tahliliy hisobotlar shakllantirish uchun', 'Cheklarni chop etish uchun', 'Tovarlarni hisobga olish uchun', 'Ish haqini hisoblash uchun'] }, 0),

  q(112, 'reports', 'screenshots/sales_report.png',
    { q: 'Какие KPI отображаются в отчёте о продаже?', opts: ['Продажи, Возвраты, Скидка, Конечный итог', 'Только продажи', 'Только возвраты', 'Только скидка'] },
    { q: 'Sotuv hisobotida qanday KPI lar ko\'rsatiladi?', opts: ['Sotuvlar, Qaytarishlar, Chegirma, Yakuniy natija', 'Faqat sotuvlar', 'Faqat qaytarishlar', 'Faqat chegirma'] }, 0),

  q(113, 'reports', 'screenshots/top_sales.png',
    { q: 'Что показывает "Топ продаж"?', opts: ['Список самых продаваемых товаров', 'Лучших клиентов', 'Лучших сотрудников', 'Лучшие дни продаж'] },
    { q: '"Top sotuvlar" nimani ko\'rsatadi?', opts: ['Eng ko\'p sotilgan tovarlar ro\'yxati', 'Eng yaxshi mijozlar', 'Eng yaxshi xodimlar', 'Eng yaxshi sotuv kunlari'] }, 0),

  q(114, 'reports', 'screenshots/top_sales.png',
    { q: 'Как отфильтровать топ продаж по периоду?', opts: ['Использовать поле выбора дат', 'Это невозможно', 'Автоматически', 'Через настройки'] },
    { q: 'Top sotuvlarni davr bo\'yicha qanday filtrlash mumkin?', opts: ['Sanalarni tanlash maydonidan foydalanish', 'Buni qilish mumkin emas', 'Avtomatik ravishda', 'Sozlamalar orqali'] }, 0),

  q(115, 'reports', 'screenshots/pl_report.png',
    { q: 'Что такое P&L отчёт?', opts: ['Отчёт о доходах, расходах и прибыли', 'Отчёт о товарах', 'Отчёт о клиентах', 'Отчёт о сотрудниках'] },
    { q: 'P&L hisoboti nima?', opts: ['Daromad, xarajat va foyda hisoboti', 'Tovarlar hisoboti', 'Mijozlar hisoboti', 'Xodimlar hisoboti'] }, 0),

  q(116, 'reports', 'screenshots/pl_report.png',
    { q: 'Что показывает P&L отчёт?', opts: ['Выручку, НДС, прибыль, расходы', 'Только выручку', 'Только прибыль', 'Только расходы'] },
    { q: 'P&L hisoboti nimani ko\'rsatadi?', opts: ['Tushum, QQS, foyda, xarajatlar', 'Faqat tushum', 'Faqat foyda', 'Faqat xarajatlar'] }, 0),

  q(117, 'reports', 'screenshots/balance.png',
    { q: 'Для чего нужен раздел "Салдо"?', opts: ['Для отслеживания остатка и балансов', 'Для расчёта зарплаты', 'Для печати чеков', 'Для учёта товаров'] },
    { q: '"Saldo" bo\'limi nimaga kerak?', opts: ['Qoldiq va balanslarni kuzatish uchun', 'Ish haqini hisoblash uchun', 'Cheklarni chop etish uchun', 'Tovarlarni hisobga olish uchun'] }, 0),

  q(118, 'reports', 'screenshots/balance.png',
    { q: 'Какие данные показывает Салдо?', opts: ['Остатки товаров и балансы', 'Только остатки', 'Только балансы', 'Только продажи'] },
    { q: 'Saldo qanday ma\'lumotlarni ko\'rsatadi?', opts: ['Tovar qoldiqlari va balanslar', 'Faqat qoldiqlar', 'Faqat balanslar', 'Faqat sotuvlar'] }, 0),

  q(119, 'reports', 'screenshots/abc_report.png',
    { q: 'Что показывает "Отчёт ABC"?', opts: ['Классификацию товаров по значимости', 'Стабильность спроса', 'Остатки товаров', 'Продажи'] },
    { q: '"ABC hisobot" nimani ko\'rsatadi?', opts: ['Tovarlarni ahamiyatiga ko\'ra tasniflash', 'Talab barqarorligi', 'Tovar qoldiqlari', 'Sotuvlar'] }, 0),

  q(120, 'reports', 'screenshots/abc_report.png',
    { q: 'Какие категории товаров в ABC анализе?', opts: ['A - важные, B - средние, C - малозначимые', 'Только A', 'Только B', 'Только C'] },
    { q: 'ABC tahlilida qanday tovar kategoriyalari bor?', opts: ['A - muhim, B - o\'rtacha, C - kam ahamiyatli', 'Faqat A', 'Faqat B', 'Faqat C'] }, 0),

  q(121, 'reports', 'screenshots/xyz_report.png',
    { q: 'Что показывает "Отчёт XYZ"?', opts: ['Анализ стабильности спроса товаров', 'Классификацию по значимости', 'Остатки товаров', 'Продажи'] },
    { q: '"XYZ hisobot" nimani ko\'rsatadi?', opts: ['Tovarlarning talab barqarorligini tahlil qilish', 'Ahamiyat bo\'yicha tasniflash', 'Tovar qoldiqlari', 'Sotuvlar'] }, 0),

  q(122, 'reports', 'screenshots/xyz_report.png',
    { q: 'Что означает категория X в XYZ анализе?', opts: ['Стабильный спрос', 'Нестабильный спрос', 'Хаотичный спрос', 'Отсутствие спроса'] },
    { q: 'XYZ tahlilidagi X toifasi nimani anglatadi?', opts: ['Barqaror talab', 'Barqaror bo\'lmagan talab', 'Tartibsiz talab', 'Talab yo\'qligi'] }, 0),

  q(123, 'reports', 'screenshots/abc_xyz_report.png',
    { q: 'Для чего нужен "Отчёт ABC/XYZ"?', opts: ['Для комбинированного анализа товаров', 'Только для ABC анализа', 'Только для XYZ анализа', 'Для печати отчётов'] },
    { q: '"ABC/XYZ hisobot" nimaga kerak?', opts: ['Tovarlarni birikma tahlil qilish uchun', 'Faqat ABC tahlili uchun', 'Faqat XYZ tahlili uchun', 'Hisobotlarni chop etish uchun'] }, 0),

  q(124, 'reports', 'screenshots/abc_xyz_report.png',
    { q: 'Какие товары в категории AX?', opts: ['Важные со стабильным спросом', 'Маловажные с нестабильным спросом', 'Средние по важности', 'Хаотичные'] },
    { q: 'AX toifasidagi qanday tovarlar bor?', opts: ['Muhim va barqaror talabli', 'Kam ahamiyatli va barqarorsiz talabli', 'O\'rtacha ahamiyatli', 'Tartibsiz'] }, 0),

  q(125, 'reports', 'screenshots/material_report.png',
    { q: 'Для чего нужен "Материальный отчёт"?', opts: ['Для отчёта по материальным ценностям', 'Для отчёта по зарплате', 'Для отчёта по клиентам', 'Для отчёта по продажам'] },
    { q: '"Moddiy hisobot" nimaga kerak?', opts: ['Moddiy boyliklar bo\'yicha hisobot uchun', 'Ish haqi hisoboti uchun', 'Mijozlar hisoboti uchun', 'Sotuvlar hisoboti uchun'] }, 0),

  q(126, 'reports', 'screenshots/material_report.png',
    { q: 'Какие данные содержит материальный отчёт?', opts: ['Движения материальных ценностей', 'Только приход', 'Только расход', 'Только остатки'] },
    { q: 'Moddiy hisobot qanday ma\'lumotlarni o\'z ichiga oladi?', opts: ['Moddiy boyliklar harakati', 'Faqat kirim', 'Faqat chiqim', 'Faqat qoldiqlar'] }, 0),

  q(127, 'reports', 'screenshots/no_movement.png',
    { q: 'Для чего нужен отчёт "Товары без движения"?', opts: ['Для выявления товаров без продаж за период', 'Для новых товаров', 'Для популярных товаров', 'Для списанных товаров'] },
    { q: '"Harakatsiz tovarlar" hisoboti nimaga kerak?', opts: ['Davrdagi sotuv bo\'lmagan tovarlarni aniqlash uchun', 'Yangi tovarlar uchun', 'Mashhur tovarlar uchun', 'Yozib chiqarilgan tovarlar uchun'] }, 0),

  q(128, 'reports', 'screenshots/no_movement.png',
    { q: 'Как настроить период для отчёта?', opts: ['Выбрать даты в поле периода', 'Автоматически за месяц', 'Автоматически за неделю', 'Это невозможно'] },
    { q: 'Hisobot uchun davrni qanday sozlash mumkin?', opts: ['Davr maydonida sanalarni tanlash', 'Avtomatik oy uchun', 'Avtomatik hafta uchun', 'Buni qilish mumkin emas'] }, 0),

  q(129, 'reports', 'screenshots/product_report.png',
    { q: 'Для чего нужен "Товарный отчёт"?', opts: ['Для общего отчёта товарных движений', 'Для отчёта по клиентам', 'Для отчёта по зарплате', 'Для отчёта по продажам'] },
    { q: '"Tovar hisoboti" nimaga kerak?', opts: ['Tovar harakatlarining umumiy hisoboti uchun', 'Mijozlar hisoboti uchun', 'Ish haqi hisoboti uchun', 'Sotuvlar hisoboti uchun'] }, 0),

  q(130, 'reports', 'screenshots/product_report.png',
    { q: 'Какие данные содержит товарный отчёт?', opts: ['Приход, расход, остатки товаров', 'Только приход', 'Только расход', 'Только продажи'] },
    { q: 'Tovar hisoboti qanday ma\'lumotlarni o\'z ichiga oladi?', opts: ['Kirim, chiqim, tovar qoldiqlari', 'Faqat kirim', 'Faqat chiqim', 'Faqat sotuvlar'] }, 0),

  q(131, 'reports', 'screenshots/params_report.png',
    { q: 'Для чего нужен "Отчёт по параметрам"?', opts: ['Для формирования отчёта по выбранным параметрам', 'Для печати чеков', 'Для учёта товаров', 'Для расчёта зарплаты'] },
    { q: '"Parametrlar hisoboti" nimaga kerak?', opts: ['Tanlangan parametrlar bo\'yicha hisobot shakllantirish uchun', 'Cheklarni chop etish uchun', 'Tovarlarni hisobga olish uchun', 'Ish haqini hisoblash uchun'] }, 0),

  q(132, 'reports', 'screenshots/params_report.png',
    { q: 'Какие параметры можно выбрать?', opts: ['Различные критерии фильтрации данных', 'Только дату', 'Только товары', 'Только клиентов'] },
    { q: 'Qanday parametrlarni tanlash mumkin?', opts: ['Ma\'lumotlarni filtrlashning turli mezonlari', 'Faqat sana', 'Faqat tovarlar', 'Faqat mijozlar'] }, 0),

  q(133, 'reports', 'screenshots/sales_report.png',
    { q: 'Какие графики есть в отчёте о продаже?', opts: ['Структура платежей и диаграммы', 'Только таблицы', 'Только цифры', 'Никаких графиков'] },
    { q: 'Sotuv hisobotida qanday grafiklar bor?', opts: ['To\'lovlar tuzilishi va diagrammalar', 'Faqat jadvallar', 'Faqat raqamlar', 'Grafiklar yo\'q'] }, 0),

  q(134, 'reports', 'screenshots/sales_report.png',
    { q: 'Как экспортировать отчёт о продаже?', opts: ['Нажать кнопку экспорта', 'Это невозможно', 'Через настройки', 'Автоматически'] },
    { q: 'Sotuv hisobotini qanday eksport qilish mumkin?', opts: ['Eksport tugmasini bosing', 'Buni qilish mumkin emas', 'Sozlamalar orqali', 'Avtomatik ravishda'] }, 0),

  q(135, 'reports', 'screenshots/top_sales.png',
    { q: 'Какие данные показываются в топ продаж?', opts: ['Наименование, цена, количество, сумма', 'Только наименование', 'Только цену', 'Только количество'] },
    { q: 'Top sotuvlarda qanday ma\'lumotlar ko\'rsatiladi?', opts: ['Nom, narx, miqdor, summa', 'Faqat nom', 'Faqat narx', 'Faqat miqdor'] }, 0),

  q(136, 'reports', 'screenshots/pl_report.png',
    { q: 'Какие показатели в P&L отчёте?', opts: ['Выручка, валовая прибыль, расходы, чистая прибыль', 'Только выручка', 'Только прибыль', 'Только расходы'] },
    { q: 'P&L hisobotida qanday ko\'rsatkichlar bor?', opts: ['Tushum, yalpi foyda, xarajatlar, sof foyda', 'Faqat tushum', 'Faqat foyda', 'Faqat xarajatlar'] }, 0),

  q(137, 'reports', 'screenshots/balance.png',
    { q: 'Как отфильтровать данные в Салдо?', opts: ['По дате и контрагенту', 'Только по дате', 'Только по контрагенту', 'Это невозможно'] },
    { q: 'Saldoda ma\'lumotlarni qanday filtrlash mumkin?', opts: ['Sana va kontragent bo\'yicha', 'Faqat sana bo\'yicha', 'Faqat kontragent bo\'yicha', 'Buni qilish mumkin emas'] }, 0),

  q(138, 'reports', 'screenshots/abc_report.png',
    { q: 'Как рассчитывается категория A в ABC?', opts: ['По наибольшему вкладу в выручку', 'По количеству', 'По цене', 'По дате'] },
    { q: 'ABC da A toifasi qanday hisoblanadi?', opts: ['Tushumdagi eng katta ulush bo\'yicha', 'Miqdor bo\'yicha', 'Narx bo\'yicha', 'Sana bo\'yicha'] }, 0),

  q(139, 'reports', 'screenshots/xyz_report.png',
    { q: 'Что означает категория Z в XYZ?', opts: ['Хаотичный, непредсказуемый спрос', 'Стабильный спрос', 'Нестабильный спрос', 'Отсутствие спроса'] },
    { q: 'XYZ dagi Z toifasi nimani anglatadi?', opts: ['Tartibsiz, bashorat qilib bo\'lmaydigan talab', 'Barqaror talab', 'Barqaror bo\'lmagan talab', 'Talab yo\'qligi'] }, 0),

  q(140, 'reports', 'screenshots/abc_xyz_report.png',
    { q: 'Какие товары в категории CZ?', opts: ['Малозначимые с хаотичным спросом', 'Важные со стабильным спросом', 'Средние по важности', 'Новые товары'] },
    { q: 'CZ toifasida qanday tovarlar bor?', opts: ['Kam ahamiyatli va tartibsiz talabli', 'Muhim va barqaror talabli', 'O\'rtacha ahamiyatli', 'Yangi tovarlar'] }, 0),

  q(141, 'reports', 'screenshots/material_report.png',
    { q: 'Какие фильтры есть в материальном отчёте?', opts: ['По дате, складу, товару', 'Только по дате', 'Только по складу', 'Нет фильтров'] },
    { q: 'Moddiy hisobotda qanday filtrlar bor?', opts: ['Sana, ombor, tovar bo\'yicha', 'Faqat sana bo\'yicha', 'Faqat ombor bo\'yicha', 'Filtrlar yo\'q'] }, 0),

  q(142, 'reports', 'screenshots/no_movement.png',
    { q: 'Что делать с товарами без движения?', opts: ['Проанализировать и принять решение', 'Удалить', 'Списать', 'Оставить как есть'] },
    { q: 'Harakatsiz tovarlar bilan nima qilish kerak?', opts: ['Tahlil qilish va qaror qabul qilish', 'O\'chirish', 'Yozib chiqarish', 'Shunday qoldirish'] }, 0),

  q(143, 'reports', 'screenshots/product_report.png',
    { q: 'Как сформировать товарный отчёт?', opts: ['Выбрать период и нажать сформировать', 'Автоматически', 'Это невозможно', 'Через настройки'] },
    { q: 'Tovar hisobotini qanday shakllantirish mumkin?', opts: ['Davrni tanlash va shakllantirishni bosish', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Sozlamalar orqali'] }, 0),

  q(144, 'reports', 'screenshots/sales_report.png',
    { q: 'Какие методы оплаты видны в структуре платежей?', opts: ['Наличные, карта и другие', 'Только наличные', 'Только карта', 'Никакие'] },
    { q: 'To\'lovlar tuzilishida qanday to\'lov usullari ko\'rinadi?', opts: ['Naqd, karta va boshqalar', 'Faqat naqd', 'Faqat karta', 'Hech qanday'] }, 0),

  q(145, 'reports', 'screenshots/top_sales.png',
    { q: 'Как отсортировать товары в топ продаж?', opts: ['По количеству или сумме продаж', 'Только по имени', 'Только по цене', 'Без сортировки'] },
    { q: 'Top sotuvlarda tovarlarni qanday saralash mumkin?', opts: ['Miqdor yoki sotuv summasi bo\'yicha', 'Faqat ism bo\'yicha', 'Faqat narx bo\'yicha', 'Saralashsiz'] }, 0),

  q(146, 'reports', 'screenshots/pl_report.png',
    { q: 'Какой период можно выбрать в P&L?', opts: ['Любой период с выбором дат', 'Только день', 'Только неделя', 'Только месяц'] },
    { q: 'P&L da qanday davrni tanlash mumkin?', opts: ['Sanalarni tanlab istalgan davr', 'Faqat kun', 'Faqat hafta', 'Faqat oy'] }, 0),

  q(147, 'reports', 'screenshots/balance.png',
    { q: 'Что показывает начальный остаток в Салдо?', opts: ['Остаток на начало периода', 'Остаток на конец периода', 'Приход за период', 'Расход за период'] },
    { q: 'Saldodagi boshlang\'ich qoldiq nimani ko\'rsatadi?', opts: ['Davr boshidagi qoldiq', 'Davrdagi oxirgi qoldiq', 'Davrdagi kirim', 'Davrdagi chiqim'] }, 0),

  q(148, 'reports', 'screenshots/abc_report.png',
    { q: 'Что означает процент в ABC отчёте?', opts: ['Долю товара в общей выручке', 'Скидку', 'Налог', 'Наценку'] },
    { q: 'ABC hisobotidagi foiz nimani anglatadi?', opts: ['Tovarning umumiy tushumdagi ulushi', 'Chegirmi', 'Soliq', 'Orz qo\'shish'] }, 0),

  q(149, 'reports', 'screenshots/xyz_report.png',
    { q: 'Что означает категория Y в XYZ?', opts: ['Нестабильный, но предсказуемый спрос', 'Стабильный спрос', 'Хаотичный спрос', 'Отсутствие спроса'] },
    { q: 'XYZ dagi Y toifasi nimani anglatadi?', opts: ['Barqaror bo\'lmagan, lekin bashorat qilinadigan talab', 'Barqaror talab', 'Tartibsiz talab', 'Talab yo\'qligi'] }, 0),

  q(150, 'reports', 'screenshots/abc_xyz_report.png',
    { q: 'Сколько категорий в ABC/XYZ анализе?', opts: ['9 категорий (AX, AY, AZ, BX, BY, BZ, CX, CY, CZ)', '3 категории', '6 категорий', '12 категорий'] },
    { q: 'ABC/XYZ tahlilida nechta toifa bor?', opts: ['9 toifa (AX, AY, AZ, BX, BY, BZ, CX, CY, CZ)', '3 toifa', '6 toifa', '12 toifa'] }, 0),

  // ═══════════════════════════════════════════════════════════════════════════
  // НАСТРОЙКИ - 30 вопросов
  // ═══════════════════════════════════════════════════════════════════════════
  q(151, 'settings', 'screenshots/payment_methods.png',
    { q: 'Для чего нужны "Методы оплаты"?', opts: ['Для настройки способов приёма платежей', 'Для расчёта зарплаты', 'Для учёта товаров', 'Для печати чеков'] },
    { q: '"To\'lov usullari" nimaga kerak?', opts: ['To\'lovlarni qabul qilish usullarini sozlash uchun', 'Ish haqini hisoblash uchun', 'Tovarlarni hisobga olish uchun', 'Cheklarni chop etish uchun'] }, 0),

  q(152, 'settings', 'screenshots/payment_methods.png',
    { q: 'Какие методы оплаты можно настроить?', opts: ['Наличные, карта, перевод и другие', 'Только наличные', 'Только карта', 'Только перевод'] },
    { q: 'Qanday to\'lov usullarini sozlash mumkin?', opts: ['Naqd, karta, o\'tkazma va boshqalar', 'Faqat naqd', 'Faqat karta', 'Faqat o\'tkazma'] }, 0),

  q(153, 'settings', 'screenshots/pricetags.png',
    { q: 'Для чего нужны "Ценники"?', opts: ['Для настройки шаблонов и печати ценников', 'Для изменения цен', 'Для создания товаров', 'Для расчёта скидок'] },
    { q: '"Narx yorliqlari" nimaga kerak?', opts: ['Narx yorliqlari shablonlarini sozlash va chop etish uchun', 'Narlarni o\'zgartirish uchun', 'Tovarlar yaratish uchun', 'Chegirmalarni hisoblash uchun'] }, 0),

  q(154, 'settings', 'screenshots/pricetags.png',
    { q: 'Как настроить шаблон ценника?', opts: ['Через раздел "Ценники" с выбором параметров', 'Автоматически', 'Это невозможно', 'Через раздел Товары'] },
    { q: 'Narx yorlig\'i shablonini qanday sozlash mumkin?', opts: ['"Narx yorliqlari" bo\'limi orqali parametrlarni tanlash', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Tovarlar bo\'limi orqali'] }, 0),

  q(155, 'settings', 'screenshots/checks_settings.png',
    { q: 'Для чего нужны настройки "Чеки"?', opts: ['Для настройки параметров печати чеков', 'Для создания чеков', 'Для возврата чеков', 'Для удаления чеков'] },
    { q: '"Cheklar" sozlamalari nimaga kerak?', opts: ['Cheklarni chop etish parametrlarini sozlash uchun', 'Cheklar yaratish uchun', 'Cheklarni qaytarish uchun', 'Cheklarni o\'chirish uchun'] }, 0),

  q(156, 'settings', 'screenshots/checks_settings.png',
    { q: 'Что можно настроить для чеков?', opts: ['Шаблон, данные компании, параметры печати', 'Только цену', 'Только дату', 'Ничего'] },
    { q: 'Cheklar uchun nimalarni sozlash mumkin?', opts: ['Shablon, kompaniya ma\'lumotlari, chop etish parametrlari', 'Faqat narx', 'Faqat sana', 'Hech narsa'] }, 0),

  q(157, 'settings', 'screenshots/devices.png',
    { q: 'Для чего нужен раздел "Устройства"?', opts: ['Для подключения и управления оборудованием', 'Для учёта товаров', 'Для расчёта зарплаты', 'Для печати чеков'] },
    { q: '"Qurilmalar" bo\'limi nimaga kerak?', opts: ['Uskunalarni ulash va boshqarish uchun', 'Tovarlarni hisobga olish uchun', 'Ish haqini hisoblash uchun', 'Cheklarni chop etish uchun'] }, 0),

  q(158, 'settings', 'screenshots/devices.png',
    { q: 'Какие устройства можно подключить?', opts: ['Кассовые аппараты, принтеры, сканеры', 'Только компьютеры', 'Только телефоны', 'Никакие'] },
    { q: 'Qanday qurilmalarni ulash mumkin?', opts: ['Kassa apparatlari, printerlar, skanerlar', 'Faqat kompyuterlar', 'Faqat telefonlar', 'Hech qanday'] }, 0),

  q(159, 'settings', 'screenshots/pricing.png',
    { q: 'Для чего нужно "Ценообразование"?', opts: ['Для настройки правил формирования цен', 'Для расчёта зарплаты', 'Для печати чеков', 'Для учёта товаров'] },
    { q: '"Narx belgilash" nimaga kerak?', opts: ['Narxlarni shakllantirish qoidalarini sozlash uchun', 'Ish haqini hisoblash uchun', 'Cheklarni chop etish uchun', 'Tovarlarni hisobga olish uchun'] }, 0),

  q(160, 'settings', 'screenshots/pricing.png',
    { q: 'Какие правила ценообразования можно настроить?', opts: ['Наценки, скидки, округление', 'Только наценки', 'Только скидки', 'Никакие'] },
    { q: 'Qanday narx belgilash qoidalarini sozlash mumkin?', opts: ['Orz qo\'shish, chegirmalar, yaxlitlash', 'Faqat orz qo\'shish', 'Faqat chegirmalar', 'Hech qanday'] }, 0),

  q(161, 'settings', 'screenshots/parameters.png',
    { q: 'Для чего нужны "Параметры"?', opts: ['Для настройки технических параметров системы', 'Для создания товаров', 'Для расчёта зарплаты', 'Для печати чеков'] },
    { q: '"Parametrlar" nimaga kerak?', opts: ['Tizimning texnik parametrlarini sozlash uchun', 'Tovarlar yaratish uchun', 'Ish haqini hisoblash uchun', 'Cheklarni chop etish uchun'] }, 0),

  q(162, 'settings', 'screenshots/parameters.png',
    { q: 'Какие параметры можно настроить?', opts: ['Параметры приёма платежей и другие', 'Только язык', 'Только тему', 'Никакие'] },
    { q: 'Qanday parametrlarni sozlash mumkin?', opts: ['To\'lovlarni qabul qilish parametrlari va boshqalar', 'Faqat til', 'Faqat mavzu', 'Hech qanday'] }, 0),

  q(163, 'settings', 'screenshots/tags.png',
    { q: 'Для чего нужны "Теги"?', opts: ['Для сортировки товаров и формирования отчётов', 'Для создания товаров', 'Для печати чеков', 'Для расчёта зарплаты'] },
    { q: '"Teglar" nimaga kerak?', opts: ['Tovarlarni saralash va hisobotlar shakllantirish uchun', 'Tovarlar yaratish uchun', 'Cheklarni chop etish uchun', 'Ish haqini hisoblash uchun'] }, 0),

  q(164, 'settings', 'screenshots/tags.png',
    { q: 'Как создать новый тег?', opts: ['Нажать "Добавить тег" в разделе Теги', 'Автоматически', 'Это невозможно', 'Через раздел Товары'] },
    { q: 'Yangi tegni qanday yaratish mumkin?', opts: ['Teglar bo\'limida "Teg qo\'shish" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Tovarlar bo\'limi orqali'] }, 0),

  q(165, 'settings', 'screenshots/interface.png',
    { q: 'Для чего нужны настройки "Интерфейс"?', opts: ['Для настройки внешнего вида системы', 'Для создания товаров', 'Для расчёта зарплаты', 'Для печати чеков'] },
    { q: '"Interfeys" sozlamalari nimaga kerak?', opts: ['Tizim ko\'rinishini sozlash uchun', 'Tovarlar yaratish uchun', 'Ish haqini hisoblash uchun', 'Cheklarni chop etish uchun'] }, 0),

  q(166, 'settings', 'screenshots/interface.png',
    { q: 'Что можно настроить в интерфейсе?', opts: ['Тему, язык и другие параметры отображения', 'Только язык', 'Только тему', 'Ничего'] },
    { q: 'Interfeysda nimalarni sozlash mumkin?', opts: ['Mavzu, til va boshqa ko\'rsatish parametrlari', 'Faqat til', 'Faqat mavzu', 'Hech narsa'] }, 0),

  q(167, 'settings', 'screenshots/telegram_bot.png',
    { q: 'Для чего нужен "Телеграм бот"?', opts: ['Для получения уведомлений о событиях в кассе', 'Для отправки SMS', 'Для печати чеков', 'Для расчёта зарплаты'] },
    { q: '"Telegram bot" nimaga kerak?', opts: ['Kassada sodir bo\'layotgan voqealar haqida bildirishnomalar olish uchun', 'SMS yuborish uchun', 'Cheklarni chop etish uchun', 'Ish haqini hisoblash uchun'] }, 0),

  q(168, 'settings', 'screenshots/telegram_bot.png',
    { q: 'Какие уведомления можно настроить?', opts: ['О продажах, возвратах, сменах', 'Только о продажах', 'Только о возвратах', 'Никакие'] },
    { q: 'Qanday bildirishnomalarni sozlash mumkin?', opts: ['Sotuvlar, qaytarishlar, smenalar haqida', 'Faqat sotuvlar haqida', 'Faqat qaytarishlar haqida', 'Hech qanday'] }, 0),

  q(169, 'settings', 'screenshots/tariffs.png',
    { q: 'Для чего нужен раздел "Тарифы"?', opts: ['Для просмотра текущего тарифа и условий', 'Для расчёта зарплаты', 'Для печати чеков', 'Для учёта товаров'] },
    { q: '"Tariflar" bo\'limi nimaga kerak?', opts: ['Joriy tarif va shartlarni ko\'rish uchun', 'Ish haqini hisoblash uchun', 'Cheklarni chop etish uchun', 'Tovarlarni hisobga olish uchun'] }, 0),

  q(170, 'settings', 'screenshots/tariffs.png',
    { q: 'Как сменить тариф?', opts: ['Через раздел "Тарифы" или поддержку', 'Автоматически', 'Это невозможно', 'Через настройки'] },
    { q: 'Tarifni qanday o\'zgartirish mumkin?', opts: ['"Tariflar" bo\'limi yoki qo\'llab-quvvatlash orqali', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Sozlamalar orqali'] }, 0),

  q(171, 'settings', 'screenshots/payment_methods.png',
    { q: 'Как добавить новый метод оплаты?', opts: ['Нажать "Добавить" в разделе Методы оплаты', 'Автоматически', 'Это невозможно', 'Через раздел Счета'] },
    { q: 'Yangi to\'lov usulini qanday qo\'shish mumkin?', opts: ['To\'lov usullari bo\'limida "Qo\'shish" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Hisoblar bo\'limi orqali'] }, 0),

  q(172, 'settings', 'screenshots/devices.png',
    { q: 'Как удалить устройство?', opts: ['Нажать "Удалить" у устройства', 'Автоматически', 'Это невозможно', 'Через техподдержку'] },
    { q: 'Qurilmani qanday o\'chirish mumkin?', opts: ['Qurilmadagi "O\'chirish" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Texnik yordam orqali'] }, 0),

  q(173, 'settings', 'screenshots/pricetags.png',
    { q: 'Какие размеры ценников доступны?', opts: ['Различные стандартные форматы', 'Только один размер', 'Только большой', 'Только маленький'] },
    { q: 'Qanday narx yorlig\'i o\'lchamlari mavjud?', opts: ['Turli standart formatlar', 'Faqat bitta o\'lcham', 'Faqat katta', 'Faqat kichik'] }, 0),

  q(174, 'settings', 'screenshots/checks_settings.png',
    { q: 'Как настроить данные компании на чеке?', opts: ['Через раздел Чеки с вводом данных', 'Автоматически', 'Это невозможно', 'Через раздел Кабинет'] },
    { q: 'Chekdagi kompaniya ma\'lumotlarini qanday sozlash mumkin?', opts: ['Cheklar bo\'limi orqali ma\'lumotlarni kiritish', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Kabinet bo\'limi orqali'] }, 0),

  q(175, 'settings', 'screenshots/tags.png',
    { q: 'Как присвоить тег товару?', opts: ['В карточке товара выбрать нужные теги', 'Автоматически', 'Это невозможно', 'Через импорт'] },
    { q: 'Tovarga tegni qanday biriktirish mumkin?', opts: ['Tovar kartochkasida kerakli teglarni tanlash', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Import orqali'] }, 0),

  q(176, 'settings', 'screenshots/interface.png',
    { q: 'Как изменить язык интерфейса?', opts: ['Через раздел "Интерфейс" или профиль', 'Автоматически', 'Это невозможно', 'Через настройки браузера'] },
    { q: 'Interfeys tilini qanday o\'zgartirish mumkin?', opts: ['"Interfeys" bo\'limi yoki profil orqali', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Brauzer sozlamalari orqali'] }, 0),

  q(177, 'settings', 'screenshots/telegram_bot.png',
    { q: 'Как подключить Telegram-бот?', opts: ['Ввести ID чата и настроить уведомления', 'Автоматически', 'Это невозможно', 'Через техподдержку'] },
    { q: 'Telegram-botni qanday ulash mumkin?', opts: ['Chat ID ni kiritish va bildirishnomalarni sozlash', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Texnik yordam orqali'] }, 0),

  q(178, 'settings', 'screenshots/pricing.png',
    { q: 'Как настроить автоматическую наценку?', opts: ['Через раздел "Ценообразование"', 'Автоматически', 'Это невозможно', 'Через раздел Товары'] },
    { q: 'Avtomatik orz qo\'shishni qanday sozlash mumkin?', opts: ['"Narx belgilash" bo\'limi orqali', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Tovarlar bo\'limi orqali'] }, 0),

  q(179, 'settings', 'screenshots/parameters.png',
    { q: 'Какие технические параметры можно изменить?', opts: ['Настройки оплат, уведомлений и другие', 'Только пароль', 'Только email', 'Никакие'] },
    { q: 'Qanday texnik parametrlarni o\'zgartirish mumkin?', opts: ['To\'lovlar, bildirishnomalar va boshqa sozlamalar', 'Faqat parol', 'Faqat email', 'Hech qanday'] }, 0),

  q(180, 'settings', 'screenshots/payment_methods.png',
    { q: 'Как изменить название метода оплаты?', opts: ['Отредактировать в разделе Методы оплаты', 'Это невозможно', 'Автоматически', 'Через техподдержку'] },
    { q: 'To\'lov usuli nomini qanday o\'zgartirish mumkin?', opts: ['To\'lov usullari bo\'limida tahrirlash', 'Buni qilish mumkin emas', 'Avtomatik ravishda', 'Texnik yordam orqali'] }, 0),

  // ═══════════════════════════════════════════════════════════════════════════
  // КАБИНЕТ - 20 вопросов
  // ═══════════════════════════════════════════════════════════════════════════
  q(181, 'cabinet', 'screenshots/subscriptions.png',
    { q: 'Для чего нужен раздел "Подписки"?', opts: ['Для управления активными подписками', 'Для учёта товаров', 'Для печати чеков', 'Для расчёта зарплаты'] },
    { q: '"Obunalar" bo\'limi nimaga kerak?', opts: ['Faol obunalarni boshqarish uchun', 'Tovarlarni hisobga olish uchun', 'Cheklarni chop etish uchun', 'Ish haqini hisoblash uchun'] }, 0),

  q(182, 'cabinet', 'screenshots/subscriptions.png',
    { q: 'Какие данные отображаются в подписках?', opts: ['Сумма, способ оплаты, дата пополнения', 'Только сумма', 'Только дата', 'Только способ оплаты'] },
    { q: 'Obunalarda qanday ma\'lumotlar ko\'rsatiladi?', opts: ['Summa, to\'lov usuli, to\'ldirish sanasi', 'Faqat summa', 'Faqat sana', 'Faqat to\'lov usuli'] }, 0),

  q(183, 'cabinet', 'screenshots/cash_registers.png',
    { q: 'Для чего нужен раздел "Кассы"?', opts: ['Для управления списком кассовых аппаратов', 'Для расчёта зарплаты', 'Для печати чеков', 'Для учёта товаров'] },
    { q: '"Kassalar" bo\'limi nimaga kerak?', opts: ['Kassa apparatlari ro\'yxatini boshqarish uchun', 'Ish haqini hisoblash uchun', 'Cheklarni chop etish uchun', 'Tovarlarni hisobga olish uchun'] }, 0),

  q(184, 'cabinet', 'screenshots/cash_registers.png',
    { q: 'Какие данные хранятся о кассах?', opts: ['Номер, название, серийный номер, дата активации', 'Только номер', 'Только название', 'Только дату'] },
    { q: 'Kassalar haqida qanday ma\'lumotlar saqlanadi?', opts: ['Raqam, nom, seriya raqami, aktivlashtirish sanasi', 'Faqat raqam', 'Faqat nom', 'Faqat sana'] }, 0),

  q(185, 'cabinet', 'screenshots/company_data.png',
    { q: 'Для чего нужен раздел "Данные"?', opts: ['Для просмотра и редактирования данных компании', 'Для расчёта зарплаты', 'Для печати чеков', 'Для учёта товаров'] },
    { q: '"Ma\'lumotlar" bo\'limi nimaga kerak?', opts: ['Kompaniya ma\'lumotlarini ko\'rish va tahrirlash uchun', 'Ish haqini hisoblash uchun', 'Cheklarni chop etish uchun', 'Tovarlarni hisobga olish uchun'] }, 0),

  q(186, 'cabinet', 'screenshots/company_data.png',
    { q: 'Какие данные компании можно редактировать?', opts: ['Название, адрес, реквизиты, контакты', 'Только название', 'Только адрес', 'Только контакты'] },
    { q: 'Kompaniyaning qanday ma\'lumotlarini tahrirlash mumkin?', opts: ['Nom, manzil, rekvizitlar, kontaktlar', 'Faqat nom', 'Faqat manzil', 'Faqat kontaktlar'] }, 0),

  q(187, 'cabinet', 'screenshots/dashboard.png',
    { q: 'Что делает кнопка "Выход"?', opts: ['Выполняет полный выход из аккаунта', 'Закрывает кассу', 'Блокирует пользователя', 'Ничего'] },
    { q: '"Chiqish" tugmasi nima qiladi?', opts: ['Akkauntdan to\'liq chiqadi', 'Kassani yopadi', 'Foydalanuvchini bloklaydi', 'Hech narsa'] }, 0),

  q(188, 'cabinet', 'screenshots/dashboard.png',
    { q: 'Какого цвета карточка "Выход"?', opts: ['Красная', 'Зелёная', 'Синяя', 'Серая'] },
    { q: '"Chiqish" kartochkasi qanday rangda?', opts: ['Qizil', 'Yashil', 'Ko\'k', 'Kulrang'] }, 0),

  q(189, 'cabinet', 'screenshots/dashboard.png',
    { q: 'Как пополнить баланс?', opts: ['Нажать кнопку с балансом и плюсом', 'Автоматически', 'Это невозможно', 'Через техподдержку'] },
    { q: 'Balansni qanday to\'ldirish mumkin?', opts: ['Balans va plyus tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Texnik yordam orqali'] }, 0),

  q(190, 'cabinet', 'screenshots/dashboard.png',
    { q: 'Где отображается баланс пользователя?', opts: ['Внизу левой панели на зелёной кнопке', 'Вверху страницы', 'В настройках', 'Нигде'] },
    { q: 'Foydalanuvchi balansi qayerda ko\'rsatiladi?', opts: ['Chap panelning pastida yashil tugmada', 'Sahifaning yuqorisida', 'Sozlamalarda', 'Hech qayerda'] }, 0),

  q(191, 'cabinet', 'screenshots/subscriptions.png',
    { q: 'Как посмотреть историю подписок?', opts: ['В разделе "Подписки" отображается история', 'Это невозможно', 'Через отчёты', 'Через настройки'] },
    { q: 'Obunalar tarixini qanday ko\'rish mumkin?', opts: ['"Obunalar" bo\'limida tarix ko\'rsatiladi', 'Buni qilish mumkin emas', 'Hisobotlar orqali', 'Sozlamalar orqali'] }, 0),

  q(192, 'cabinet', 'screenshots/cash_registers.png',
    { q: 'Как добавить новую кассу?', opts: ['Нажать "Добавить" в разделе Кассы', 'Автоматически', 'Это невозможно', 'Через техподдержку'] },
    { q: 'Yangi kassani qanday qo\'shish mumkin?', opts: ['Kassalar bo\'limida "Qo\'shish" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Texnik yordam orqali'] }, 0),

  q(193, 'cabinet', 'screenshots/company_data.png',
    { q: 'Как сохранить изменения данных компании?', opts: ['Нажать "Сохранить" после редактирования', 'Автоматически', 'Это невозможно', 'Через техподдержку'] },
    { q: 'Kompaniya ma\'lumotlari o\'zgarishlarini qanday saqlash mumkin?', opts: ['Tahrirlagandan so\'ng "Saqlash" tugmasini bosing', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Texnik yordam orqali'] }, 0),

  q(194, 'cabinet', 'screenshots/dashboard.png',
    { q: 'Какой логин отображается под аватаром?', opts: ['Текущий пользователь системы', 'Администратор', 'Гость', 'Не отображается'] },
    { q: 'Avatar ostida qanday login ko\'rsatiladi?', opts: ['Tizimning joriy foydalanuvchisi', 'Administrator', 'Mehmon', 'Ko\'rsatilmaydi'] }, 0),

  q(195, 'cabinet', 'screenshots/subscriptions.png',
    { q: 'Можно ли отменить подписку?', opts: ['Да, через раздел "Подписки"', 'Нет', 'Автоматически', 'Через техподдержку'] },
    { q: 'Obunani bekor qilish mumkinmi?', opts: ['Ha, "Obunalar" bo\'limi orqali', 'Yo\'q', 'Avtomatik ravishda', 'Texnik yordam orqali'] }, 0),

  q(196, 'cabinet', 'screenshots/cash_registers.png',
    { q: 'Как отредактировать данные кассы?', opts: ['Нажать иконку редактирования у кассы', 'Это невозможно', 'Автоматически', 'Удалить и создать заново'] },
    { q: 'Kassa ma\'lumotlarini qanday tahrirlash mumkin?', opts: ['Kassadagi tahrirlash belgisini bosing', 'Buni qilish mumkin emas', 'Avtomatik ravishda', 'O\'chirib qayta yaratish'] }, 0),

  q(197, 'cabinet', 'screenshots/company_data.png',
    { q: 'Какие реквизиты компании можно указать?', opts: ['ИНН, ОГРН, расчётный счёт и другие', 'Только название', 'Только адрес', 'Только телефон'] },
    { q: 'Kompaniyaning qanday rekvizitlarini ko\'rsatish mumkin?', opts: ['INN, OGRN, hisob raqami va boshqalar', 'Faqat nom', 'Faqat manzil', 'Faqat telefon'] }, 0),

  q(198, 'cabinet', 'screenshots/dashboard.png',
    { q: 'Где находится раздел "Кабинет"?', opts: ['Внизу бокового меню', 'Вверху бокового меню', 'В настройках', 'В отчётах'] },
    { q: '"Kabinet" bo\'limi qayerda joylashgan?', opts: ['Yon menyuning pastida', 'Yon menyuning yuqorisida', 'Sozlamalarda', 'Hisobotlarda'] }, 0),

  q(199, 'cabinet', 'screenshots/subscriptions.png',
    { q: 'Как посмотреть дату следующего платежа?', opts: ['В разделе "Подписки" отображается информация', 'Это невозможно', 'Через техподдержку', 'Автоматически'] },
    { q: 'Keyingi to\'lov sanasini qanday ko\'rish mumkin?', opts: ['"Obunalar" bo\'limida ma\'lumot ko\'rsatiladi', 'Buni qilish mumkin emas', 'Texnik yordam orqali', 'Avtomatik ravishda'] }, 0),

  q(200, 'cabinet', 'screenshots/cash_registers.png',
    { q: 'Как деактивировать кассу?', opts: ['Через редактирование или удаление', 'Автоматически', 'Это невозможно', 'Через техподдержку'] },
    { q: 'Kassani qanday faolsizlashtirish mumkin?', opts: ['Tahrirlash yoki o\'chirish orqali', 'Avtomatik ravishda', 'Buni qilish mumkin emas', 'Texnik yordam orqali'] }, 0),
];
