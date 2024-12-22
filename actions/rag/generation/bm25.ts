"use server"

interface BM25Options {
  k1?: number // term frequency saturation parameter (default: 1.2)
  b?: number // length normalization parameter (default: 0.75)
}

interface Document {
  termFrequencies: Record<string, number>
  documentLength: number
}

export class BM25 {
  private documents: Document[]
  private avgDocLength: number
  private docFreq: Map<string, number>
  private k1: number
  private b: number

  constructor(documents: Document[], options: BM25Options = {}) {
    this.documents = documents
    this.k1 = options.k1 || 1.2
    this.b = options.b || 0.75
    
    // Calculate average document length
    const totalLength = documents.reduce((sum, doc) => sum + doc.documentLength, 0)
    this.avgDocLength = totalLength / documents.length

    // Calculate document frequencies
    this.docFreq = new Map()
    documents.forEach(doc => {
      const terms = Object.keys(doc.termFrequencies)
      terms.forEach(term => {
        this.docFreq.set(term, (this.docFreq.get(term) || 0) + 1)
      })
    })
  }

  static calculateTermFrequencies(text: string): Record<string, number> {
    const terms = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)

    const frequencies: Record<string, number> = {}
    for (const term of terms) {
      frequencies[term] = (frequencies[term] || 0) + 1
    }
    
    return frequencies
  }

  score(query: string, documentIndex: number): number {
    const queryTerms = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
    
    const doc = this.documents[documentIndex]
    
    return queryTerms.reduce((score, term) => {
      const tf = doc.termFrequencies[term] || 0
      const df = this.docFreq.get(term) || 0
      if (df === 0) return score
      
      const idf = Math.log((this.documents.length - df + 0.5) / (df + 0.5) + 1)
      const numerator = tf * (this.k1 + 1)
      const denominator = tf + this.k1 * (1 - this.b + this.b * doc.documentLength / this.avgDocLength)
      
      return score + idf * numerator / denominator
    }, 0)
  }
}