# Urok 044. Финансы / Создание / Приход

**Route:** `/finance/create/receipt`  
**Razdel:** Финансы  
**URL:** https://admin.lume.uz/finance/create/receipt

![Screenshot](../shots259/044_finance__create__receipt.png)

## Tsel uroka
Razobrat, dlya chego nuzhen route `/finance/create/receipt` i kak s nim rabotat v admin-paneli Lume.

## Chto eto za stranitsa
Eto forma sozdaniya v razdele «Финансы». Na takih stranitsah obyčno zapolnyayut polya, dobavlyayut dannye i sohranyayut novuyu zapis.

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
- Dlya finansovyh operatsiy obyazatelno proveri schet, summu, statyu i period do podtverzhdeniya.

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
