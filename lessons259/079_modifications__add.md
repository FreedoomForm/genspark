# Urok 079. Модификации / add

**Route:** `/modifications/add`  
**Razdel:** Общее  
**URL:** https://admin.lume.uz/modifications/add

![Screenshot](../shots259/079_modifications__add.png)

## Tsel uroka
Razobrat, dlya chego nuzhen route `/modifications/add` i kak s nim rabotat v admin-paneli Lume.

## Chto eto za stranitsa
Eto forma sozdaniya v razdele «Модификации». Na takih stranitsah obyčno zapolnyayut polya, dobavlyayut dannye i sohranyayut novuyu zapis.

Osnovnoy zagolovok ili samyy zametnyy tekst na ekrane: **990123456**.

## Poshagovyy stsenariy raboty
1. Voydite v admin-panel i otkroyte nuzhnyy route cherez levoye menyu ili pryamoy adres.
2. Proverte verhniye filtry, poisk, knopy sozdaniya ili tablichnyy spisok elementov.
3. Zapolnite obyazatelnyye polya formy.
4. Pri neobhodimosti vibерите svyazannye spravochniki, kategorii ili sklady.
5. Nazhmiте knopku sohraneniya i proverьте, chto novaya zapis poyavilas v spiske.

## Poleznye podskazki
- Esli na stranitse est tablitsa, srazu proveri poisk, filtr i paginatsiyu.
- Parametricheskiye route-y s :id, :name, :type i drugimi segmentami obychno zavisyat ot konkretnoy zapisi v baze.
- Posle sohraneniya proveri, izmenilsya li status, spisok ili kartochka objekta.

## Fragment teksta so stranitsy
```
990123456
749 700 UZS
Начало работы
Счета
Создание, ведение и оплата счетов.
Проданные чеки
Список всех завершённых продаж.
Товары
Добавление, редактирование и поиск товаров.
Приход
Оформление поступления товаров от поставщиков.
Отчет о продаже
Формирование подробных аналитических отчетов.
Товары
Добавление, редактирование и поиск товаров.
Приход
Оформление поступления товаров от поставщиков.
Возврат прихода
```
