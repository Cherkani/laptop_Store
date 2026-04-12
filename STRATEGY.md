# CasaByStore — Plan Stratégique

> Modèle : dropshipping local Casa · Équipe : Aymen + Adam · Canaux : WhatsApp + Instagram

---

## Contexte réel

- **Aucun stock physique** — achat à la commande uniquement, fournisseurs dans la même ville
- **Stock unique** par article chez la source → vérification quotidienne obligatoire
- **6 nouveaux produits/jour** à poster (site + Instagram)
- **Livraison assurée par l'équipe** (Aymen + Adam)
- **Marge calculée** à l'ajout produit (prix source + lien déjà trackés)
- **Image sourcée** depuis les sites fournisseurs, ajoutée manuellement

---

## Ce qui fonctionne déjà

| Élément | État |
|---|---|
| Catalogue avec prix/marge | ✅ En place |
| Vérification quotidienne disponibilité | ✅ En place |
| Tracker posts journaliers (objectif 6/jour) | ✅ En place |
| Clics WhatsApp trackés par produit | ✅ En place |
| Heatmap activité historique | ✅ En place |
| Source URL + image source | ✅ En place |

---

## Ce qui manque — Priorité haute

### 1. Multi-admin avec traçabilité (Aymen + Adam)

**Problème :** Un seul compte admin aujourd'hui, impossible de savoir qui a fait quoi.

**À construire :**
- Créer deux comptes : `aymen@casabystore.ma` et `adam@casabystore.ma`
- Migration Supabase : ajouter `created_by` (user_id) sur `products`, `sales_records`, `payments`
- Afficher l'auteur dans le backoffice (qui a ajouté ce produit, qui a marqué vendu)
- Dashboard par personne : X produits ajoutés aujourd'hui par Aymen, Y par Adam

---

### 2. Tracker livraison

**Problème :** Aucun suivi si la livraison a été faite ou non.

**À construire :**
- Statut `delivery` sur `sales_records` (déjà dans le schéma)
- Bouton "Livré" dans la liste des ventes avec timestamp + qui a livré
- Vue "À livrer aujourd'hui" dans le Daily Check
- Historique livraisons par personne (Aymen vs Adam)

---

### 3. Tracker dépenses opérationnelles

**Problème :** Pas de visibilité sur ce que coûte réellement le business (domaine, outils, achats directs).

**À construire :**
- Table `expenses` : montant, catégorie (achat stock, outil, transport, autre), payé par qui, date
- Page Trésorerie : recettes (ventes payées) − dépenses = bénéfice net réel
- Distinction achat dropshipping (coût d'achat d'une pièce) vs dépense fixe

---

### 4. Statut Instagram post

**Problème :** Le tracker compte les produits ajoutés au site mais pas si le post Instagram a été publié.

**À construire :**
- Champ `instagram_posted_at` sur le produit (date de publication Instagram)
- Bouton rapide "Posté sur Instagram" dans la liste produits / Daily Check
- Objectif journalier séparé : X/6 postés sur Instagram

---

## Ce qui manque — Priorité moyenne

### 5. Alerte stock vendu à la source

**Problème :** Si tu marques un produit indisponible, il disparaît mais aucune trace de pourquoi.

**À construire :**
- Champ `unavailable_reason` : vendu source / prix changé / retiré
- Historique des produits mis hors ligne avec raison
- Stat : taux de perte (combien de fois le stock était parti avant qu'un client confirme)

---

### 6. Temps de réponse WhatsApp

**Problème :** Un lead WhatsApp non répondu dans l'heure = vente perdue.

**À construire :**
- Timestamp `first_replied_at` sur `sales_records`
- Alerte dans Daily Check : leads sans réponse depuis +2h
- Stat : délai moyen de réponse par personne

---

### 7. Source de trafic par produit

**Problème :** Tu ne sais pas si un clic vient de WhatsApp direct, du lien Instagram bio, ou du site.

**À construire :**
- Paramètre UTM sur les liens partagés (ex: `?ref=instagram`, `?ref=whatsapp`)
- Capturer la source dans `sales_records` au moment du clic
- Rapport : quelle plateforme convertit le mieux par catégorie produit

---

## Ce qui manque — Priorité basse (plus tard)

### 8. Facebook Marketplace

- Quand vous attaquez Facebook, le même système de post tracker s'applique
- Ajouter `facebook_posted_at` au même moment qu'Instagram

### 9. Statistiques vendeur

- Classement mensuel Aymen vs Adam : ventes conclues, produits ajoutés, livraisons
- Motiver la compétition saine entre les deux

### 10. Vraie marge nette automatique

- Prix de vente − coût d'achat − frais livraison = marge réelle par vente
- Aujourd'hui la marge est calculée au produit, pas à la vente (quantité, remise, etc.)

---

## Ordre de construction recommandé

```
Semaine 1  →  Multi-admin (aymen + adam) + created_by sur toutes les tables
Semaine 2  →  Tracker livraison + vue "À livrer"
Semaine 3  →  Dépenses opérationnelles + Trésorerie nette
Semaine 4  →  instagram_posted_at + objectif Instagram dans Daily Check
Mois 2     →  Alertes WhatsApp non répondus + source de trafic UTM
Mois 3     →  Stats vendeur + Facebook Marketplace
```

---

## Métriques à suivre chaque jour (KPIs)

| Métrique | Objectif |
|---|---|
| Produits ajoutés | 6/jour |
| Posts Instagram | 6/jour |
| Produits vérifiés | 100% du catalogue |
| Leads WhatsApp répondus < 1h | > 90% |
| Taux de conversion lead → vendu | À mesurer |
| Marge nette mensuelle | À définir ensemble |
| Livraisons du jour complètes | 100% |

---

## Risque principal à surveiller

> **Stock unique = vente perdue si quelqu'un d'autre achète avant toi.**
> La vérification quotidienne est votre bouclier principal.
> L'objectif futur : être le premier à voir quand un nouveau stock entre chez la source — envisager des alertes automatiques (scraping ou notification manuelle fournisseur).
