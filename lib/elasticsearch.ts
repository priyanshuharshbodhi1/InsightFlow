import { Client } from '@elastic/elasticsearch';
import { getEmbeddingDimensions } from './ai-service';

let client: Client | null = null;

export function getElasticsearchClient(): Client {
  if (!client) {
    const cloudId = process.env.ELASTICSEARCH_CLOUD_ID?.trim();
    const apiKey = process.env.ELASTICSEARCH_API_KEY?.trim();
    const url = process.env.ELASTICSEARCH_URL?.trim();

    console.log('Elasticsearch Config Check:', { 
      hasCloudId: !!cloudId, 
      hasApiKey: !!apiKey, 
      hasUrl: !!url,
      cloudIdLength: cloudId?.length || 0,
      urlValue: url ? `${url.substring(0, 30)}...` : 'none'
    });

    // Priority: URL + API Key (Serverless) > Cloud ID + API Key (Traditional)
    if (url && apiKey) {
      // Serverless Elasticsearch configuration (HTTPS URL + API Key)
      console.log('✅ Using Serverless Elasticsearch configuration');
      client = new Client({
        node: url,
        auth: { apiKey }
      });
    } else if (cloudId && apiKey && cloudId.includes(':') && cloudId.length > 10) {
      // Traditional Elastic Cloud configuration (validate Cloud ID format more strictly)
      console.log('✅ Using Traditional Elastic Cloud configuration');
      client = new Client({
        cloud: { id: cloudId },
        auth: { apiKey }
      });
    } else if (url) {
      // Self-hosted Elasticsearch configuration
      console.log('✅ Using Self-hosted Elasticsearch configuration');
      client = new Client({
        node: url,
        auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD 
          ? {
              username: process.env.ELASTICSEARCH_USERNAME,
              password: process.env.ELASTICSEARCH_PASSWORD
            }
          : undefined
      });
    } else {
      throw new Error(
        'Elasticsearch configuration missing or invalid. Please provide either:\n' +
        '- ELASTICSEARCH_URL and ELASTICSEARCH_API_KEY for Serverless Elasticsearch (recommended), or\n' +
        '- ELASTICSEARCH_CLOUD_ID (format: "name:base64string") and ELASTICSEARCH_API_KEY for traditional Elastic Cloud, or\n' +
        '- ELASTICSEARCH_URL for self-hosted\n\n' +
        `Current config: cloudId=${!!cloudId}, apiKey=${!!apiKey}, url=${!!url}`
      );
    }
  }

  return client;
}

export interface EmbeddedDocument {
  id: string;
  teamId?: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export class ElasticsearchService {
  private client: Client;
  private readonly indexName = 'zapfeed-documents';

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
              dims: 768, // Fixed to Gemini dimensions for now
              index: true,
              similarity: 'cosine'
            },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        },
        // No settings for serverless Elasticsearch - shards/replicas are auto-managed
      });
    }
  }

  async indexDocument(document: EmbeddedDocument): Promise<void> {
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

    // Refresh the index to make the document searchable immediately
    await this.client.indices.refresh({ index: this.indexName });
  }

  async hybridSearch(
    query: string,
    embedding: number[],
    teamId?: string,
    limit: number = 5
  ): Promise<EmbeddedDocument[]> {
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
            // Keyword search
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
      embedding: hit._source.embedding,
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

  async getDocument(id: string): Promise<EmbeddedDocument | null> {
    try {
      const response = await this.client.get({
        index: this.indexName,
        id
      });

      if (response.found) {
        const source = response._source as any;
        return {
          id: source.id,
          teamId: source.teamId,
          content: source.content,
          metadata: source.metadata,
          embedding: source.embedding,
          createdAt: new Date(source.createdAt),
          updatedAt: new Date(source.updatedAt)
        };
      }
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }

    return null;
  }
}

export const elasticsearchService = new ElasticsearchService();
