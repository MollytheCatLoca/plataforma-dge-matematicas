export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  
  // Bypass temporal para pruebas + logging
  console.log(`[API DEBUG] Recibiendo solicitud para contenido ID: ${id}`);
  
  // Usar la importación existente de UserRole
  // No necesitamos agregar otra importación porque ya está en el archivo
  const session = { user: { role: UserRole.TEACHER } };
  
  // Comentar temporalmente la autenticación real
  // const session = await getServerSession(authOptions);
  // assertAuth(session);

  console.log(`[API DEBUG] Buscando contenido con ID: ${id}`);
  
  const where: any = { id };
  if (session.user.role === UserRole.STUDENT)
    where.status = ContentStatus.PUBLISHED;

  try {
    const content = await prisma.contentResource.findUnique({
      where,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        curriculumNode: { select: { id: true, name: true, nodeType: true } },
      },
    });

    if (!content) {
      console.log(`[API DEBUG] Contenido no encontrado para ID: ${id}`);
      return NextResponse.json(
        { error: 'Contenido no encontrado' },
        { status: 404 }
      );
    }

    console.log(`[API DEBUG] Contenido encontrado:`, {
      id: content.id,
      title: content.title,
      type: content.type,
      contentBodyExists: content.contentBody !== null
    });
    
    // Loguear contentBody para depuración
    if (content.contentBody) {
      console.log(`[API DEBUG] ContentBody:`, content.contentBody);
    } else {
      console.log(`[API DEBUG] ContentBody es NULL`);
    }

    return NextResponse.json(content, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error(`[API DEBUG] Error al buscar contenido:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}