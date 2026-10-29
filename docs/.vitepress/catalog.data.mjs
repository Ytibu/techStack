import { readCatalog } from './catalog.mjs'

export default {
  watch: ['../**/*.md'],
  load() { return readCatalog() }
}
