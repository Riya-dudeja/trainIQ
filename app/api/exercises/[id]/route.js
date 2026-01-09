import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, checkRateLimit } from '../../../utils/rateLimiter';

const RAPIDAPI_BASE_URL = 'https://gym-fit.p.rapidapi.com/v1';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'gym-fit.p.rapidapi.com';

// Strict ID schema: alphanumeric and hyphen, length limit
const ExerciseIdSchema = z.string().trim().regex(/^[a-zA-Z0-9-]+$/).min(1).max(64);

// GET /api/exercises/[id]
export async function GET(request, { params }) {
  try {
    // Rate limiting (IP + optional user-based via header)
    const ip = getClientIp(request.headers);
    const userId = request.headers.get('x-user-id') || null; // optional
    const rl = checkRateLimit({ key: `exercises-id`, ip, userId });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
        }
      );
    }

    const rawId = params.id;
    const parsed = ExerciseIdSchema.safeParse(rawId);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid exercise ID', details: parsed.error.issues },
        { status: 400 }
      );
    }
    const id = parsed.data;

    const response = await fetch(`${RAPIDAPI_BASE_URL}/exercises/${encodeURIComponent(id)}`, {
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

      if (response.status === 401) errorMessage = 'Unauthorized: Invalid RapidAPI key';
      else if (response.status === 403) errorMessage = 'Forbidden: API access denied';
      else if (response.status === 404) errorMessage = `Exercise with ID ${id} not found`;
      else if (response.status === 429) errorMessage = 'Rate limit exceeded';
      else if (errorText) {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `${errorMessage} - ${errorText}`;
        }
      }

      return NextResponse.json({ success: false, error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching exercise from RapidAPI:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercise from RapidAPI' },
      { status: 500 }
    );
  }
}