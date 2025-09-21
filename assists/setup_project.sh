#!/bin/bash

# ===================================================================
# ===== MASTER SCRIPT VOOR GITHUB PROJECT SETUP (V4.0) =====
# ===================================================================
# Dit script zet het volledige GitHub project op voor 'Cliento',
# inclusief labels, mijlpalen, user stories en gedetailleerde sub-taken
# met omschrijvingen.
# ===================================================================

# --- CONFIGURATIE ---
REPO="moonwitch/Cliento"

# ============================
# ===== LABELS & MILESTONES =====
# ============================
echo "--- Labels aanmaken ---"

# Categorie Labels
gh label create --title "user-story" --description "User Story definitie." --color "218380" --repo "$REPO" --force
gh label create --title "task" --description "Een concrete, uitvoerbare technische taak." --color "FBB13C" --repo "$REPO" --force
gh label create --title "meeting" --description "Een afspraak of validatiemoment." --color "8338EC" --repo "$REPO" --force

# Component Labels
gh label create --title "ux" --description "Taken voor User Experience en Design" --color "FB34F3" --repo "$REPO" --force
gh label create --title "api" --description "Taken voor de back-end API" --color "345BFB" --repo "$REPO" --force
gh label create --title "db" --description "Taken voor de database" --color "A034FB" --repo "$REPO" --force
gh label create --title "front-end" --description "Algemene development taken (HTML, CSS, JS)" --color "34FBB1" --repo "$REPO" --force
gh label create --title "back-end" --description "Algemene development taken (Node.js, Supabase)" --color "34FBB1" --repo "$REPO" --force
gh label create --title "admin" --description "Taken gerelateerd aan projectdocumentatie" --color "6c757d" --repo "$REPO" --force

echo "--- Mijlpalen aanmaken ---"
gh milestone create --title "1. Project-analyse" --description "De klant en de projectvereisten analyseren." --due-date "2025-09-28" --repo "$REPO"
gh milestone create --title "2. Huisstijl" --description "De visuele identiteit van het project bepalen." --due-date "2025-10-05" --repo "$REPO"
gh milestone create --title "3. Prototype Front-end" --description "Een klikbaar, visueel prototype bouwen." --due-date "2025-10-26" --repo "$REPO"
gh milestone create --title "4. Backend-analyse" --description "Het technische plan voor de back-end uitwerken." --due-date "2025-11-09" --repo "$REPO"
gh milestone create --title "5. Prototype Back-end" --description "De server-side logica bouwen." --due-date "2025-11-23" --repo "$REPO"
gh milestone create --title "6. Publicatie" --description "De applicatie integreren, testen en publiceren." --due-date "2025-12-14" --repo "$REPO"
gh milestone create --title "7. Productreflectie & Presentatie" --description "Reflecteren en voorbereiden op de eindpresentatie." --due-date "2026-01-12" --repo "$REPO"

# ==================================
# ===== ISSUES & SUB-ISSUES AANMAKEN =====
# ==================================

echo "--- Mijlpaal 1: Project-analyse ---"
URL=$(gh issue create --title "Als student moet ik de project-scope vastleggen en laten goedkeuren" --milestone "1. Project-analyse" --label "user-story,task" --repo $REPO --body "Het formeel vastleggen van de project-scope om een solide basis te hebben." | tail -n 1)
gh sub-issue create --parent $URL --title "[Docs] Kick-off meeting met klant voorbereiden en houden" --label "task,meeting" --assignee "moonwitch" --body "Plan een meeting met Harlyne om de projectdoelen en verwachtingen te bespreken. Maak vooraf een agenda."
gh sub-issue create --parent $URL --title "[Docs] Projectanalyse-document opstellen v.1" --label "task,admin" --assignee "moonwitch" --body "Schrijf de eerste versie van het project-analyse hoofdstuk in het OpvolgDocument.md op basis van de meeting."
gh sub-issue create --parent $URL --title "[Docs] Document ter goedkeuring voorleggen aan leerkracht" --label "task,admin" --assignee "moonwitch" --body "Dien het document in via de juiste kanalen en vraag om feedback en formele goedkeuring."
gh sub-issue create --parent $URL --title "VALIDATIE: Maak afspraak met Wido" --label "meeting" --assignee "moonwitch" --body "Plan een korte meeting in met de leerkracht om de voortgang van deze mijlpaal te bespreken en te valideren."

