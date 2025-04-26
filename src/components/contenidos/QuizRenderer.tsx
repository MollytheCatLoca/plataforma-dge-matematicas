'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  type: string;
  text: string;
  options?: any[];
  correctAnswer?: any;
  points: number;
}

interface Evaluation {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore: number;
  questions: Question[];
  contentResourceId: string;
}

interface QuizRendererProps {
  evaluation: Evaluation;
  contentId: string;
}

export default function QuizRenderer({ evaluation, contentId }: QuizRendererProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(evaluation.timeLimit ? evaluation.timeLimit * 60 : null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Iniciar temporizador cuando comienza el quiz
  useEffect(() => {
    if (!quizStarted || !timeRemaining || quizSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          // Enviar automáticamente si se acaba el tiempo
          if (prev === 1) handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining, quizSubmitted]);

  // Formatear tiempo en minutos:segundos
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Manejar cambio de respuesta
  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navegar a la siguiente pregunta
  const handleNextQuestion = () => {
    if (currentQuestionIndex < evaluation.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navegar a la pregunta anterior
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Comenzar el quiz
  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  // Enviar respuestas
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Aquí se implementará la llamada a la API para calificar el quiz
      // en la Etapa 3 del desarrollo
      console.log('Enviando respuestas:', answers);
      
      // Simulación de calificación (se reemplazará con la API real)
      const totalPoints = evaluation.questions.reduce((sum, q) => sum + q.points, 0);
      const earnedPoints = evaluation.questions.reduce((sum, q) => {
        // Simulación simple de calificación
        const userAnswer = answers[q.id];
        const isCorrect = q.type === 'multiple_choice' 
          ? userAnswer === q.correctAnswer
          : userAnswer === q.correctAnswer; // Simplificado
        
        return sum + (isCorrect ? q.points : 0);
      }, 0);
      
      const calculatedScore = Math.round((earnedPoints / totalPoints) * 100);
      
      // Actualizar estado
      setScore(calculatedScore);
      setQuizSubmitted(true);
      
      // En una implementación real, aquí se guardaría el resultado en el servidor
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Ocurrió un error al enviar el quiz. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar pregunta actual
  const renderQuestion = () => {
    if (!quizStarted) return null;
    
    const question = evaluation.questions[currentQuestionIndex];
    if (!question) return null;

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{question.text}</h3>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name={`question-${question.id}`}
                    value={option.value || option}
                    checked={answers[question.id] === (option.value || option)}
                    onChange={() => handleAnswerChange(question.id, option.value || option)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={quizSubmitted}
                  />
                  <label htmlFor={`option-${index}`} className="ml-2 block text-gray-700">
                    {option.text || option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      
      // Más tipos de preguntas se implementarán en la Etapa 3
      default:
        return (
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">
              Tipo de pregunta "{question.type}" no implementado aún.
            </p>
          </div>
        );
    }
  };

  // Renderizar resultados
  const renderResults = () => {
    if (!quizSubmitted || score === null) return null;

    const passed = score >= evaluation.passingScore;

    return (
      <div className={`p-6 rounded-lg ${passed ? 'bg-green-50' : 'bg-red-50'} text-center`}>
        <h2 className={`text-2xl font-bold mb-4 ${passed ? 'text-green-700' : 'text-red-700'}`}>
          {passed ? '¡Felicitaciones!' : 'Evaluación no superada'}
        </h2>

        <div className="text-6xl font-bold mb-4">
          {score}%
        </div>

        <p className={`text-lg ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {passed 
            ? 'Has superado exitosamente esta evaluación.' 
            : `El puntaje mínimo requerido es ${evaluation.passingScore}%.`}
        </p>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => {
              setQuizStarted(false);
              setQuizSubmitted(false);
              setAnswers({});
              setCurrentQuestionIndex(0);
              setScore(null);
              setTimeRemaining(evaluation.timeLimit ? evaluation.timeLimit * 60 : null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Intentar nuevamente
          </button>
          
          <button
            onClick={() => router.push(`/dashboard/contenidos/${contentId}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Volver al contenido
          </button>
        </div>
      </div>
    );
  };

  // Renderizar pantalla de inicio
  const renderStartScreen = () => {
    if (quizStarted) return null;

    return (
      <div className="text-center max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">{evaluation.title}</h2>
        
        {evaluation.description && (
          <p className="text-gray-600 mb-6">{evaluation.description}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700 mb-1">Preguntas</h3>
            <p className="text-2xl font-bold">{evaluation.questions.length}</p>
          </div>
          
          {evaluation.timeLimit && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-700 mb-1">Tiempo límite</h3>
              <p className="text-2xl font-bold">{evaluation.timeLimit} minutos</p>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700 mb-1">Puntuación para aprobar</h3>
            <p className="text-2xl font-bold">{evaluation.passingScore}%</p>
          </div>
        </div>
        
        <button
          onClick={handleStartQuiz}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg font-medium"
        >
          Comenzar evaluación
        </button>
      </div>
    );
  };

  // Render principal
  return (
    <div className="quiz-renderer">
      {/* Mostrar error si existe */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {/* Pantalla de inicio */}
      {!quizStarted && renderStartScreen()}
      
      {/* Resultados si el quiz fue enviado */}
      {quizSubmitted && renderResults()}
      
      {/* Interfaz del quiz */}
      {quizStarted && !quizSubmitted && (
        <div>
          {/* Barra superior */}
          <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-md">
            <div>
              <span className="font-medium">Pregunta {currentQuestionIndex + 1} de {evaluation.questions.length}</span>
            </div>
            
            {timeRemaining !== null && (
              <div className={`font-mono font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-700'}`}>
                Tiempo: {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          
          {/* Contenido de la pregunta */}
          <div className="mb-8">
            {renderQuestion()}
          </div>
          
          {/* Navegación y envío */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {currentQuestionIndex < evaluation.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Finalizar y Enviar'}
              </button>
            )}
          </div>
          
          {/* Indicador de progreso */}
          <div className="mt-8">
            <div className="flex justify-between mb-2 text-sm text-gray-600">
              <span>Progreso</span>
              <span>{Math.round(((currentQuestionIndex + 1) / evaluation.questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${((currentQuestionIndex + 1) / evaluation.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}