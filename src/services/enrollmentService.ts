import { apiRequest, ApiError } from "./api";
import { parseCookies } from "nookies";

/**
 * Enrolls the logged-in student in a course.
 * @param courseId The ID of the course to enroll in.
 */
export async function enrollInCourse(courseId: number | string) {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("User not authenticated", 401);
  }

  return apiRequest<any>("/enrollments", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ cursoId: courseId }),
  });
}

/**
 * Cancels a student's enrollment in a course.
 * @param enrollmentId The ID of the enrollment.
 */
export async function cancelEnrollment(enrollmentId: number | string) {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("User not authenticated", 401);
  }

  // Note: Backend endpoint for DELETE might not exist yet.
  // This is prepared for when `DELETE /enrollments/{id}` is implemented.
  return apiRequest<any>(`/enrollments/${enrollmentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}