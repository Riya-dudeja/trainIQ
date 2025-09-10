import { NextResponse } from 'next/server';

const RAPIDAPI_BASE_URL = 'https://gym-fit.p.rapidapi.com/v1';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'gym-fit.p.rapidapi.com';

// GET /api/exercises - Proxy to RapidAPI
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyPart = searchParams.get('bodyPart');
    const target = searchParams.get('target');
    const equipment = searchParams.get('equipment');
    const name = searchParams.get('name');

    let endpoint = '/exercises';
    
    // Build endpoint based on query parameters
    if (bodyPart) {
      endpoint = `/exercises/bodyPart/${bodyPart}`;
    } else if (target) {
      endpoint = `/exercises/target/${target}`;
    } else if (equipment) {
      endpoint = `/exercises/equipment/${equipment}`;
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
      count: Array.isArray(data) ? data.length : 1
    });
  } catch (error) {
    console.error('Error fetching exercises from RapidAPI:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercises from RapidAPI' },
      { status: 500 }
    );
  }
}