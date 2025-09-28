import { Teacher, TeachersApiResponse, ApiTeacher } from '@/types/teacher';
import { ApiError, handleApiError } from '@/lib/errors';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function transformApiTeacher(apiTeacher: ApiTeacher): Teacher {
  return {
    id: apiTeacher.id,
    profilePhoto: apiTeacher.profileImage,
    fullName: apiTeacher.name,
    username: apiTeacher.username,
    email: apiTeacher.email,
    phoneNumber: '', // Not available in API response
    address: '', // Not available in API response
    dateOfBirth: '', // Not available in API response
    subjects: [], // Not available in API response
    joinDate: apiTeacher.createdAt,
    status: apiTeacher.verified_at ? 'active' : 'inactive',
  };
}

export async function fetchTeachers(page: number = 1): Promise<{
  teachers: Teacher[];
  meta: TeachersApiResponse['meta'];
}> {
  try {
    const response = await fetch(`${BASE_URL}/teachers?page=${page}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorMessage = `Failed to fetch teachers (${response.status})`;
      throw new ApiError(errorMessage, response.status);
    }

    const data: TeachersApiResponse = await response.json();
    
    // Validate response structure
    if (!data || typeof data.success !== 'boolean' || !Array.isArray(data.data)) {
      throw new ApiError('Invalid API response format');
    }

    if (!data.success) {
      throw new ApiError(data.message || 'API request failed');
    }
    
    return {
      teachers: data.data.map(transformApiTeacher),
      meta: data.meta,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Error fetching teachers:', {
      message: apiError.message,
      status: apiError.status,
      baseUrl: BASE_URL
    });
    throw apiError;
  }
}
