# Source de vérité — contenu éditorial légal migré (extraction fidèle de l'existant)

> Référence interne pour la migration (Phase D). Contenu reproduit FIDÈLEMENT depuis
> les pages existantes — RGPD/LCEN à ne pas altérer. Confidentialité = conforme, non régressée.
> Deux emails distincts : `hamdi.tlili@primapp.dev` (légal/RGPD) et `support@primapp.dev` (support apps).

## confidentialite (FR) / privacy (EN)

Title FR : « Politique de confidentialité — Prim | Tlili Hamdi »
Title EN : « Privacy Policy — Prim | Tlili Hamdi »

Responsable de traitement / Data controller : TLILI HAMDI — hamdi.tlili@primapp.dev.

Blocs (H2) :
1. Données collectées par le site / Data collected by this site —
   clause exacte FR : « il ne contient aucun formulaire de collecte directe, aucun traceur publicitaire et aucun outil d'analyse d'audience. Aucun cookie n'est déposé par le site lui-même. »
   EN : « it contains no data collection form, no advertising tracker and no audience analytics tool. The site itself sets no cookies. »
2. Préférence de langue (localStorage) — clé `prim.lang`, fonctionnelle, jamais transmise, supprimable.
3. Prise de rendez-vous (Calendly) — Calendly LLC sous-traitant, chargé AU CLIC, cookies (Calendly, Cloudflare, Stripe), données saisies (nom, email, créneau, message) traitées aux seules fins de rendez-vous. Lien : https://calendly.com/legal/privacy-notice
4. Hébergement et journaux techniques — Cloudflare, Inc. (Workers), logs IP visiteurs sécurité/maintenance. Lien : https://www.cloudflare.com/privacypolicy/
5. Emails — répondre à la demande, conservation max 3 ans après dernier contact.
6. Vos droits (RGPD) / Your rights (GDPR) — Règlement (UE) 2016/679 : accès, rectification, effacement, opposition, limitation, portabilité. Exercice : hamdi.tlili@primapp.dev. Réclamation CNIL : https://www.cnil.fr
Dernière mise à jour : 10 juin 2026 / June 10, 2026.

## mentions-legales (FR) / legal-notice (EN)

Title FR : « Mentions légales — Prim | Tlili Hamdi » · EN : « Legal Notice — Prim | Tlili Hamdi »
EN uniquement : clause de prévalence LCEN en intro — « This English translation is provided for convenience. In case of discrepancy, the French version (mentions légales) prevails, as required by French law (LCEN). »

H2 :
- Éditeur du site / Site publisher : TLILI HAMDI — entrepreneur individuel / sole proprietor, fondateur de Prim, studio indépendant d'applications Apple natives. Paris, France. hamdi.tlili@primapp.dev
- Directeur de la publication / Publishing director : TLILI HAMDI.
- Hébergement / Hosting : Cloudflare, Inc. (Workers) — 101 Townsend Street, San Francisco, CA 94107, United States — https://www.cloudflare.com
- Propriété intellectuelle / Intellectual property : contenus propriété de TLILI HAMDI sauf mention contraire ; reproduction non autorisée interdite ; marques citées (Apple, iOS, SwiftUI, GitHub, Firebase, Calendly…) à leurs propriétaires.
- Données personnelles / Personal data : voir politique de confidentialité.
Dernière mise à jour : 10 juin 2026.

## support (FR/EN)

Title : « Support — Prim | Tlili Hamdi »
Intro : centralise le support des applications éditées par Prim (TLILI HAMDI) sur l'App Store + demandes sur ce site.
Contact-card : support@primapp.dev (mailto subject FR=`Support Prim`, EN=`Prim Support`). Réponse sous 48 h ouvrées / 48 business hours. Indiquer nom app, version, version iOS.
H2 : Signaler un bug / Report a bug · Demander une fonctionnalité / Request a feature · Confidentialité des applications / App privacy (traitement local, détail sur fiche App Store + /confidentialite).
Dernière mise à jour : 10 juin 2026.

## fichechef/privacy (FR/EN)

Title : « FicheChef — Politique de confidentialité | Prim » / « FicheChef — Privacy Policy | Prim »
En tête sous H1 : « Dernière mise à jour : avril 2026. » / « Last updated: April 2026. »
H2 : Résumé/Summary (aucune donnée collectée, données sur l'appareil) · Données stockées/Data storage (SwiftData local ; iCloud sync via Apple CloudKit compte privé, TLILI HAMDI sans accès ; conditions Apple https://www.apple.com/legal/privacy/fr-ww/ [EN: /en-ww/]) · Données collectées par l'app/Data collected by the app (Aucune/None ; pas de tracker, SDK analytics, tiers ; liste non collectée) · Données partagées avec des tiers/Data shared (aucune ; PDF générés localement, partage via action explicite — Messages, Mail, WhatsApp, AirDrop) · Abonnements et achats intégrés/Subscriptions (FicheChef Pro via Apple StoreKit 2, pas d'accès paiement) · Permissions iOS demandées/iOS permissions (photothèque uniquement à l'ajout d'une photo ; copie privée ; photothèque jamais parcourue) · Droits/Your rights (art. 15-17 RGPD gérés dans l'app, export/suppression depuis Réglages ▸ Données) · Modifications/Changes (nouvelle version + notes de version) · Contact (support@primapp.dev ou page support FicheChef).

## fichechef/support (FR/EN)

Title : « FicheChef — Support | Prim »
Intro : question/bug/suggestion FicheChef.
Contact-card : support@primapp.dev (pas de subject pré-rempli). Réponse 48 h ouvrées. Indiquer version app + iOS.
H2 : Confidentialité/Privacy (aucune donnée — voir /fichechef/privacy) · Autres applications Prim/Other Prim apps (support général /support).

## Constats garde-fous
- Aucun lien App Store cliquable, aucun Smart App Banner, aucun AASA référencé dans ces pages → rien à fabriquer.
- AASA fichier `.well-known/apple-app-site-association` ABSENT du repo (seule la règle `_headers` existe).
