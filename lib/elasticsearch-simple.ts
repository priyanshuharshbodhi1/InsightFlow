import { Client } from '@elastic/elasticsearch';
import { getElasticsearchClient } from './elasticsearch';

/**
 * Simplified Elasticsearch service for Gemini integration
 * Focused on hackathon requirements without complex Vertex AI API calls
 */
export class ElasticsearchGeminiService {
  private client: Client;
  private readonly indexName = 'zapfeed-gemini';

  constructor() {
    this.client = getElasticsearchClient();
  }

  async ensureIndexExists(): Promise<void> {
    const indexExists = await this.client.indices.exists({
      index: this.indexName
    });

    if (!indexExists) {
      await this.client.indices.create({
        index: this.indexName,
        mappings: {
          properties: {
            id: { type: 'keyword' },
            teamId: { type: 'keyword' },
            content: { 
              type: 'text',
              analyzer: 'standard'
            },
            metadata: { type: 'object' },
            embedding: {
              type: 'dense_vector',
              dims: 768, // Gemini text-embedding-004 dimensions
              index: true,
              similarity: 'cosine'
            },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        },
        // No settings for serverless Elasticsearch - shards/replicas are auto-managed
      });
      console.log('✅ Gemini-optimized Elasticsearch index created');
    }
  }

  async indexDocument(document: {
    id: string;
    teamId?: string;
    content: string;
    metadata: Record<string, any>;
    embedding: number[];
    createdAt: Date;
    updatedAt: Date;
  }): Promise<void> {
    await this.ensureIndexExists();
    
    await this.client.index({
      index: this.indexName,
      id: document.id,
      document: {
        teamId: document.teamId,
        content: document.content,
        metadata: document.metadata,
        embedding: document.embedding,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      }
    });

    await this.client.indices.refresh({ index: this.indexName });
  }

  async hybridSearch(
    query: string,
    embedding: number[],
    teamId?: string,
    limit: number = 5
  ): Promise<any[]> {
    await this.ensureIndexExists();

    const mustQueries: any[] = [];
    if (teamId) {
      mustQueries.push({ term: { teamId } });
    }

    const response = await this.client.search({
      index: this.indexName,
      query: {
        bool: {
          must: mustQueries,
          should: [
            // Text search
            {
              multi_match: {
                query,
                fields: ['content^2', 'metadata.*'],
                type: 'best_fields',
                boost: 1.0
              }
            },
            // Vector search
            {
              knn: {
                field: 'embedding',
                query_vector: embedding,
                k: limit,
                num_candidates: limit * 2,
                boost: 1.5
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      size: limit
    });

    return response.hits.hits.map((hit: any) => ({
      id: hit._source.id,
      teamId: hit._source.teamId,
      content: hit._source.content,
      metadata: hit._source.metadata,
      createdAt: new Date(hit._source.createdAt),
      updatedAt: new Date(hit._source.updatedAt),
      score: hit._score
    }));
  }

  async deleteDocument(id: string): Promise<void> {
    await this.client.delete({
      index: this.indexName,
      id
    });
  }

  async deleteByTeamId(teamId: string): Promise<void> {
    await this.client.deleteByQuery({
      index: this.indexName,
      query: {
        term: { teamId }
      }
    });
  }
}

export const elasticsearchGeminiService = new ElasticsearchGeminiService();
