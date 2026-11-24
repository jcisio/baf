import { LatencyOptimisedTranslator } from './bergamot/translator.js'

export async function createBergamotTranslator() {
  const engine = new LatencyOptimisedTranslator({
    registryUrl: new URL('./bergamot/models.json', import.meta.url).href,
    pivotLanguage: null,
    useNativeIntGemm: false,
  })
  await Promise.all([engine.worker, engine.backing.registry])

  return {
    async translate(text) {
      const { target } = await engine.translate({ from: 'en', to: 'fr', text })
      return target.text
    },
    destroy: () => engine.delete(),
  }
}
