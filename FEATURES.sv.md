# Funktioner i 0.2.0-beta.1

Utökad community-beta baserad på Fryyyyys MIT-projekt. Kommandonas format har jämförts med originalkoden och testats med simulerade svar. **De nya kommandona har inte provats mot en riktig bil.** Att ett kommando finns i underlaget garanterar inte att en europeisk 001 eller ett delat konto accepterar det.

## Styrning

| Funktion | Homey |
|---|---|
| Lås / lås upp alla dörrar | Knappar på enheten + Flow |
| Frigör bagagelucka / frunk | Knappar + Flow; inte ett löfte om motordriven öppning |
| Öppna / stäng laddlucka | Knappar + Flow |
| Öppna / stäng alla fönster; ventilationsläge | Flow; stäng och ventilera även som knappar |
| Öppna / stäng solgardin | Flow |
| Blinka; tuta och blinka | Knappar + Flow |
| Starta / stoppa laddning och kupéklimat | Befintliga Flow-kort |
| Ställ laddgräns | Flow: 50–100 %, steg om 5 |
| Defroster, rattvärme | Flow |
| Sätesvärme fyra platser | Flow: nivå 0–3, 0 stänger av |
| Sätesventilation fram | Samma säteskort, välj ventilation |
| Kort luftningscykel | Flow; tiden styrs av bilen, underlaget anger ungefär en minut |
| Sentry/vaktläge | Flow; modell- och regionberoende |
| Stäng av parkeringskomfort | Flow; påslagning saknar tillräckligt underlag |
| Laddschema | Flow: start/slut HH:MM enligt bilens tidszon; ersätter befintlig laddplan |
| Engångsavgång med klimat/rattvärme | Flow; ersätter befintlig avgångsplan, inklusive återkommande schema |
| Inaktivera ladd-/avgångsplan | Flow; läser först befintlig plan och bevarar dess dokumenterade inställningar |

Alla nya styrningar är uttryckliga åtgärder. Inga kommandon skickas vid installation, start, parkoppling eller vanlig uppdatering. Knappar kan påverka bilen direkt när du trycker. Kontrollera bilen efter ett kommando. Använd inte en oprövad upplåsningsfunktion i automatiska Flow.

**Kommando accepterat** betyder att API:t accepterat anropet. Låsstatus och övriga mätvärden ändras först vid avläsning. Appen provar inte automatiskt ett misslyckat kommando igen. Vänta minst tio sekunder mellan kommandon och kontrollera bilstatus efter timeout.

## Fler avläsningar

Laddgräns, återstående laddtid och laddhastighet; färdsträcka, medelhastighet och förbrukning; räckvidd vid 20/100 %; koordinater; dörrar och individuella lås; fönsterläge och öppningsgrad; frunk, bagagelucka, laddlucka, parkeringsbroms och solgardin; sätes-/rattvärme, ventilation, defroster och sentry; däcktemperaturer och däckvarningar; laddplan och nästa avgång.

Värden som bilen inte rapporterar visas som okända. Fyra extra läsanrop används för tilläggsvärdena. Ett fel där behöver inte stoppa vanliga bilvärden. **Senaste fullständiga tilläggshämtning** avser de extra anropen; **Senaste API-hämtning** avser en lyckad vanlig bilstatushämtning. Det bevisar inte att Zeekr har fått ny telemetri från en sovande bil. Homeys ”x minuter” på en mätning kan avse när värdet senast ändrades.

Normal avläsning var 300:e sekund som tidigare, justerbart i appinställningarna. Hämtningarna tar också tid. Efter ett kommando begärs en uppdatering efter 35 sekunder. Ingen Bluetooth-anslutning behövs för molnkommandona.

## Ingår inte

Bluetooth-/digital nyckel, närhetsupplåsning, startbehörighet, kamerabilder/video, körjournal, kylskåpsstyrning eller alla funktioner från varje modell/region i originalappen. Appen återskapar inte hela Zeekr-appen. Nycklar och konto behövs fortfarande enligt setupguiden.

## Uppdatera och prova

1. Hämta ZIP-filen för **v0.2.0-beta.1** från Releases. Packa upp hela paketet.
2. Kör `INSTALL_WINDOWS.cmd` som förra gången och välj samma Homey. Avinstallera inte och använd inte `--clean`.
3. Befintlig bil och kontoinställningar behålls. Nya egenskaper läggs till när appen startar.
4. Öppna bilen i Homey och gå till kontrollerna. Prova en funktion i taget när du står vid bilen med din vanliga nyckel tillgänglig. Börja gärna med ljussignal. Bekräfta resultatet på bilen.
5. Om Zeekr nekar ett kommando: anteckna funktion och felkod. Dela inga nycklar, VIN, koordinater, tokens eller personliga loggar.

Återgå vid behov genom att installera ZIP-filen för v0.1.2 på samma sätt. Den äldre versionen tar inte automatiskt bort alla nya egenskaper; avinstallera inte bara för att städa korten eftersom det kan radera inställningar och historik.

Delas i befintligt skick, utan löfte om underhåll eller support. API-arbetet kommer från [Fryyyyy](https://github.com/Fryyyyy/zeekr_homeassistant); nyckelverktyget från [Wysie](https://github.com/Wysie/zeekr_key_extractor). MIT-licenserna medföljer.
