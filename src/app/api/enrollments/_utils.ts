import { counters, createTimestamp, db } from '../_lib/store';
import { Enrollment } from '../_lib/types';
import { getCourseById, serializeCourse } from '../courses/_utils';

export const recalculateEnrollmentStatus = (enrollment: Enrollment) => {
  const lessons = db.lessons.filter((lesson) => lesson.courseId === enrollment.cursoId);

  const previousStatus = enrollment.concluido;

  if (!lessons.length) {
    enrollment.concluido = false;
  } else {
    const completedLessons = lessons.filter((lesson) =>
      db.lessonProgress.some(
        (progress) => progress.enrollmentId === enrollment.id && progress.lessonId === lesson.id && progress.concluido,
      ),
    );

    enrollment.concluido = completedLessons.length === lessons.length;
  }

  if (enrollment.concluido !== previousStatus) {
    enrollment.updatedAt = createTimestamp();
  }
};

export const serializeEnrollment = (enrollment: Enrollment) => {
  const course = getCourseById(enrollment.cursoId);
  recalculateEnrollmentStatus(enrollment);

  const lessons = db.lessons.filter((lesson) => lesson.courseId === enrollment.cursoId);
  const progress = lessons.map((lesson) => {
    const lessonProgress = db.lessonProgress.find(
      (item) => item.enrollmentId === enrollment.id && item.lessonId === lesson.id,
    );

    return {
      lessonId: lesson.id,
      concluido: lessonProgress?.concluido ?? false,
      updatedAt: lessonProgress?.updatedAt ?? null,
    };
  });

  return {
    ...enrollment,
    course: serializeCourse(course),
    progress,
  };
};

export const createProgressEntry = (enrollmentId: number, lessonId: number, concluido: boolean) => {
  const id = counters.lessonProgress;
  const timestamp = createTimestamp();

  const progress = {
    id,
    enrollmentId,
    lessonId,
    concluido,
    updatedAt: timestamp,
  };

  db.lessonProgress.push(progress);
  return progress;
};
