import ExacVariantDetailsType from './exac/ExacVariantDetailsType'
import countExacVariantsInRegion from './exac/countExacVariantsInRegion'
import fetchExacVariantDetails from './exac/fetchExacVariantDetails'
import fetchExacVariantsByGene from './exac/fetchExacVariantsByGene'
import fetchExacVariantsByRegion from './exac/fetchExacVariantsByRegion'
import fetchExacVariantsByTranscript from './exac/fetchExacVariantsByTranscript'

import Gnomad202VariantDetailsType from './gnomad_r2_0_2/GnomadVariantDetailsType'
import countGnomad202VariantsInRegion from './gnomad_r2_0_2/countGnomadVariantsInRegion'
import fetchGnomad202VariantDetails from './gnomad_r2_0_2/fetchGnomadVariantDetails'
import fetchGnomad202VariantsByGene from './gnomad_r2_0_2/fetchGnomadVariantsByGene'
import fetchGnomad202VariantsByRegion from './gnomad_r2_0_2/fetchGnomadVariantsByRegion'
import fetchGnomad202VariantsByTranscript from './gnomad_r2_0_2/fetchGnomadVariantsByTranscript'

import countGnomad21VariantsInRegion from './gnomad_r2_1/countGnomadVariantsInRegion'
import fetchGnomad21VariantsByGene from './gnomad_r2_1/fetchGnomadVariantsByGene'
import fetchGnomad21VariantsByRegion from './gnomad_r2_1/fetchGnomadVariantsByRegion'
import fetchGnomad21VariantsByTranscript from './gnomad_r2_1/fetchGnomadVariantsByTranscript'

const datasetsConfig = {
  exac: {
    countVariantsInRegion: countExacVariantsInRegion,
    fetchVariantDetails: fetchExacVariantDetails,
    fetchVariantsByGene: fetchExacVariantsByGene,
    fetchVariantsByRegion: fetchExacVariantsByRegion,
    fetchVariantsByTranscript: fetchExacVariantsByTranscript,
    variantDetailsType: ExacVariantDetailsType,
  },
  gnomad_r2_0_2: {
    countVariantsInRegion: countGnomad202VariantsInRegion,
    fetchVariantDetails: fetchGnomad202VariantDetails,
    fetchVariantsByGene: fetchGnomad202VariantsByGene,
    fetchVariantsByRegion: fetchGnomad202VariantsByRegion,
    fetchVariantsByTranscript: fetchGnomad202VariantsByTranscript,
    variantDetailsType: Gnomad202VariantDetailsType,
  },
  gnomad_r2_1: {
    countVariantsInRegion: (...args) => countGnomad21VariantsInRegion(...args, 'gnomad'),
    fetchVariantsByGene: (...args) => fetchGnomad21VariantsByGene(...args, 'gnomad'),
    fetchVariantsByRegion: (...args) => fetchGnomad21VariantsByRegion(...args, 'gnomad'),
    fetchVariantsByTranscript: (...args) => fetchGnomad21VariantsByTranscript(...args, 'gnomad'),
  },
}

const gnomadSubsets = ['controls', 'non_neuro', 'non_cancer', 'non_topmed']

gnomadSubsets.forEach(subset => {
  datasetsConfig[`gnomad_r2_1_${subset}`] = {
    countVariantsInRegion: (...args) => countGnomad21VariantsInRegion(...args, subset),
    fetchVariantsByGene: (...args) => fetchGnomad21VariantsByGene(...args, subset),
    fetchVariantsByRegion: (...args) => fetchGnomad21VariantsByRegion(...args, subset),
    fetchVariantsByTranscript: (...args) => fetchGnomad21VariantsByTranscript(...args, subset),
  }
})

export default datasetsConfig

export const datasetSpecificTypes = [ExacVariantDetailsType, Gnomad202VariantDetailsType]