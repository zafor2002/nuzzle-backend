import { NextResponse } from 'next/server';
import { CORS_HEADERS } from '@/lib/api-response';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Nuzzle Full-Stack REST API Engine',
      version: '2.0.0',
      description:
        'Production RESTful API Engine for the Nuzzle Pet Social & Telemedicine Platform. Built with Next.js 16, Prisma 7 ORM, and Supabase Cloud PostgreSQL with 6-layer decoupled architecture.',
      contact: {
        name: 'Nuzzle Engineering Team',
        email: 'dev@nuzzle.app',
        url: 'https://github.com/zafor2002/nuzzle-backend',
      },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local Development Server' },
      { url: 'https://nuzzle.vercel.app', description: 'Production Edge Proxy' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Bearer JWT token obtained from Supabase Auth /api/auth/login.',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string', example: 'Operation completed successfully.' },
            error: { type: 'string' },
            meta: { type: 'object' },
          },
        },
        HealthStatus: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'HEALTHY' },
            uptimeSeconds: { type: 'number', example: 1240 },
            database: {
              type: 'object',
              properties: {
                provider: { type: 'string', example: 'Supabase PostgreSQL' },
                status: { type: 'string', example: 'CONNECTED' },
                latencyMs: { type: 'number', example: 4.8 },
              },
            },
          },
        },
        UploadResponse: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'https://knykelyweiuslgfljiir.supabase.co/storage/v1/object/public/post-media/upload_rusty.jpg' },
            key: { type: 'string', example: 'upload_1788500000.jpg' },
            size: { type: 'number', example: 245100 },
            mimeType: { type: 'string', example: 'image/jpeg' },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          summary: 'Layer 6: System & Database Health Check',
          description: 'Returns real-time uptime, PostgreSQL database connectivity latency, memory metrics, and subsystem health status.',
          responses: {
            200: { description: 'System is healthy', content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthStatus' } } } },
          },
        },
      },
      '/api/upload': {
        post: {
          summary: 'Layer 5: Cloud Media Storage Image Upload',
          description: 'Uploads images to Supabase Storage bucket (post-media) or local storage fallback and returns public CDN URL.',
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: { file: { type: 'string', format: 'binary' } },
                },
              },
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { image: { type: 'string', description: 'Base64 data URL string' } },
                },
              },
            },
          },
          responses: {
            201: { description: 'Image uploaded successfully' },
            400: { description: 'Invalid file or file size exceeds 5MB' },
          },
        },
      },
      '/api/lost-found': {
        get: {
          summary: 'Layer 3: Lost & Found 5-Mile Radar Reports',
          description: 'Fetches emergency lost and found pet reports with geospatial Haversine radius filtering.',
          parameters: [
            { name: 'filter', in: 'query', schema: { type: 'string', enum: ['all', 'lost', 'found', 'emergency'] } },
            { name: 'lat', in: 'query', schema: { type: 'number', example: 23.7925 }, description: 'User latitude coordinate' },
            { name: 'lng', in: 'query', schema: { type: 'number', example: 90.4078 }, description: 'User longitude coordinate' },
            { name: 'radius', in: 'query', schema: { type: 'number', default: 5 }, description: 'Search radius in miles (default 5)' },
          ],
          responses: {
            200: { description: 'List of nearby pet radar reports' },
          },
        },
        post: {
          summary: 'Broadcast Lost/Found Emergency Radar Alert',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['petName', 'species'],
                  properties: {
                    petName: { type: 'string' },
                    species: { type: 'string' },
                    type: { type: 'string', enum: ['lost', 'found', 'emergency_rescue'] },
                    lastSeenLocation: { type: 'string' },
                    description: { type: 'string' },
                    reward: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Alert broadcasted' } },
        },
      },
      '/api/lost-found/ai-match': {
        post: {
          summary: 'Layer 3: MAIRA RAG & Semantic AI Lost Pet Correlator',
          description: 'Correlates a sighted pet description or multimodal image query against active lost pet reports using Gigalogy MAIRA RAG / vector dataset indexing with automated local database fallback.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['query'],
                  properties: {
                    query: { type: 'string', example: 'Found a golden retriever with brown collar wandering near Banani park' },
                    imageUrl: { type: 'string', example: 'https://cdn.nuzzle.app/lost/golden_retriever_found.jpg' },
                    species: { type: 'string', example: 'Dog' },
                    location: { type: 'string', example: 'Banani, Dhaka' },
                    topK: { type: 'number', example: 5 },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Matched lost pet candidates with confidence score, analysis, and contact information',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          matches: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                petName: { type: 'string' },
                                species: { type: 'string' },
                                breed: { type: 'string' },
                                lastSeenLocation: { type: 'string' },
                                matchScore: { type: 'number', example: 0.94 },
                                matchReason: { type: 'string' },
                                contactPhone: { type: 'string' },
                                reward: { type: 'string' },
                              },
                            },
                          },
                          summary: { type: 'string' },
                          provider: { type: 'string', example: 'maira' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/pawai/triage': {
        post: {
          summary: 'Layer 3: PawDoctor AI 24/7 Clinical Symptom Triage',
          description: 'Analyzes pet symptoms in English or Bengali using Google Gemini or fallback clinical heuristic engine, returning urgency rating, first aid actions, red flags, and clinic referrals.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['symptoms'],
                  properties: {
                    petName: { type: 'string', example: 'Rusty' },
                    species: { type: 'string', example: 'Dog' },
                    breed: { type: 'string', example: 'Golden Retriever' },
                    age: { type: 'string', example: '3 years' },
                    symptoms: { type: 'string', example: 'Lethargic and vomiting after eating chocolate' },
                    isProSubscriber: { type: 'boolean', example: false },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Clinical triage diagnostic assessment complete' },
          },
        },
      },
      '/api/pawai/chat': {
        post: {
          summary: 'Layer 3: PawDoctor AI Conversational Veterinary Assistant',
          description: 'Multi-turn interactive clinical chat with pet context and follow-up guidance powered by LLM API.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['messages'],
                  properties: {
                    messages: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          role: { type: 'string', enum: ['user', 'assistant', 'system'] },
                          content: { type: 'string', example: 'What foods should I never feed my dog?' },
                        },
                      },
                    },
                    petContext: {
                      type: 'object',
                      properties: {
                        petName: { type: 'string', example: 'Mochi' },
                        species: { type: 'string', example: 'Cat' },
                        breed: { type: 'string', example: 'British Shorthair' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'PawDoctor AI conversational reply generated' },
          },
        },
      },
      '/api/posts': {
        get: {
          summary: 'Layer 3: Social Den Feed & Multimedia Posts',
          responses: { 200: { description: 'List of community posts' } },
        },
      },
      '/api/vet/directory': {
        get: {
          summary: 'Layer 3: Veterinary Clinic Directory',
          responses: { 200: { description: 'List of certified vet clinics' } },
        },
      },
      '/api/vet/appointments': {
        get: { summary: 'Get Booked Vet Telemedicine Appointments' },
        post: { summary: 'Book New Veterinary Appointment' },
      },
      '/api/marketplace': {
        get: { summary: 'Layer 3: Verified Pet Store Marketplace' },
      },
      '/api/marketplace/ai-nutrition': {
        post: {
          summary: 'Layer 3: MAIRA Nutrition & Diet Advisor Concierge',
          description: 'Evaluates pet life-stage dietary requirements, screens for safe vs toxic foods, and recommends verified marketplace feeds/supplements using Gigalogy MAIRA profile 66e15325.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['query'],
                  properties: {
                    species: { type: 'string', example: 'Cat' },
                    breed: { type: 'string', example: 'Persian' },
                    age: { type: 'string', example: '2 years' },
                    weight: { type: 'string', example: '4.5 kg' },
                    allergies: { type: 'string', example: 'Chicken sensitivity' },
                    query: { type: 'string', example: 'What hypoallergenic food should I feed my cat with sensitive stomach?' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Dietary guidance and verified marketplace products generated' },
          },
        },
      },
      '/api/marketplace/checkout': {
        post: { summary: 'External Service: Process Marketplace Payment Order' },
      },
      '/api/adoption': {
        get: { summary: 'Layer 3: Rescue Animal Adoption Profiles' },
      },
    },
  };

  return NextResponse.json(openApiSpec, {
    status: 200,
    headers: CORS_HEADERS,
  });
}