echo "--- Mijlpaal 2: Huisstijl ---"
URL=$(gh issue create --title "Als Harlyne wil ik een professionele huisstijl, zodat mijn salon herkenbaar is" --milestone "2. Huisstijl" --label "user-story,ux" --repo $REPO --body "De visuele identiteit bepalen die past bij de merkwaarden van 'Lyn and Skin'." | tail -n 1)
gh sub-issue create --parent $URL --title "[UX] Moodboard van klant analyseren" --label "task,ux" --assignee "moonwitch" --body "Bestudeer het moodboard van de klant. Identificeer de belangrijkste kleuren, lettertypes en de algemene sfeer."
gh sub-issue create --parent $URL --title "[UX] Kleurenpalet en lettertypes selecteren" --label "task,ux" --assignee "moonwitch" --body "Definieer 2-3 primaire/secundaire kleuren en selecteer 1-2 Google Fonts voor koppen en body-tekst."
gh sub-issue create --parent $URL --title "[UX] Basis UI Kit opstellen in Penpot" --label "task,ux" --assignee "moonwitch" --body "Maak een herbruikbare componentenbibliotheek in Penpot met de gekozen kleuren, fonts, knoppen en input-velden."
gh sub-issue create --parent $URL --title "VALIDATIE: Maak afspraak met Wido" --label "meeting" --assignee "moonwitch" --body "Plan een korte meeting in met de leerkracht om de voortgang van deze mijlpaal te bespreken en te valideren."

echo "--- Mijlpaal 3: Prototype Front-end ---"
URL=$(gh issue create --title "Als bezoeker wil ik de belangrijkste pagina's kunnen bekijken" --milestone "3. Prototype Front-end" --label "user-story,ux,front-end" --repo $REPO --body "De statische basispagina's (Home, Behandelingen, Over Ons) visueel opbouwen." | tail -n 1)
gh sub-issue create --parent $URL --title "[UX] Wireframes & mockups maken in Penpot" --label "task,ux" --assignee "moonwitch" --body "Teken de layout en het design voor de Home, Behandelingen en Over Ons pagina's op basis van de UI Kit."
gh sub-issue create --parent $URL --title "[Code] Basis HTML-structuur opzetten" --label "task,front-end" --assignee "moonwitch" --body "Maak de .html bestanden aan met semantische HTML5-tags voor de structuur van de pagina's."
gh sub-issue create --parent $URL --title "[Code] Basis CSS schrijven (kleuren, fonts)" --label "task,front-end" --assignee "moonwitch" --body "Maak een main.css bestand aan en implementeer de huisstijl (variabelen voor kleuren, font-imports, etc.)."

URL=$(gh issue create --title "Als bezoeker wil ik een afspraak kunnen plannen via een interactieve kalender" --milestone "3. Prototype Front-end" --label "user-story,front-end" --repo $REPO --body "Het uitgebreide JavaScript-component: een visuele kalender." | tail -n 1)
gh sub-issue create --parent $URL --title "[Code] JavaScript-kalenderbibliotheek kiezen" --label "task,front-end" --assignee "moonwitch" --body "Onderzoek en kies een geschikte, gratis JS-bibliotheek voor de kalender. Bv. FullCalendar, TuiCalendar."
gh sub-issue create --parent $URL --title "[Code] Kalender implementeren op de 'Boeking' pagina" --label "task,front-end" --assignee "moonwitch" --body "Integreer de gekozen bibliotheek in de boekingspagina en toon een basis-kalender."
gh sub-issue create --parent $URL --title "[Code] Klik-event op een tijdslot afhandelen" --label "task,front-end" --assignee "moonwitch" --body "Schrijf de JavaScript-code die reageert wanneer een gebruiker op een datum of tijd klikt. Toon de selectie aan de gebruiker."
gh sub-issue create --parent $URL --title "VALIDATIE: Maak afspraak met Wido" --label "meeting" --assignee "moonwitch" --body "Plan een korte meeting in met de leerkracht om de voortgang van deze mijlpaal te bespreken en te valideren."

echo "--- Mijlpaal 4: Backend-analyse ---"
URL=$(gh issue create --title "Als ontwikkelaar moet ik de technische architectuur ontwerpen" --milestone "4. Backend-analyse" --label "user-story,db,api" --repo $REPO --body "De blauwdruk voor de back-end uitwerken." | tail -n 1)
gh sub-issue create --parent $URL --title "[DB] Database-ontwerp maken (ERD)" --label "task,db" --assignee "moonwitch" --body "Teken een Entity Relationship Diagram met de tabellen (users, treatments, appointments) en hun relaties."
gh sub-issue create --parent $URL --title "[API] API-endpoints en dataformaat definiëren" --label "task,api" --assignee "moonwitch" --body "Definieer de nodige API routes (bv. GET /treatments), de verwachte input en de JSON output. Postman is hier een goede tool voor."
gh sub-issue create --parent $URL --title "[Docs] Keuzes documenteren in OpvolgDocument.md" --label "task,admin" --assignee "moonwitch" --body "Neem het ERD en de API-definities op in het hoofdstuk 'Backend-analyse' van het opvolgdocument."
gh sub-issue create --parent $URL --title "VALIDATIE: Maak afspraak met Wido" --label "meeting" --assignee "moonwitch" --body "Plan een korte meeting in met de leerkracht om de voortgang van deze mijlpaal te bespreken en te valideren."

