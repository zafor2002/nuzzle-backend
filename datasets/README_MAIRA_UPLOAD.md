# Nuzzle Gigalogy MAIRA Datasets: Complete Guide & Upload Instructions

All demo dataset files are ready in your repository under:
📂 **`e:\nuzzle project\datasets\`**

---

## 1. Dataset Files Overview

| # | Dataset File Name | Format | Linked MAIRA Profile | Purpose & Content |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **`lost_found_radar_dataset.csv`** | CSV | **Lost & Found Radar AI Matcher**<br>`a10e6172-abe5-4fed-965f-dcdf22148524` | 15+ lost pet records across Dhaka (Banani, Gulshan, Dhanmondi, Uttara) with breeds, colors, collar descriptions, and owner phone numbers. |
| **2** | **`vet_clinical_triage_kb.md`** | Markdown | **PawDoctor Clinical Triage Profile**<br>`0a8fd1e8-45ac-4870-8f5f-cfbc7ccf58a6` | Board-certified clinical guidelines: chocolate/theobromine dose calculations, lily poisoning in cats, GDV/bloat, first aid rules. |
| **3** | **`dhaka_vet_clinics_directory.csv`** | CSV | **Vet Clinic & Telemedicine Navigator**<br>`9884416a-abd3-4e9c-a893-b2b0cab2bc60` | Verified 24/7 hospitals and specialized clinics in Dhaka (Cascade 24/7, Bark & Purr, Avian Sanctuary) with hotlines and equipment. |
| **4** | **`pet_nutrition_and_marketplace_catalog.csv`** | CSV | **Marketplace Nutrition & Diet Advisor**<br>`66e15325-9d32-4691-af65-d436fd727674` | Genuine pet foods (Royal Canin, Farmina N&D, Orijen), supplements (Salmon Oil, Probiotics), feeding portions, and allergen tags. |

---

## 2. Step-by-Step Upload Instructions in Gigalogy MAIRA Dashboard

Follow these 4 simple steps to upload each dataset:

### Step 1: Open Gigalogy Datasets
1. Log in to your Gigalogy console: [https://recommender.gigalogy.com/](https://recommender.gigalogy.com/)
2. In the left navigation sidebar, click on **Datasets** ➔ **Create Dataset**.

### Step 2: Upload File 1 (Lost & Found)
1. **Dataset Name**: `nuzzle_lost_found_dataset`
2. Click **Upload File** and select:
   `e:\nuzzle project\datasets\lost_found_radar_dataset.csv`
3. Click **Create / Ingest**.
4. Copy the generated `Dataset ID` (e.g., `ds_xxxxxx`).

### Step 3: Upload File 2 (PawDoctor Triage)
1. Click **Create Dataset** again.
2. **Dataset Name**: `nuzzle_vet_triage_kb`
3. Upload: `e:\nuzzle project\datasets\vet_clinical_triage_kb.md`
4. Copy the generated `Dataset ID`.

### Step 4: Upload File 3 & 4
- **Clinics Directory**: Name `nuzzle_vet_clinics_directory`, upload `dhaka_vet_clinics_directory.csv`.
- **Marketplace Nutrition**: Name `nuzzle_marketplace_nutrition`, upload `pet_nutrition_and_marketplace_catalog.csv`.

---

## 3. Save Dataset IDs into `.env.local`

Once you have the Dataset IDs from MAIRA, simply paste them into [Pet Social media/.env.local](file:///e:/nuzzle%20project/Pet%20Social%20media/.env.local):

```env
MAIRA_LOST_FOUND_DATASET_ID="আপনার_LOST_FOUND_DATASET_ID"
MAIRA_VET_DATASET_ID="আপনার_VET_DATASET_ID"
MAIRA_MARKETPLACE_DATASET_ID="আপনার_MARKETPLACE_DATASET_ID"
```

Once saved, MAIRA RAG will automatically cite these documents and return live reference citations and evaluation scores for every question!
