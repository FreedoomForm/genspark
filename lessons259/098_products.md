# Urok 98. Товары

**Route:** `/products`  
**Razdel:** Товары  
**URL:** https://admin.lume.uz/products

![Screenshot](../shots259/143_products.png)

## Tsel uroka
Razobrat, dlya chego nuzhen route `/products` i kak s nim rabotat v admin-paneli Lume.

## Chto eto za stranitsa
Eto osnovnaya rabochaya stranitsa razdela «Товары». Ona ispolzuetsya dlya poiska, fil'trov, prosmotra tablits i perehoda k svyazannym deystviyam.

Osnovnoy zagolovok ili samyy zametnyy tekst na ekrane: **990123456**.

## Poshagovyy stsenariy raboty
1. Voydite v admin-panel i otkroyte nuzhnyy route cherez levoye menyu ili pryamoy adres.
2. Proverte verhniye filtry, poisk, knopy sozdaniya ili tablichnyy spisok elementov.
3. Ispolzuyte poisk, filtry po date, statusu, skladu ili kategorii.
4. Otkroyte nuzhnuyu stroku dlya detalnogo prosmotra ili redaktirovaniya.
5. Pri neobhodimosti eksportiruyte, pechataite ili sozdavayte novyye zapisi iz etogo razdela.

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
