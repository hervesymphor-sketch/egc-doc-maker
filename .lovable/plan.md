# Plan — EGC Docs

Application web pour l'EGC Martinique permettant de générer des documents administratifs à partir d'un Google Sheet.

## 1. Stack & fondations

- **TanStack Start** (déjà en place) + Tailwind v4
- **Lovable Cloud** (Supabase) pour l'authentification email/mot de passe
- **Connecteur Google Sheets** (Lovable connector gateway) pour lire le classeur partagé
- **jsPDF + html2canvas** pour la génération PDF côté client
- **Charte EGC** : violet `#6B21A8` en couleur primaire, accents dorés, typo sérif élégante pour les documents officiels + sans-serif moderne pour l'UI

## 2. Authentification

- Auth Supabase email + password (pas d'inscription publique — comptes créés manuellement par l'admin dans Lovable Cloud)
- Route protégée `_authenticated` qui redirige vers `/login`
- Page `/login`, page `/reset-password`
- Pas de table `profiles` au démarrage (un seul rôle : responsable pédagogique)

## 3. Connexion Google Sheets

- Connecteur **Google Sheets** via le gateway Lovable (le compte connecté est celui de l'admin EGC, partagé par tous les utilisateurs autorisés)
- Spreadsheet ID extrait de l'URL : `1IQoyNYzV69U8iVveJHUeUlHNtpmhdNTx`
- Server function `getStudents({ promotion })` qui lit l'onglet correspondant (Promotion 1 / 2 / 3) et renvoie les lignes typées
- Mise en cache via TanStack Query (5 min) avec bouton "Rafraîchir"

> Note : le fichier actuel est un `.xlsx` importé. Il faudra l'ouvrir dans Google Sheets (Fichier → Enregistrer en tant que Google Sheets) pour que l'API Sheets puisse le lire. Je le rappellerai dans l'UI si la lecture échoue.

## 4. Structure des routes

```text
/login
/reset-password
/_authenticated
  /                 → Dashboard (compteurs par promo, dernière sync)
  /etudiants        → Tableau filtrable (promo, recherche nom/prénom)
  /etudiants/$id    → Fiche étudiant + boutons "Générer …"
  /trombinoscope    → Grille de photos par promotion (export PDF)
  /documents        → Historique / génération en masse
  /parametres       → Infos école (RNE, adresse, signataire, logo)
```

## 5. Modules de génération de documents

Chaque document = un composant React stylé (A4), converti en PDF via html2canvas + jsPDF.

- **Certificat de scolarité**
- **Attestation de présence**
- **Carte étudiant** (format CB, recto/verso, QR code optionnel)
- **Convention de stage** (modèle simple à compléter)
- **Trombinoscope** par promotion (grille 4×N, export PDF multi-pages)

Génération unitaire (depuis fiche étudiant) ou en masse (sélection multiple → ZIP via JSZip).

## 6. Paramètres école (table `school_settings`)

Une seule ligne éditable : nom, RNE, adresse, ville, signataire, fonction, logo (upload vers Lovable Cloud Storage).

## 7. Design system

- Palette : violet EGC `#6B21A8`, blanc cassé `#fcfbf8`, gris ardoise, accent doré `#c9a84c`
- Typo UI : Inter/Manrope ; Typo documents : Cormorant Garamond (officiel)
- Layout sidebar (logo + nav) + zone principale, look administratif soigné mais moderne

## 8. Étapes d'implémentation

1. Activer Lovable Cloud + créer la table `school_settings`
2. Brancher le connecteur Google Sheets
3. Auth (login, reset, route guard, layout authentifié)
4. Lecture du Sheet + page `/etudiants` (tableau + filtres)
5. Fiche étudiant + premier document (certificat de scolarité)
6. Autres documents (attestation, carte, convention)
7. Module Trombinoscope + export PDF
8. Page Paramètres école + upload logo
9. Génération en masse + ZIP
10. Polish UI / responsive / états vides / erreurs

## Questions avant de lancer

Pour finaliser je dois encore confirmer 3 points qu'on n'a pas tranchés :

- **Logo EGC** : tu l'uploades, ou je génère un placeholder violet en attendant ?
- **Infos école** (RNE, adresse complète, nom du signataire) : tu me les donnes maintenant ou tu les rempliras dans la page Paramètres après le build ?
- **Comptes utilisateurs** : je pars sur "comptes créés manuellement par l'admin" (pas d'inscription publique). OK ?

Dès que tu valides, je commence par l'étape 1.