echo "--- Mijlpaal 5: Prototype Back-end ---"
URL=$(gh issue create --title "Als klant wil ik veilig kunnen inloggen en registreren" --milestone "5. Prototype Back-end" --label "user-story,db,api" --repo $REPO --body "Authenticatie voor de applicatie bouwen." | tail -n 1)
gh sub-issue create --parent "$URL" --title "[DB] 'users' tabel opzetten in Supabase" --label "task,db" --assignee "moonwitch" --body "Maak de 'users' tabel aan in de Supabase database. Voorzie de nodige kolommen en datatypes."
gh sub-issue create --parent "$URL" --title "[API] Supabase Authentication configureren" --label "task,api" --assignee "moonwitch" --body "Activeer en configureer de ingebouwde authenticatie-module van Supabase voor dit project."

URL=$(gh issue create --title "Als Harlyne wil ik mijn behandelingen kunnen beheren" --milestone "5. Prototype Back-end" --label "user-story,db,api" --repo $REPO --body "CRUD functionaliteit voor de behandelingen." | tail -n 1)
gh sub-issue create --parent "$URL" --title "[DB] 'treatments' tabel opzetten in Supabase" --label "task,db" --assignee "moonwitch" --body "Maak de 'treatments' tabel aan met kolommen voor o.a. naam, omschrijving, prijs en duur."
gh sub-issue create --parent "$URL" --title "[API] CRUD API-endpoints bouwen voor '/treatments'" --label "task,api" --assignee "moonwitch" --body "Ontwikkel de API-functies voor Create, Read, Update en Delete voor de behandelingen."

URL=$(gh issue create --title "Als Harlyne wil ik alle afspraken kunnen beheren" --milestone "5. Prototype Back-end" --label "user-story,db,api" --repo $REPO --body "CRUD functionaliteit voor afspraken." | tail -n 1)
gh sub-issue create --parent "$URL" --title "[DB] 'appointments' tabel opzetten in Supabase" --label "task,db" --assignee "moonwitch" --body "Maak de 'appointments' tabel aan met relaties naar de 'users' en 'treatments' tabellen."
gh sub-issue create --parent "$URL" --title "[API] CRUD API-endpoints bouwen voor '/appointments'" --label "task,api" --assignee "moonwitch" --body "Ontwikkel de API-functies voor het aanmaken, ophalen en annuleren van afspraken."
gh sub-issue create --parent "$URL" --title "VALIDATIE: Maak afspraak met Wido" --label "meeting" --assignee "moonwitch" --body "Plan een korte meeting in met de leerkracht om de voortgang van deze mijlpaal te bespreken en te valideren."

echo "--- Mijlpaal 6: Publicatie ---"
URL=$(gh issue create --title "Als Harlyne wil ik de werkende webapp online gebruiken" --milestone "6. Publicatie" --label "user-story,front-end" --repo $REPO --body "De applicatie integreren, testen en live zetten." | tail -n 1)
gh sub-issue create --parent "$URL" --title "[Code] Front-end aan alle back-end API's koppelen" --label "task,front-end" --assignee "moonwitch" --body "Vervang alle dummy data in de front-end met echte API calls naar de Supabase back-end."
gh sub-issue create --parent "$URL" --title "[Code] End-to-end tests uitvoeren" --label "task,front-end" --assignee "moonwitch" --body "Test de volledige flow: registreren, inloggen, behandeling kiezen, afspraak boeken, afspraak bekijken in admin."
gh sub-issue create --parent "$URL" --title "[Code] Applicatie publiceren (deployen)" --label "task,front-end" --assignee "moonwitch" --body "Kies een hosting provider (Vercel/Netlify) en volg hun stappen om het project live te zetten."
gh sub-issue create --parent "$URL" --title "VALIDATIE: Maak afspraak met Wido" --label "meeting" --assignee "moonwitch" --body "Plan een korte meeting in met de leerkracht om de voortgang van deze mijlpaal te bespreken en te valideren."

echo "--- Mijlpaal 7: Productreflectie & Presentatie ---"
URL=$(gh issue create --title "Als student moet ik mijn project presenteren en erop reflecteren" --milestone "7. Productreflectie & Presentatie" --label "user-story,admin" --repo $REPO --body "Het project afronden en voorbereiden op de presentatie." | tail -n 1)
gh sub-issue create --parent "$URL" --title "[Docs] Productreflectie schrijven" --label "task,admin" --assignee "moonwitch" --body "Schrijf het laatste hoofdstuk van het opvolgdocument waarin je terugblikt op het proces."
gh sub-issue create --parent "$URL" --title "[Docs] Presentatie (slides) maken" --label "task,admin" --assignee "moonwitch" --body "Maak een duidelijke en visuele presentatie die het project van A tot Z uitlegt."
gh sub-issue create --parent "$URL" --title "[Docs] Live demo voorbereiden en oefenen" --label "task,admin" --assignee "moonwitch" --body "Zorg voor een vlotte live demo van de werkende applicatie. Oefen dit meerdere keren."
gh sub-issue create --parent "$URL" --title "FINALE: Presentatie voor de jury" --label "meeting" --assignee "moonwitch" --body "De finale presentatie en verdediging van je GIP."

echo "✅ Missie volbracht! Je volledige, super-gedetailleerde project staat klaar in GitHub."
