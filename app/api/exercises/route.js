import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp } from '../../utils/rateLimiter';
import { checkRateLimit } from '../../utils/rateLimiter';

// Server-side env only. Never expose client-side.
const RAPIDAPI_BASE_URL = 'https://gym-fit.p.rapidapi.com/v1';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'gym-fit.p.rapidapi.com';

// Strict schema-based validation (OWASP: whitelist, length limits, type checks)
const ExercisesQuerySchema = z.object({
  bodyPart: z.string().trim().toLowerCase().min(1).max(64).optional(),
  target: z.string().trim().toLowerCase().min(1).max(64).optional(),
  equipment: z.string().trim().toLowerCase().min(1).max(64).optional(),
  name: z.string().trim().min(1).max(128).optional(),
}).strict(); // Reject unexpected fields

// GET /api/exercises - Proxy to RapidAPI
export async function GET(request) {
  try {
    // Rate limiting (IP + optional user-based via header)
    const ip = getClientIp(request.headers);
    const userId = request.headers.get('x-user-id') || null; // optional
    const rl = checkRateLimit({ key: `exercises`, ip, userId });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
        }
      );
    }

    // Validate and sanitize query params
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsed = ExercisesQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { bodyPart, target, equipment, name } = parsed.data;

    let endpoint = '/exercises';
    // Build endpoint based on query parameters (mutually exclusive priority)
    if (bodyPart) {
      endpoint = `/exercises/bodyPart/${encodeURIComponent(bodyPart)}`;
    } else if (target) {
      endpoint = `/exercises/target/${encodeURIComponent(target)}`;
    } else if (equipment) {
      endpoint = `/exercises/equipment/${encodeURIComponent(equipment)}`;
    } else if (name) {
      endpoint = `/exercises/name/${encodeURIComponent(name)}`;
    }

    const response = await fetch(`${RAPIDAPI_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `RapidAPI request failed: ${response.status}`;

      if (response.status === 401) {
        errorMessage = 'Unauthorized: Invalid RapidAPI key';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden: API access denied';
      } else if (response.status === 404) {
        errorMessage = 'Exercises not found';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded';
      } else if (errorText) {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `${errorMessage} - ${errorText}`;
        }
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data,
      count: Array.isArray(data) ? data.length : 1,
    });
  } catch (error) {
    console.error('Error fetching exercises from RapidAPI:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercises from RapidAPI' },
      { status: 500 }
    );
  }
}