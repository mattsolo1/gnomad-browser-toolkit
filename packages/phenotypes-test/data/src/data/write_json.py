import hail as hl
import pandas as pd
from functools import reduce

# https://www.dropbox.com/s/18p4lj3finj11oh/phenotype_manifest.tsv.bgz?dl=0
manifest = hl.import_table("./phenotype_manifest.tsv.bgz", impute=True)
df = manifest.to_pandas()
# df.to_json("200819_pan_ancestry_manifest.json", orient="records")

id_vars = ["trait_type", "phenocode", "coding", "modifier"]

n_cases = df.rename(
    columns={
        "n_cases_full_cohort_both_sexes": "both_sexes",
        "n_cases_full_cohort_males": "males",
        "n_cases_full_cohort_females": "females",
    }
)
n_cases_full = n_cases.melt(
    id_vars=id_vars,
    value_vars=["both_sexes", "males", "females",],
    var_name="population",
    value_name="n_cases",
)
n_cases_pops = df.melt(
    id_vars=id_vars,
    value_vars=[
        "n_cases_AFR",
        "n_cases_AMR",
        "n_cases_CSA",
        "n_cases_EAS",
        "n_cases_EUR",
        "n_cases_MID",
    ],
    var_name="population",
    value_name="n_cases",
)
n_cases_pops["population"] = n_cases_pops.population.str.split(
    "_", expand=True
)[2]
n_cases = n_cases_pops.append(n_cases_full)
n_cases.to_csv("200827_pan_n_cases.tsv", sep="\t")

n_controls = df.melt(
    id_vars=id_vars,
    value_vars=[
        "n_controls_AFR",
        "n_controls_AMR",
        "n_controls_CSA",
        "n_controls_EAS",
        "n_controls_EUR",
        "n_controls_MID",
    ],
    var_name="population",
    value_name="n_controls",
)
n_controls["population"] = n_controls.population.str.split("_", expand=True)[2]
n_controls
n_controls.to_csv("200827_pan_n_controls.tsv", sep="\t")


drop_main = [
    "n_cases_full_cohort_both_sexes",
    "n_cases_full_cohort_females",
    "n_cases_full_cohort_males",
    "n_cases_AFR",
    "n_cases_AMR",
    "n_cases_CSA",
    "n_cases_EAS",
    "n_cases_EUR",
    "n_cases_MID",
    "n_controls_AFR",
    "n_controls_AMR",
    "n_controls_CSA",
    "n_controls_EAS",
    "n_controls_EUR",
    "n_controls_MID",
    "saige_heritability_AFR",
    "saige_heritability_AMR",
    "saige_heritability_CSA",
    "saige_heritability_EAS",
    "saige_heritability_EUR",
    "saige_heritability_MID",
    "lambda_gc_AFR",
    "lambda_gc_AMR",
    "lambda_gc_CSA",
    "lambda_gc_EAS",
    "lambda_gc_EUR",
    "lambda_gc_MID",
]
df_limited = df.drop(columns=drop_main)
df_limited.to_csv("200827_pan_limited.tsv", sep="\t")
# cases = reduce(
#     lambda left, right: pd.merge(left, right, on=id_vars), cases
# )
