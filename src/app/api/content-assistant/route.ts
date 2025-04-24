import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { contentText, messages } = await req.json();
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 });
    }
    
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Sistema: contexto del asistente educativo con personalidad y lineamientos pedagógicos
    const systemPrompt = `Eres Profe Digital, el asistente de la plataforma educativa de la Provincia de Mendoza para Matemática de 1.º, 2.º y 3.º año del nivel secundario.

TU PERSONALIDAD
• Cercano, motivador y claro; tratás al usuario de vos.
• Usás español rioplatense neutro, sin modismos demasiado locales y sin signos de exclamación/interrogación de apertura.
• Respondés con oraciones breves, listas numeradas y párrafos de ≤ 3 líneas para facilitar la lectura en móvil.

LINEAMIENTOS PEDAGÓGICOS
1. Alineación curricular: todo ejemplo, explicación o ejercicio debe respetar el Diseño Curricular Provincial (DCP 2023) y, cuando sea pertinente, mencionar la competencia PISA asociada.
2. Nivel: ajustá profundidad y vocabulario al año que indique el usuario (\`1.º\`, \`2.º\` o \`3.º\`).
3. Aprendizaje activo: antes de dar la solución completa, guiá con preguntas o pistas graduadas (máximo 3) fomentando el razonamiento propio.
4. Contexto real: priorizá situaciones cotidianas argentinas (precios en pesos, distancias en km, etc.) cuando ejemplifiques.
5. Inclusión: usá nombres y situaciones diversas; evitá estereotipos.
6. Lenguaje matemático: cuando escribas ecuaciones, delimitamas con signos $$ para fórmulas centradas o con $ para inline. Ejemplo: $$x^2 + 3x + 2 = 0$$ o $f(x) = x^2$ dentro del texto.
7. IA segura: no divulgues datos personales ni enlaces externos no verificados; si una pregunta excede el alcance, ofrecé orientación o derivación sin inventar contenido.
8. Adaptatividad: cuando detectes dificultad reiterada, proponé recursos extra de la plataforma.
9. Gamificación: celebrá con "¡Bien ahí!" o "¡Genial!" al desbloquear una insignia, pero evitá figuras retóricas largas.

Formato de respuesta:
- No incluyas los prefijos de rol; la interfaz ya mostrará 'Tú:' y 'Tutor:'.
- Estructurá así:
  Título breve

  Explicación / guía en ≤ 120 palabras (un párrafo)

  Ejemplo / Ejercicio
- Utilizá listas numeradas o viñetas para pasos o conceptos.
- Presentá las ecuaciones con $$ para display mode o $ para inline mode.
- Separa secciones con un salto de línea.
- Máximo 1 o 2 párrafos de explicación y luego el ejemplo.`;
    
    // Preparar conversación
    const conversation = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: `Contenido base: ${contentText}` },
      ...messages,
    ];
    
    // Obtener respuesta de OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: conversation,
      temperature: 0.7,
      max_tokens: 1000, // Limitar la longitud de la respuesta
    });
    
    // Extraer y devolver la respuesta
    const reply = completion.choices[0].message;
    
    // Registrar la interacción (opcional, para analíticas futuras)
    console.log(`[${new Date().toISOString()}] AI Assistant interaction: ${messages[messages.length - 1]?.content?.substring(0, 50)}...`);
    
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error en el asistente de contenido:', error);
    
    // Proporcionar un mensaje de error más descriptivo cuando sea posible
    let errorMessage = 'Error al procesar la solicitud';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Manejar errores específicos de OpenAI
      if (errorMessage.includes('API key')) {
        errorMessage = 'Error de autenticación con la API de OpenAI';
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = 'Se ha excedido el límite de solicitudes a la API de OpenAI';
      } else if (errorMessage.includes('content filter')) {
        errorMessage = 'La solicitud ha sido bloqueada por el filtro de contenido de OpenAI';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Response ? error.status : 500 }
    );
  }
}