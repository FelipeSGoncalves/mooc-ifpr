// src/pages/aluno/cursos/[id]/aula/[aulaId]/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { Typography, Button, List, Spin, App, Breadcrumb } from "antd";
import { CheckCircleOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/player/VideoPlayer"; 
import styles from "./page.module.css";
import { getCourseDetails, CourseDetails, LessonSummary } from "@/services/courseService"; 
import { markLessonProgress, getLessonDetails, LessonDetails } from "@/services/lessonService"; 

const { Title, Paragraph, Text } = Typography;

export default function AulaPage() {
  const { message } = App.useApp();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [canMarkAsComplete, setCanMarkAsComplete] = useState(false);
  
  // ALTERAÇÃO 1: Usando os 'refs' numéricos
  const secondsWatchedRef = useRef(0); // O "int comum" para o total de segundos
  const lastProcessedSecondRef = useRef(0); // O "ajudante" para rastrear o último segundo contado
  
  const totalDurationRef = useRef(0);
  
  const params = useParams();
  const router = useRouter();
  
  const courseId = params.id as string;
  const aulaId = params.aulaId as string;

  useEffect(() => {
    if (!aulaId || !courseId) return;

    const fetchData = async () => {
      setLoading(true);
      
      // ALTERAÇÃO 2: Resetar os contadores numéricos
      secondsWatchedRef.current = 0; 
      lastProcessedSecondRef.current = 0;
      
      setCanMarkAsComplete(false);

      try {
        const [courseData, lessonData] = await Promise.all([
          getCourseDetails(courseId),
          getLessonDetails(courseId, aulaId)
        ]);

        const lessonFromCourseList = courseData.aulas?.find(a => a.id.toString() === aulaId);
        const isCompleted = lessonFromCourseList?.concluido || false;
        
        if (isCompleted) {
          setCanMarkAsComplete(true);
        }

        const completeLessonData = { ...lessonData, concluido: isCompleted };
        
        if (courseData.aulas) {
          courseData.aulas.sort((a, b) => a.ordemAula - b.ordemAula);
        }
        
        setCourse(courseData);
        setCurrentLesson(completeLessonData);
      } catch (error) {
        console.error("Erro ao carregar dados da aula:", error);
        message.error("Não foi possível carregar os dados desta aula.");
        router.push(`/aluno/cursos/${courseId}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [aulaId, courseId, message, router]);

  const handleMarkAsComplete = async () => {
    if (!course?.inscricaoInfo || !currentLesson) return;

    const newStatus = !currentLesson.concluido; 
    
    try {
      await markLessonProgress(course.inscricaoInfo.inscricaoId, currentLesson.id, newStatus);
      
      message.success(`Aula marcada como ${newStatus ? 'concluída' : 'não concluída'}!`);

      const updatedLesson = { ...currentLesson, concluido: newStatus };
      setCurrentLesson(updatedLesson);

      setCourse(prev => {
        if (!prev) return null;
        const updatedAulas = prev.aulas.map(aula => 
          aula.id === currentLesson.id ? { ...aula, concluido: newStatus } : aula
        );
        return { ...prev, aulas: updatedAulas };
      });

      if (newStatus === false) {
         // ALTERAÇÃO 3: Usar o 'int comum' (secondsWatchedRef)
         const watched = secondsWatchedRef.current;
         const total = totalDurationRef.current;
         if (total > 0 && watched >= total * 0.8) {
            setCanMarkAsComplete(true);
         } else {
            setCanMarkAsComplete(false);
         }
      }

    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      message.error("Não foi possível atualizar o progresso da aula.");
    }
  };

  const checkAndMarkComplete = () => {
    if (currentLesson?.concluido) return; 

    // ALTERAÇÃO 4: A const 'watched' agora vem do 'int comum'
    const watched = secondsWatchedRef.current;
    const total = totalDurationRef.current;
    const percentageRequired = 0.8;

    if (total > 0 && watched >= total * percentageRequired) {
      if (!canMarkAsComplete) { 
        console.log(`Atingiu ${Math.round(watched / total * 100)}% (${watched}/${total})! Marcando como concluída...`);
        setCanMarkAsComplete(true);
        handleMarkAsComplete();
      }
    } else {
        console.log(`Progresso: ${watched} segundos de ${total} (Requerido: ${total * percentageRequired})`);
    }
  };

  const handleDuration = (duration: number) => {
    totalDurationRef.current = Math.floor(duration);
    console.log(`Duração do vídeo: ${totalDurationRef.current} segundos`);
  };

  // #############################################################
  // ALTERAÇÃO 5 (CORRIGIDA): Lógica que incrementa +1 e ignora pulos
  // #############################################################
  const handleProgress = (state: { playedSeconds: number }) => {
    const currentSecond = Math.floor(state.playedSeconds);
    
    // 1. Não faz nada se ainda estiver no mesmo segundo que já processamos
    if (currentSecond === lastProcessedSecondRef.current) {
        return;
    }
    
    // 2. Handle de "Rewind" (voltar o vídeo)
    // Se o segundo atual for MENOR que o último, o usuário voltou.
    // Apenas atualizamos o ponteiro, não contamos nada.
    if (currentSecond < lastProcessedSecondRef.current) {
        lastProcessedSecondRef.current = currentSecond;
        return;
    }

    // 3. Handle de "Play" normal ou "Skip" (pulo para frente)
    if (currentSecond > lastProcessedSecondRef.current) {
        
        // Calcula a diferença de segundos desde a última verificação
        const difference = currentSecond - lastProcessedSecondRef.current;
        
        // Se a diferença for pequena (1 ou 2), é play normal.
        // (Usamos <= 2 por segurança, caso o evento onTimeUpdate pule 1 segundo)
        if (difference <= 2) { 
            // Incrementa o "int comum" com a diferença (normalmente 1)
            secondsWatchedRef.current += difference;
        } 
        // Se a 'difference' for > 2 (ex: 138), foi um PULO.
        // NENHUM segundo é adicionado ao 'secondsWatchedRef.current'.
        
        // Finalmente, atualizamos o último segundo processado,
        // seja num skip (ex: 140) ou num play normal (ex: 3)
        lastProcessedSecondRef.current = currentSecond;
    }
    
    // Roda a verificação de progresso após qualquer lógica
    checkAndMarkComplete();
  };

  const handleEnded = () => {
    console.log("Vídeo terminou. Fazendo verificação final.");
    
    // ALTERAÇÃO 6: Garante que o total assistido seja, no mínimo, a duração total
    const totalDuration = totalDurationRef.current;
    if (secondsWatchedRef.current < totalDuration) {
        // Garante que o último segundo seja contado
        // (Ex: se o vídeo tem 59.8s e o último 'currentSecond' foi 59)
        if (totalDuration - secondsWatchedRef.current <= 2) {
           secondsWatchedRef.current = totalDuration;
        }
    }
    
    checkAndMarkComplete();
  };

  if (loading || !course || !currentLesson) {
    return <div className={styles.wrapper}><Spin size="large" /></div>;
  }
  
  const isButtonDisabled = !canMarkAsComplete && !currentLesson.concluido;
  const currentIndex = course.aulas.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? course.aulas[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.aulas.length - 1 ? course.aulas[currentIndex + 1] : null;

  return (
    <div className={styles.wrapper}>
      <Breadcrumb
        items={[
          { title: <Link href="/aluno/cursos">Catálogo de Cursos</Link> },
          { title: <Link href={`/aluno/cursos/${course.id}`}>{course.nome}</Link> },
          { title: currentLesson.titulo },
        ]}
      />
      <div className={styles.playerLayout}>
        <div className={styles.videoContent}>
          <div className={styles.playerWrapper}>
            {currentLesson.urlVideo ? (
              <VideoPlayer
                className={styles.reactPlayer}
                src={currentLesson.urlVideo}
                width="100%"
                height="100%"
                controls={true}
                onLoadedMetadata={(e) => handleDuration((e.currentTarget as HTMLVideoElement).duration)}
                onTimeUpdate={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                  const video = e.currentTarget as HTMLVideoElement;
                  handleProgress({ playedSeconds: video.currentTime });
                }}
                onEnded={handleEnded}
              />
            ) : (
              <div className={styles.noVideo}>
                  <Text>Vídeo não disponível para esta aula.</Text>
              </div>
            )}
          </div>
          <header className={styles.lessonHeader}>
            <Title level={3}>{currentLesson.titulo}</Title>
            {course.inscricaoInfo?.estaInscrito && (
              <Button
                type={currentLesson.concluido ? "default" : "primary"}
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAsComplete}
                disabled={isButtonDisabled}
              >
                {currentLesson.concluido ? "Desmarcar como concluída" : "Marcar como concluída"}
              </Button>
            )}
          </header>
          <Paragraph className={styles.lessonDescription}>
            {currentLesson.descricao}
          </Paragraph>
        </div>
        <aside className={styles.playlistSidebar}>
          <Title level={4}>Aulas do Curso</Title>
          <List
            dataSource={course.aulas}
            renderItem={(item: LessonSummary) => (
              <List.Item className={item.id === currentLesson.id ? styles.activeLesson : ''}>
                <Link href={`/aluno/cursos/${course?.id}/aula/${item.id}`} className={styles.lessonLink}>
                  <Text>{item.ordemAula}. {item.titulo}</Text>
                  {item.concluido && <CheckCircleOutlined className={styles.checkIcon} />}
                </Link>
              </List.Item>
            )}
          />
          <div className={styles.navigationButtons}>
            {prevLesson && (
              <Link href={`/aluno/cursos/${course?.id}/aula/${prevLesson.id}`}>
                <Button icon={<LeftOutlined />}>Aula Anterior</Button>
              </Link>
            )}
            {nextLesson && (
              <Link href={`/aluno/cursos/${course?.id}/aula/${nextLesson.id}`}>
                <Button icon={<RightOutlined />}>Próxima Aula</Button>
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}