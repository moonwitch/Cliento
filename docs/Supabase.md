# Architectuurkeuze: Scheiding tussen Auth Users en Clients

In het datamodel van **Cliento** is er bewust gekozen voor een scheiding tussen de technische gebruikers (in `auth.users`) en de functionele klantgegevens (in `public.clients`). Dit hoofdstuk motiveert deze architecturale keuze.

## 1. Het fundamentele verschil
Er zijn twee totaal verschillende entiteiten die we moeten beheren, elk met hun eigen verantwoordelijkheid:

* **Auth Users (`auth.users`)**: Dit is het domein van **veiligheid en toegang**.
    * *Doel:* Identificatie en Authenticatie.
    * *Data:* E-mail, versleuteld wachtwoord, unieke User ID (UUID), laatste inlogmoment.
    * *Beheer:* Wordt strikt beheerd door Supabase Auth. Hier kunnen en mogen we zelf geen functionele business-data (zoals 'allergieën' of 'verjaardag') aan toevoegen.

* **Clients (`public.clients`)**: Dit is het domein van **bedrijfsvoering (CRM)**.
    * *Doel:* Klantenrelatiebeheer en dossieropbouw.
    * *Data:* Naam, telefoonnummer, medische info (allergieën), notities, verjaardag.
    * *Beheer:* Volledig beheerd door de applicatie en de schoonheidsspecialiste.

## 2. De "Oma Gerda" Casus (Offline Klanten)
De belangrijkste reden om deze tabellen **niet** samen te voegen, is de realiteit van een fysiek schoonheidssalon.

> **Scenario:** Een oudere klant, "Oma Gerda", belt naar het salon voor een afspraak. Ze heeft geen computer, geen e-mailadres en zal nooit inloggen op de website.

Als we alle klantdata in de `auth.users` tabel zouden forceren, ontstaan er problemen:
1.  **Verplichte Login:** Supabase Auth vereist een e-mail en wachtwoord voor elke regel in de database.
2.  **Vervuiling:** De schoonheidsspecialiste zou "nep-adressen" (bv. `gerda@fake.com`) moeten aanmaken om een dossier voor Gerda te kunnen openen. Dit is een 'bad practice'.

Door een aparte `public.clients` tabel te gebruiken, kan Gerda gewoon als klant bestaan **zonder** dat ze een account heeft.

## 3. De Hybride Oplossing (Best of Both Worlds)
Om te voorkomen dat we data dubbel moeten ingeven, gebruiken we een **koppeling** en **automatisatie**.

### De Koppeling
We voegen een `user_id` kolom toe aan de `clients` tabel die verwijst naar `auth.users`. Deze kolom is *nullable* (mag leeg zijn).

* **Online Klant (Jane):** Heeft een rij in `clients` én een `user_id` die linkt naar haar login. Ze kan haar eigen gegevens zien.
* **Offline Klant (Gerda):** Heeft een rij in `clients`, maar het veld `user_id` is leeg (`NULL`). De schoonheidsspecialiste beheert haar dossier, maar er is geen login gekoppeld.

### De Automatisatie (Triggers)
Om de consistentie te bewaren, gebruiken we een **PostgreSQL Trigger** (`handle_new_user`).
Wanneer een klant zich online registreert (in `auth.users`), voert de database automatisch de volgende stappen uit:
1.  Er wordt een record aangemaakt in `public.profiles` (voor rechtenbeheer/rollen).
2.  Er wordt **automatisch** een record aangemaakt in `public.clients` met de naam en het e-mailadres.
3.  De link (`user_id`) wordt direct gelegd.

## Conclusie
Deze architectuur biedt **flexibiliteit en schaalbaarheid**:
* ✅ **Data integriteit:** Authenticatie staat los van business logic.
* ✅ **Inclusiviteit:** Het systeem ondersteunt zowel digitale 'power users' als klanten zonder computer.
* ✅ **Gebruiksgemak:** Voor de schoonheidsspecialiste staan alle klanten (online en offline) in één overzichtelijke lijst (`clients`), zonder dat ze zich zorgen hoeft te maken over wie er wel of niet kan inloggen.

Database Architectuur: Supabase (PostgreSQL)

Voor de data-opslag van Cliento maken we gebruik van een relationeel model in Supabase. De architectuur is opgesplitst in drie domeinen:

Identity & Access (IAM):

auth.users: Beheerd door Supabase Auth. Bevat inloggegevens.

public.profiles: Een extensie van de user-tabel die rollen (RBAC) beheert zoals 'admin', 'beautician', en 'client'.

Customer Relationship Management (CRM):

public.clients: De centrale tabel voor klantgegevens.

Relatie: Er is een One-to-One relatie met auth.users via de user_id kolom. Deze is 'nullable' (mag leeg zijn), waardoor het systeem ook offline klanten ondersteunt die geen account hebben (bijv. telefonische afspraken).

Core Business Logic:

public.treatments: Bevat het aanbod (Producten/Diensten). Deze is publiek leesbaar via RLS policies.

public.appointments: Koppelt een client aan een tijdstip.

Automatisering: Om de consistentie te bewaren wordt gebruik gemaakt van Database Triggers. De functie handle_new_user zorgt ervoor dat bij elke nieuwe registratie automatisch een profile en een client record wordt aangemaakt.
