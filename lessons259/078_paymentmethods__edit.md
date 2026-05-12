# Urok 78. Методы оплаты / Редактирование

**Route:** `/paymentmethods/edit`  
**Razdel:** Общее  
**URL:** https://admin.lume.uz/paymentmethods/edit

![Screenshot](../shots259/114_paymentmethods__edit.png)

## Tsel uroka
Razobrat, dlya chego nuzhen route `/paymentmethods/edit` i kak s nim rabotat v admin-paneli Lume.

## Chto eto za stranitsa
Eto stranitsa redaktirovaniya v razdele «Методы оплаты». Zdes obyčno menyayut sushchestvuyushchie dannye i sohranyayut izmeneniya.

Osnovnoy zagolovok ili samyy zametnyy tekst na ekrane: **990123456**.

## Poshagovyy stsenariy raboty
1. Voydite v admin-panel i otkroyte nuzhnyy route cherez levoye menyu ili pryamoy adres.
2. Proverte verhniye filtry, poisk, knopy sozdaniya ili tablichnyy spisok elementov.
3. Naydite nujnuyu zapis ili otkroyte ee po pryamoy ssylke.
4. Vnesite izmeneniya v polya formy.
5. Sohranite pravki i proverьте rezultat v spiske ili kartochke.

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
