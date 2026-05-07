# Urok 107. Поставщики / add

**Route:** `/providers/add`  
**Razdel:** Поставщики  
**URL:** https://admin.lume.uz/providers/add

![Screenshot](../shots259/157_providers__add.png)

## Tsel uroka
Razobrat, dlya chego nuzhen route `/providers/add` i kak s nim rabotat v admin-paneli Lume.

## Chto eto za stranitsa
Eto forma sozdaniya v razdele «Поставщики». Na takih stranitsah obyčno zapolnyayut polya, dobavlyayut dannye i sohranyayut novuyu zapis.

Osnovnoy zagolovok ili samyy zametnyy tekst na ekrane: **ERROR**.

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
ERROR
Page.screenshot: Target crashed
Browser logs:
<launching> /home/user/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints --enable-feat …
```
