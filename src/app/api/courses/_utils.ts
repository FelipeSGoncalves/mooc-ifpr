import { db } from '../_lib/store';
import { Course } from '../_lib/types';

export const getCourseById = (id: number): Course | undefined =>
  db.courses.find((item) => item.id === id);

export const serializeCourse = (course: Course | undefined) => {
  if (!course) {
    return null;
  }

  const knowledgeArea = db.knowledgeAreas.find((item) => item.id === course.knowledgeAreaId);
  const campus = db.campuses.find((item) => item.id === course.campusId);
  const lessons = db.lessons
    .filter((lesson) => lesson.courseId === course.id)
    .sort((a, b) => a.ordemAula - b.ordemAula);

  return {
    ...course,
    knowledgeArea,
    campus,
    lessons,
  };
};
