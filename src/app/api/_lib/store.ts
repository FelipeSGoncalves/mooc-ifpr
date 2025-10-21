import { Campus, Course, Enrollment, KnowledgeArea, Lesson, LessonProgress, Session, User } from './types';

const now = () => new Date().toISOString();

let userIdCounter = 2;
let knowledgeAreaIdCounter = 2;
let campusIdCounter = 2;
let courseIdCounter = 2;
let lessonIdCounter = 1;
let enrollmentIdCounter = 1;
let lessonProgressIdCounter = 1;

const users: User[] = [
  {
    id: 1,
    fullName: 'Administrador',
    cpf: '00000000000',
    birthDate: '1990-01-01',
    email: 'admin@mooc.ifpr.edu.br',
    password: 'admin123',
    role: 'admin',
    createdAt: now(),
    updatedAt: now(),
  },
];

const knowledgeAreas: KnowledgeArea[] = [
  {
    id: 1,
    name: 'Tecnologia da Informação',
    visible: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

const campuses: Campus[] = [
  {
    id: 1,
    name: 'IFPR Campus Cascavel',
    visible: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

const courses: Course[] = [
  {
    id: 1,
    name: 'Introdução à Programação',
    description: 'Curso introdutório de lógica de programação e fundamentos de algoritmos.',
    knowledgeAreaId: 1,
    campusId: 1,
    professorName: 'Prof. Maria Souza',
    workload: 40,
    visible: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

const lessons: Lesson[] = [];
const enrollments: Enrollment[] = [];
const lessonProgress: LessonProgress[] = [];
const sessions: Session[] = [];

export const db = {
  users,
  knowledgeAreas,
  campuses,
  courses,
  lessons,
  enrollments,
  lessonProgress,
  sessions,
};

export const counters = {
  get user() {
    return userIdCounter++;
  },
  get knowledgeArea() {
    return knowledgeAreaIdCounter++;
  },
  get campus() {
    return campusIdCounter++;
  },
  get course() {
    return courseIdCounter++;
  },
  get lesson() {
    return lessonIdCounter++;
  },
  get enrollment() {
    return enrollmentIdCounter++;
  },
  get lessonProgress() {
    return lessonProgressIdCounter++;
  },
};

export const resetLessonOrder = (courseId: number) => {
  const courseLessons = lessons
    .filter((lesson) => lesson.courseId === courseId)
    .sort((a, b) => a.ordemAula - b.ordemAula);
  courseLessons.forEach((lesson, index) => {
    lesson.ordemAula = index + 1;
    lesson.updatedAt = now();
  });
};

export const findCourseLessons = (courseId: number) =>
  lessons.filter((lesson) => lesson.courseId === courseId);

export const touchCourse = (courseId: number) => {
  const course = courses.find((item) => item.id === courseId);
  if (course) {
    course.updatedAt = now();
  }
};

export const createTimestamp = now;
