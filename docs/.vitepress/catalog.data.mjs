import { readLibraries } from './catalog.mjs'

export default {
  watch: ['../**/*.md'],
  load() { return readLibraries() }
}
