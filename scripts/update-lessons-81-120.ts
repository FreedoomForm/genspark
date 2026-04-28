// Update lessons 81-120 with detailed descriptions (3+ sentences)
// Run: npx tsx scripts/update-lessons-81-120.ts

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from project root
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const detailedLessons: {
  order: number;
  ruDescription: string;
  uzDescription: string;
  ruFunctionality: string;
  uzFunctionality: string;
}[] = [
  // === СКЛАД: ТЕХКАРТЫ (81-85) ===
  {
    order: 81,
    ruDescription:
      'Раздел "Техкарты" предназначен для создания и управления технологическими картами производства. Это ключевой инструмент для предприятий, занимающихся производством продукции из исходных материалов и ингредиентов.\n\nТехнологическая карта содержит полный состав изделия: перечень ингредиентов с указанием количества, единиц измерения и стоимости. Это позволяет точно рассчитать себестоимость готовой продукции и контролировать расход материалов.\n\nСистема автоматически пересчитывает количество ингредиентов при изменении объёма производства. Это упрощает планирование закупок и помогает оптимизировать производственные процессы.',
    uzDescription:
      '"Tex-kartalar" bo\'limi ishlab chiqarish texnologik kartalarini yaratish va boshqarish uchun mo\'ljallangan. Bu xom ashyo va ingredientlardan mahsulot ishlab chiqaruvchi korxonalar uchun asosiy vosita.\n\nTexnologik karta mahsulotning to\'liq tarkibini o\'z ichiga oladi: ingredientlar ro\'yxati miqdori, o\'lchov birliklari va narxi bilan. Bu tayyor mahsulot tannarxini aniq hisoblash va materiallar sarfini nazorat qilish imkonini beradi.\n\nTizim ishlab chiqarish hajmi o\'zgarganda ingredientlar miqdorini avtomatik qayta hisoblaydi. Bu xaridlar rejalashtirishni soddalashtiradi va ishlab chiqarish jarayonlarini optimallashtirishga yordam beradi.',
    ruFunctionality:
      'Открывает список всех технологических карт с возможностью поиска, фильтрации и сортировки. Каждая карта показывает наименование готовой продукции, количество ингредиентов и расчётную себестоимость. Доступны функции создания новой карты, редактирования существующей и копирования для создания аналогичных рецептур.',
    uzFunctionality:
      'Qidiruv, filtrlash va saralash imkoniyati bilan barcha texnologik kartalar ro\'yxatini ochadi. Har bir karta tayyor mahsulot nomi, ingredientlar soni va hisoblangan tannarxni ko\'rsatadi. Yangi karta yaratish, mavjudni tahrirlash va o\'xshash retsepturalar yaratish uchun nusxalash funksiyalari mavjud.',
  },
  {
    order: 82,
    ruDescription:
      'Кнопка создания техкарты открывает форму для добавления новой рецептуры в систему. Это первый шаг при запуске производства нового вида продукции.\n\nВ форме необходимо указать наименование готового продукта, единицу измерения выхода и добавить все ингредиенты с их количеством. Система поддерживает многоуровневые техкарты, когда один полуфабрикат используется для производства другого.\n\nПосле сохранения техкарта становится доступна для использования в актах изготовления. Можно также указать технологические потери и процент выхода готовой продукции.',
    uzDescription:
      'Tex-karta yaratish tugmasi tizimga yangi retseptura qo\'shish uchun formani ochadi. Bu yangi turdagi mahsulot ishlab chiqarishni boshlashda birinchi qadam.\n\nFormada tayyor mahsulot nomini, chiqish o\'lchov birligini ko\'rsatish va barcha ingredientlarni ularning miqdori bilan qo\'shish kerak. Tizim ko\'p darajali tex-kartalarni qo\'llab-quvvatlaydi, bitta yarim tayyor mahsulot boshqasini ishlab chiqarishda ishlatiladi.\n\nSaqlangandan so\'ng tex-karta ishlab chiqarish aktlarida foydalanish uchun mavjud bo\'ladi. Shuningdek texnologik yo\'qotishlar va tayyor mahsulot chiqish foizini ko\'rsatish mumkin.',
    ruFunctionality:
      'Открывает пустую форму создания технологической карты с полями для наименования продукта, единицы измерения и таблицей ингредиентов. Автоматически рассчитывает себестоимость при добавлении каждого ингредиента. Позволяет сохранять черновики для дальнейшего редактирования.',
    uzFunctionality:
      'Mahsulot nomi, o\'lchov birligi va ingredientlar jadvali maydonlari bilan bo\'sh texnologik karta yaratish formasini ochadi. Har bir ingredient qo\'shilganda tannarxni avtomatik hisoblaydi. Keyingi tahrirlash uchun qoralamalarni saqlash imkonini beradi.',
  },
  {
    order: 83,
    ruDescription:
      'Таблица ингредиентов техкарты содержит полный состав продукции с указанием наименования, количества и стоимости каждого компонента. Это основа для расчёта себестоимости.\n\nИнгредиенты добавляются из справочника товаров с указанием количества на единицу готовой продукции. Система автоматически подтягивает текущую закупочную цену и рассчитывает сумму затрат.\n\nМожно указать процент технологических потерь для каждого ингредиента, что важно для точного планирования закупок. Также доступен порядок добавления ингредиентов в технологическом процессе.',
    uzDescription:
      'Tex-karta ingredientlari jadvali har bir komponentning nomi, miqdori va narxi ko\'rsatilgan holda mahsulotning to\'liq tarkibini o\'z ichiga oladi. Bu tannarxni hisoblash asosidir.\n\nIngredientlar tayyor mahsulot birligiga miqdor ko\'rsatilgan holda tovarlar ma\'lumotnomasidan qo\'shiladi. Tizim joriy xarid narxini avtomatik tortib oladi va xarajatlar summasini hisoblaydi.\n\nHar bir ingredient uchun texnologik yo\'qotishlar foizini ko\'rsatish mumkin, bu xaridlar rejalashtirish uchun muhim. Shuningdek texnologik jarayonda ingredientlar qo\'shish tartibi ham mavjud.',
    ruFunctionality:
      'Отображает интерактивную таблицу с возможностью добавления, удаления и изменения порядка ингредиентов. Автоматически рассчитывает общую стоимость ингредиентов и стоимость на единицу продукции. Поддерживает drag-and-drop для изменения порядка и массовое добавление из буфера обмена.',
    uzFunctionality:
      'Ingredientlarni qo\'shish, o\'chirish va tartibini o\'zgartirish imkoniyati bilan interaktiv jadvalni ko\'rsatadi. Ingredientlarning umumiy narxini va mahsulot birligi narxini avtomatik hisoblaydi. Tartibni o\'zgartirish uchun drag-and-drop va buferdan ommaviy qo\'shishni qo\'llab-quvvatlaydi.',
  },
  {
    order: 84,
    ruDescription:
      'Поле себестоимости техкарты показывает расчётную стоимость производства единицы продукции. Это ключевой показатель для ценообразования и анализа рентабельности.\n\nСебестоимость рассчитывается автоматически как сумма стоимостей всех ингредиентов с учётом технологических потерь. При изменении цен на материалы система предлагает пересчитать себестоимость.\n\nМожно сравнивать себестоимость по разным техкартам и анализировать влияние цен на материалы. Это помогает принимать решения о замене поставщиков или оптимизации рецептуры.',
    uzDescription:
      'Tex-karta tannarxi maydoni mahsulot birligini ishlab chiqarishning hisoblangan narxini ko\'rsatadi. Bu narx belgilash va rentabellikni tahlil qilish uchun asosiy ko\'rsatkich.\n\nTannarx barcha ingredientlar narxlarining yig\'indisi sifatida texnologik yo\'qotishlarni hisobga olgan holda avtomatik hisoblanadi. Materiallar narxlari o\'zgarganda tizim tannarxni qayta hisoblashni taklif qiladi.\n\nTurli tex-kartalar bo\'yicha tannarxni solishtirish va materiallar narxining ta\'sirini tahlil qilish mumkin. Bu yetkazib beruvchilarni almashtirish yoki retsepturani optimallashtirish bo\'yicha qarorlar qabul qilishga yordam beradi.',
    ruFunctionality:
      'Автоматически рассчитывает и отображает себестоимость в режиме реального времени при любом изменении состава техкарты. Показывает детализацию по статьям затрат и позволяет экспортировать расчёт в Excel. Учитывает дополнительные расходы: упаковку, энергию, трудозатраты.',
    uzFunctionality:
      'Tex-karta tarkibining har qanday o\'zgarishida tannarxni real vaqt rejimida avtomatik hisoblab ko\'rsatadi. Xarajatlar bo\'yicha batafsil ma\'lumotni ko\'rsatadi va hisobni Excelga eksport qilish imkonini beradi. Qo\'shimcha xarajatlarni hisobga oladi: qadoqlash, energiya, mehnat xarajatlari.',
  },
  {
    order: 85,
    ruDescription:
      'Поле готовой продукции техкарты указывает, какой товар получается в результате производства. Это связывает техкарту с конкретной позицией в справочнике товаров.\n\nПри выборе готовой продукции система автоматически определяет единицу измерения выхода. Можно указать процент выхода для учёта технологических потерь при производстве.\n\nПосле проведения акта изготовления готовая продукция появляется на остатках склада. История производства сохраняется в карточке товара и доступна для анализа.',
    uzDescription:
      'Tex-karta tayyor mahsuloti maydoni ishlab chiqarish natijasida qanday tovar olinishini ko\'rsatadi. Bu tex-kartani tovarlar ma\'lumotnomasidagi aniq pozitsiya bilan bog\'laydi.\n\nTayyor mahsulot tanlanganda tizim chiqish o\'lchov birligini avtomatik belgilaydi. Ishlab chiqarishda texnologik yo\'qotishlarni hisobga olish uchun chiqish foizini ko\'rsatish mumkin.\n\nIshlab chiqarish akti o\'tkazilgandan so\'ng tayyor mahsulot ombor qoldiqlarida paydo bo\'ladi. Ishlab chiqarish tarixi tovar kartochkasida saqlanadi va tahlil uchun mavjud.',
    ruFunctionality:
      'Позволяет выбрать товар из справочника, который будет производиться по данной техкарте. Автоматически связывает техкарту с карточкой товара и показывает текущие остатки. Поддерживает производство полуфабрикатов для использования в других техкартах.',
    uzFunctionality:
      'Ushbu tex-karta bo\'yicha ishlab chiqariladigan tovarni ma\'lumotnomadan tanlash imkonini beradi. Tex-kartani tovar kartochkasi bilan avtomatik bog\'laydi va joriy qoldiqlarni ko\'rsatadi. Boshqa tex-kartalarda foydalanish uchun yarim tayyor mahsulotlar ishlab chiqarishni qo\'llab-quvvatlaydi.',
  },

  // === СКЛАД: АКТ ИЗГОТОВЛЕНИЯ (86-90) ===
  {
    order: 86,
    ruDescription:
      'Раздел "Акт изготовления" предназначен для оформления выпуска готовой продукции. Это ключевой документ производственного учёта, связывающий расход материалов с приходом продукции.\n\nВ разделе отображается список документов производства с информацией о техкарте, количестве, дате и статусе. Документы можно фильтровать по периоду, продукции и складу.\n\nПравильное оформление актов изготовления обеспечивает корректный учёт материалов и готовой продукции, а также точный расчёт себестоимости.',
    uzDescription:
      '"Ishlab chiqarish akti" bo\'limi tayyor mahsulot chiqarishni rasmiylashtirish uchun mo\'ljallangan. Bu ishlab chiqarish hisobining asosiy hujjati bo\'lib, materiallar sarfini mahsulot kirim bilan bog\'laydi.\n\nBo\'limda tex-karta, miqdor, sana va holat haqida ma\'lumot bilan ishlab chiqarish hujjatlari ro\'yxati ko\'rsatiladi. Hujjatlarni davr, mahsulot va ombor bo\'yicha filtrlash mumkin.\n\nIshlab chiqarish aktlarini to\'g\'ri rasmiylashtirish materiallar va tayyor mahsulotlarning to\'g\'ri hisobini, shuningdek tannarxning aniq hisoblanishini ta\'minlaydi.',
    ruFunctionality:
      'Открывает список всех актов изготовления с возможностью фильтрации и поиска. Показывает сводную информацию о произведённой продукции и затраченных материалах. Позволяет создавать новые акты, редактировать черновики и просматривать историю производства.',
    uzFunctionality:
      'Filtrlash va qidiruv imkoniyati bilan barcha ishlab chiqarish aktlari ro\'yxatini ochadi. Ishlab chiqarilgan mahsulotlar va sarflangan materiallar haqida umumiy ma\'lumotni ko\'rsatadi. Yangi aktlar yaratish, qoralamalarni tahrirlash va ishlab chiqarish tarixini ko\'rish imkonini beradi.',
  },
  {
    order: 87,
    ruDescription:
      'Кнопка создания акта изготовления открывает форму для оформления нового документа производства. Это первый шаг при выпуске партии продукции.\n\nВ форме необходимо выбрать техкарту, указать количество производимой продукции и склад, на который будет оприходован результат. Система автоматически заполнит список необходимых материалов.\n\nПеред сохранением можно скорректировать количество материалов, если фактический расход отличается от планового. Это важно для точного учёта себестоимости.',
    uzDescription:
      'Ishlab chiqarish aktini yaratish tugmasi yangi ishlab chiqarish hujjatini rasmiylashtirish uchun formani ochadi. Bu mahsulot partiyasini chiqarishda birinchi qadam.\n\nFormada tex-kartani tanlash, ishlab chiqariladigan mahsulot miqdorini va natija qabul qilinadigan omborni ko\'rsatish kerak. Tizim kerakli materiallar ro\'yxatini avtomatik to\'ldiradi.\n\nSaqlashdan oldin, agar haqiqiy sarf rejaviydan farq qilsa, materiallar miqdorini tuzatish mumkin. Bu tannarxni aniq hisoblash uchun muhim.',
    ruFunctionality:
      'Открывает форму создания акта с выбором техкарты, указанием количества и склада. Автоматически рассчитывает требуемое количество материалов на основе рецептуры. Позволяет предварительно просмотреть список материалов и их наличие на складе.',
    uzFunctionality:
      'Tex-kartani tanlash, miqdor va omborni ko\'rsatish bilan akt yaratish formasini ochadi. Retseptura asosida kerakli materiallar miqdorini avtomatik hisoblaydi. Materiallar ro\'yxatini va ularning ombordagi mavjudligini oldindan ko\'rish imkonini beradi.',
  },
  {
    order: 88,
    ruDescription:
      'Поле выбора техкарты позволяет указать рецептуру, по которой будет производиться продукция. Это обязательный параметр акта изготовления.\n\nПри выборе техкарты система автоматически определяет готовую продукцию и заполняет список необходимых ингредиентов. Количество материалов рассчитывается пропорционально объёму производства.\n\nМожно просмотреть состав техкарты перед выбором, чтобы убедиться в её актуальности. История использования техкарты сохраняется для анализа производства.',
    uzDescription:
      'Tex-kartani tanlash maydoni mahsulot ishlab chiqariladigan retsepturani ko\'rsatish imkonini beradi. Bu ishlab chiqarish aktining majburiy parametri.\n\nTex-karta tanlanganda tizim tayyor mahsulotni avtomatik belgilaydi va kerakli ingredientlar ro\'yxatini to\'ldiradi. Materiallar miqdori ishlab chiqarish hajmiga proporsional hisoblanadi.\n\nTanlashdan oldin tex-karta tarkibini ko\'rib, uning dolzarbligiga ishonch hosil qilish mumkin. Tex-kartadan foydalanish tarixi ishlab chiqarishni tahlil qilish uchun saqlanadi.',
    ruFunctionality:
      'Открывает выпадающий список доступных техкарт с поиском по названию продукции. Показывает краткую информацию о составе и себестоимости при наведении. Автоматически связывает акт с выбранной техкартой и заполняет связанные поля.',
    uzFunctionality:
      'Mahsulot nomi bo\'yicha qidiruv bilan mavjud tex-kartalar ochiluvchi ro\'yxatini ochadi. Sichqoncha ustiga olib kelganda tarkib va tannarx haqida qisqa ma\'lumot ko\'rsatadi. Akt avtomatik tanlangan tex-karta bilan bog\'lanadi va bog\'liq maydonlarni to\'ldiradi.',
  },
  {
    order: 89,
    ruDescription:
      'Поле количества продукции указывает, сколько единиц готовой продукции будет произведено по акту изготовления. От этого значения зависит расчёт материалов.\n\nПри изменении количества система автоматически пересчитывает требуемое количество всех ингредиентов согласно рецептуре. Проверяется наличие достаточного количества материалов на складе.\n\nМожно указать дробное количество для продукции, измеряемой в килограммах или литрах. Система корректно рассчитает компоненты и себестоимость.',
    uzDescription:
      'Mahsulot miqdori maydoni ishlab chiqarish akti bo\'yicha necha birlik tayyor mahsulot ishlab chiqarilishini ko\'rsatadi. Ushbu qiymatdan materiallarni hisoblash bog\'liq.\n\nMiqdor o\'zgarganda tizim retsepturaga ko\'ra barcha ingredientlarning kerakli miqdorini avtomatik qayta hisoblaydi. Omborda materiallarning yetarli miqdori mavjudligi tekshiriladi.\n\nKilogramm yoki litrda o\'lchanadigan mahsulotlar uchun kasr miqdor ko\'rsatish mumkin. Tizim komponentlar va tannarxni to\'g\'ri hisoblaydi.',
    ruFunctionality:
      'Позволяет ввести планируемое количество продукции с автоматическим пересчётом материалов. Проверяет достаточность материалов на складе и подсвечивает недостаток. Рассчитывает плановую себестоимость партии продукции в реальном времени.',
    uzFunctionality:
      'Materiallarni avtomatik qayta hisoblash bilan rejalashtirilayotgan mahsulot miqdorini kiritish imkonini beradi. Omborda materiallarning yetarliligini tekshiradi va yetishmovchilikni belgilaydi. Mahsulot partiyasining reja tannarxini real vaqtda hisoblaydi.',
  },
  {
    order: 90,
    ruDescription:
      'Кнопка проведения акта изготовления завершает оформление документа и отражает операцию в учёте. Это финальное действие, после которого материалы списываются, а продукция приходуется.\n\nПри проведении система проверяет наличие всех материалов в нужном количестве. Если материалов недостаточно, выводится предупреждение с перечнем дефицитных позиций.\n\nПосле проведения документ можно просмотреть и распечатать, но нельзя редактировать. При необходимости корректировки создаётся документ сторнирования.',
    uzDescription:
      'Ishlab chiqarish aktini o\'tkazish tugmasi hujjatni rasmiylashtirishni tugatadi va operatsiyani hisobda aks ettiradi. Bu yakuniy harakat, undan so\'ng materiallar yozib chiqariladi va mahsulot qabul qilinadi.\n\nO\'tkazishda tizim barcha materiallarning kerakli miqdorda mavjudligini tekshiradi. Agar materiallar yetarli bo\'lmasa, yetishmovchilik pozitsiyalari ro\'yxati bilan ogohlantirish chiqariladi.\n\nO\'tkazilgandan so\'ng hujjatni ko\'rish va chop etish mumkin, lekin tahrirlab bo\'lmaydi. Tuzatish zarurati bo\'lsa, bekor qilish hujjati yaratiladi.',
    ruFunctionality:
      'Проверяет наличие материалов и проводит документ при успешной проверке. Списывает материалы со склада и приходует готовую продукцию по расчётной себестоимости. Формирует проводки в бухгалтерском учёте и обновляет отчёты по производству.',
    uzFunctionality:
      'Materiallarning mavjudligini tekshiradi va muvaffaqiyatli tekshiruvda hujjatni o\'tkazadi. Materiallarni ombordan yozib chiqaradi va tayyor mahsulotni hisoblangan tannarx bo\'yicha qabul qiladi. Buxgalteriya hisobida o\'tkazmalarni shakllantiradi va ishlab chiqarish bo\'yicha hisobotlarni yangilaydi.',
  },

  // === СКЛАД: ИЗБРАННЫЕ (91-93) ===
  {
    order: 91,
    ruDescription:
      'Раздел "Избранные товары" содержит список товаров, отмеченных пользователем как избранные. Это персональный список для быстрого доступа к часто используемым позициям.\n\nИзбранные товары отображаются отдельным списком с возможностью сортировки по различным параметрам. Каждый пользователь имеет свой собственный список избранного, который не виден другим сотрудникам.\n\nЭтот раздел особенно полезен для кассиров и менеджеров, которые регулярно работают с определённым набором товаров. Быстрый доступ экономит время на поиск в большом справочнике.',
    uzDescription:
      '"Sevimli tovarlar" bo\'limi foydalanuvchi tomonidan sevimli deb belgilangan tovarlar ro\'yxatini o\'z ichiga oladi. Bu tez-tez ishlatiladigan pozitsiyalarga tez kirish uchun shaxsiy ro\'yxat.\n\nSevimli tovarlar turli parametrlar bo\'yicha saralash imkoniyati bilan alohida ro\'yxatda ko\'rsatiladi. Har bir foydalanuvchining o\'z sevimlilar ro\'yxati bor, uni boshqa xodimlar ko\'rmaydi.\n\nBu bo\'lim ayniqsa aniq tovarlar to\'plami bilan muntazam ishlaydigan kassirlar va menejerlar uchun foydali. Tez kirish katta ma\'lumotnomada qidirish vaqtini tejaydi.',
    ruFunctionality:
      'Открывает персональный список избранных товаров пользователя с актуальными ценами и остатками. Позволяет быстро добавлять товары в чек или документ одним кликом. Поддерживает drag-and-drop для изменения порядка отображения.',
    uzFunctionality:
      'Dolzarb narxlar va qoldiqlar bilan foydalanuvchining shaxsiy sevimli tovarlar ro\'yxatini ochadi. Tovarlarni bir marta bosish bilan chek yoki hujjatga tez qo\'shish imkonini beradi. Ko\'rsatish tartibini o\'zgartirish uchun drag-and-drop qo\'llab-quvvatlaydi.',
  },
  {
    order: 92,
    ruDescription:
      'Кнопка удаления из избранного убирает товар из персонального списка быстрых товаров. Это позволяет поддерживать актуальность списка избранного.\n\nУдаление из избранного не влияет на сам товар в справочнике — он остаётся доступным для поиска и использования. Можно повторно добавить товар в избранное в любой момент.\n\nРекомендуется периодически очищать список избранного от товаров, которые перестали использоваться регулярно. Это ускоряет работу с актуальными позициями.',
    uzDescription:
      'Sevimlilardan o\'chirish tugmasi tovarni shaxsiy tez tovarlar ro\'yxatidan olib tashlaydi. Bu sevimlilar ro\'yxatining dolzarbligini saqlash imkonini beradi.\n\nSevimlilardan o\'chirish ma\'lumotnomadagi tovarning o\'ziga ta\'sir qilmaydi — u qidirish va foydalanish uchun mavjud bo\'lib qoladi. Tovarni istalgan vaqtda qayta sevimlilarga qo\'shish mumkin.\n\nMuntazam ishlatilishdan to\'xtagan tovarlardan sevimlilar ro\'yxatini vaqti-vaqti bilan tozalash tavsiya etiladi. Bu dolzarb pozitsiyalar bilan ishlashni tezlashtiradi.',
    ruFunctionality:
      'Удаляет выбранный товар из списка избранного текущего пользователя. Подтверждает действие перед удалением для предотвращения ошибок. Автоматически обновляет список и сохраняет изменения без перезагрузки страницы.',
    uzFunctionality:
      'Tanlangan tovarni joriy foydalanuvchining sevimlilar ro\'yxatidan o\'chiradi. Xatolarning oldini olish uchun o\'chirishdan oldin harakatni tasdiqlaydi. Ro\'yxatni avtomatik yangilaydi va sahifani qayta yuklamasdan o\'zgarishlarni saqlaydi.',
  },
  {
    order: 93,
    ruDescription:
      'Кнопка добавления всех товаров в чек позволяет одним действием перенести все избранные товары в документ продажи. Это ускоряет формирование типовых заказов.\n\nПри нажатии система добавляет все товары из списка избранного в текущий чек с количеством по умолчанию (обычно одна единица). После добавления можно скорректировать количество каждого товара.\n\nФункция особенно полезна для оптовых клиентов с постоянным набором заказываемых товаров. Это экономит время на построчное добавление позиций.',
    uzDescription:
      'Barcha tovarlarni chekka qo\'shish tugmasi bitta harakat bilan barcha sevimli tovarlarni sotuv hujjatiga ko\'chirish imkonini beradi. Bu tipik buyurtmalarni shakllantirishni tezlashtiradi.\n\nBosilganda tizim sevimlilar ro\'yxatidagi barcha tovarlarni joriy chekka standart miqdor bilan (odatda bitta birlik) qo\'shadi. Qo\'shilgandan so\'ng har bir tovar miqdorini tuzatish mumkin.\n\nFunktsiya ayniqsa buyurtma qilinadigan tovarlarning doimiy to\'plami bo\'lgan ulgurji mijozlar uchun foydali. Bu pozitsiyalarni satr bo\'yicha qo\'shish vaqtini tejaydi.',
    ruFunctionality:
      'Добавляет все товары из списка избранного в текущий открытый чек. Устанавливает количество по умолчанию и применяет стандартные скидки клиента. Показывает уведомление о количестве добавленных товаров и общей сумме.',
    uzFunctionality:
      'Sevimlilar ro\'yxatidagi barcha tovarlarni joriy ochiq chekka qo\'shadi. Standart miqdorni o\'rnatadi va mijozning standart chegirmalarini qo\'llaydi. Qo\'shilgan tovarlar soni va umumiy summa haqida bildirishnoma ko\'rsatadi.',
  },

  // === СПРАВОЧНИК: ПЕРСОНАЛ (94-100) ===
  {
    order: 94,
    ruDescription:
      'Раздел "Персонал" предназначен для управления сотрудниками организации. Это центральное место для ведения кадрового учёта и настройки прав доступа.\n\nВ разделе отображается список всех сотрудников с информацией о должности, статусе работы и контактных данных. Сотрудников можно фильтровать по должности, подразделению и статусу.\n\nОтсюда осуществляется управление правами доступа, назначение PIN-кодов для кассы и просмотр истории работы каждого сотрудника.',
    uzDescription:
      '"Personal" bo\'limi tashkilot xodimlarini boshqarish uchun mo\'ljallangan. Bu kadrlar hisobini yuritish va kirish huquqlarini sozlash uchun markaziy joy.\n\nBo\'limda lavozim, ish holati va aloqa ma\'lumotlari haqida ma\'lumot bilan barcha xodimlar ro\'yxati ko\'rsatiladi. Xodimlarni lavozim, bo\'linma va holat bo\'yicha filtrlash mumkin.\n\nBu yerdan kirish huquqlarini boshqarish, kassa uchun PIN-kodlarni tayinlash va har bir xodimning ish tarixini ko\'rish amalga oshiriladi.',
    ruFunctionality:
      'Открывает реестр сотрудников с полным набором кадровых функций. Позволяет добавлять, редактировать и увольнять сотрудников. Предоставляет доступ к настройке прав, PIN-кодов и просмотру статистики работы.',
    uzFunctionality:
      'To\'liq kadrlar funktsiyalari to\'plami bilan xodimlar registrini ochadi. Xodimlarni qo\'shish, tahrirlash va ishdan bo\'shatish imkonini beradi. Huquqlarni sozlash, PIN-kodlarni belgilash va ish statistikasini ko\'rishga kirish beradi.',
  },
  {
    order: 95,
    ruDescription:
      'Кнопка добавления сотрудника открывает форму для создания карточки нового работника. Это первый шаг при приёме сотрудника на работу.\n\nВ форме необходимо указать личные данные: ФИО, телефон, email, а также рабочую информацию: должность, подразделение, график работы. Все поля валидируются для предотвращения ошибок.\n\nПосле сохранения сотрудник появляется в общем списке и ему можно назначить права доступа и PIN-код для работы на кассе.',
    uzDescription:
      'Xodim qo\'shish tugmasi yangi ishchi kartochkasini yaratish uchun formani ochadi. Bu xodimni ishga qabul qilishda birinchi qadam.\n\nFormada shaxsiy ma\'lumotlarni ko\'rsatish kerak: FISH, telefon, email, shuningdek ish ma\'lumotlari: lavozim, bo\'linma, ish grafik. Xatolarning oldini olish uchun barcha maydonlar tasdiqlanadi.\n\nSaqlangandan so\'ng xodim umumiy ro\'yxatda paydo bo\'ladi va unga kirish huquqlari va kassada ishlash uchun PIN-kod tayinlash mumkin.',
    ruFunctionality:
      'Открывает комплексную форму создания сотрудника с вкладками для личных и рабочих данных. Позволяет сразу назначить должность с предустановленными правами доступа. Автоматически генерирует PIN-код или позволяет задать вручную.',
    uzFunctionality:
      'Shaxsiy va ish ma\'lumotlari uchun yorliqlar bilan xodim yaratishning kompleks formasini ochadi. Darhol oldindan o\'rnatilgan kirish huquqlari bilan lavozim tayinlash imkonini beradi. PIN-kodni avtomatik yaratadi yoki qo\'lda belgilashga ruxsat beradi.',
  },
  {
    order: 96,
    ruDescription:
      'Поле должности сотрудника позволяет указать занимаемую позицию в организации. От должности зависят права доступа к разделам системы.\n\nПри выборе должности система автоматически применяет предустановленный набор прав доступа. Это упрощает настройку — не нужно вручную назначать каждое разрешение.\n\nДолжности настраиваются администратором и могут быть изменены в процессе работы. История изменения должностей сохраняется в карточке сотрудника.',
    uzDescription:
      'Xodim lavozimi maydoni tashkilotdagi egallab turgan pozitsiyasini ko\'rsatish imkonini beradi. Lavozimdan tizim bo\'limlariga kirish huquqlari bog\'liq.\n\nLavozim tanlanganda tizim oldindan o\'rnatilgan kirish huquqlari to\'plamini avtomatik qo\'llaydi. Bu sozlashni soddalashtiradi — har bir ruxsatni qo\'lda tayinlash shart emas.\n\nLavozimlar administrator tomonidan sozlanadi va ish jarayonida o\'zgartirilishi mumkin. Lavozimlarni o\'zgartirish tarixi xodim kartochkasida saqlanadi.',
    ruFunctionality:
      'Открывает список должностей с автоматическим применением связанных прав доступа. Показывает описание должности и перечень доступных функций при выборе. Позволяет изменять должность с пересчётом прав доступа.',
    uzFunctionality:
      'Bog\'liq kirish huquqlarini avtomatik qo\'llash bilan lavozimlar ro\'yxatini ochadi. Tanlashda lavozim tavsifini va mavjud funktsiyalar ro\'yxatini ko\'rsatadi. Kirish huquqlarini qayta hisoblash bilan lavozimni o\'zgartirish imkonini beradi.',
  },
  {
    order: 97,
    ruDescription:
      'Раздел прав доступа позволяет детально настроить, какие функции системы доступны конкретному сотруднику. Это важный инструмент информационной безопасности.\n\nПрава группируются по разделам: склад, продажи, финансы, отчёты, настройки. Можно дать полный доступ к разделу, только просмотр или полностью запретить.\n\nИзменение прав доступа логируется и требует подтверждения администратора. Рекомендуется регулярно пересматривать права доступа для поддержания безопасности.',
    uzDescription:
      'Kirish huquqlari bo\'limi aniq xodim uchun tizimning qaysi funktsiyalari mavjudligini batafsil sozlash imkonini beradi. Bu axborot xavfsizligining muhim vositasi.\n\nHuquqlar bo\'limlar bo\'yicha guruhlanadi: ombor, savdo, moliya, hisobotlar, sozlamalar. Bo\'limga to\'liq kirish, faqat ko\'rish yoki butunlay taqiqlash mumkin.\n\nKirish huquqlarini o\'zgartirish jurnalga yoziladi va administrator tasdiqini talab qiladi. Xavfsizlikni saqlash uchun kirish huquqlarini muntazam ko\'rib chiqish tavsiya etiladi.',
    ruFunctionality:
      'Открывает детальную матрицу прав доступа с чекбоксами для каждого разрешения. Позволяет быстро включать и отключать группы прав. Показывает эффективные права с учётом должности и индивидуальных настроек.',
    uzFunctionality:
      'Har bir ruxsat uchun checkboxlar bilan batafsil kirish huquqlari matritsasini ochadi. Huquqlar guruhlarini tez yoqish va o\'chirish imkonini beradi. Lavozim va shaxsiy sozlamalarni hisobga olgan holda samarali huquqlarni ko\'rsatadi.',
  },
  {
    order: 98,
    ruDescription:
      'Поле PIN-кода сотрудника задаёт числовой код для быстрой авторизации на кассе. Это альтернатива вводу логина и пароля для кассиров.\n\nPIN-код должен быть уникальным в пределах организации. Система проверяет уникальность и предупреждает о дубликатах. Рекомендуется использовать не менее 4 цифр для безопасности.\n\nPIN-код используется для открытия смены, оформления чеков и выполнения других операций на кассе. Сотрудник может изменить свой PIN-код самостоятельно.',
    uzDescription:
      'Xodim PIN-kodi maydoni kassada tez avtorizatsiya uchun raqamli kodni belgilaydi. Bu kassirlar uchun login va parol kiritishga muqobil.\n\nPIN-kod tashkilot doirasida noyob bo\'lishi kerak. Tizim noyoblikni tekshiradi va dublikatlar haqida ogohlantiradi. Xavfsizlik uchun kamida 4 ta raqamdan foydalanish tavsiya etiladi.\n\nPIN-kod smena ochish, cheklarni rasmiylashtirish va kassada boshqa operatsiyalarni bajarish uchun ishlatiladi. Xodim o\'z PIN-kodini mustaqil o\'zgartirishi mumkin.',
    ruFunctionality:
      'Позволяет задать или изменить PIN-код сотрудника для кассы. Проверяет уникальность PIN-кода и его соответствие требованиям безопасности. Автоматически обновляет PIN на всех связанных устройствах.',
    uzFunctionality:
      'Kassa uchun xodimning PIN-kodini belgilash yoki o\'zgartirish imkonini beradi. PIN-kodning noyobligini va xavfsizlik talablariga mosligini tekshiradi. Barcha bog\'liq qurilmalarda PIN-ni avtomatik yangilaydi.',
  },
  {
    order: 99,
    ruDescription:
      'Кнопка увольнения сотрудника оформляет прекращение трудовых отношений. Это важная кадровая операция, требующая корректного оформления.\n\nПри увольнении система деактивирует учётную запись сотрудника, но сохраняет всю историю его работы. Документы, созданные сотрудником, остаются в системе с указанием автора.\n\nУволенный сотрудник немедленно теряет доступ ко всем системам. При необходимости его можно восстановить на работу с сохранением истории.',
    uzDescription:
      'Xodimni ishdan bo\'shatish tugmasi mehnat munosabatlarining tugatilishini rasmiylashtiradi. Bu to\'g\'ri rasmiylashtirishni talab qiluvchi muhim kadrlar operatsiyasi.\n\nIshdan bo\'shatishda tizim xodim akkauntini o\'chiradi, lekin uning ish tarixini to\'liq saqlaydi. Xodim yaratgan hujjatlar tizimda muallif ko\'rsatilgan holda qoladi.\n\nIshdan bo\'shatilgan xodim darhol barcha tizimlarga kirishni yo\'qotadi. Zarurat bo\'lsa, uni tarixni saqlab ishga qayta tiklash mumkin.',
    ruFunctionality:
      'Оформляет увольнение с указанием даты и причины. Деактивирует учётные данные и закрывает все активные сессии сотрудника. Сохраняет историю работы и архивные данные для отчётности.',
    uzFunctionality:
      'Sana va sababni ko\'rsatgan holda ishdan bo\'shatishni rasmiylashtiradi. Akkaunt ma\'lumotlarini o\'chiradi va xodimning barcha faol sessiyalarini yopadi. Hisobot uchun ish tarixini va arxiv ma\'lumotlarini saqlaydi.',
  },
  {
    order: 100,
    ruDescription:
      'Вкладка истории работы показывает полную информацию о деятельности сотрудника в системе. Это важно для анализа эффективности и разрешения спорных ситуаций.\n\nИстория включает все смены сотрудника, суммы продаж, средний чек, количество чеков и другие показатели. Данные можно фильтровать по периоду и анализировать динамику.\n\nИстория хранится неограниченное время и доступна даже после увольнения сотрудника. Это обеспечивает прозрачность и возможность аудита.',
    uzDescription:
      'Ish tarixi yorlig\'i xodimning tizimdagi faoliyati haqida to\'liq ma\'lumotni ko\'rsatadi. Bu samaradorlikni tahlil qilish va bahsli vaziyatlarni hal qilish uchun muhim.\n\nTarix xodimning barcha smenalarini, sotuvlar summasini, o\'rtacha chekni, cheklar sonini va boshqa ko\'rsatkichlarni o\'z ichiga oladi. Ma\'lumotlarni davr bo\'yicha filtrlash va dinamikani tahlil qilish mumkin.\n\nTarix cheksiz vaqt saqlanadi va xodim ishdan bo\'shatilgandan keyin ham mavjud. Bu shaffoflik va auditoriya imkoniyatini ta\'minlaydi.',
    ruFunctionality:
      'Открывает детальную хронологию работы сотрудника с графиками и таблицами. Позволяет экспортировать данные в Excel для детального анализа. Показывает сравнение со средними показателями по организации.',
    uzFunctionality:
      'Grafiklar va jadvallar bilan xodim ishining batafsil xronologiyasini ochadi. Batafsil tahlil uchun ma\'lumotlarni Excelga eksport qilish imkonini beradi. Tashkilot bo\'yicha o\'rtacha ko\'rsatkichlar bilan solishtirishni ko\'rsatdi.',
  },

  // === СПРАВОЧНИК: ВОДИТЕЛИ (101-103) ===
  {
    order: 101,
    ruDescription:
      'Раздел "Водители" предназначен для управления водителями доставки. Это важный инструмент для организаций, занимающихся доставкой товаров.\n\nВ разделе отображается список водителей с информацией о транспортном средстве, статусе и контактных данных. Можно отслеживать текущее местоположение водителей через интеграцию с навигацией.\n\nСистема позволяет назначать водителей на заказы и отслеживать выполнение доставок. Это повышает эффективность логистики и улучшает сервис для клиентов.',
    uzDescription:
      '"Haydovchilar" bo\'limi yetkazib berish haydovchilarini boshqarish uchun mo\'ljallangan. Bu tovar yetkazib berish bilan shug\'ullanuvchi tashkilotlar uchun muhim vosita.\n\nBo\'limda transport vositasi, holat va aloqa ma\'lumotlari haqida ma\'lumot bilan haydovchilar ro\'yxati ko\'rsatiladi. Navigatsiya bilan integratsiya orqali haydovchilarning joriy joylashuvini kuzatish mumkin.\n\nTizim haydovchilarni buyurtmalarga tayinlash va yetkazib berishlarning bajarilishini kuzatish imkonini beradi. Bu logistika samaradorligini oshiradi va mijozlar uchun xizmatni yaxshilaydi.',
    ruFunctionality:
      'Открывает реестр водителей с информацией о назначенных доставках. Позволяет добавлять новых водителей и привязывать их к транспортным средствам. Показывает статус доступности и текущие задания каждого водителя.',
    uzFunctionality:
      'Tayinlangan yetkazib berishlar haqida ma\'lumot bilan haydovchilar registrini ochadi. Yangi haydovchilarni qo\'shish va ularni transport vositalariga biriktirish imkonini beradi. Har bir haydovchining mavjudlik holati va joriy vazifalarini ko\'rsatadi.',
  },
  {
    order: 102,
    ruDescription:
      'Кнопка добавления водителя открывает форму для создания карточки нового водителя. Это первый шаг при найме водителя для доставки.\n\nВ форме необходимо указать личные данные водителя, данные водительского удостоверения и информацию о транспортном средстве. Все данные сохраняются в защищённом виде.\n\nПосле создания карточки водителя ему можно назначать заказы на доставку. Система будет учитывать его местоположение и загруженность.',
    uzDescription:
      'Haydovchi qo\'shish tugmasi yangi haydovchi kartochkasini yaratish uchun formani ochadi. Bu yetkazib berish uchun haydovchi yollashda birinchi qadam.\n\nFormada haydovchining shaxsiy ma\'lumotlari, haydovchilik guvohnomasi ma\'lumotlari va transport vositasi haqida ma\'lumot ko\'rsatish kerak. Barcha ma\'lumotlar himoyalangan shaklda saqlanadi.\n\nHaydovchi kartochkasi yaratilgandan so\'ng unga yetkazib berish buyurtmalarini tayinlash mumkin. Tizim uning joylashuvi va bandligini hisobga oladi.',
    ruFunctionality:
      'Открывает форму создания карточки водителя с полями для личных данных и информации об автомобиле. Позволяет загрузить документы: права, паспорт, страховку. Автоматически проверяет уникальность и валидирует данные.',
    uzFunctionality:
      'Shaxsiy ma\'lumotlar va avtomobil haqida ma\'lumot maydonlari bilan haydovchi kartochkasini yaratish formasini ochadi. Hujjatlarni yuklash imkonini beradi: huquqlar, pasport, sug\'urta. Noyoblikni avtomatik tekshiradi va ma\'lumotlarni tasdiqlaydi.',
  },
  {
    order: 103,
    ruDescription:
      'Функция привязки к автомобилю связывает водителя с конкретным транспортным средством. Это необходимо для планирования доставок и учёта расходов.\n\nПри привязке указывается марка, модель, госномер и грузоподъёмность автомобиля. Эти данные используются при распределении заказов по водителям.\n\nИстория привязки сохраняется, что позволяет анализировать эффективность использования автопарка. Один водитель может быть привязан к нескольким автомобилям с учётом графика.',
    uzDescription:
      'Avtomobilga biriktirish funksiyasi haydovchini aniq transport vositasi bilan bog\'laydi. Bu yetkazib berishlarni rejalashtirish va xarajatlarni hisoblash uchun zarur.\n\nBiriktirishda avtomobilning markasi, modeli, davlat raqami va yuk ko\'tarish qobiliyati ko\'rsatiladi. Bu ma\'lumotlar buyurtmalarni haydovchilar o\'rtasida taqsimlashda ishlatiladi.\n\nBiriktirish tarixi saqlanadi, bu avtoparkdan foydalanish samaradorligini tahlil qilish imkonini beradi. Bitta haydovchi grafikni hisobga olgan holda bir nechta avtomobilga biriktirilishi mumkin.',
    ruFunctionality:
      'Позволяет выбрать автомобиль из справочника или создать новую запись. Автоматически проверяет свободность автомобиля на указанный период. Показывает историю использования автомобиля другими водителями.',
    uzFunctionality:
      'Ma\'lumotnomadan avtomobilni tanlash yoki yangi yozuv yaratish imkonini beradi. Ko\'rsatilgan davrda avtomobilning bo\'sh ekanligini avtomatik tekshiradi. Avtomobildan boshqa haydovchilar tomonidan foydalanish tarixini ko\'rsatadi.',
  },

  // === СПРАВОЧНИК: СМЕНЫ (104-108) ===
  {
    order: 104,
    ruDescription:
      'Раздел "Смены" предназначен для управления рабочими сменами на кассах. Это ключевой инструмент контроля работы персонала и денежных средств.\n\nВ разделе отображается список всех смен с информацией о кассе, кассире, времени открытия и закрытия, а также сумме выручки. Можно фильтровать смены по различным параметрам.\n\nПравильное ведение смен обеспечивает контроль за денежными средствами и соответствие фискальному законодательству. Каждая смена должна быть закрыта Z-отчётом.',
    uzDescription:
      '"Smenalar" bo\'limi kassalardagi ish smenalarini boshqarish uchun mo\'ljallangan. Bu xodimlar ishini va pul mablag\'larini nazorat qilishning asosiy vositasi.\n\nBo\'limda kassa, kassir, ochilish va yopilish vaqti hamda tushum summasi haqida ma\'lumot bilan barcha smenalar ro\'yxati ko\'rsatiladi. Smenalarni turli parametrlar bo\'yicha filtrlash mumkin.\n\nSmenalarni to\'g\'ri yuritish pul mablag\'lari ustidan nazoratni va fiskal qonunchilikka moslikni ta\'minlaydi. Har bir smena Z-hisobot bilan yopilishi kerak.',
    ruFunctionality:
      'Открывает реестр смен с детальной информацией о каждой. Позволяет открывать и закрывать смены, просматривать сводную информацию. Показывает статус каждой смены: открыта, закрыта, просрочена.',
    uzFunctionality:
      'Har bir smena haqida batafsil ma\'lumot bilan smenalar registrini ochadi. Smenalarni ochish va yopish, umumiy ma\'lumotni ko\'rish imkonini beradi. Har bir smena holatini ko\'rsatadi: ochiq, yopiq, muddati o\'tgan.',
  },
  {
    order: 105,
    ruDescription:
      'Кнопка открытия смены инициирует новую рабочую смену на выбранной кассе. Это обязательная процедура перед началом продаж.\n\nПри открытии смены кассир вводит свой PIN-код и указывает начальный остаток денежных средств в кассе. Система фиксирует время открытия и связывает смену с конкретным кассиром.\n\nОткрытая смена позволяет проводить продажи, принимать оплаты и выдавать чеки. Без открытой смены касса не функционирует.',
    uzDescription:
      'Smena ochish tugmasi tanlangan kassada yangi ish smenasini boshlaydi. Bu sotuvlarni boshlashdan oldin majburiy protsedura.\n\nSmena ochishda kassir o\'z PIN-kodini kiritadi va kassadagi pul mablag\'larining boshlang\'ich qoldig\'ini ko\'rsatadi. Tizim ochilish vaqtini belgilaydi va smenani aniq kassir bilan bog\'laydi.\n\nOchiq smena sotuvlarni o\'tkazish, to\'lovlarni qabul qilish va cheklar berish imkonini beradi. Ochiq smena bo\'lmasa kassa ishlamaydi.',
    ruFunctionality:
      'Инициирует открытие новой смены на выбранной кассе с авторизацией кассира. Запрашивает ввод начального остатка и проверяет корректность данных. Регистрирует открытие в фискальном накопителе.',
    uzFunctionality:
      'Kassir avtorizatsiyasi bilan tanlangan kassada yangi smena ochishni boshlaydi. Boshlang\'ich qoldiq kiritishni so\'raydi va ma\'lumotlarning to\'g\'riligini tekshiradi. Ochilishni fiskal hotirada ro\'yxatdan o\'tkazadi.',
  },
  {
    order: 106,
    ruDescription:
      'Кнопка закрытия смены завершает рабочую смену и формирует Z-отчёт. Это обязательная процедура в конце рабочего дня.\n\nПри закрытии кассир пересчитывает денежные средства и сверяет с суммой в системе. Расхождения фиксируются и требуют объяснения. Система формирует итоговый отчёт по всем операциям за смену.\n\nЗакрытая смена блокирует возможность проведения новых операций. Все данные передаются в фискальный накопитель и налоговую систему.',
    uzDescription:
      'Smena yopish tugmasi ish smenasini tugatadi va Z-hisobot shakllantiradi. Bu ish kunining oxirida majburiy protsedura.\n\nYopishda kassir pul mablag\'larini qayta hisoblaydi va tizimdagi summa bilan solishtiradi. Farqlar qayd etiladi va tushuntirish talab qilinadi. Tizim smena davomidagi barcha operatsiyalar bo\'yicha yakuniy hisobot shakllantiradi.\n\nYopilgan smena yangi operatsiyalarni o\'tkazish imkoniyatini bloklaydi. Barcha ma\'lumotlar fiskal hotiraga va soliq tizimiga uzatiladi.',
    ruFunctionality:
      'Инициирует процедуру закрытия смены с пересчётом денежных средств. Формирует Z-отчёт и отправляет данные в ОФД. Фиксирует расхождения и требует объяснений при необходимости.',
    uzFunctionality:
      'Pul mablag\'larini qayta hisoblash bilan smena yopish protsedurasini boshlaydi. Z-hisobot shakllantiradi va ma\'lumotlarni OFD ga yuboradi. Farqlarni qayd etadi va zarurat bo\'lganda tushuntirish talab qiladi.',
  },
  {
    order: 107,
    ruDescription:
      'Поле выручки за смену показывает общую сумму продаж, проведённых в течение смены. Это ключевой показатель эффективности работы кассира.\n\nВыручка рассчитывается автоматически как сумма всех чеков за смену. Учитываются наличные и безналичные оплаты, а также возвраты. Можно посмотреть детализацию по видам оплаты.\n\nСравнение выручки разных смен позволяет анализировать эффективность работы персонала и популярность торговой точки в разное время.',
    uzDescription:
      'Smena tushumi maydoni smena davomida o\'tkazilgan sotuvlarning umumiy summasini ko\'rsatadi. Bu kassir ishi samaradorligining asosiy ko\'rsatkichi.\n\nTushum smena davomidagi barcha cheklar summasi sifatida avtomatik hisoblanadi. Naqd va naqdsiz to\'lovlar, shuningdek qaytarishlar hisobga olinadi. To\'lov turlari bo\'yicha batafsil ma\'lumotni ko\'rish mumkin.\n\nTurli smenalarning tushumlarini solishtirish xodimlar ishi samaradorligini va savdo nuqtasining turli vaqtlarda mashhurligini tahlil qilish imkonini beradi.',
    ruFunctionality:
      'Отображает сумму выручки в режиме реального времени с разбивкой по видам оплаты. Позволяет сравнить с плановыми показателями и средними значениями. Показывает динамику выручки в течение смены.',
    uzFunctionality:
      'To\'lov turlari bo\'yicha parchalash bilan real vaqt rejimida tushum summasini ko\'rsatadi. Reja ko\'rsatkichlari va o\'rtacha qiymatlar bilan solishtirish imkonini beradi. Smena davomida tushum dinamikasini ko\'rsatadi.',
  },
  {
    order: 108,
    ruDescription:
      'Фильтр смен по кассе позволяет отобрать смены для конкретной кассы или торговой точки. Это необходимо при анализе работы отдельных подразделений.\n\nПри выборе кассы система показывает только смены, открытые на этом устройстве. Можно выбрать несколько касс одновременно для сравнительного анализа.\n\nФильтр особенно полезен для менеджеров, контролирующих несколько торговых точек. Можно настроить фильтр по умолчанию для быстрого доступа к нужным данным.',
    uzDescription:
      'Smenalarni kassa bo\'yicha filtr aniq kassa yoki savdo nuqtasi uchun smenalarni tanlash imkonini beradi. Bu alohida bo\'linmalarning ishini tahlil qilishda zarur.\n\nKassa tanlanganda tizim faqat ushbu qurilmada ochilgan smenalarni ko\'rsatadi. Qiyosiy tahlil uchun bir vaqtning o\'zida bir nechta kassani tanlash mumkin.\n\nFiltr ayniqsa bir nechta savdo nuqtalarini nazorat qiluvchi menejerlar uchun foydali. Kerakli ma\'lumotlarga tez kirish uchun filtrni standart qilib sozlash mumkin.',
    ruFunctionality:
      'Открывает список касс с возможностью множественного выбора. Фильтрует список смен по выбранным кассам. Показывает статистику по каждой кассе в отфильтрованном списке.',
    uzFunctionality:
      'Ko\'p tanlov imkoniyati bilan kassalar ro\'yxatini ochadi. Tanlangan kassalar bo\'yicha smenalar ro\'yxatini filtrlaydi. Filtrlangan ro\'yxatda har bir kassa bo\'yicha statistikani ko\'rsatadi.',
  },

  // === СПРАВОЧНИК: Z-ОТЧЁТЫ (109-111) ===
  {
    order: 109,
    ruDescription:
      'Раздел "Z-отчёты" содержит архив фискальных отчётов, сформированных при закрытии смен. Это важный документ для налоговой отчётности.\n\nZ-отчёт содержит итоговую информацию о продажах за смену: общая сумма, количество чеков, суммы по видам оплаты. Каждый отчёт имеет уникальный номер и дату формирования.\n\nСистема хранит Z-отчёты за весь период работы и позволяет распечатать копию любого отчёта. Это обеспечивает соответствие требованиям фискального законодательства.',
    uzDescription:
      '"Z-hisobotlar" bo\'limi smena yopilganda shakllantirilgan fiskal hisobotlar arxivini o\'z ichiga oladi. Bu soliq hisoboti uchun muhim hujjat.\n\nZ-hisobot smena davomidagi sotuvlar haqida yakuniy ma\'lumotni o\'z ichiga oladi: umumiy summa, cheklar soni, to\'lov turlari bo\'yicha summalar. Har bir hisobot noyob raqam va shakllantirish sanasiga ega.\n\nTizim butun ish davri uchun Z-hisobotlarni saqlaydi va har qanday hisobot nusxasini chop etish imkonini beradi. Bu fiskal qonunchilik talablariga moslikni ta\'minlaydi.',
    ruFunctionality:
      'Открывает архив Z-отчётов с возможностью поиска по номеру и дате. Показывает детальное содержание каждого отчёта. Позволяет экспортировать данные для бухгалтерской отчётности.',
    uzFunctionality:
      'Raqam va sana bo\'yicha qidiruv imkoniyati bilan Z-hisobotlar arxivini ochadi. Har bir hisobotning batafsil tarkibini ko\'rsatadi. Buxgalteriya hisoboti uchun ma\'lumotlarni eksport qilish imkonini beradi.',
  },
  {
    order: 110,
    ruDescription:
      'Кнопка печати Z-отчёта выводит на печать копию фискального документа. Это необходимо для архивного хранения и предоставления в контролирующие органы.\n\nПечатная форма содержит всю информацию из электронного Z-отчёта: номер, дата, суммы, количество операций. Формат соответствует требованиям налогового законодательства.\n\nРекомендуется распечатывать Z-отчёты ежедневно и хранить в архиве вместе с другими кассовыми документами. Это обеспечивает готовность к проверкам.',
    uzDescription:
      'Z-hisobotni chop etish tugmasi fiskal hujjat nusxasini chop etishga yuboradi. Bu arxivda saqlash va nazorat qiluvchi organlarga taqdim etish uchun zarur.\n\nBosma shakl elektron Z-hisobotdan barcha ma\'lumotlarni o\'z ichiga oladi: raqam, sana, summalar, operatsiyalar soni. Format soliq qonunchiligi talablariga mos keladi.\n\nZ-hisobotlarni kunda chop etib, boshqa kassa hujjatlari bilan birga arxivda saqlash tavsiya etiladi. Bu tekshiruvlarga tayyorlikni ta\'minlaydi.',
    ruFunctionality:
      'Формирует печатную форму Z-отчёта на основе данных из фискального накопителя. Позволяет выбрать принтер и количество копий. Сохраняет информацию о печати в журнале действий.',
    uzFunctionality:
      'Fiskal hotiradagi ma\'lumotlar asosida Z-hisobotning bosma shaklini yaratadi. Printerni va nusxalar sonini tanlash imkonini beradi. Chop etish haqida ma\'lumotni harakatlar jurnalida saqlaydi.',
  },
  {
    order: 111,
    ruDescription:
      'Кнопка отправки в ОФД передаёт фискальные данные в Оператор фискальных данных для последующей передачи в налоговую. Это требование законодательства о применении ККТ.\n\nОтправка происходит автоматически при закрытии смены, но можно инициировать повторную отправку при необходимости. Система подтверждает успешную передачу и фиксирует время.\n\nСтатус отправки отображается для каждого Z-отчёта. При отсутствии интернета данные сохраняются в фискальном накопителе и отправляются при восстановлении связи.',
    uzDescription:
      'OFD ga yuborish tugmasi fiskal ma\'lumotlarni keyinchalik soliq organiga uzatish uchun Fiskal ma\'lumotlar operatoriga yuboradi. Bu KKT qo\'llash to\'g\'risidagi qonunchilik talabi.\n\nYuborish smena yopilganda avtomatik amalga oshiriladi, lekin zarurat bo\'lganda qayta yuborishni boshlash mumkin. Tizim muvaffaqiyatli uzatishni tasdiqlaydi va vaqtni belgilaydi.\n\nHar bir Z-hisobot uchun yuborish holati ko\'rsatiladi. Internet bo\'lmaganda ma\'lumotlar fiskal hotirada saqlanadi va aloqa tiklanganda yuboriladi.',
    ruFunctionality:
      'Инициирует передачу фискальных данных в ОФД через защищённое соединение. Проверяет статус подключения и подтверждает успешную передачу. Фиксирует время и результат отправки в системе.',
    uzFunctionality:
      'Himoyalangan ulanish orqali fiskal ma\'lumotlarni OFD ga uzatishni boshlaydi. Ulanish holatini tekshiradi va muvaffaqiyatli uzatishni tasdiqlaydi. Tizimda yuborish vaqtini va natijasini belgilaydi.',
  },

  // === СПРАВОЧНИК: ПЕЧАТЬ ЦЕННИКОВ (112-114) ===
  {
    order: 112,
    ruDescription:
      'Раздел "Печать ценников" предназначен для массового формирования и печати ценников для товаров. Это необходимо для оформления торгового зала.\n\nВ разделе можно выбрать товары для печати ценников, настроить шаблон и отправить на печать. Поддерживаются различные форматы: от маленьких этикеток до крупных плакатов.\n\nПравильное оформление ценников обязательно в соответствии с законодательством о защите прав потребителей. Ценник должен содержать наименование, цену и единицу измерения.',
    uzDescription:
      '"Narx yorliqlarini chop etish" bo\'limi tovarlar uchun narx yorliqlarini ommaviy shakllantirish va chop etish uchun mo\'ljallangan. Bu savdo zalini bezash uchun zarur.\n\nBo\'limda narx yorliqlarini chop etish uchun tovarlarni tanlash, shablonni sozlash va chop etishga yuborish mumkin. Turli formatlar qo\'llab-quvvatlanadi: kichik etiketkalardan katta plakatlargacha.\n\nNarx yorliqlarini to\'g\'ri rasmiylashtirish iste\'molchilar huquqlarini himoya qilish to\'g\'risidagi qonunchilikka muvofiq majburiydir. Narx yorlig\'i nom, narx va o\'lchov birligini o\'z ichiga olishi kerak.',
    ruFunctionality:
      'Открывает интерфейс для выбора товаров и настройки печати ценников. Позволяет предварительно просмотреть результат перед печатью. Поддерживает массовую печать для сотен товаров одновременно.',
    uzFunctionality:
      'Tovarlarni tanlash va narx yorliqlarini chop etishni sozlash interfeysini ochadi. Chop etishdan oldin natijani oldindan ko\'rish imkonini beradi. Bir vaqtning o\'zida yuzlab tovarlar uchun ommaviy chop etishni qo\'llab-quvvatlaydi.',
  },
  {
    order: 113,
    ruDescription:
      'Функция выбора шаблона ценника позволяет выбрать формат и дизайн этикетки. Это важно для соответствия требованиям торговой точки и законодательству.\n\nСистема предлагает несколько готовых шаблонов: маленький, средний, крупный, с QR-кодом, с логотипом. Каждый шаблон можно предварительно просмотреть перед выбором.\n\nПри необходимости можно создать собственный шаблон с учётом фирменного стиля организации. Шаблон сохраняется и доступен для повторного использования.',
    uzDescription:
      'Narx yorlig\'i shablonini tanlash funksiyasi etiketka formati va dizaynini tanlash imkonini beradi. Bu savdo nuqtasi talablari va qonunchilikka moslik uchun muhim.\n\nTizim bir nechta tayyor shablonlarni taklif qiladi: kichik, o\'rtacha, katta, QR-kodli, logotipli. Har bir shablonni tanlashdan oldin oldindan ko\'rish mumkin.\n\nZarurat bo\'lganda tashkilotning firmaviy uslubini hisobga olgan holda o\'z shablonini yaratish mumkin. Shablon saqlanadi va qayta foydalanish uchun mavjud.',
    ruFunctionality:
      'Открывает галерею шаблонов ценников с предпросмотром. Позволяет выбрать размер, расположение элементов и дополнительные поля. Поддерживает настройку отступов и размеров для конкретного принтера.',
    uzFunctionality:
      'Oldindan ko\'rish bilan narx yorliqlari shablonlari galereyasini ochadi. O\'lcham, elementlar joylashuvi va qo\'shimcha maydonlarni tanlash imkonini beradi. Aniq printer uchun chekinishlar va o\'lchamlarni sozlashni qo\'llab-quvvatlaydi.',
  },
  {
    order: 114,
    ruDescription:
      'Кнопка печати выбранных ценников отправляет сформированные этикетки на принтер. Это финальный этап процесса печати ценников.\n\nПеред печатью система показывает превью всех выбранных ценников и их общее количество. Можно отменить печать отдельных позиций или изменить порядок печати.\n\nПоддерживается печать на различных типах носителей: обычная бумага, самоклеящиеся этикетки, термобумага. Система автоматически адаптирует макет под выбранный тип.',
    uzDescription:
      'Tanlangan narx yorliqlarini chop etish tugmasi shakllantirilgan etiketkalarni printerga yuboradi. Bu narx yorliqlarini chop etish jarayonining yakuniy bosqichi.\n\nChop etishdan oldin tizim barcha tanlangan narx yorliqlarining oldindan ko\'rishini va ularning umumiy sonini ko\'rsatadi. Alohida pozitsiyalarni chop etishni bekor qilish yoki chop etish tartibini o\'zgartirish mumkin.\n\nTurli turlardagi tashuvchilarda chop etish qo\'llab-quvvatlanadi: oddiy qog\'oz, o\'z-o\'zidan yopishqoq etiketkalar, termoqog\'oz. Tizim tanlangan tur uchun maketni avtomatik moslashtiradi.',
    ruFunctionality:
      'Отправляет выбранные ценники на печать с учётом настроек принтера. Показывает прогресс печати и позволяет приостановить или отменить. Формирует отчёт о успешно напечатанных ценниках.',
    uzFunctionality:
      'Printer sozlamalarini hisobga olgan holda tanlangan narx yorliqlarini chop etishga yuboradi. Chop etish progressini ko\'rsatadi va to\'xtatish yoki bekor qilish imkonini beradi. Muvaffaqiyatli chop etilgan narx yorliqlari haqida hisobot shakllantiradi.',
  },

  // === СПРАВОЧНИК: КЛИЕНТЫ (115-120) ===
  {
    order: 115,
    ruDescription:
      'Раздел "Клиенты" предназначен для управления базой покупателей. Это центральное место для хранения информации о клиентах и их покупках.\n\nВ разделе отображается список всех клиентов с контактными данными, историей покупок, накопленными баллами и задолженностью. Можно искать клиентов по имени, телефону и другим параметрам.\n\nБаза клиентов используется для программы лояльности, рассылок, анализа покупательского поведения и управления дебиторской задолженностью.',
    uzDescription:
      '"Mijozlar" bo\'limi xaridorlar bazasini boshqarish uchun mo\'ljallangan. Bu mijozlar va ularning xaridlari haqida ma\'lumotlarni saqlash uchun markaziy joy.\n\nBo\'limda barcha mijozlar kontakt ma\'lumotlari, xaridlar tarixi, yig\'ilgan ballar va qarz bilan ro\'yxat ko\'rsatiladi. Mijozlarni ism, telefon va boshqa parametrlar bo\'yicha qidirish mumkin.\n\nMijozlar bazasi sodiqlik dasturi, tarqatmalar, xarid xulqini tahlil qilish va debitorlik qarzini boshqarish uchun ishlatiladi.',
    ruFunctionality:
      'Открывает реестр клиентов с полным набором функций управления. Позволяет добавлять, редактировать и искать клиентов. Показывает ключевые показатели: сумму покупок, баллы, долг.',
    uzFunctionality:
      'To\'liq boshqaruv funktsiyalari to\'plami bilan mijozlar registrini ochadi. Mijozlarni qo\'shish, tahrirlash va qidirish imkonini beradi. Asosiy ko\'rsatkichlarni ko\'rsatadi: xaridlar summasi, ballar, qarz.',
  },
  {
    order: 116,
    ruDescription:
      'Кнопка добавления клиента открывает форму для создания карточки нового покупателя. Это первый шаг при регистрации клиента в системе.\n\nВ форме необходимо указать контактные данные: имя, телефон, email. Также можно добавить адрес, дату рождения и другие сведения. Система проверяет уникальность телефона для предотвращения дубликатов.\n\nПосле сохранения клиенту можно присвоить карту лояльности, установить скидку и накопить баллы за покупки.',
    uzDescription:
      'Mijoz qo\'shish tugmasi yangi xaridor kartochkasini yaratish uchun formani ochadi. Bu tizimda mijozni ro\'yxatdan o\'tkazishda birinchi qadam.\n\nFormada kontakt ma\'lumotlarini ko\'rsatish kerak: ism, telefon, email. Shuningdek manzil, tug\'ilgan kun va boshqa ma\'lumotlarni qo\'shish mumkin. Tizim dublikatlarning oldini olish uchun telefon noyobligini tekshiradi.\n\nSaqlangandan so\'ng mijozga sodiqlik kartasini berish, chegirma o\'rnatish va xaridlar uchun ballar yig\'ish mumkin.',
    ruFunctionality:
      'Открывает форму создания клиента с полями для контактных данных. Автоматически проверяет дубликаты по номеру телефона. Позволяет сразу привязать карту лояльности или сгенерировать новую.',
    uzFunctionality:
      'Kontakt ma\'lumotlari maydonlari bilan mijoz yaratish formasini ochadi. Telefon raqami bo\'yicha dublikatlarni avtomatik tekshiradi. Darhol sodiqlik kartasini biriktirish yoki yangisini yaratish imkonini beradi.',
  },
  {
    order: 117,
    ruDescription:
      'Поле поиска клиентов позволяет быстро найти нужного покупателя в базе данных. Это ускоряет обслуживание на кассе и работу менеджеров.\n\nПоиск работает в реальном времени: результаты появляются при вводе первых символов. Система ищет по имени, номеру телефона, номеру карты и другим идентификаторам.\n\nРезультаты сортируются по релевантности и частоте покупок. Это помогает быстрее найти активных клиентов, с которыми работаете чаще всего.',
    uzDescription:
      'Mijozlarni qidirish maydoni bazadan kerakli xaridorni tez topish imkonini beradi. Bu kassada xizmat ko\'rsatish va menejerlar ishini tezlashtiradi.\n\nQidiruv real vaqt rejimida ishlaydi: natijalar birinchi belgilarni kiritishda paydo bo\'ladi. Tizim ism, telefon raqami, karta raqami va boshqa identifikatorlar bo\'yicha qidiradi.\n\nNatijalar dolzarblik va xaridlar chastotasi bo\'yicha saralanadi. Bu eng ko\'p ishlaydigan faol mijozlarni tezroq topishga yordam beradi.',
    ruFunctionality:
      'Обеспечивает мгновенный поиск по базе клиентов с подсветкой совпадений. Поддерживает поиск по частичному совпадению номера телефона. Показывает краткую информацию о клиенте в результатах поиска.',
    uzFunctionality:
      'Mosliklarni belgilash bilan mijozlar bazasida bir zumda qidirishni ta\'minlaydi. Telefon raqamining qisman mosligi bo\'yicha qidiruvni qo\'llab-quvvatlaydi. Qidiruv natijalarida mijoz haqida qisqa ma\'lumot ko\'rsatadi.',
  },
  {
    order: 118,
    ruDescription:
      'История покупок клиента показывает все совершённые операции за всё время. Это важно для анализа покупательского поведения и персонального подхода.\n\nИстория включает дату, сумму, список товаров в каждом чеке и способ оплаты. Можно отфильтровать по периоду, сумме и другим параметрам.\n\nАнализ истории позволяет выявить предпочтения клиента и предложить релевантные товары. Это повышает лояльность и увеличивает средний чек.',
    uzDescription:
      'Mijoz xaridlari tarixi butun davr mobaynida amalga oshirilgan barcha operatsiyalarni ko\'rsatadi. Bu xarid xulqini tahlil qilish va shaxsiy yondashuv uchun muhim.\n\nTarix sana, summa, har bir chekdagi tovarlar ro\'yxati va to\'lov usulini o\'z ichiga oladi. Davr, summa va boshqa parametrlar bo\'yicha filtrlash mumkin.\n\nTarixni tahlil qilish mijoz afzalliklarini aniqlash va dolzarb tovarlarni taklif qilish imkonini beradi. Bu sodiqlikni oshiradi va o\'rtacha chekni kattalashtiradi.',
    ruFunctionality:
      'Открывает детальную хронологию покупок клиента с возможностью детализации. Позволяет открыть любой чек из истории для просмотра состава. Показывает статистику: средний чек, частоту покупок, любимые категории.',
    uzFunctionality:
      'Batafsil ko\'rish imkoniyati bilan mijoz xaridlarining batafsil xronologiyasini ochadi. Tarixdan har qanday chekni tarkibini ko\'rish uchun ochish imkonini beradi. Statistikani ko\'rsatadi: o\'rtacha chek, xaridlar chastotasi, sevimli kategoriyalar.',
  },
  {
    order: 119,
    ruDescription:
      'Поле долга клиента показывает текущую сумму задолженности покупателя перед организацией. Это важно для контроля дебиторской задолженности.\n\nДолг формируется при продаже в долг и уменьшается при погашении. История изменений долга сохраняется с указанием дат и оснований.\n\nМожно настроить уведомления о просроченной задолженности и ограничить возможность новых покупок в долг. Это помогает управлять финансовыми рисками.',
    uzDescription:
      'Mijoz qarzi maydoni xaridorning tashkilot oldidagi joriy qarz summasini ko\'rsatadi. Bu debitorlik qarzini nazorat qilish uchun muhim.\n\nQarz qarzga sotishda shakllanadi va to\'langanda kamayadi. Qarz o\'zgarishlar tarixi sanalar va asoslar ko\'rsatilgan holda saqlanadi.\n\nMuddati o\'tgan qarz haqida bildirishnomalarni sozlash va yangi qarzga xarid qilish imkoniyatini cheklash mumkin. Bu moliyaviy xavflarni boshqarishga yordam beradi.',
    ruFunctionality:
      'Отображает текущую сумму долга с детализацией по документам. Позволяет оформить погашение долга напрямую из карточки клиента. Показывает предупреждение при превышении кредитного лимита.',
    uzFunctionality:
      'Hujjatlar bo\'yicha batafsil ma\'lumot bilan joriy qarz summasini ko\'rsatadi. Mijoz kartochkasidan to\'g\'ridan-to\'g\'ri qarzni to\'lashni rasmiylashtirish imkonini beradi. Kredit limiti oshganda ogohlantirish ko\'rsatadi.',
  },
  {
    order: 120,
    ruDescription:
      'Поле скидки клиента позволяет задать индивидуальный процент скидки для конкретного покупателя. Это инструмент поощрения постоянных клиентов.\n\nИндивидуальная скидка применяется автоматически при оформлении чека для данного клиента. Она суммируется или заменяет скидку по программе лояльности в зависимости от настроек.\n\nМожно изменять скидку в зависимости от объёма покупок или других факторов. История изменений скидки сохраняется для контроля.',
    uzDescription:
      'Mijoz chegirmasi maydoni aniq xaridor uchun individual chegirma foizini belgilash imkonini beradi. Bu doimiy mijozlarni rag\'batlantirish vositasi.\n\nIndividual chegirma ushbu mijoz uchun chek rasmiylashtirilganda avtomatik qo\'llaniladi. U sozlamalarga qarab sodiqlik dasturi bo\'yicha chegirma bilan qo\'shiladi yoki almashtiradi.\n\nXaridlar hajmiga yoki boshqa omillarga qarab chegirmni o\'zgartirish mumkin. Chegirma o\'zgarishlar tarixi nazorat uchun saqlanadi.',
    ruFunctionality:
      'Позволяет задать или изменить индивидуальный процент скидки для клиента. Автоматически применяет скидку при расчёте чека. Показывает эффективную скидку с учётом программы лояльности.',
    uzFunctionality:
      'Mijoz uchun individual chegirma foizini belgilash yoki o\'zgartirish imkonini beradi. Chek hisoblashda chegirm avtomatik qo\'llaniladi. Sodiqlik dasturini hisobga olgan holda samarali chegirmni ko\'rsatadi.',
  },
];

async function main() {
  console.log('Updating lessons 81-120 with detailed descriptions...');

  let updated = 0;
  let notFound = 0;

  for (const lesson of detailedLessons) {
    const result = await prisma.lesson.updateMany({
      where: { order: lesson.order },
      data: {
        ruDescription: lesson.ruDescription,
        uzDescription: lesson.uzDescription,
        ruFunctionality: lesson.ruFunctionality,
        uzFunctionality: lesson.uzFunctionality,
      },
    });

    if (result.count > 0) {
      console.log(`✓ Updated lesson ${lesson.order}`);
      updated++;
    } else {
      console.log(`✗ Lesson ${lesson.order} not found`);
      notFound++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Updated: ${updated}`);
  console.log(`Not found: ${notFound}`);
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
