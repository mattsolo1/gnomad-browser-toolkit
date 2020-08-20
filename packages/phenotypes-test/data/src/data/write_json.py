import hail as hl
# https://www.dropbox.com/s/18p4lj3finj11oh/phenotype_manifest.tsv.bgz?dl=0
manifest = hl.import_table("./phenotype_manifest.tsv.bgz", impute=True)
df = manifest.to_pandas()
df.to_json('200819_pan_ancestry_manifest.json', orient="records")
