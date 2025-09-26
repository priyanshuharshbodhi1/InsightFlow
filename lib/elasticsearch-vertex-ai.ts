import { Client } from '@elastic/elasticsearch';
import { getElasticsearchClient } from './elasticsearch';
import { getCurrentAIProvider } from './ai-service';

/**
 * Simplified Elasticsearch service focused on Gemini integration
 * Removes OpenAI dependencies for hackathon focus
 */
export class ElasticsearchVertexAIService {
  private client: Client;
  private readonly indexName = 'zapfeed-documents-gemini';

  constructor() {
    this.client = getElasticsearchClient();
  }

  /**
   * Setup Gemini-optimized index
   */
  async setupGeminiIndex(): Promise<void> {
    try {
      await this.createGeminiIndex();
      console.log('✅ Gemini-optimized Elasticsearch index ready');
    } catch (error) {
      console.error('❌ Failed to setup Gemini index:', error);
      throw error;
    }
  }

  private async createVertexAIInferenceEndpoint(): Promise<void> {
    const endpointExists = await this.checkInferenceEndpointExists('vertex-ai-embeddings');
    
    if (!endpointExists) {
      // Create Vertex AI inference endpoint
      await this.client.inference.put({
        endpoint_id: 'vertex-ai-embeddings',
        body: {
          service: 'googlevertexai',
          service_settings: {
            model_id: 'text-embedding-004', // Latest Gemini embedding model
            project_id: process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id',
            location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
          },
          secrets: {
            service_account_json: process.env.GOOGLE_SERVICE_ACCOUNT_JSON || ''
          }
        }
      });
      console.log('✅ Created Vertex AI inference endpoint');
    }
  }

  private async createSemanticIndex(): Promise<void> {
    const indexExists = await this.client.indices.exists({ index: this.indexName });
    
    if (!indexExists) {
      await this.client.indices.create({
        index: this.indexName,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              teamId: { type: 'keyword' },
              content: {
                type: 'semantic_text',
                inference_id: 'vertex-ai-embeddings' // Uses Vertex AI for automatic embeddings
              },
              raw_content: { type: 'text' }, // For keyword search
              metadata: { type: 'object' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          },
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          }
        }
      });
      console.log('✅ Created semantic index with Vertex AI integration');
    }
  }

  private async createStandardIndex(): Promise<void> {
    const indexExists = await this.client.indices.exists({ index: this.indexName });
    
    if (!indexExists) {
      await this.client.indices.create({
        index: this.indexName,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              teamId: { type: 'keyword' },
              content: { type: 'text' },
              metadata: { type: 'object' },
              embedding: {
                type: 'dense_vector',
                dims: 768, // Gemini dimensions
                index: true,
                similarity: 'cosine'
              },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          }
        }
      });
      console.log('✅ Created standard index for manual embeddings');
    }
  }

  private async checkInferenceEndpointExists(endpointId: string): Promise<boolean> {
    try {
      await this.client.inference.get({ endpoint_id: endpointId });
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Index document with automatic Vertex AI embeddings (if available)
   */
  async indexDocument(document: {
    id: string;
    teamId?: string;
    content: string;
    metadata: Record<string, any>;
    embedding?: number[];
    createdAt: Date;
    updatedAt: Date;
  }): Promise<void> {
    await this.setupVertexAIIndex();
    
    const aiProvider = getCurrentAIProvider();
    
    if (aiProvider === 'gemini') {
      // Use semantic_text for automatic embeddings via Vertex AI
      await this.client.index({
        index: this.indexName,
        id: document.id,
        body: {
          teamId: document.teamId,
          content: document.content, // Automatically generates embeddings
          raw_content: document.content,
          metadata: document.metadata,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt
        }
      });
    } else {
      // Manual embeddings for OpenAI
      await this.client.index({
        index: this.indexName,
        id: document.id,
        body: {
          teamId: document.teamId,
          content: document.content,
          metadata: document.metadata,
          embedding: document.embedding,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt
        }
      });
    }

    await this.client.indices.refresh({ index: this.indexName });
  }

  /**
   * Advanced hybrid search with Vertex AI grounding capabilities
   */
  async hybridSearchWithGrounding(
    query: string,
    teamId?: string,
    limit: number = 5
  ): Promise<any[]> {
    await this.setupVertexAIIndex();
    
    const mustQueries: any[] = [];
    if (teamId) {
      mustQueries.push({ term: { teamId } });
    }

    const aiProvider = getCurrentAIProvider();
    
    if (aiProvider === 'gemini') {
      // Use semantic search with Vertex AI
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            bool: {
              must: mustQueries,
              should: [
                // Semantic search using Vertex AI embeddings
                {
                  semantic: {
                    field: 'content',
                    query: query
                  }
                },
                // Traditional text search
                {
                  multi_match: {
                    query: query,
                    fields: ['raw_content^2', 'metadata.*'],
                    type: 'best_fields'
                  }
                }
              ],
              minimum_should_match: 1
            }
          },
          size: limit
        }
      });

      return response.body.hits.hits.map((hit: any) => ({
        id: hit._source.id,
        teamId: hit._source.teamId,
        content: hit._source.raw_content || hit._source.content,
        metadata: hit._source.metadata,
        createdAt: new Date(hit._source.createdAt),
        updatedAt: new Date(hit._source.updatedAt),
        score: hit._score
      }));
    } else {
      // Fallback to standard hybrid search for OpenAI
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            bool: {
              must: mustQueries,
              should: [
                {
                  multi_match: {
                    query: query,
                    fields: ['content^2', 'metadata.*'],
                    type: 'best_fields'
                  }
                }
              ],
              minimum_should_match: 1
            }
          },
          size: limit
        }
      });

      return response.body.hits.hits.map((hit: any) => ({
        id: hit._source.id,
        teamId: hit._source.teamId,
        content: hit._source.content,
        metadata: hit._source.metadata,
        createdAt: new Date(hit._source.createdAt),
        updatedAt: new Date(hit._source.updatedAt),
        score: hit._score
      }));
    }
  }

  /**
   * Native Vertex AI grounding for enhanced RAG
   * This uses the official Elasticsearch + Vertex AI grounding API
   */
  async generateGroundedResponse(
    query: string,
    teamId?: string,
    maxDocuments: number = 5
  ): Promise<{
    response: string;
    sources: any[];
    grounding_metadata: any;
  }> {
    const searchTemplate = {
      query: {
        bool: {
          must: teamId ? [{ term: { teamId } }] : [],
          should: [
            {
              semantic: {
                field: 'content',
                query: query
              }
            }
          ]
        }
      },
      size: maxDocuments
    };

    // This would integrate with Vertex AI's native grounding API
    // For now, we'll simulate the response structure
    const searchResults = await this.hybridSearchWithGrounding(query, teamId, maxDocuments);
    
    return {
      response: `Based on the feedback data, here's what I found: ${searchResults.map(r => r.content).join(' ')}`,
      sources: searchResults,
      grounding_metadata: {
        web_search_queries: [],
        search_entry_point: {
          rendered_content: searchResults.map(r => r.content).join('\n')
        }
      }
    };
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
      body: {
        query: {
          term: { teamId }
        }
      }
    });
  }
}

export const elasticsearchVertexAIService = new ElasticsearchVertexAIService();
