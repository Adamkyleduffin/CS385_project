# Carbon credits: method and sources

**Ticket:** CS385-36 · **Code:** `src/lib/carbon.ts` (numbers), `src/lib/ledger.ts` (who gets what)

## What we estimate

When a student gives away a clothing item instead of the receiver buying it new, some new production is avoided. We estimate that saving in kg CO₂e and turn it into points.

```
kg CO₂e saved = typical item weight (kg) × clothing emission factor (kg CO₂e per kg) × displacement rate
points        = round(kg CO₂e saved × 10)
```

Both the giver and the receiver earn the points. Campus totals count each exchange's CO₂e once (see `docs/carbon-data-spec.md`).

## 1. Clothing emission factor: 22.31 kg CO₂e per kg

| Field           | Value                                                                             |
| --------------- | --------------------------------------------------------------------------------- |
| Provider        | Climatiq                                                                          |
| Name            | Clothing (primary material production)                                            |
| Activity ID     | `consumer_goods-type_clothing_primary_material_production`                        |
| Factor ID       | `b510ce09-872e-82c3-8cbe-823f1ce5ecbc`                                            |
| Original source | UK government (BEIS / DESNZ), _Greenhouse gas reporting: conversion factors 2026_ |
| Value           | 22,310 kg CO₂e per tonne = **22.31 kg CO₂e per kg**                               |
| Region          | United Kingdom (closest available to Ireland)                                     |
| Scope           | Cradle to gate                                                                    |

The same value appears in the 2022, 2024, 2025 and 2026 releases of this dataset, so it is a stable choice.

**Why this one:** it is an official government factor, it is measured per kg (which fits our weight-based method), and it covers clothing in general rather than one fibre.

## 2. Displacement rate: 0.646

Not every second-hand item replaces a new purchase. WRAP found that, on average, 64.6% of second-hand clothing purchases displace a new one (about three new items avoided for every five bought second-hand). We only count that share.

## 3. Typical item weights

| Sub-category | Weight (kg) | kg CO₂e saved | Points |
| ------------ | ----------- | ------------- | ------ |
| Accessories  | 0.10        | 1.4           | 14     |
| Tops         | 0.25        | 3.6           | 36     |
| Dresses      | 0.30        | 4.3           | 43     |
| Bottoms      | 0.50        | 7.2           | 72     |
| Bags         | 0.60        | 8.6           | 86     |
| Footwear     | 0.90        | 13.0          | 130    |
| Outerwear    | 1.20        | 17.3          | 173    |

These are typical single-item weights. A garment study from OsloMet found synthetic dresses weigh about 200 g and synthetic trousers about 300 g, with natural-fibre versions heavier (some trousers over 500 g), which is consistent with the values above.

**To do:** each team member weighs 3–5 of their own items per sub-category on a kitchen scale. Replace the weights with the averages and note the sample size here. Measured data is easier to defend than estimates.

## Limitations (say these in the demo)

- **We under-claim on purpose.** The factor is cradle to gate, so it leaves out transport, retail and washing. WRAP estimates that buying second-hand jeans online instead of new saves over 30 kg CO₂e, while we give Bottoms 7.2 kg.
- **Footwear and bags** use the clothing factor as an approximation. They are mostly leather, rubber and synthetics; a specific factor can replace it later.
- **Weights are averages.** A heavy winter coat and a light rain jacket both count as Outerwear.
- **UK factor.** Ireland-specific clothing factors weren't available; production happens abroad either way, so the UK figure is a reasonable proxy.

## Checking the factor with the Climatiq API

Create a free Climatiq account, then keep the API key out of the repo (it will live in a Supabase secret later). Ask for the emissions of 1 kg of clothing:

```bash
curl --request POST \
  --url https://api.climatiq.io/data/v1/estimate \
  --header "Authorization: Bearer $CLIMATIQ_API_KEY" \
  --data '{
    "emission_factor": {
      "activity_id": "consumer_goods-type_clothing_primary_material_production",
      "region": "GB",
      "data_version": "^33"
    },
    "parameters": { "weight": 1, "weight_unit": "kg" }
  }'
```

`co2e` in the response should be about **22.31**. If Climatiq returns a notice about the data version, use the latest version shown in the Climatiq documentation.

## Sources

- Climatiq factor page: https://www.climatiq.io/data/emission-factor/b510ce09-872e-82c3-8cbe-823f1ce5ecbc
- Climatiq estimate API: https://www.climatiq.io/docs/api-reference/estimate
- WRAP, resale displacement rates: https://www.wrap.ngo/media-centre/press-releases/fast-fashion-could-be-left-peg-preloved-and-repair-displace-new-sales
- OsloMet Clothing Research, "Weighing Weight": https://clothingresearch.oslomet.no/?p=11491
