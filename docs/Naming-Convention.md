## 📘 Naamgevingsafspraken (Naming Conventions)

Om de codebase overzichtelijk en voorspelbaar te houden, hanteren we strikte naamgevingsregels. Dit helpt om in één oogopslag het verschil te zien tussen een *pagina*, een *hulpmiddel* of een *stijlbestand*.

### 1. PascalCase (Hoofdletter)
**Gebruik:** Voor visuele elementen (UI) die HTML teruggeven.
* **Waarom?** Dit is de standaard in moderne JavaScript development (zoals React/Vue). Het geeft aan: *"Dit bestand bevat een herbruikbaar blok of een pagina."*
* **Locaties:** `components/` en `pages/`.

| Type | Voorbeeld Bestandsnaam | Omschrijving |
| :--- | :--- | :--- |
| **Components** | `Sidebar.js`, `Header.js` | Losse bouwblokken (Menu, Footer, Kaart). |
| **Pages** | `HomePage.js`, `StaffPage.js` | Volledige pagina's die content tonen. |
| **Modals** | `AuthModal.js` | Pop-ups of dialogen. |

### 2. camelCase (kleine letter start)
**Gebruik:** Voor logica, functies en configuratie.
* **Waarom?** Deze bestanden bevatten geen HTML, maar "gereedschap" (functies) die door de rest van de app worden gebruikt.
* **Locaties:** `js/` root mappen.

| Type | Voorbeeld Bestandsnaam | Omschrijving |
| :--- | :--- | :--- |
| **Configuratie** | `config.js` | Supabase instellingen en keys. |
| **Utilities** | `auth.js`, `utils.js` | Hulpfuncties (inloggen, datum formatteren). |
| **Controllers** | `app.js`, `dashboard.js` | Hoofdscripts die de applicatie starten. |

### 3. kebab-case (kleine-letters-met-streepjes)
**Gebruik:** Voor static assets zoals CSS en afbeeldingen.
* **Waarom?** Dit is de webstandaard voor URLs en bestanden die direct door de browser worden ingeladen zonder JavaScript logica.
* **Locaties:** `css/` en `assets/`.

| Type | Voorbeeld Bestandsnaam | Omschrijving |
| :--- | :--- | :--- |
| **Stylesheets** | `admin.css`, `style.css` | De opmaakbestanden. |
| **Afbeeldingen** | `hero-image.jpg`, `logo.png` | Plaatjes en iconen. |

---

### 💡 Voorbeeld Mappenstructuur

```text
src/
├── css/
│   ├── style.css             (kebab-case: Styling)
│   └── variables.css
├── js/
│   ├── app.js                (camelCase: Logica/Controller)
│   ├── auth.js               (camelCase: Hulpfunctie)
│   ├── components/
│   │   ├── Header.js         (PascalCase: Visueel Component)
│   │   └── Footer.js
│   └── pages/
│       └── HomePage.js       (PascalCase: Visuele Pagina)
